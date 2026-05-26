import { z } from 'zod';

export const RoleEnum = z.enum([
  'director',
  'project_director',
  'design_manager',
  'senior_engineer',
  'engineer',
  'graduate',
  'drafter',
  'admin',
  'finance'
]);

export const CreateStaffSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  preferredName: z.string().optional().nullable(),
  email: z.string().email("Valid email is required"),
  role: RoleEnum,
  primaryOfficeId: z.string().uuid("Office must be selected"),
  primaryDisciplineId: z.string().uuid("Discipline must be selected").optional().nullable(),
  hourlyCostRate: z.number().min(0).optional().nullable(),
  hourlyBillRate: z.number().min(0).optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true)
});

export const UpdateStaffSchema = CreateStaffSchema.partial().extend({
  id: z.string().uuid("Invalid staff ID"),
});

export type CreateStaffDTO = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffDTO = z.infer<typeof UpdateStaffSchema>;
