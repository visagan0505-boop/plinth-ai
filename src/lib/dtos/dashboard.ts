import { z } from 'zod';

export const DashboardMetricsSchema = z.object({
  activeJobsCount: z.number().min(0),
  activeStaffCount: z.number().min(0),
  submittedTimeEntries: z.number().min(0),
  approvedTimeEntries: z.number().min(0),
  totalHoursThisWeek: z.number().min(0),
  totalHoursThisMonth: z.number().min(0),
  utilisationSnapshot: z.number().min(0).max(100),
  totalFeeValue: z.number().min(0),
});

export type DashboardMetricsDTO = z.infer<typeof DashboardMetricsSchema>;

export const ActivityFeedEventSchema = z.object({
  id: z.string().uuid(),
  eventType: z.string(),
  occurredAt: z.string(),
  actorName: z.string().optional(),
});

export type ActivityFeedEventDTO = z.infer<typeof ActivityFeedEventSchema>;
