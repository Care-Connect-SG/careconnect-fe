export interface ReportSectionContent {
  form_element_id: string;
  input: string | null
}

export interface ReportBase {
  form_id: string;
  reporter_id: string;
  report_content: ReportSectionContent[];
  status: "Submitted" | "Pending Edit" | "Approved";
}

export interface ReportComplete extends ReportBase {
  _id: string;
  created_date: string;
}
