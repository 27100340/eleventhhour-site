export type Service = {
  id: string
  name: string
  price: number
  time_minutes: number
  active: boolean
  order_index: number
  question_type: 'plus_minus' | 'checkbox' | 'dropdown'
  dropdown_options: { label: string; value: string | number }[]
}

export type FormConfig = {
  id: string
  name: string
  active: boolean
  config: {
    base_fields: string[]
    arrival_windows: string[]
    frequencies: Array<'one_time'|'weekly'|'bi_weekly'|'monthly'>
    service_selector: 'quantities' | 'checkboxes'
    allowed_services: { service_id: string; default_qty: number }[]
  }
}

export type Booking = {
  id: string
  status: 'draft'|'active'|'cancelled'|'completed'
  source: 'web'|'admin'
  email: string
  first_name: string
  last_name: string
  address: string
  city: string
  postcode: string
  phone: string
  frequency: 'one_time'|'weekly'|'bi_weekly'|'monthly'
  service_date: string | null
  arrival_window: 'exact'|'morning'|'afternoon'|null
  discount: number
  admin_time_override: number | null
  subtotal: number
  total: number
  total_time_minutes: number
  payment_status?: 'pending'|'paid'|'failed'|'refunded'
  created_at: string
}

export type BookingItem = {
  id: string
  booking_id: string
  service_id: string
  qty: number
  unit_price: number
  time_minutes: number
}
