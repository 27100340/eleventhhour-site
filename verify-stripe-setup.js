// Quick verification script to check if Stripe is configured correctly
// Run this with: node verify-stripe-setup.js

const fs = require('fs')
const path = require('path')

// Manually load .env.local since dotenv may not be installed
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      process.env[key] = value
    }
  })
}

const checks = {
  '✅ Stripe Publishable Key': !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  '✅ Stripe Secret Key': !!process.env.STRIPE_SECRET_KEY,
  '⚠️  Stripe Webhook Secret (optional for dev)': !!process.env.STRIPE_WEBHOOK_SECRET,
  '✅ Supabase URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  '✅ Supabase Service Role': !!process.env.SUPABASE_SERVICE_ROLE,
}

console.log('\n🔍 Stripe Integration Configuration Check\n')
console.log('=' .repeat(50))

let allRequired = true
for (const [check, passed] of Object.entries(checks)) {
  const icon = check.startsWith('⚠️') ? '⚠️ ' : passed ? '✅' : '❌'
  const status = check.startsWith('⚠️') ? (passed ? 'SET' : 'NOT SET') : (passed ? 'OK' : 'MISSING')
  console.log(`${icon} ${check.replace('✅ ', '').replace('⚠️  ', '')}: ${status}`)

  if (!check.startsWith('⚠️') && !passed) {
    allRequired = false
  }
}

console.log('=' .repeat(50))

if (allRequired) {
  console.log('\n✅ All required environment variables are set!')
  console.log('\nNext steps:')
  console.log('1. Run the database migration (see STRIPE-INTEGRATION-README.md)')
  console.log('2. Start your dev server: npm run dev')
  console.log('3. Test a booking at: http://localhost:3000/book')
  console.log('4. Use test card: 4242 4242 4242 4242')
} else {
  console.log('\n❌ Some required environment variables are missing!')
  console.log('Please check your .env.local file and ensure all keys are set.')
}

// Test Stripe connection
if (process.env.STRIPE_SECRET_KEY) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

  console.log('\n🔗 Testing Stripe API connection...')

  stripe.balance.retrieve()
    .then(() => {
      console.log('✅ Stripe API connection successful!')
      console.log('✅ Your integration is ready to go!')
    })
    .catch((err) => {
      console.log('❌ Stripe API connection failed:', err.message)
      console.log('Please verify your STRIPE_SECRET_KEY is correct.')
    })
} else {
  console.log('\n⚠️  Skipping Stripe API test (no secret key)')
}
