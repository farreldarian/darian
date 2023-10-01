import { z } from 'zod'
import { tagSchema } from './tag'

export const addTransactionSchema = z.object({
  name: z.string(),
  amount: z.coerce.number().min(0),
  tag: tagSchema.optional(),
  date: z.coerce.date(),
})
