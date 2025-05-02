import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { QuestionnaireQuestion } from "../BidWritingStateManagerView";
import { toast } from "react-toastify";

// Import questionnaire from Excel file
export const handleImportQuestionnaire = async (
  e: React.ChangeEvent<HTMLInputElement>,
  sharedState: any,
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void,
  setLoading: (loading: boolean) => void,
  setFile: (file: File | null) => void,
  fileInputRef: React.RefObject<HTMLInputElement>,
  auth: any
) => {
  if (e.target.files && e.target.files.length > 0) {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setLoading(true);

    try {
      // Create form data for file upload
      const fileFormData = new FormData();
      fileFormData.append("bid_id", sharedState.object_id || "");
      fileFormData.append("file", selectedFile);

      // Send the file to the server for processing
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/import_questionnaire`,
        fileFormData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (result.data.success && result.data.questions) {
        // Use the server-processed questions
        updateSharedStateQuestions(result.data.questions);
        toast.success("File uploaded and processed successfully");
      } else {
        toast.error(result.data.message || "Failed to process questionnaire");
      }
    } catch (error) {
      console.error("Error uploading questionnaire file:", error);
      toast.error("Failed to upload questionnaire. Please try again.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }
};

// Generate answers using AI
export const autofillAnswers = async (
  questions: QuestionnaireQuestion[],
  sharedState: any,
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void,
  setLoading: (loading: boolean) => void,
  auth: any
) => {
  try {
    setLoading(true);

    // Collect questions that need answers
    const questionsToFill = questions.filter(
      (q) => !q.answer || q.answer.trim() === ""
    );

    if (questionsToFill.length === 0) {
      toast.info("All questions already have answers");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("bid_id", sharedState.object_id || "");
    formData.append("questions", JSON.stringify(questionsToFill));

    const result = await axios.post(
      `http${HTTP_PREFIX}://${API_URL}/autofill_questionnaire`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    if (result.data.success && result.data.answers) {
      // Update the questions with the generated answers
      const updatedQuestions = questions.map((q) => {
        const generatedAnswer = result.data.answers.find(
          (a: any) => a.id === q.id
        );
        return generatedAnswer
          ? { ...q, answer: generatedAnswer.answer || q.answer }
          : q;
      });

      updateSharedStateQuestions(updatedQuestions);
      toast.success("Answers generated successfully");
    } else {
      toast.error(result.data.message || "Failed to generate answers");
    }
  } catch (error) {
    console.error("Error generating answers:", error);
    toast.error("Failed to generate answers. Please try again.");
  } finally {
    setLoading(false);
  }
};

// Download an Excel template
export const downloadTemplate = async (
  sharedState: any,
  setLoading: (loading: boolean) => void,
  auth: any
) => {
  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("bid_id", sharedState.object_id || "");

    const response = await axios.post(
      `http${HTTP_PREFIX}://${API_URL}/download_questionnaire_excel`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "multipart/form-data",
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        },
        responseType: "blob"
      }
    );

    // Create a download link for the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "questionnaire_template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Template downloaded successfully");
  } catch (error) {
    console.error("Error downloading template from server:", error);
    toast.error("Failed to download template. Please try again.");
  } finally {
    setLoading(false);
  }
};

// Add an empty question to the list
export const addQuestion = (
  questions: QuestionnaireQuestion[],
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void,
  auth: any
) => {
  const newQuestion: QuestionnaireQuestion = {
    id: Date.now().toString(),
    question: "",
    answer: "",
    collaborator: auth?.email || "Current User",
    approved: false,
    isNew: true
  };

  const updatedQuestions = [...questions, newQuestion];
  updateSharedStateQuestions(updatedQuestions);
};

// Handle question text change (only for new questions)
export const handleQuestionChange = (
  id: string,
  value: string,
  questions: QuestionnaireQuestion[],
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void
) => {
  const updatedQuestions = questions.map((q) =>
    q.id === id ? { ...q, question: value } : q
  );
  updateSharedStateQuestions(updatedQuestions);
};

// Handle answer text change
export const handleAnswerChange = (
  id: string,
  value: string,
  questions: QuestionnaireQuestion[],
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void
) => {
  const updatedQuestions = questions.map((q) =>
    q.id === id ? { ...q, answer: value } : q
  );
  updateSharedStateQuestions(updatedQuestions);
};

// Handle approval status change
export const handleApprovalChange = (
  id: string,
  value: boolean,
  questions: QuestionnaireQuestion[],
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void
) => {
  const updatedQuestions = questions.map((q) =>
    q.id === id ? { ...q, approved: value } : q
  );
  updateSharedStateQuestions(updatedQuestions);
};

// Delete a question
export const deleteQuestion = (
  id: string,
  questions: QuestionnaireQuestion[],
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void
) => {
  const updatedQuestions = questions.filter((q) => q.id !== id);
  updateSharedStateQuestions(updatedQuestions);

  toast.success("Question deleted");
};

// Cancel adding a new question
export const cancelNewQuestion = (
  id: string,
  questions: QuestionnaireQuestion[],
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void
) => {
  const updatedQuestions = questions.filter((q) => q.id !== id);
  updateSharedStateQuestions(updatedQuestions);
};

// Finalize a new question (remove isNew flag)
export const finalizeQuestion = (
  id: string,
  questions: QuestionnaireQuestion[],
  updateSharedStateQuestions: (questions: QuestionnaireQuestion[]) => void
) => {
  const updatedQuestions = questions.map((q) =>
    q.id === id ? { ...q, isNew: false } : q
  );
  updateSharedStateQuestions(updatedQuestions);
  toast.success("Question saved");
};
