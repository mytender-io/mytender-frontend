import React, { useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
// import withAuth from "../routes/withAuth";
import { useAuthUser } from "react-auth-kit";
import { FileIcon } from "lucide-react";
import { displayAlert } from "../helper/Alert";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const SelectTenderLibraryFile: React.FC<{
  bid_id: string;
  onFileSelect: (files: string[]) => void;
  initialSelectedFiles: string[];
}> = ({ bid_id, onFileSelect, initialSelectedFiles }) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [documents, setDocuments] = useState([]);
  const [documentListVersion, setDocumentListVersion] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState(() => {
    const initialSelection = new Set([...initialSelectedFiles]);
    return Array.from(initialSelection);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(documents.length / rowsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const fetchDocuments = async () => {
    try {
      console.log("tender library docs");
      if (bid_id) {
        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/get_tender_library_doc_filenames`,
          { bid_id: bid_id },
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "application/json"
            }
          }
        );
        console.log("tender library docs", response.data);
        setDocuments(response.data.filenames);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching tender library filenames:", error);
      displayAlert("Error fetching documents", "danger");
      setIsLoading(false);
    }
  };

  const handleFileSelect = (filename) => {
    setSelectedFiles((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(filename)) {
        newSelection.delete(filename);
      } else {
        newSelection.add(filename);
      }
      const newSelectionArray = Array.from(newSelection);
      onFileSelect(newSelectionArray);
      return newSelectionArray;
    });
  };

  useEffect(() => {
    setSelectedFiles((prev) => {
      const newSelection = new Set([...initialSelectedFiles]);
      return Array.from(newSelection);
    });
  }, [initialSelectedFiles]);

  useEffect(() => {
    fetchDocuments();
  }, [bid_id, documentListVersion]);

  return (
    <Card className="h-[22.5rem] bg-white rounded-md shadow-sm p-4">
      <CardContent className="h-full p-0 overflow-y-auto">
        <>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <Table>
              <TableBody>
                {documents
                  .slice(
                    (currentPage - 1) * rowsPerPage,
                    currentPage * rowsPerPage
                  )
                  .map((doc, index) => (
                    <TableRow
                      key={index}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <TableCell className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedFiles.includes(doc.filename)}
                          onCheckedChange={() => handleFileSelect(doc.filename)}
                        >
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4" />
                            <span className="text-sm">{doc.filename}</span>
                          </div>
                        </Checkbox>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => paginate(i + 1)}
                  disabled={currentPage === i + 1}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      </CardContent>
    </Card>
  );
};

export default SelectTenderLibraryFile;
