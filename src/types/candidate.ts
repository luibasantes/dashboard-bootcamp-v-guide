import { z } from 'zod';

export const CandidateStatusSchema = z.enum([
  'Pending',
  'Reviewing',
  'Interviewing',
  'Hired',
]);

export const CandidateSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, 'Escribir el nombre')
    .max(40, 'Maximo 40 caracteres')
    .describe('Nombre del candidato'),
  lastname: z.string().min(1, 'Escribir el apellido').max(40).nullish(),
  email: z.email('Email inválido').nullish(),
  position: z.string().max(60).nullish(),
  linkedIn: z.string().url('URL inválida').nullish().or(z.literal('')),
  appliedAt: z.string().nullish(),
  age: z
    .number()
    .min(18, 'Solo mayores de edad')
    .max(100, 'No mas de 100')
    .nullish()
    .describe('Edad del candidato'),
  experience: z
    .number()
    .min(0)
    .nullish()
    .describe('Experiencia en años del candidato'),
  status: CandidateStatusSchema,
  skills: z.array(z.string().min(1)).min(1, 'Minima una skill'),
  working: z.boolean().nullish(),
  deleted: z.boolean(),
});

export type CandidateType = z.infer<typeof CandidateSchema>;

export const FormCandidateSchema = CandidateSchema.omit({
  id: true,
  appliedAt: true,
});

export type FormCandidateType = z.infer<typeof FormCandidateSchema>;

export const UpdateCandidateSchema = CandidateSchema;

export type UpdateCandidateType = z.infer<typeof UpdateCandidateSchema>;
