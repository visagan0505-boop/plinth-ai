import { z } from 'zod';

export const TenantOnboardingSchema = z.object({
  tenantName: z.string().min(3, "Tenant name must be at least 3 characters").max(100),
  tenantSlug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  
  // Initial Office
  officeName: z.string().min(3, "Office name must be at least 3 characters").max(100),
  
  // Initial Discipline
  disciplineName: z.string().min(3, "Discipline name must be at least 3 characters").max(100),
  
  // Operational Staff Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  
  // Temporal/Financial
  costRate: z.number().min(0, "Cost rate cannot be negative"),
  billRate: z.number().min(0, "Bill rate cannot be negative"),
});

export type TenantOnboardingDTO = z.infer<typeof TenantOnboardingSchema>;

export type OnboardingResult = 
  | { success: true; tenantId: string }
  | { success: false; error: 'ValidationFailed'; details: z.ZodError }
  | { success: false; error: 'AlreadyOnboarded' }
  | { success: false; error: 'SlugUnavailable' }
  | { success: false; error: 'DatabaseError'; message: string };
