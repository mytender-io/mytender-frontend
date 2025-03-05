import { useContext, useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import withAuth from "../../routes/withAuth";
import { BidContext } from "../BidWritingStateManagerView";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants";
import axios from "axios";
import mammoth from "mammoth";
import { Button } from "@/components/ui/button";
import DocIcon from "@/components/icons/DocIcon";
import { Spinner } from "@/components/ui/spinner";

const ProposalPreview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const { sharedState } = useContext(BidContext);

  const loadPreview = async () => {
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/get_proposal`,
        {
          bid_id: sharedState.object_id,
          extra_instructions: "",
          datasets: []
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          },
          responseType: "blob"
        }
      );

      const arrayBuffer = await response.data.arrayBuffer();

      // Add style mapping options for mammoth
      const options = {
        styleMap: [
          "p[style-name='Title'] => h1.document-title",
          "p[style-name='Subtitle'] => p.document-subtitle",
          "p[style-name='Heading 1'] => h1",
          "p[style-name='Heading 2'] => h2"
        ]
      };

      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      setHtmlContent(`
        <style>
          h1.document-title {
            font-size: 36px;
            margin-top: 0;
          }
          p.document-subtitle {
            font-size: 24px;
          }
          h1 { margin-top: 24px; margin-bottom: 16px; }
          h2 { margin-top: 20px; margin-bottom: 12px; }
        </style>
        ${result.value}
      `);

      const url = URL.createObjectURL(response.data);
      setDocUrl(url);
      setIsLoading(false);
    } catch (err) {
      console.error("Preview loading error:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
    return () => {
      if (docUrl) {
        URL.revokeObjectURL(docUrl);
      }
    };
  }, [sharedState.object_id]);

  const handleWordDownload = async () => {
    if (docUrl) {
      const link = document.createElement("a");
      link.href = docUrl;
      link.download = `proposal_${sharedState.bidInfo || "document"}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Here is your first draft:</h3>
          <Button
            variant="outline"
            onClick={handleWordDownload}
            className="flex items-center gap-2 text-orange border-orange hover:text-orange-light hover:bg-orange-light/10"
          >
            <DocIcon />
            Download Word
          </Button>
        </div>
        <div className="flex-1 border-[0.5px] border-b-0 border-gray-line rounded-t-lg overflow-auto bg-white p-8 h-full w-full max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner className="w-8 h-8" />
            </div>
          ) : htmlContent ? (
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              className="font-sans text-base leading-relaxed w-full m-0"
            />
          ) : (
            <div className="flex justify-center items-center h-full bg-muted p-5 text-center">
              <p>
                Generate a Proposal to preview it here. Click on the bid outline
                tab, then on the generate proposal button.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(ProposalPreview);
