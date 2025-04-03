export const enum ReportStatus {
  DRAFT = "Draft",
  PUBLISHED = "Published",
  SUBMITTED = "Submitted",
  CHANGES_REQUESTED = "Changes Requested",
  CHANGES_MADE = "Changes Made",
}

export interface ReportSectionContent {
  form_element_id: string;
  input: string | string[];
}

export enum ReportReviewStatus {
  PENDING = "Pending",
  RESOLVED = "Resolved",
}

export interface ReportReviewCreate {
  review_id: string;
  reviewer: CaregiverTag;
  review: string;
}

export interface ReportReview extends ReportReviewCreate {
  resolution?: string | null;
  status: ReportReviewStatus;
  reviewed_at: Date;
  resolved_at?: Date | null;
}

export interface ReportCreate {
  form_id: string;
  form_name: string;
  reporter: CaregiverTag;
  primary_resident?: ResidentTag | null;
  involved_residents?: ResidentTag[];
  involved_caregivers?: CaregiverTag[];
  report_content: ReportSectionContent[];
  status: ReportStatus;
  reference_report_id?: string;
  reviews?: ReportReview[];
}

export interface ReportResponse extends ReportCreate {
  id: string;
  created_at: Date;
  submitted_at?: Date | null;
  last_updated_at: Date;
  published_at?: Date | null;
}

export interface ResidentTag {
  id: string;
  name: string;
}

export interface CaregiverTag {
  id: string;
  name: string;
  role: string;
}
