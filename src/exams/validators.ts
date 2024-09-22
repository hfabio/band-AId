import z from 'zod';

export const validateVerifyExamPayload = z.object({
  image: z.union([z.string().base64('Image format error'), z.string().url('Image url error')]).optional(),
  prompt: z.string().optional()
});