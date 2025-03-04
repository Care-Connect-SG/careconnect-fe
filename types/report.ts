export interface ReportSectionContent {
  form_element_id: string;
  input: string | null;
}

export interface ReportCreate {
  form_id: string;
  reporter_id: string;
  primary_resident?: string;
  involved_residents?: string[];
  involved_caregivers?: string[];
  report_content: ReportSectionContent[];
  status: "Draft" | "Published";
}

export interface ReportResponse extends ReportCreate {
  id: string;
  created_date: string;
  published_date?: string;
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