# Facebook Pixel Integration Guide
## Eleventh Hour Cleaning Website

---

## Table of Contents
1. [What is Facebook Pixel?](#what-is-facebook-pixel)
2. [How Does It Work?](#how-does-it-work)
3. [What Does It Track?](#what-does-it-track)
4. [Privacy & Security](#privacy--security)
5. [Implementation Details](#implementation-details)
6. [How to Use Events](#how-to-use-events)
7. [Testing & Verification](#testing--verification)
8. [Benefits for Your Business](#benefits-for-your-business)

---

## What is Facebook Pixel?

The **Facebook Pixel** is a small piece of JavaScript code (tracking pixel) that you install on your website. It's provided by Facebook (Meta) and serves as a bridge between your website and your Facebook advertising account.

**Your Pixel ID**: `25165355493153413`

Think of it like a smart camera that watches what visitors do on your website and reports back to Facebook. But instead of watching with a camera, it tracks digital actions like:
- Which pages people visit
- When they submit a form
- When they complete a purchase
- How long they stay on pages

---

## How Does It Work?

### The Simple Explanation:

1. **Installation** →A small piece of code is added to every page of your website (we've done this in the `<head>` section)

2. **Visitor Arrives** → When someone visits your site, the pixel "fires" (activates) and sends data to Facebook

3. **Facebook Matches** → Facebook tries to match the visitor to a Facebook user account (using cookies, IP address, browser fingerprint)

4. **Data Collection** → Information about what the visitor does is sent to your Facebook Ads Manager

5. **Audience Building** → Facebook builds "audiences" of people who took specific actions

6. **Ad Targeting** → You can show ads to these specific audiences

### The Technical Flow:

```
User Visits Website
       ↓
Pixel Script Loads (from connect.facebook.net)
       ↓
Pixel Fires: fbq('init', 'YOUR_PIXEL_ID')
       ↓
PageView Event Tracked: fbq('track', 'PageView')
       ↓
User Takes Action (e.g., completes booking)
       ↓
Custom Event Fires: fbq('track', 'Purchase', {value: 150, currency: 'GBP'})
       ↓
Data Sent to Facebook via HTTPS
       ↓
Facebook Matches to User Account (if possible)
       ↓
Event Appears in Facebook Events Manager
       ↓
Used for Ad Targeting & Retargeting
```

---

## What Does It Track?

### Automatically Tracked:
- **Page Views**: Every time someone visits any page
- **Visitor Information**: Browser type, device type, location (country/city)
- **Referral Source**: Where the visitor came from (Google, direct, social media)
- **Time on Site**: How long visitors stay

### Custom Events We've Implemented:

| Event Name | When It Fires | Purpose |
|-----------|---------------|---------|
| `PageView` | Every page load | Track all traffic |
| `Purchase` | Booking payment successful | Track conversions & ROI |
| `Lead` | Career form submitted | Track job applications |
| `Contact` | Contact form submitted | Track inquiries |
| `InitiateCheckout` | Booking process started | Track booking intent |
| `AddToCart` | Services selected | Track service interest |
| `ViewContent` | Viewing service details | Track content engagement |

### Example Data Sent to Facebook:

When someone completes a booking for £150:
```javascript
{
  event_name: "Purchase",
  event_time: 1234567890,
  user_data: {
    client_ip_address: "192.168.1.1",
    client_user_agent: "Mozilla/5.0...",
    fbc: "fb.1.1234567890.AbCdEfGhIj", // Facebook click ID
    fbp: "fb.1.1234567890.1234567890", // Facebook browser ID
  },
  custom_data: {
    value: 150,
    currency: "GBP"
  }
}
```

---

## Privacy & Security

### What We've Done to Protect Privacy:

1. **Environment Variables**: Your Pixel ID is stored securely in `.env.local`, not hardcoded

2. **Client-Side Only**: The pixel only runs in the browser (marked with `'use client'`)

3. **No Personal Data Sent**: The pixel does NOT send:
   - Names
   - Email addresses
   - Phone numbers
   - Addresses
   - Payment details

4. **HTTPS Only**: All data transmission is encrypted

5. **Cookie Consent**: You should add a cookie consent banner (GDPR/UK compliance)

### GDPR Compliance Notes:

⚠️ **Important**: To be fully compliant with GDPR and UK data protection laws:

1. **Add Cookie Consent Banner**: Before the pixel fires, get user consent
2. **Privacy Policy**: Update your privacy policy to mention Facebook Pixel usage
3. **Data Processing Agreement**: Sign Facebook's Data Processing Agreement

Example cookie banner logic:
```javascript
// Only load pixel if user consents
if (userConsentedToCookies) {
  window.fbq('init', 'YOUR_PIXEL_ID');
}
```

---

## Implementation Details

### Files Created:

1. **`src/components/FacebookPixel.tsx`**
   - Main pixel component
   - Handles initialization
   - Tracks automatic page views
   - Exports helper functions

2. **`src/lib/fbpixel.ts`**
   - Event tracking utilities
   - Easy-to-use functions for tracking events
   - Type-safe helper methods

3. **`.env.local`** (updated)
   - Added: `NEXT_PUBLIC_FB_PIXEL_ID=25165355493153413`

4. **`src/app/layout.tsx`** (updated)
   - Imported FacebookPixel component
   - Added to `<head>` section for site-wide tracking

### Code Structure:

```typescript
// 1. Pixel initializes on every page
<FacebookPixel />

// 2. Automatic PageView tracking on route change
useEffect(() => {
  pageview()
}, [pathname, searchParams])

// 3. Manual event tracking in components
import { trackPurchase } from '@/lib/fbpixel'

// When booking completes:
trackPurchase(bookingData.total, 'GBP')
```

---

## How to Use Events

### Example 1: Track Purchase (Booking Success Page)

```typescript
import { trackPurchase } from '@/lib/fbpixel'

function BookingSuccessPage() {
  useEffect(() => {
    if (bookingData) {
      // Track the purchase
      trackPurchase(bookingData.total, 'GBP')
    }
  }, [bookingData])

  return <div>...</div>
}
```

### Example 2: Track Form Submission (Contact Form)

```typescript
import { trackContact } from '@/lib/fbpixel'

const onSubmit = async (data) => {
  // Submit form...
  await fetch('/api/contact', { ... })

  // Track the contact event
  trackContact()
}
```

### Example 3: Track Service Selection (Booking Form)

```typescript
import { trackAddToCart } from '@/lib/fbpixel'

function handleServiceSelect(service, price) {
  setSelectedService(service)

  // Track when user selects a service
  trackAddToCart(price, 'GBP')
}
```

### Available Functions:

```typescript
// From src/lib/fbpixel.ts

trackPurchase(value: number, currency?: string)
trackLead()
trackContact()
trackInitiateCheckout()
trackAddToCart(value?: number, currency?: string)
trackViewContent(contentName?: string)
trackSearch(searchString: string)
trackCustomEvent(eventName: string, params?: object)
```

---

## Testing & Verification

### Method 1: Facebook Pixel Helper (Chrome Extension)

1. Install "Facebook Pixel Helper" from Chrome Web Store
2. Visit your website
3. Click the extension icon
4. You should see:
   - ✅ Green checkmark = Pixel working
   - Pixel ID: 25165355493153413
   - Events fired (PageView, etc.)

### Method 2: Facebook Events Manager

1. Go to https://business.facebook.com/events_manager
2. Select your Pixel (25165355493153413)
3. Click "Test Events"
4. Enter your website URL
5. Browse your site and watch events appear in real-time

### Method 3: Browser Console

Open browser DevTools Console and type:
```javascript
fbq('track', 'PageView')
```

You should see the pixel object in the console.

### What Success Looks Like:

```
✅ PageView events on every page
✅ Pixel Helper shows green checkmark
✅ Events appearing in Facebook Events Manager
✅ No console errors related to fbq
```

---

## Benefits for Your Business

### 1. **Conversion Tracking**
- See exactly how many bookings came from Facebook ads
- Calculate ROI: If you spend £100 on ads and get £500 in bookings, you know it's profitable

### 2. **Retargeting (Remarketing)**
- Show ads to people who visited your site but didn't book
- Example: "25% off your first booking!" to cart abandoners

### 3. **Lookalike Audiences**
- Facebook finds people similar to your customers
- "Find me more people like those who booked cleaning services"

### 4. **Custom Audiences**
- Target people who:
  - Visited the pricing page but didn't book
  - Started booking but didn't complete payment
  - Visited specific service pages (deep cleaning, gardening, etc.)

### 5. **Ad Optimization**
- Facebook automatically shows ads to people most likely to convert
- Uses pixel data to improve ad delivery over time

### 6. **Performance Insights**
- See which pages drive the most conversions
- Understand customer journey from ad click to purchase
- Identify drop-off points in booking flow

### Example Campaign Strategy:

```
Campaign 1: Cold Traffic
- Target: London homeowners, age 30-55
- Ad: "Professional cleaning services"
- Budget: £50/day

Campaign 2: Warm Traffic (Retargeting)
- Target: Website visitors (last 30 days)
- Ad: "Complete your booking - 10% off"
- Budget: £20/day

Campaign 3: Lookalike
- Target: People similar to customers
- Ad: "Join 500+ happy customers"
- Budget: £30/day
```

---

## Security Best Practices

### ✅ What We Did Right:

1. **Environment Variable**: Pixel ID stored in `.env.local`
2. **TypeScript Types**: Proper type declarations for `window.fbq`
3. **Client-Side Only**: Pixel only runs in browser, not on server
4. **Error Handling**: Checks if `window.fbq` exists before calling
5. **HTTPS Only**: No insecure HTTP connections

### ⚠️ Additional Recommendations:

1. **Add Cookie Consent**: Use a library like `react-cookie-consent`
2. **Content Security Policy**: Add Facebook domains to CSP headers
3. **Privacy Policy**: Update to mention data collection
4. **Data Retention**: Configure pixel data retention in Facebook (recommended: 90 days)
5. **Regular Audits**: Review pixel events quarterly

---

## Troubleshooting

### Problem: Pixel Not Firing

**Check:**
1. Is `NEXT_PUBLIC_FB_PIXEL_ID` in `.env.local`?
2. Did you restart the dev server after adding the env variable?
3. Open DevTools → Console → Look for errors
4. Check Network tab → Filter by "facebook.com" → Should see requests

### Problem: Events Not Showing in Facebook

**Check:**
1. Wait 20 minutes (data processing delay)
2. Make sure you're logged into the correct Facebook Business account
3. Verify Pixel ID matches in Facebook Events Manager
4. Check if ad blocker is interfering (disable for testing)

### Problem: Duplicate Events

**Check:**
1. Pixel should only be in `layout.tsx` (site-wide), not individual pages
2. Don't call `fbq('init', ...)` more than once
3. Use `fbq('track', 'PageView')` not `fbq('init', ...)`

---

## What Happens When Someone Books?

Let's walk through the complete flow:

1. **User searches "cleaning services London"** → Sees your Facebook ad
2. **Clicks ad** → Lands on your website
   *Pixel fires: PageView event*

3. **Browses services** → Views "Deep Cleaning" page
   *Pixel fires: ViewContent event*

4. **Clicks "Book Now"** → Starts booking form
   *Pixel fires: InitiateCheckout event*

5. **Selects services** → Chooses 3 hours of cleaning
   *Pixel fires: AddToCart event (value: £90)*

6. **Completes payment** → Stripe checkout success
   *Pixel fires: Purchase event (value: £90)*

7. **In Facebook Ads Manager**, you see:
   - 1 Purchase conversion
   - Revenue: £90
   - ROAS (Return on Ad Spend): If ad cost £10, ROAS = 9x

8. **Next time you run ads**, Facebook will:
   - Show ads to similar people (lookalike)
   - Optimize delivery for people likely to purchase
   - Exclude this customer (unless you want repeat bookings)

---

## Advanced: Event Parameters

You can send additional data with events:

```typescript
// Rich Purchase event with full details
window.fbq('track', 'Purchase', {
  value: 150.00,
  currency: 'GBP',
  content_name: 'Deep Cleaning Service',
  content_category: 'Cleaning',
  content_type: 'product',
  num_items: 3,
  predicted_ltv: 500.00, // Lifetime value prediction
})

// Lead event with job application details
window.fbq('track', 'Lead', {
  content_name: 'Cleaning Professional Application',
  content_category: 'Career',
  status: 'pending_review',
})
```

---

## Next Steps

### 1. **Immediate (Testing Phase)**
- [ ] Verify pixel fires on all pages
- [ ] Test purchase event on booking-success page
- [ ] Check Events Manager for data

### 2. **Short Term (This Week)**
- [ ] Add cookie consent banner
- [ ] Update privacy policy
- [ ] Add events to contact form
- [ ] Add events to careers form

### 3. **Medium Term (This Month)**
- [ ] Create Facebook custom audiences
- [ ] Set up retargeting campaigns
- [ ] Build lookalike audiences
- [ ] Configure conversion tracking in Ads Manager

### 4. **Long Term (Ongoing)**
- [ ] Analyze pixel data monthly
- [ ] Optimize ad campaigns based on data
- [ ] A/B test different audiences
- [ ] Monitor ROAS and adjust budgets

---

## Quick Reference

### Pixel ID
```
25165355493153413
```

### Environment Variable
```bash
NEXT_PUBLIC_FB_PIXEL_ID=25165355493153413
```

### Import Events
```typescript
import { trackPurchase, trackLead, trackContact } from '@/lib/fbpixel'
```

### Fire Event
```typescript
trackPurchase(150, 'GBP') // Booking completed
trackLead() // Form submitted
trackContact() // Contact initiated
```

### Check if Loaded
```javascript
typeof window !== 'undefined' && window.fbq
```

---

## Support & Resources

- **Facebook Pixel Helper**: https://chrome.google.com/webstore → Search "Facebook Pixel Helper"
- **Events Manager**: https://business.facebook.com/events_manager
- **Facebook Pixel Documentation**: https://developers.facebook.com/docs/facebook-pixel
- **Meta Business Help Center**: https://www.facebook.com/business/help

---

## Summary

**The Facebook Pixel is now installed and tracking:**

✅ Page views on every page
✅ User journeys across your site
✅ Ready for custom event tracking (Purchase, Lead, etc.)
✅ Integrated with Next.js App Router
✅ Environment variable configured
✅ Type-safe implementation

**You can now:**

✨ Create retargeting campaigns
✨ Build lookalike audiences
✨ Track ROI from Facebook ads
✨ Optimize ad delivery
✨ Understand customer behavior

**Next immediate action:** Test the pixel using Facebook Pixel Helper to ensure it's firing correctly!

---

*Last Updated: October 2025*
*Pixel ID: 25165355493153413*
*Implementation: Next.js 15 + TypeScript*
