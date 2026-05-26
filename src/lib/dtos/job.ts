import { z } from 'zod';

export const JobAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  suburb: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  region: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  country: z.string().default('NZ'),
});

export const CreateJobSchema = z.object({
  name: z.string().min(1, "Job name is required"),
  clientId: z.string().uuid("Client is required"),
  jobTypeId: z.string().uuid("Job Type is required"),
  statusId: z.string().uuid("Status is required"),
  riskTierId: z.string().uuid("Risk Tier is required"),
  projectDirectorId: z.string().uuid("Project Director is required"),
  designManagerId: z.string().uuid("Design Manager is optional").optional().nullable(),
  primaryOfficeId: z.string().uuid("Primary Office is required"),
  
  siteAddress: JobAddressSchema.optional().nullable(),
  lotNumber: z.string().optional().nullable(),
  dpNumber: z.string().optional().nullable(),
  
  feeValue: z.number().min(0).default(0),
  projectRiskValue: z.number().min(0).default(0),
  
  openedDate: z.string().optional(),
  targetCompletionDate: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  id: z.string().uuid("Invalid job ID"),
});

export type CreateJobDTO = z.infer<typeof CreateJobSchema>;
export type UpdateJobDTO = z.infer<typeof UpdateJobSchema>;
