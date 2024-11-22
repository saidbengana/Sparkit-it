import { t } from "@lingui/macro";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Panel, PanelGroup, PanelResizeHandle } from "@appractic/ui";

import { CoverLetterForm } from "./_components/form";
import { CoverLetterPreview } from "./_components/preview";

export const CoverLetterPage = () => {
  useEffect(() => {
    document.title = t`Cover Letter Generator - Appractic`;
  }, []);

  return (
    <>
      <Helmet>
        <title>{t`Cover Letter Generator - Appractic`}</title>
        <meta name="description" content={t`Generate professional cover letters with Appractic's AI-powered cover letter generator.`} />
      </Helmet>

      <main className="relative h-screen overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={40} minSize={30} className="overflow-y-auto">
            <div className="h-full p-6">
              <CoverLetterForm />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 hover:w-1.5 transition-all" />

          <Panel minSize={30} className="overflow-y-auto">
            <div className="h-full p-6">
              <CoverLetterPreview />
            </div>
          </Panel>
        </PanelGroup>
      </main>
    </>
  );
};
