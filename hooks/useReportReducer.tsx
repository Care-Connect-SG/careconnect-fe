import {
  CaregiverTag,
  ReportSectionContent,
  ResidentTag,
} from "@/types/report";
import { useReducer } from "react";

export interface ReportState {
  report_content: ReportSectionContent[];
  primaryResident: ResidentTag | null;
  involvedResidents: ResidentTag[];
  involvedCaregivers: CaregiverTag[];
  isSubmitting: boolean;
  error: string | null;
}

const initialReportState: ReportState = {
  report_content: [],
  primaryResident: null,
  involvedResidents: [],
  involvedCaregivers: [],
  isSubmitting: false,
  error: null,
};

type ReportAction =
  | { type: "SET_REPORT"; payload: ReportState }
  | { type: "SET_REPORT_CONTENT"; payload: ReportSectionContent[] }
  | { type: "UPDATE_INPUT"; payload: { form_element_id: string; input: any } }
  | { type: "SET_PRIMARY_RESIDENT"; payload: ResidentTag | null }
  | { type: "UNSET_PRIMARY_RESIDENT"; paylod: string }
  | { type: "ADD_INVOLVED_RESIDENT"; payload: ResidentTag }
  | { type: "REMOVE_INVOLVED_RESIDENT"; payload: string }
  | { type: "ADD_INVOLVED_CAREGIVER"; payload: CaregiverTag }
  | { type: "REMOVE_INVOLVED_CAREGIVER"; payload: string }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const reportReducer = (
  state: ReportState,
  action: ReportAction,
): ReportState => {
  switch (action.type) {
    case "SET_REPORT":
      return { ...state, ...action.payload };
    case "SET_REPORT_CONTENT":
      return { ...state, report_content: action.payload };
    case "UPDATE_INPUT":
      return {
        ...state,
        report_content: state.report_content.map((section) =>
          section.form_element_id === action.payload.form_element_id
            ? { ...section, input: action.payload.input }
            : section,
        ),
      };
    case "SET_PRIMARY_RESIDENT":
      return { ...state, primaryResident: action.payload };
    case "UNSET_PRIMARY_RESIDENT":
      return { ...state, primaryResident: null };
    case "ADD_INVOLVED_RESIDENT":
      return {
        ...state,
        involvedResidents: [...state.involvedResidents, action.payload],
      };
    case "REMOVE_INVOLVED_RESIDENT":
      return {
        ...state,
        involvedResidents: state.involvedResidents.filter(
          (resident) => resident.id !== action.payload,
        ),
      };
    case "ADD_INVOLVED_CAREGIVER":
      return {
        ...state,
        involvedCaregivers: [...state.involvedCaregivers, action.payload],
      };
    case "REMOVE_INVOLVED_CAREGIVER":
      return {
        ...state,
        involvedCaregivers: state.involvedCaregivers.filter(
          (caregiver) => caregiver.id !== action.payload,
        ),
      };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export function useReportReducer(
  initialState: ReportState = initialReportState,
) {
  return useReducer(reportReducer, initialState);
}
