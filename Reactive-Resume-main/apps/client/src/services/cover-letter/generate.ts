import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface GenerateCoverLetterParams {
  name: string;
  experience: string;
  jobDescription: string;
}

interface GenerateCoverLetterResponse {
  content: string;
}

export const useGenerateCoverLetter = () => {
  const { mutateAsync: generateCoverLetter, isLoading } = useMutation({
    mutationFn: async ({
      name,
      experience,
      jobDescription,
    }: GenerateCoverLetterParams): Promise<GenerateCoverLetterResponse> => {
      try {
        const response = await fetch("/api/cover-letter/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, experience, jobDescription }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to generate cover letter");
        }

        return response.json();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to generate cover letter");
        throw error;
      }
    },
  });

  return {
    generateCoverLetter,
    isLoading,
  };
};
