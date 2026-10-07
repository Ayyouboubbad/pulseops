import { z } from 'zod';

export const createMonitorSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(50),
  url: z.string().url('L\'URL fournie n\'est pas valide (doit commencer par http:// ou https://)'),
  type: z.enum(['http', 'https']).default('https'),
  interval: z.number().int().min(10, 'L\'intervalle minimum est de 10 secondes').max(3600).default(60),
  timeout: z.number().int().min(1000).max(30000).default(10000),
  alertConfig: z.object({
    telegram: z.object({
      enabled: z.boolean().default(false),
      chatId: z.string().optional().default('')
    }).optional(),
    discord: z.object({
      enabled: z.boolean().default(false),
      webhookUrl: z.string().optional().default('')
    }).optional()
  }).optional()
});

export const updateMonitorSchema = createMonitorSchema.partial();
