import React, { useContext, useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../helper/Constants";
import axios from "axios";
import withAuth from "../routes/withAuth";
import { useAuthUser } from "react-auth-kit";
import SideBarSmall from "../routes/SidebarSmall";
import { Button, Row } from "react-bootstrap";
import BidNavbar from "@/views/Bid/components/BidNavbar";
import ProposalEditor from "./ProposalEditor";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState
} from "draft-js";
import "./Proposal.css";
import { BidContext } from "./BidWritingStateManagerView";
import { TabProvider } from "../routes/TabProvider";
import BidCompilerWizard from "../wizards/BidCompilerWizard";
import posthog from "posthog-js";
import { displayAlert } from "../helper/Alert";

const Proposal = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const { sharedState, saveProposal } = useContext(BidContext);
  const { bidInfo, contributors } = sharedState;

  const [isLoading, setIsLoading] = useState(false);
  const [appendResponse, setAppendResponse] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState("-1");
  const [isSaved, setIsSaved] = useState(false);

  const typingTimeout = useRef(null);

  const currentUserPermission = contributors[auth.email] || "viewer";
  const canUserEdit =
    currentUserPermission === "admin" || currentUserPermission === "editor";

  const exportToDocx = (editorState) => {
    posthog.capture("proposal_export_to_word", {
      bidId: sharedState.object_id,
      bidName: bidInfo
    });
    if (!editorState) {
      console.error("No editor state available");
      return;
    }

    const contentState = editorState.getCurrentContent();
    const contentText = contentState.getPlainText("\n");

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: contentText.split("\n").map(
            (line) =>
              new Paragraph({
                children: [new TextRun(line)]
              })
          )
        }
      ]
    });

    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, "proposal.docx");
      })
      .catch((err) => {
        console.error("Error creating DOCX:", err);
      });
  };

  const handleSaveProposal = async () => {
    setIsLoading(true);
    posthog.capture("proposal_save_started", {
      bidId: sharedState.object_id,
      bidName: bidInfo
    });

    setIsSaved(false);
    try {
      await saveProposal();
      displayAlert("Proposal saved successfully", "success");
      posthog.capture("proposal_save_succeeded", {
        bidId: sharedState.object_id,
        bidName: bidInfo
      });
    } catch (error) {
      displayAlert("Failed to save proposal", "danger");
      posthog.capture("proposal_save_failed", {
        bidId: sharedState.object_id,
        bidName: bidInfo,
        error: error.message
      });
    }
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="chatpage">
      <SideBarSmall />
      <div className="lib-container">
        <div className="scroll-container">
          <BidNavbar />
          <TabProvider>
            <ProposalEditor
              bidData={
                sharedState.documents[sharedState.currentDocumentIndex]
                  ?.editorState
              }
              appendResponse={appendResponse}
              selectedQuestionId={selectedQuestionId}
              setSelectedQuestionId={setSelectedQuestionId}
            />
          </TabProvider>
          <Row>
            <div className="mb-2">
              <Button
                variant={"primary"}
                onClick={() =>
                  exportToDocx(
                    sharedState.documents[sharedState.currentDocumentIndex]
                      ?.editorState
                  )
                }
                className="ml-2 upload-button"
              >
                Export to Word
              </Button>
              <Button
                style={{ marginLeft: "5px" }}
                onClick={handleSaveProposal}
                className="save-button"
                disabled={isLoading || !canUserEdit}
              >
                {isSaved ? "Saved" : "Save Document"}
              </Button>
            </div>
          </Row>
        </div>
      </div>
      {/* <BidCompilerWizard /> */}
    </div>
  );
};

export default withAuth(Proposal);
