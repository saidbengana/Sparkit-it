import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface PersonalInfo {
  name?: string;
  experience?: string;
}

interface CoverLetterState {
  content: string;
  jobDescription: string;
  personalInfo: PersonalInfo;
  setContent: (content: string) => void;
  updateContent: (content: string) => void;
  setJobDescription: (description: string) => void;
  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  reset: () => void;
}

const initialState = {
  content: "",
  jobDescription: "",
  personalInfo: {},
};

export const useCoverLetterStore = create<CoverLetterState>()(
  devtools(
    (set) => ({
      ...initialState,

      setContent: (content) => set({ content }),
      updateContent: (content) => set({ content }),
      setJobDescription: (jobDescription) => set({ jobDescription }),
      setPersonalInfo: (info) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, ...info },
        })),
      reset: () => set(initialState),
    }),
    { name: "Cover Letter Store" },
  ),
);
