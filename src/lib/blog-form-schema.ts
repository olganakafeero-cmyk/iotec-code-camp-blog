import { z } from 'zod'
import { CATEGORIES, SUBSCRIPTION_MODES } from './blog-options'
import { htmlToText } from './blog-utils'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png']

export const blogFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must be 100 characters or fewer'),
    subtitle: z
      .string()
      .trim()
      .min(10, 'Subtitle must be at least 10 characters')
      .max(250, 'Subtitle must be 250 characters or fewer'),
    category: z.enum(CATEGORIES, { message: 'Choose a category' }),
    subscriptionMode: z.enum(SUBSCRIPTION_MODES, { message: 'Choose free or paid' }),
    priceAmount: z.coerce
      .number({ message: 'Enter a number' })
      .min(0, 'Price cannot be negative'),
    cover: z.custom<File | null>().superRefine((file, ctx) => {
      if (!file) {
        ctx.addIssue({ code: 'custom', message: 'Add a cover image' })
        return
      }
      if (!IMAGE_TYPES.includes(file.type)) {
        ctx.addIssue({ code: 'custom', message: 'Use a WebP, JPG or PNG image' })
      }
      if (file.size > MAX_IMAGE_BYTES) {
        ctx.addIssue({ code: 'custom', message: 'The image must be 5MB or smaller' })
      }
    }),
    body: z
      .string()
      .refine(
        (html) => htmlToText(html).length >= 50,
        'Write at least 50 characters in the blog body',
      ),
  })
  .superRefine((data, ctx) => {
    if (data.subscriptionMode === 'paid' && data.priceAmount <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['priceAmount'],
        message: 'A paid blog must cost at least 500',
      })
    }
  })
      
    