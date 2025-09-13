// scripts/make-admin.ts (run with ts-node or node after transpile)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE! // SERVER-ONLY key
)

async function makeAdmin(userId: string) {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'admin' }
  })
  console.log({ data, error })
}

makeAdmin('the-user-uuid')
