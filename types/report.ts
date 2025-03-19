export const enum ReportStatus {
  DRAFT = "Draft",
  PUBLISHED = "Published",
}

export interface ReportSectionContent {
  form_element_id: string;
  input: string | string[];
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
}

export interface ReportResponse extends ReportCreate {
  id: string;
  created_at: Date;
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
