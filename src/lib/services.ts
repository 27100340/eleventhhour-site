export type Service = {
  slug: string
  name: string
  blurb: string
  images: string[]
  subServices?: string[]
  specialNote?: string
}
export const SERVICES: Service[] = [
  {
    slug: 'cleaning',
    name: 'Cleaning',
    blurb: 'From deep home cleans to scheduled office maintenance, our cleaning services are designed for comfort, health, and luxury. We use eco-friendly products, advanced tools, and a detail-oriented approach that keeps your space immaculate.',
    images: ['/svc-clean-1.jpg','/svc-clean-2.jpg'],
    subServices: ['Deep Cleaning', 'End of Tenancy Cleaning', 'Office & Commercial Cleaning', 'After-Party & Emergency Cleaning']
  },
  {
    slug: 'gardening',
    name: 'Gardening',
    blurb: 'Transform your outdoor spaces with our professional gardening and landscaping services. We handle everything from seasonal upkeep to full redesigns — ensuring your garden reflects your home\'s beauty.',
    images: ['/svc-garden-1.jpg','/svc-garden-2.jpg'],
    subServices: ['Lawn Care & Maintenance', 'Hedge Trimming & Pruning', 'Planting & Landscaping', 'Garden Clearance']
  },
  {
    slug: 'handyman',
    name: 'Handyman',
    blurb: 'From wall repairs to assembling bespoke furniture, our skilled handymen handle every small job with precision and care.',
    images: ['/svc-handyman-1.jpg','/svc-handyman-2.jpg'],
    subServices: ['Painting & Decorating', 'Furniture Assembly', 'Wall Mounting & Fixing', 'Minor Repairs']
  },
  {
    slug: 'plumbing-heating',
    name: 'Plumbing & Heating',
    blurb: 'We provide certified plumbing and heating solutions — from fixing leaks to installing entire systems.',
    images: ['/svc-plumb-1.jpg','/svc-plumb-2.jpg'],
    subServices: ['Pipe Repairs & Leak Fixes', 'Boiler Servicing & Installation', 'Radiator & Heating Maintenance', 'Bathroom Fittings']
  },
  {
    slug: 'gas-boiler',
    name: 'Gas & Boiler',
    blurb: 'Our Gas Safe registered engineers keep your home safe, warm, and efficient.',
    images: ['/svc-boiler-1.jpg','/svc-boiler-2.jpg'],
    subServices: ['Annual Boiler Servicing', 'Emergency Gas Repairs']
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    blurb: 'From fitting lighting installations to performing small electrical jobs safely and efficiently — our team handles it all.',
    images: ['/svc-electric-1.jpg','/svc-electric-2.jpg'],
    subServices: ['Lighting installations', 'Small electric jobs']
  },
  {
    slug: 'pet-care',
    name: 'Pet Care & Cleaning',
    blurb: 'We love pets — and we know they can make a bit of a mess. Our team uses gentle, pet-safe products to keep your home fresh and hygienic.',
    images: ['/svc-pest-1.jpg','/svc-pest-2.jpg'],
    subServices: ['Pet hair & odour removal', 'Carpet & upholstery cleaning', 'Accident and litter area refresh'],
    specialNote: 'Mention PETS while booking to let our team know to use pet friendly products.'
  },
  { slug: 'locksmith', name: 'Locksmith', blurb: '24/7 lockouts, lock replacement & security upgrades.', images: ['/svc-lock-1.jpg','/svc-lock-2.jpg'] },
  { slug: 'appliance-repair', name: 'Appliance Repair', blurb: 'Ovens, washers, fridges—diagnostics & fixes.', images: ['/svc-appliance-1.jpg','/svc-appliance-2.jpg'] },
  { slug: 'landscaping', name: 'Landscaping', blurb: 'Hard & soft landscaping projects, design to build.', images: ['/svc-land-1.jpg','/svc-land-2.jpg'] },
]
export const getService = (slug: string) => SERVICES.find(s => s.slug === slug)
