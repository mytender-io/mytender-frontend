import React, { useRef, useEffect } from "react";
import { Spinner } from "react-bootstrap";

const PDFViewer = ({ pdfUrl, isLoading, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">Document Viewer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="relative flex-1 w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-[10000]">
              <Spinner animation="border" style={{ width: "2rem", height: "2rem", color: "black" }} />
            </div>
          )}
          {!pdfUrl && !isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
              <div className="text-2xl text-gray-600 mb-4">No PDF Found</div>
              <div className="text-gray-500">
                Please try uploading the file again
              </div>
            </div>
          ) : (
            <iframe src={pdfUrl} className="w-full h-full" title="PDF Viewer" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;