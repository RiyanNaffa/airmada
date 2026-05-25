import { z } from 'zod'

export const CreateShipmentSchema = z.object({
  sender_name: z.string().min(2),
  sender_address: z.string().min(5),
  recipient_name: z.string().min(2),
  recipient_address: z.string().min(5),
  recipient_lat: z.number().min(-90).max(90),
  recipient_lng: z.number().min(-180).max(180),
  weight_kg: z.number().positive(),
  volume_m3: z.number().positive(),
  priority: z.enum(['regular', 'express', 'same_day']),
  notes: z.string().optional(),
})

export const UpdateShipmentStatusSchema = z
  .object({
    status: z.enum(['pickup', 'in_transit', 'delivered', 'failed']),
    note: z.string().optional(),
    location_lat: z.number().optional(),
    location_lng: z.number().optional(),
    failure_reason: z.string().optional(),
  })
  .refine((data) => data.status !== 'failed' || !!data.failure_reason, {
    message: 'failure_reason wajib diisi jika status = failed',
    path: ['failure_reason'],
  })

export type CreateShipmentInput = z.infer<typeof CreateShipmentSchema>
export type UpdateShipmentStatusInput = z.infer<typeof UpdateShipmentStatusSchema>
