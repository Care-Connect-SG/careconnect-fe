export interface ReportSectionContent {
  form_element_id: string;
  input: string | null;
}

export interface ReportCreate {
  form_id: string;
  form_name: string;
  reporter_id: string;
  reporter_name: string;
  primary_resident?: string;
  primary_resident_name?: string;
  involved_residents?: string[];
  involved_residents_name?: string[];
  involved_caregivers?: string[];
  involved_caregivers_name?: string[];
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
