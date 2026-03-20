import { z } from 'zod';

const requiredField = 'Заполните это поле.';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, requiredField)
    .email('Введите корректный email.'),
  password: z
    .string()
    .min(1, requiredField)
    .min(8, 'Пароль должен содержать минимум 8 символов.'),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Укажите имя.'),
    lastName: z.string().trim().min(1, 'Укажите фамилию.'),
    middleName: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .min(1, requiredField)
      .email('Введите корректный email.'),
    phone: z
      .string()
      .trim()
      .min(1, 'Укажите телефон.')
      .regex(/^[\d\s()+-]{10,20}$/, 'Введите корректный телефон.'),
    department: z.string().trim().min(1, 'Укажите подразделение.'),
    position: z.string().trim().min(1, 'Укажите должность.'),
    password: z
      .string()
      .min(1, requiredField)
      .min(8, 'Пароль должен содержать минимум 8 символов.'),
    confirmPassword: z.string().min(1, 'Повторите пароль.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли должны совпадать.',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
