import { z } from 'zod'

export const CreateVehicleSchema = z.object({
  plate_number: z.string().regex(/^[A-Z]{1,2}\s\d{1,4}\s[A-Z]{1,3}$/, 'Format plat tidak valid'),
  type: z.enum(['motor', 'pickup', 'van', 'truck']),
  capacity_kg: z.number().positive(),
  capacity_volume_m3: z.number().positive(),
  fuel_type: z.string().min(1),
  year: z.number().int().min(2000).max(new Date().getFullYear()),
  notes: z.string().optional(),
})

export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>
