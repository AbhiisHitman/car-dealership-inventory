import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.email('Enter a valid email address').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

const requiredText = (label: string, max = 60) =>
  z.string(`${label} is required`).trim().min(1, `${label} is required`).max(max);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform(value => value || null)
    .nullable()
    .optional();

const currentYear = new Date().getFullYear();

export const createVehicleSchema = z.object({
  make: requiredText('Make'),
  model: requiredText('Model'),
  category: requiredText('Category', 40),
  price: z.number('Price must be a number').nonnegative('Price cannot be negative').max(100_000_000),
  quantity: z.number().int('Quantity must be a whole number').nonnegative('Quantity cannot be negative').default(0),
  year: z
    .number()
    .int()
    .min(1886, 'Cars did not exist before 1886')
    .max(currentYear + 2)
    .nullable()
    .optional(),
  color: optionalText(40),
  description: optionalText(1000)
});

export const updateVehicleSchema = createVehicleSchema
  .partial()
  .extend({ quantity: z.number().int().nonnegative().optional() })
  .refine(changes => Object.values(changes).some(value => value !== undefined), {
    message: 'Provide at least one field to update'
  });

/** Query strings arrive as text; empty strings mean "no filter". */
const queryNumber = z.preprocess(
  value => (value === '' || value === undefined ? undefined : Number(value)),
  z.number('Price filters must be numbers').nonnegative().optional()
);
const queryText = z.preprocess(
  value => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
  z.string().max(60).optional()
);

export const searchVehiclesSchema = z
  .object({
    make: queryText,
    model: queryText,
    category: queryText,
    minPrice: queryNumber,
    maxPrice: queryNumber
  })
  .refine(f => f.minPrice === undefined || f.maxPrice === undefined || f.minPrice <= f.maxPrice, {
    message: 'minPrice cannot be greater than maxPrice',
    path: ['minPrice']
  });

export const idParamSchema = z.object({ id: z.uuid() });

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
