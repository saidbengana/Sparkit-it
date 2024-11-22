import { useMutation } from "@tanstack/react-query";

interface PrintCoverLetterParams {
  content: string;
}

interface PrintCoverLetterResponse {
  url: string;
}

export const usePrintCoverLetter = () => {
  const { mutateAsync: printCoverLetter, isLoading: loading } = useMutation({
    mutationFn: async ({ content }: PrintCoverLetterParams): Promise<PrintCoverLetterResponse> => {
      const response = await fetch("/api/cover-letter/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      return response.json();
    },
  });

  return { printCoverLetter, loading };
};
