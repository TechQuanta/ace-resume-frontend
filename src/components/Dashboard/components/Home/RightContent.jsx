// src/components/Home/RightContent.jsx
import React, { lazy, Suspense } from 'react';
import Loading from '../../../Shared/Loading';

// --- Lazy Load Editor Components ---
const QuilEditor = lazy(() => import('../../components/EditingComponents/QuilEditor'));
const ResumeEditor = lazy(() => import('../../components/EditingComponents/AdobeEditor'));

const RightContent = ({ activeEditorType }) => {
  const renderEditor = () => {
    switch (activeEditorType) {
      case 'cover-letter':
        return <QuilEditor/>;
      case 'resume-editor':
        return <ResumeEditor />;
      default:
        return (
          <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400 p-4 text-center">
            <p>Select an editor from the "Swap Editor" menu on the left to get started!</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 h-full bg-transparent dark:bg-transparent overflow-y-auto flex justify-center items-start mt-[70px]">
      {/* A4 Paper Container */}
      <div
        className="
          w-full max-w-[21cm]
          h-full
          aspect-[210/297]
          flex flex-col
          overflow-hidden
          text-gray-900 dark:text-gray-100
        "
        style={{ minHeight: '29.7cm' }}
      >
        {/* main-editor-content now fills the A4 container and will center its content */}
        <div
          id="main-editor-content"
          // --- ADD FONT CLASS HERE ---
          className="w-full h-[100%] flex justify-center items-center font-serif" // Example: Using a serif font
          // Try also: "font-sans" (default), "font-mono"
        >
          {/* Suspense boundary for lazy-loaded components, using the Loading component as fallback */}
          <Suspense fallback={<Loading />}>
            {renderEditor()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default RightContent;