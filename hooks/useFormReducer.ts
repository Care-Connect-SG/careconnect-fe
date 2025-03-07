import { useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

export type FormElementType =
  | "text"
  | "textarea"
  | "date"
  | "radio"
  | "checkbox";

export interface FormElementData {
  element_id: string;
  type: FormElementType;
  label: string;
  helptext: string;
  required: boolean;
  options?: string[];
}

export type FormState = {
  title: string;
  description: string;
  elements: FormElementData[];
};

type Action =
  | { type: "SET_FORM"; payload: FormState }
  | { type: "UPDATE_TITLE"; payload: string }
  | { type: "UPDATE_DESCRIPTION"; payload: string }
  | { type: "ADD_ELEMENT"; payload: FormElementType }
  | {
      type: "UPDATE_ELEMENT";
      payload: { element_id: string; updatedData: Partial<FormElementData> };
    }
  | { type: "REMOVE_ELEMENT"; payload: string };

const formReducer = (state: FormState, action: Action): FormState => {
  switch (action.type) {
    case "SET_FORM":
      return { ...state, ...action.payload };
    case "UPDATE_TITLE":
      return { ...state, title: action.payload };
    case "UPDATE_DESCRIPTION":
      return { ...state, description: action.payload };
    case "ADD_ELEMENT":
      return {
        ...state,
        elements: [
          ...state.elements,
          {
            element_id: uuidv4(),
            type: action.payload,
            label: "",
            helptext: "",
            required: false,
            options:
              action.payload === "radio" || action.payload === "checkbox"
                ? ["Option 1"]
                : undefined,
          },
        ],
      };
    case "UPDATE_ELEMENT":
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.element_id === action.payload.element_id
            ? { ...el, ...action.payload.updatedData }
            : el,
        ),
      };
    case "REMOVE_ELEMENT":
      return {
        ...state,
        elements: state.elements.filter(
          (el) => el.element_id !== action.payload,
        ),
      };
    default:
      return state;
  }
};

export function useFormReducer(
  initialState: FormState = { title: "", description: "", elements: [] },
) {
  return useReducer(formReducer, initialState);
}
