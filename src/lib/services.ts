export type Service = {
  slug: string
  name: string
  blurb: string
  images: string[]
}
export const SERVICES: Service[] = [
  { slug: 'cleaning', name: 'Cleaning', blurb: 'Domestic & commercial cleans: regular, deep, end of tenancy.', images: ['/svc-clean-1.jpg','/svc-clean-2.jpg'] },
  { slug: 'gardening', name: 'Gardening', blurb: 'Hedge trimming, lawn care and seasonal tidy-ups.', images: ['/svc-garden-1.jpg','/svc-garden-2.jpg'] },
  { slug: 'handyman', name: 'Handyman', blurb: 'Small repairs, mounting, odd jobs done right.', images: ['/svc-handyman-1.jpg','/svc-handyman-2.jpg'] },
  { slug: 'plumbing-heating', name: 'Plumbing & Heating', blurb: 'Leaks, installs and maintenance by Gas Safe engineers.', images: ['/svc-plumb-1.jpg','/svc-plumb-2.jpg'] },
  { slug: 'gas-boiler', name: 'Gas & Boiler', blurb: 'Servicing, repairs and new boiler installs.', images: ['/svc-boiler-1.jpg','/svc-boiler-2.jpg'] },
  { slug: 'electrical', name: 'Electrical', blurb: 'Fault-finding, lighting, sockets & consumer units.', images: ['/svc-electric-1.jpg','/svc-electric-2.jpg'] },
  { slug: 'pest-control', name: 'Pest Control', blurb: 'Rapid response for rodents, insects & more.', images: ['/svc-pest-1.jpg','/svc-pest-2.jpg'] },
  { slug: 'locksmith', name: 'Locksmith', blurb: '24/7 lockouts, lock replacement & security upgrades.', images: ['/svc-lock-1.jpg','/svc-lock-2.jpg'] },
  { slug: 'appliance-repair', name: 'Appliance Repair', blurb: 'Ovens, washers, fridges—diagnostics & fixes.', images: ['/svc-appliance-1.jpg','/svc-appliance-2.jpg'] },
  { slug: 'landscaping', name: 'Landscaping', blurb: 'Hard & soft landscaping projects, design to build.', images: ['/svc-land-1.jpg','/svc-land-2.jpg'] },
]
export const getService = (slug: string) => SERVICES.find(s => s.slug === slug)
