import React, { useState, useRef, useContext } from "react";
import { useAuthUser } from "react-auth-kit";
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
import { cn } from "@/utils/index.ts";
import PaginationRow from "@/components/PaginationRow";
import SkeletonRow from "../Bids/components/SkeletonRow.tsx";
import {
  BidContext,
  QuestionnaireQuestion
} from "../BidWritingStateManagerView.tsx";
import { addQuestion, autofillAnswers, handleImportQuestionnaire, downloadTemplate, handleQuestionChange, handleAnswerChange, handleApprovalChange, finalizeQuestion, cancelNewQuestion, deleteQuestion } from "./questionnaireFunctions.tsx";

const Questionnaire = () => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getAuth = useAuthUser();
  const auth = getAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get questions from shared state
  const questions = sharedState.questionnaire || [];

  // Calculate pagination values
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentQuestions = questions.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Update the shared state with new questions
  const updateSharedStateQuestions = (
    updatedQuestions: QuestionnaireQuestion[]
  ) => {
    setSharedState((prev) => ({
      ...prev,
      questionnaire: updatedQuestions
    }));
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
          <Button 
            variant="link" 
            onClick={() => addQuestion(
              questions, 
              updateSharedStateQuestions, 
              setCurrentPage, 
              currentPage, 
              pageSize, 
              auth
            )} 
            className="text-orange"
          >
            <PlusIcon /> Add Question
          </Button>
          <Button
            variant="link"
            onClick={() => autofillAnswers(
              questions,
              sharedState,
              updateSharedStateQuestions,
              setLoading,
              auth
            )}
            className="text-orange"
          >
            <FastIcon /> Autofill Answers
          </Button>
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleImportQuestionnaire(
                e,
                sharedState,
                updateSharedStateQuestions,
                setCurrentPage,
                setLoading,
                setFile,
                fileInputRef,
                auth
              )}
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
            onClick={() => downloadTemplate(
              sharedState,
              setLoading,
              auth
            )}
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
                                  e.target.value,
                                  questions,
                                  updateSharedStateQuestions
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
                            handleAnswerChange(
                              question.id,
                              e.target.value,
                              questions,
                              updateSharedStateQuestions
                            )
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
                              handleApprovalChange(
                                question.id,
                                !!checked,
                                questions,
                                updateSharedStateQuestions
                              )
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex justify-end">
                          {question.isNew ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => finalizeQuestion(
                                  question.id,
                                  questions,
                                  updateSharedStateQuestions
                                )}
                                disabled={!question.question.trim()}
                                size="sm"
                                variant="default"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() => cancelNewQuestion(
                                  question.id,
                                  questions,
                                  updateSharedStateQuestions
                                )}
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
                                  onClick={() => deleteQuestion(
                                    question.id,
                                    questions,
                                    updateSharedStateQuestions,
                                    setCurrentPage,
                                    currentPage,
                                    pageSize
                                  )}
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