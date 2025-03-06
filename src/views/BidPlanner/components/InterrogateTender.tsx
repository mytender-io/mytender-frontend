import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuthUser } from "react-auth-kit";
import { API_URL, HTTP_PREFIX } from "../../../helper/Constants";
import { Search, FileSearch, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "react-toastify";

// The actual InterrogateTender component that will be shown in the dialog
const InterrogateTenderContent = ({
  bid_id,
  viewFile,
  onSearch,
  initialSearchTerm = "",
  initialSearchResults = []
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState(initialSearchResults);

  useEffect(() => {
    if (initialSearchResults.length > 0) {
      setSearchResults(initialSearchResults);
    }
  }, [initialSearchResults]);

  const searchTenderDocs = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    // setError(null);
    try {
      console.log(
        "Sending request to:",
        `http${HTTP_PREFIX}://${API_URL}/search_tender_documents`
      );
      console.log("Search query:", searchQuery);
      console.log("Bid ID:", bid_id);
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/search_tender_documents`,
        { input_text: searchQuery, bid_id: bid_id },
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );
      console.log("Response:", response.data);
      setSearchResults(response.data);
      onSearch(response.data, searchQuery);
      if (response.data.length === 0) {
        toast.warning("No results found. Please try a different search query.");
      }
    } catch (error) {
      console.error("Error searching tender documents:", error);
      const errorMessage = error.response?.data?.detail || error.message;
      toast.error(`Error searching tender documents: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, bid_id, onSearch]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      searchTenderDocs();
    },
    [searchTenderDocs]
  );

  const highlightKeywords = useCallback((text, keywords) => {
    if (!text) return "";
    // Filter out empty keywords
    const filteredKeywords = keywords.filter(
      (keyword) => keyword.trim().length > 0
    );
    if (filteredKeywords.length === 0) return text;

    const regex = new RegExp(`(${filteredKeywords.join("|")})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-orange text-black">
          {part}
        </span>
      ) : (
        part
      )
    );
  }, []);

  const handleSnippetClick = useCallback(
    async (result) => {
      setIsLoadingText(true);
      await viewFile(
        result.document_name,
        result.page_number,
        searchQuery,
        result.snippet
      );
      setIsLoadingText(false);
      // Remove the closing behavior - don't call onClose
    },
    [viewFile, searchQuery]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-hint_text">
        Extract quick tender insights to help formulate your bid strategy
      </p>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter your search query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-20 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none"
            autoFocus
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="absolute right-0 top-0 h-full rounded-l-none"
          >
            {isLoading ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </span>
            )}
          </Button>
        </div>
      </form>

      <div className="max-h-[65vh] overflow-y-auto pr-2 pb-4">
        {searchResults.length > 0 && (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => !isLoadingText && handleSnippetClick(result)}
              >
                <CardContent className="p-4">
                  <h5 className="font-medium mb-2">{result.document_name}</h5>
                  <p className="text-sm text-gray-700">
                    {highlightKeywords(result.snippet, searchQuery.split(" "))}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Dialog wrapper component that can be triggered from elsewhere
const InterrogateTenderDialog = ({ bid_id, triggerComponent }) => {
  const [open, setOpen] = useState(false);

  const [textContent, setTextContent] = useState("");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentSnippet, setCurrentSnippet] = useState("");
  const [isViewingText, setIsViewingText] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const textContentRef = useRef(null);

  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const viewFile = useCallback(
    async (fileName, pageNumber, searchTerm, snippet) => {
      console.log("viewFile called with:", {
        fileName,
        pageNumber,
        searchTerm,
        snippet
      });
      setIsLoadingText(true);
      setIsViewingText(true); // This sets the state to show file content
      try {
        const formData = new FormData();
        formData.append("bid_id", bid_id);
        formData.append("file_name", fileName);

        const response = await axios.post(
          `http${HTTP_PREFIX}://${API_URL}/show_tenderLibrary_file_content_word_format`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        console.log("API response:", response.data);
        setTextContent(response.data.content);
        setCurrentSearchTerm(searchTerm);
        setCurrentSnippet(snippet);
      } catch (error) {
        console.error("Error viewing file:", error);
        toast.error(
          `Error viewing file: ${error.response?.data?.detail || error.message}`
        );
        setIsViewingText(false);
      } finally {
        setIsLoadingText(false);
      }
    },
    [bid_id]
  );
  // Enhanced highlightContent function for better snippet matching
  const highlightContent = useCallback((content, snippet) => {
    console.log("highlightContent called with:", {
      contentLength: content?.length,
      snippet
    });
    if (!content || !snippet) return content;

    // Remove ellipsis from the beginning and end of the snippet
    const trimmedSnippet = snippet
      .replace(/^\.\.\./, "")
      .replace(/\.\.\.$/, "")
      .trim();
    console.log("Trimmed snippet:", trimmedSnippet);

    // More robust approach for partial matching
    // Extract significant words (3+ characters) for better matching
    const significantWords = trimmedSnippet
      .split(/\s+/)
      .filter((word) => word.length >= 3)
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (significantWords.length === 0) {
      console.log("No significant words found in snippet");
      return content;
    }

    console.log("Significant words:", significantWords);

    // Try to find a section of content that contains most of these words in proximity
    let bestMatchIndex = -1;
    let bestMatchCount = 0;
    let bestMatchLength = 0;

    // Check each significant word as a potential starting point
    for (const word of significantWords) {
      const wordRegex = new RegExp(word, "gi");
      let wordMatch;

      while ((wordMatch = wordRegex.exec(content)) !== null) {
        const startIndex = wordMatch.index;
        // Look for other significant words within a reasonable window (e.g., 200 chars)
        const windowSize = 200;
        const searchWindow = content.substring(
          startIndex,
          Math.min(startIndex + windowSize, content.length)
        );

        let matchCount = 1; // We already matched one word
        for (const otherWord of significantWords) {
          if (
            otherWord !== word &&
            searchWindow.match(new RegExp(otherWord, "i"))
          ) {
            matchCount++;
          }
        }

        if (
          matchCount > bestMatchCount ||
          (matchCount === bestMatchCount &&
            searchWindow.length < bestMatchLength)
        ) {
          bestMatchCount = matchCount;
          bestMatchIndex = startIndex;
          bestMatchLength = searchWindow.length;
        }
      }
    }

    console.log("Best match stats:", {
      bestMatchIndex,
      bestMatchCount,
      totalSignificantWords: significantWords.length
    });

    // If we found a good match, highlight the relevant section
    if (bestMatchIndex >= 0) {
      const matchPercentage = (bestMatchCount / significantWords.length) * 100;
      console.log(`Match confidence: ${matchPercentage.toFixed(2)}%`);

      // Determine highlight range - expand a bit around the best match
      const contextPadding = 50;
      const highlightStart = Math.max(0, bestMatchIndex - contextPadding);
      const highlightEnd = Math.min(
        content.length,
        bestMatchIndex + bestMatchLength + contextPadding
      );

      // Highlight the section
      const highlightedContent =
        content.substring(0, highlightStart) +
        `<mark id="snippet-match" class="highlighted-snippet bg-orange text-black">` +
        content.substring(highlightStart, highlightEnd) +
        "</mark>" +
        content.substring(highlightEnd);

      console.log(
        "Created highlight from index",
        highlightStart,
        "to",
        highlightEnd
      );
      return highlightedContent;
    }

    // Fallback to regular expression approach if no good match was found
    console.log("Falling back to regex pattern matching");
    try {
      // Create a more flexible pattern - look for consecutive words with flexible spacing
      const flexPattern = significantWords.join("[\\s\\S]{1,30}");
      const snippetRegex = new RegExp(flexPattern, "i");

      const match = snippetRegex.exec(content);
      if (match) {
        console.log("Found fallback match at index:", match.index);
        const matchText = match[0];
        return (
          content.substring(0, match.index) +
          `<mark id="snippet-match" class="highlighted-snippet bg-orange text-black">` +
          matchText +
          "</mark>" +
          content.substring(match.index + matchText.length)
        );
      }
    } catch (error) {
      console.error("Error in regex fallback:", error);
    }

    // If all else fails, return the original content
    console.log("No matches found for snippet");
    return content;
  }, []);

  // Improved scrollToHighlight function
  const scrollToHighlight = useCallback(() => {
    if (textContentRef.current) {
      // First try to find the specific marked snippet
      const highlightedElement =
        textContentRef.current.querySelector("#snippet-match");

      if (highlightedElement) {
        console.log("Found highlighted element with ID snippet-match");
        const container = textContentRef.current;
        const containerRect = container.getBoundingClientRect();
        const highlightRect = highlightedElement.getBoundingClientRect();

        // Calculate the scroll position
        const highlightTop =
          highlightRect.top + container.scrollTop - containerRect.top;

        // Define padding to position the highlight in the center of the viewport
        const padding = containerRect.height / 3;
        const newScrollTop = Math.max(0, highlightTop - padding);

        // Scroll to the new position
        container.scrollTo({
          top: newScrollTop,
          behavior: "smooth"
        });

        // Add a temporary visual emphasis to help the user see the match
        highlightedElement.classList.add("pulsate");
        setTimeout(() => {
          highlightedElement.classList.remove("pulsate");
        }, 2000);

        console.log(
          "Scrolled to highlighted element at position:",
          newScrollTop
        );
      } else {
        console.log("No highlighted element found with ID snippet-match");
        // If no specific highlight was found, try any highlighted snippet
        const anyHighlight = textContentRef.current.querySelector(
          ".highlighted-snippet"
        );
        if (anyHighlight) {
          console.log("Found generic highlighted element");
          anyHighlight.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        } else {
          console.log("No highlighted elements found to scroll to");
        }
      }
    }
  }, []);

  useEffect(() => {
    console.log("useEffect triggered with:", {
      textContentLength: textContent?.length,
      currentSnippet,
      isLoadingText
    });
    let scrollTimeoutId;

    if (!isLoadingText && textContent && currentSnippet) {
      scrollTimeoutId = setTimeout(() => {
        scrollToHighlight();
      }, 500); // Wait for 0.5 seconds after content is loaded before scrolling
    }

    return () => {
      if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
      }
    };
  }, [textContent, currentSnippet, isLoadingText, scrollToHighlight]);

  const handleSearch = useCallback((results, query) => {
    console.log("handleSearch called with:", {
      resultsCount: results.length,
      query
    });
    setSearchResults(results);
    setCurrentSearchTerm(query);
  }, []);

  const handleBackToSearch = useCallback(() => {
    setIsViewingText(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerComponent || (
          <Button
            variant="outline"
            className="w-full justify-start border-gray-spacer_light hover:bg-background hover:text-current"
          >
            <div className="flex items-center space-x-3">
              <FileSearch className="h-5 w-5 text-gray" />
              <span className="text-gray-hint_text font-medium">
                Ask questions about the tender...
              </span>
            </div>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isViewingText && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 -ml-2"
                onClick={handleBackToSearch}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to search</span>
              </Button>
            )}
            {isViewingText ? "Document Viewer" : "Search Tender Documents"}
          </DialogTitle>
        </DialogHeader>
        {isViewingText ? (
          <>
            {isLoadingText ? (
              <div className="flex justify-center items-center p-10">
                <Spinner />
              </div>
            ) : (
              <div
                ref={textContentRef}
                className="h-[500px] w-full overflow-y-auto border border-gray-200 rounded-md p-4 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightContent(textContent, currentSnippet)
                }}
              />
            )}
          </>
        ) : (
          <InterrogateTenderContent
            bid_id={bid_id}
            viewFile={viewFile}
            onSearch={handleSearch}
            initialSearchTerm={currentSearchTerm}
            initialSearchResults={searchResults}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InterrogateTenderDialog;
