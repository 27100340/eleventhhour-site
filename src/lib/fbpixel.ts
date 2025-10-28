// Facebook Pixel Event Tracking Utilities

declare global {
  interface Window {
    fbq: any
  }
}

// Track Purchase event (for completed bookings/payments)
export function trackPurchase(value: number, currency: string = 'GBP') {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
    })
  }
}

// Track Lead event (for form submissions)
export function trackLead() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead')
  }
}

// Track Contact event (when user initiates contact)
export function trackContact() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact')
  }
}

// Track InitiateCheckout event (when booking process starts)
export function trackInitiateCheckout() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout')
  }
}

// Track AddToCart event (when services are selected)
export function trackAddToCart(value?: number, currency: string = 'GBP') {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', value ? { value, currency } : {})
  }
}

// Track ViewContent event (when viewing service details)
export function trackViewContent(contentName?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', contentName ? { content_name: contentName } : {})
  }
}

// Track Search event (when user searches)
export function trackSearch(searchString: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', { search_string: searchString })
  }
}

// Track Custom Events (must be created in Facebook Events Manager first)
export function trackCustomEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params || {})
  }
}
