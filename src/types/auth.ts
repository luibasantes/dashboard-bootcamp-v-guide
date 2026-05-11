import z from 'zod';

const PasswordSchema = z.string().min(6).max(24);

export const EmailAndPasswordLoginSchema = z.object({
  email: z.email(),
  password: PasswordSchema,
});

export type EmailAndPasswordLoginType = z.infer<
  typeof EmailAndPasswordLoginSchema
>;

export const EmailAndPasswordRegisterFormSchema =
  EmailAndPasswordLoginSchema.extend({
    name: z.string().min(2, 'Escribir el nombre').max(40),
    confirmPassword: PasswordSchema,
  }).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'invalid_value',
        path: ['confirmPassword'],
        values: [data.confirmPassword],
        message: 'Passwords do not match',
      });
    }
  });

export type EmailAndPasswordRegisterFormType = z.infer<
  typeof EmailAndPasswordRegisterFormSchema
>;

// User

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
});

export type UserType = z.infer<typeof UserSchema>;
