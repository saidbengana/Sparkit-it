import { Card } from '@/components/ui/card';
import { useCoverLetterStore } from '@/stores/cover-letter';
import { Editor } from '@/components/editor';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { printCoverLetter } from '@/services/cover-letter/print';

export const CoverLetterPreview = () => {
  const content = useCoverLetterStore((state) => state.content);
  const setContent = useCoverLetterStore((state) => state.setContent);

  const handleExport = async () => {
    await printCoverLetter();
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-lg font-semibold">Cover Letter Preview</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={!content}
        >
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {content ? (
          <div className="mx-auto max-w-[800px]">
            <Editor
              content={content}
              onChange={setContent}
              className="prose max-w-none"
              editorProps={{
                attributes: {
                  class: 'focus:outline-none min-h-[500px]',
                },
              }}
              extensions={[
                // Add any additional editor extensions here
              ]}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Generate a cover letter to preview it here
          </div>
        )}
      </div>
    </Card>
  );
};
