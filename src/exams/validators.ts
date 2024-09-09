import z from 'zod';

export const validateVerifyExamPayload = z.object({
  image: z.string().base64('Image format error').optional(),
  prompt: z.string().optional()
});