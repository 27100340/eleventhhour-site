// Test script to verify Stripe API endpoint works
// Run this with: node test-stripe-api.js
// Make sure your dev server is running (npm run dev) in another terminal

const http = require('http')

const testPayload = {
  bookingId: 'test-booking-123',
  items: [
    {
      service_id: 'test-service-1',
      name: 'Test Cleaning Service',
      qty: 1,
      unit_price: 50.00,
      time_minutes: 60
    }
  ],
  total: 50.00,
  customerEmail: 'test@example.com',
  customerName: 'Test User'
}

const data = JSON.stringify(testPayload)

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/create-checkout-session',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

console.log('🧪 Testing Stripe checkout session creation...\n')
console.log('📤 Sending test payload to: http://localhost:3000/api/create-checkout-session')
console.log('📦 Test booking ID:', testPayload.bookingId)
console.log('📦 Test items:', testPayload.items.length)
console.log('')

const req = http.request(options, (res) => {
  let responseData = ''

  res.on('data', (chunk) => {
    responseData += chunk
  })

  res.on('end', () => {
    console.log('📥 Response Status:', res.statusCode, res.statusMessage)
    console.log('')

    try {
      const jsonResponse = JSON.parse(responseData)

      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! Stripe session created')
        console.log('   Session ID:', jsonResponse.sessionId)
        console.log('   Checkout URL:', jsonResponse.url)
        console.log('')
        console.log('🎉 Your Stripe integration is working correctly!')
        console.log('   You can now test it in the browser at: http://localhost:3000/book')
      } else {
        console.log('❌ ERROR:', jsonResponse.error?.message || 'Unknown error')
        if (jsonResponse.error?.details) {
          console.log('   Details:', jsonResponse.error.details)
        }
        console.log('')
        console.log('🔍 Check your terminal where npm run dev is running for more details')
      }
    } catch (e) {
      console.log('❌ Failed to parse response')
      console.log('   Raw response:', responseData)
    }
  })
})

req.on('error', (error) => {
  console.log('❌ Connection Error:', error.message)
  console.log('')
  console.log('💡 Make sure your dev server is running:')
  console.log('   Run: npm run dev')
  console.log('   Then try this test script again')
})

req.write(data)
req.end()
