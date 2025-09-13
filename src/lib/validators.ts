import { z } from 'zod'

export const BookingSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(3),
  city: z.string().min(2),
  postcode: z.string().min(3),
  phone: z.string().min(5), // GB validation done separately
  frequency: z.enum(['weekly','bi_weekly','monthly','one_time']),
  serviceType: z.enum([
    'one_bed','two_bed','three_bed','four_bed','five_bed','six_bed',
    'regular','deep','hourly','end_of_tenancy'
  ]),
  serviceDate: z.string(),     // ISO string
  arrivalWindow: z.number(),   // 0 = exact time; map as needed
  paymentMethod: z.enum(['cash','card']).default('cash'),
  extras: z.object({
    insideFridge: z.boolean().optional(),
    walls: z.boolean().optional(),
    laundry: z.boolean().optional(),
    insideOven: z.boolean().optional(),
    insideWindows: z.boolean().optional(),
    moveInOut: z.boolean().optional(),
    insideCabinets: z.boolean().optional(),
    deepCleaning: z.boolean().optional(),
  }).optional(),
  quantities: z.object({
    carpetCleaning: z.number().int().nonnegative().default(0),
    singleOven: z.number().int().nonnegative().default(0),
    doubleOven: z.number().int().nonnegative().default(0),
    rangeOven: z.number().int().nonnegative().default(0),
    washingMachine: z.number().int().nonnegative().default(0),
    fridge: z.number().int().nonnegative().default(0),
  }).optional(),
})

export type BookingValues = z.infer<typeof BookingSchema>
