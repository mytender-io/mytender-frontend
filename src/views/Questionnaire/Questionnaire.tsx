import React, { useState, useRef } from "react";
import { useAuthUser } from "react-auth-kit";
import * as XLSX from "xlsx";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import withAuth from "../../routes/withAuth.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PlusIcon from "@/components/icons/PlusIcon.tsx";
import FastIcon from "@/components/icons/FastIcon.tsx";
import { Upload, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import ElipsisMenuIcon from "@/components/icons/ElipsisMenuIcon";
import RecyclebinIcon from "@/components/icons/RecyclebinIcon";
import { toast } from "react-toastify";
import { cn } from "@/utils/index.ts";
import PaginationRow from "@/components/PaginationRow";
import SkeletonRow from "../Bids/components/SkeletonRow.tsx";

interface Question {
  id: string;
  question: string;
  answer: string;
  collaborator: string;
  approved: boolean;
  isNew?: boolean;
}

// Dummy data for initial display
const dummyQuestions: Question[] = [
  {
    id: "1",
    question: "What is your company's approach to sustainability?",
    answer:
      "Our company implements a comprehensive sustainability program that includes reducing carbon emissions, minimizing waste, and sourcing materials responsibly.",
    collaborator: "Jane Smith",
    approved: true
  },
  {
    id: "2",
    question: "Describe your quality assurance process.",
    answer:
      "We have a rigorous QA process that includes multiple testing phases, peer reviews, and automated testing to ensure consistent quality.",
    collaborator: "John Doe",
    approved: false
  },
  {
    id: "3",
    question: "What certifications does your company hold?",
    answer:
      "Our company holds ISO 9001, ISO 14001, and industry-specific certifications that demonstrate our commitment to quality and standards compliance.",
    collaborator: "Robert Johnson",
    approved: true
  }
];

const Questionnaire = () => {
  const [questions, setQuestions] = useState<Question[]>(dummyQuestions);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getAuth = useAuthUser();
  const auth = getAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate pagination values
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentQuestions = questions.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Add an empty question to the list
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      answer: "",
      collaborator: auth?.fullName || "Current User",
      approved: false,
      isNew: true
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);

    // Go to the last page if the new question would be there
    const newTotalPages = Math.ceil(updatedQuestions.length / pageSize);
    if (currentPage < newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  // Handle question text change (only for new questions)
  const handleQuestionChange = (id: string, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, question: value } : q))
    );
  };

  // Handle answer text change
  const handleAnswerChange = (id: string, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  };

  // Handle approval status change
  const handleApprovalChange = (id: string, value: boolean) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, approved: value } : q))
    );
  };

  // Delete a question
  const deleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);

    // Adjust current page if needed (e.g., if we deleted the last item on the last page)
    const newTotalPages = Math.ceil(updatedQuestions.length / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }

    toast.success("Question deleted");
  };

  // Cancel adding a new question
  const cancelNewQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Finalize a new question (remove isNew flag)
  const finalizeQuestion = (id: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, isNew: false } : q))
    );
    toast.success("Question saved");
  };

  // Handle file selection and automatically upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Automatically process the file after selection
      setLoading(true);
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON with headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Map the Excel data to our Question interface
          const parsedQuestions: Question[] = jsonData.map(
            (row: Record<string, unknown>, index) => ({
              id: (Date.now() + index).toString(),
              question: row.question || row.Question || "",
              answer: row.answer || row.Answer || "",
              collaborator:
                row.collaborator ||
                row.Collaborator ||
                auth?.fullName ||
                "Current User",
              approved: Boolean(row.approved || row.Approved || false),
              isNew: false
            })
          );

          setQuestions(parsedQuestions);
          setCurrentPage(1); // Reset to first page after import
          toast.success("File uploaded and processed successfully");
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast.error("Error parsing Excel file. Please check the format.");
        } finally {
          setLoading(false);
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

      reader.onerror = () => {
        toast.error("Error reading file");
        setLoading(false);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.readAsBinaryString(selectedFile);
    }
  };

  // Generate dummy answers using fixed responses
  const autofillAnswers = () => {
    const dummyAnswers = [
      "Our company has extensive experience in this area with proven results.",
      "We follow industry best practices and maintain rigorous standards.",
      "Our team of experts has developed innovative solutions to address this requirement.",
      "We have a comprehensive approach that ensures quality and compliance.",
      "Our methodology incorporates regular reviews and continuous improvement."
    ];

    setLoading(true);

    setTimeout(() => {
      const updatedQuestions = questions.map((q) => ({
        ...q,
        answer:
          q.answer ||
          dummyAnswers[Math.floor(Math.random() * dummyAnswers.length)]
      }));

      setQuestions(updatedQuestions);
      setLoading(false);
      toast.success("Answers generated successfully");
    }, 1000); // Simulate API delay
  };

  // Download an Excel template
  const downloadTemplate = () => {
    const templateData = [
      {
        Question: "Enter your question here",
        Answer: "Enter your answer here",
        Collaborator: "Enter collaborator name",
        Approved: false
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questionnaire");

    // Generate Excel file
    XLSX.writeFile(workbook, "questionnaire_template.xlsx");
  };

  const parentPages = [] as Array<{ name: string; path: string }>;

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "flex items-center justify-between w-full border-b border-typo-200 pl-6 py-2 min-h-14",
          "pr-6"
        )}
      >
        <BreadcrumbNavigation
          currentPage="Questionnaire"
          parentPages={parentPages}
        />
      </div>
      <div className="flex flex-col flex-1 px-6 py-4 overflow-y-auto">
        <div className="flex justify-end gap-3 mb-6">
          <Button variant="link" onClick={addQuestion} className="text-orange">
            <PlusIcon /> Add Question
          </Button>
          <Button
            variant="link"
            onClick={autofillAnswers}
            className="text-orange"
          >
            <FastIcon /> Autofill Answers
          </Button>
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx,.xls"
            />
            <Button
              variant="link"
              onClick={() => fileInputRef.current?.click()}
              className="text-orange"
            >
              <Upload /> Import Questionnaire
            </Button>
          </>
          <Button
            variant="link"
            onClick={downloadTemplate}
            className="text-orange"
          >
            <Download /> Download Import Template
          </Button>
        </div>

        <div className="flex flex-col justify-between flex-1 overflow-y-auto space-y-4">
          <div className="border border-typo-200 rounded-lg overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-sm text-typo-900 font-semibold py-3.5 px-4">
                    #
                  </TableHead>
                  <TableHead className="w-1/3 text-sm text-typo-900 font-semibold py-3.5 px-4">
                    Question
                  </TableHead>
                  <TableHead className="w-2/3 text-sm text-typo-900 font-semibold py-3.5 px-4">
                    Answer
                  </TableHead>
                  <TableHead className="w-32 text-sm text-typo-900 font-semibold py-3.5 px-4">
                    Collaborator
                  </TableHead>
                  <TableHead className="w-24 text-sm text-typo-900 font-semibold py-3.5 px-4">
                    Approved
                  </TableHead>
                  <TableHead className="w-[100px] text-right text-sm text-typo-900 font-semibold py-3.5 px-4 select-none">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(14)
                    .fill(0)
                    .map((_, index) => <SkeletonRow key={index} rowCount={6} />)
                ) : currentQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No questions added yet. Add a question or import a
                      questionnaire.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentQuestions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell className="px-4">
                        {indexOfFirstItem + index + 1}
                      </TableCell>
                      <TableCell className="px-4">
                        {question.isNew ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={question.question}
                              onChange={(e) =>
                                handleQuestionChange(
                                  question.id,
                                  e.target.value
                                )
                              }
                              placeholder="Enter question..."
                            />
                          </div>
                        ) : (
                          <div className="py-2">{question.question}</div>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <Input
                          value={question.answer}
                          onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                          }
                          className={cn(
                            !question.isNew && "border-0 shadow-none"
                          )}
                          placeholder="Enter answer..."
                        />
                      </TableCell>
                      <TableCell className="px-4">
                        {question.collaborator}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={question.approved}
                            onCheckedChange={(checked) =>
                              handleApprovalChange(question.id, !!checked)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex justify-end">
                          {question.isNew ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => finalizeQuestion(question.id)}
                                disabled={!question.question.trim()}
                                size="sm"
                                variant="default"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() => cancelNewQuestion(question.id)}
                                size="sm"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 rounded-full bg-transparent hover:bg-gray-light focus-visible:ring-0"
                                >
                                  <ElipsisMenuIcon className="w-4 h-4 text-gray-hint_text" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-[150px]"
                              >
                                <DropdownMenuItem
                                  onClick={() => deleteQuestion(question.id)}
                                >
                                  <RecyclebinIcon className="h-4 w-4" />
                                  Delete Question
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          {questions.length > 0 && (
            <PaginationRow
              currentPage={currentPage}
              pageSize={pageSize}
              totalRecords={questions.length}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Questionnaire);
