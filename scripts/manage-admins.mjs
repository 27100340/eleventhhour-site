// scripts/manage-admins.mjs
// Manage admin accounts for the /admin panel (Supabase auth users whose
// app_metadata.role === 'admin'). Uses the service-role key from .env.local,
// so it must only ever be run locally — never ship this to the client.
//
// Usage:
//   node scripts/manage-admins.mjs list
//   node scripts/manage-admins.mjs create <email> <password>
//   node scripts/manage-admins.mjs set-password <email> <new-password>
//   node scripts/manage-admins.mjs set-email <email> <new-email>
//   node scripts/manage-admins.mjs promote <email>     (make an existing user an admin)
//   node scripts/manage-admins.mjs demote <email>      (remove admin role, keep the user)
//   node scripts/manage-admins.mjs delete <email> --yes
//
// Note on "seeing passwords": Supabase (like every sane auth system) stores
// only bcrypt hashes — existing passwords cannot be viewed by anyone,
// including us. If a password is lost, use set-password to set a new one.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvLocal() {
  const raw = readFileSync(path.join(projectRoot, '.env.local'), 'utf8')
  const env = {}
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return env
}

const env = loadEnvLocal()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

async function findUserByEmail(email) {
  let page = 1
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (hit) return hit
    if (data.users.length < 1000) return null
    page++
  }
}

function printUser(u) {
  const role = u.app_metadata?.role === 'admin' ? 'ADMIN' : 'user '
  const confirmed = u.email_confirmed_at ? 'confirmed' : 'UNCONFIRMED'
  const lastSignIn = u.last_sign_in_at ? u.last_sign_in_at.slice(0, 16).replace('T', ' ') : 'never'
  console.log(`  [${role}] ${u.email}  (${confirmed}, last sign-in: ${lastSignIn})`)
  console.log(`          id: ${u.id}`)
}

const [cmd, arg1, arg2] = process.argv.slice(2)

async function main() {
  switch (cmd) {
    case 'list': {
      const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      if (error) throw error
      const admins = data.users.filter((u) => u.app_metadata?.role === 'admin')
      const others = data.users.filter((u) => u.app_metadata?.role !== 'admin')
      console.log(`\nAdmins (${admins.length}):`)
      admins.forEach(printUser)
      if (others.length) {
        console.log(`\nNon-admin users (${others.length}):`)
        others.forEach(printUser)
      }
      console.log('\nPasswords are stored as one-way hashes and cannot be viewed.')
      console.log('Use: node scripts/manage-admins.mjs set-password <email> <new-password>')
      break
    }

    case 'create': {
      if (!arg1 || !arg2) throw new Error('Usage: create <email> <password>')
      if (arg2.length < 8) throw new Error('Password must be at least 8 characters')
      const { data, error } = await supabase.auth.admin.createUser({
        email: arg1,
        password: arg2,
        email_confirm: true,
        app_metadata: { role: 'admin' },
      })
      if (error) throw error
      console.log(`Created admin ${data.user.email} (id ${data.user.id}). They can log in at /admin/login now.`)
      break
    }

    case 'set-password': {
      if (!arg1 || !arg2) throw new Error('Usage: set-password <email> <new-password>')
      if (arg2.length < 8) throw new Error('Password must be at least 8 characters')
      const user = await findUserByEmail(arg1)
      if (!user) throw new Error(`No user with email ${arg1}`)
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password: arg2 })
      if (error) throw error
      console.log(`Password updated for ${arg1}.`)
      break
    }

    case 'set-email': {
      if (!arg1 || !arg2) throw new Error('Usage: set-email <email> <new-email>')
      const user = await findUserByEmail(arg1)
      if (!user) throw new Error(`No user with email ${arg1}`)
      const { error } = await supabase.auth.admin.updateUserById(user.id, { email: arg2, email_confirm: true })
      if (error) throw error
      console.log(`Email changed: ${arg1} -> ${arg2}.`)
      break
    }

    case 'promote':
    case 'demote': {
      if (!arg1) throw new Error(`Usage: ${cmd} <email>`)
      const user = await findUserByEmail(arg1)
      if (!user) throw new Error(`No user with email ${arg1}`)
      const app_metadata = { ...user.app_metadata, role: cmd === 'promote' ? 'admin' : null }
      const { error } = await supabase.auth.admin.updateUserById(user.id, { app_metadata })
      if (error) throw error
      console.log(`${arg1} is ${cmd === 'promote' ? 'now an admin' : 'no longer an admin'}.`)
      break
    }

    case 'delete': {
      if (!arg1) throw new Error('Usage: delete <email> --yes')
      if (arg2 !== '--yes') throw new Error(`Deleting is permanent. Re-run with --yes to confirm: delete ${arg1} --yes`)
      const user = await findUserByEmail(arg1)
      if (!user) throw new Error(`No user with email ${arg1}`)
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw error
      console.log(`Deleted user ${arg1}.`)
      break
    }

    default:
      console.log(`Admin account manager for the /admin panel.

Commands:
  list                                 show all users and who is an admin
  create <email> <password>            create a new admin account
  set-password <email> <new-password>  reset an account's password
  set-email <email> <new-email>        change an account's email
  promote <email>                      grant admin role to an existing user
  demote <email>                       remove admin role (keeps the user)
  delete <email> --yes                 permanently delete an account

Passwords cannot be viewed (only one-way hashes are stored) — use set-password instead.`)
      process.exit(cmd ? 1 : 0)
  }
}

main().catch((e) => {
  console.error('Error:', e.message || e)
  process.exit(1)
})
