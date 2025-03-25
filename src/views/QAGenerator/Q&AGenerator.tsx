import { useEffect, useRef, useState } from "react";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import axios from "axios";
import withAuth from "../../routes/withAuth.tsx";
import { useAuthUser } from "react-auth-kit";
// import SideBarSmall from "../routes/SidebarSmall.tsx";
import handleGAEvent from "../../utils/handleGAEvent.tsx";
// import "./QuestionsCrafter.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import {
  Editor,
  EditorState,
  Modifier,
  SelectionState,
  convertToRaw,
  ContentState
} from "draft-js";
import "draft-js/dist/Draft.css";
import SelectFolderModal from "./components/SelectFolderModal.tsx";
import BidDropdown from "./components/BidDropdown.tsx";
import FolderLogic from "./components/Folders.tsx";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import PlusIcon from "@/components/icons/PlusIcon";
import { Checkbox } from "@/components/ui/checkbox";

const QAGenerator = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [dataset, setDataset] = useState("default");
  const [availableCollections, setAvailableCollections] = useState([]);
  const [folderContents, setFolderContents] = useState({});

  const [selectedBidId, setSelectedBidId] = useState("");

  const [isCopilotVisible, setIsCopilotVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [tempText, setTempText] = useState("");
  const [copilotOptions, setCopilotOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);

  const [inputText, setInputText] = useState(
    localStorage.getItem("inputText") || ""
  );
  const [responseEditorState, setResponseEditorState] = useState(
    EditorState.createWithContent(
      ContentState.createFromText(localStorage.getItem("response") || "")
    )
  );
  const [contentLoaded, setContentLoaded] = useState(true); // Set to true initially
  const [selectionRange, setSelectionRange] = useState({
    start: null,
    end: null
  });

  const responseBoxRef = useRef(null); // Ref for the response box
  const promptsContainerRef = useRef(null); // Ref for the prompts container
  const editorRef = useRef(null);

  const [selectedDropdownOption, setSelectedDropdownOption] =
    useState("library-chat");
  const bidPilotRef = useRef(null);

  const [selectedFolders, setSelectedFolders] = useState(["default"]);

  const handleSaveSelectedFolders = (folders) => {
    console.log("Received folders in parent:", folders);
    setSelectedFolders(folders);
  };
  useEffect(() => {
    localStorage.setItem(
      "response",
      convertToRaw(responseEditorState.getCurrentContent())
        .blocks.map((block) => block.text)
        .join("\n")
    );
  }, [responseEditorState]);

  const styleMap = {
    ORANGE: {
      backgroundColor: "orange"
    }
  };

  const handleClearMessages = () => {
    setMessages([
      {
        type: "bot",
        text: "Welcome to Bid Pilot! Ask questions about your company library data or search the internet for up to date information. Select text in the response box to use copilot and refine the response."
      }
    ]);
    localStorage.removeItem("messages");

    setIsCopilotVisible(false);

    if (showOptions == true) {
      resetEditorState();
    }
    setShowOptions(false);
  };

  const askCopilot = async (copilotInput, instructions, copilot_mode) => {
    setQuestionAsked(true);
    localStorage.setItem("questionAsked", "true");
    handleGAEvent("Chatbot", "Copilot Input", copilotInput);
    setCopilotLoading(true);
    setStartTime(Date.now()); // Set start time for the timer
    console.log(selectedBidId);

    try {
      const requests = [
        axios.post(
          `http${HTTP_PREFIX}://${API_URL}/copilot`,
          {
            input_text: copilotInput,
            extra_instructions: instructions,
            copilot_mode: copilot_mode,
            datasets: [],
            bid_id: selectedBidId
          },
          {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          }
        )
      ];

      const results = await Promise.all(requests);
      const options = results.map((result) => result.data);
      setCopilotOptions(options);
    } catch (error) {
      console.error("Error sending question:", error);
    }
    setCopilotLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("click outside");
      if (
        responseBoxRef.current &&
        promptsContainerRef.current &&
        bidPilotRef.current &&
        !responseBoxRef.current.contains(event.target) &&
        !promptsContainerRef.current.contains(event.target) &&
        !bidPilotRef.current.contains(event.target)
      ) {
        setIsCopilotVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showOptions, isCopilotVisible]);

  const optionsContainerRef = useRef(null); // Ref for the options container

  const [originalEditorState, setOriginalEditorState] =
    useState(responseEditorState);

  const resetEditorState = () => {
    const contentState = originalEditorState.getCurrentContent();
    const blocks = contentState.getBlockMap();

    let newContentState = contentState;

    // Remove ORANGE style from all blocks
    blocks.forEach((block) => {
      const blockKey = block.getKey();
      const length = block.getLength();
      const blockSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: 0,
        focusOffset: length
      });

      newContentState = Modifier.removeInlineStyle(
        newContentState,
        blockSelection,
        "ORANGE"
      );
    });

    const newEditorState = EditorState.createWithContent(newContentState);
    setResponseEditorState(newEditorState);
    setIsCopilotVisible(false);
    setSelectedText("");
  };

  //only hide options if show Options equals true and the user clicks somewhere else in the response box. So clicking on an option and the selected text changing should not trigger this
  useEffect(() => {
    const handleClickOutsideOptions = (event) => {
      if (
        responseBoxRef.current &&
        optionsContainerRef.current &&
        responseBoxRef.current.contains(event.target) &&
        !optionsContainerRef.current.contains(event.target) &&
        showOptions
      ) {
        setShowOptions(false);
        // Clear the orange style and reset the text
        resetEditorState();
      }
    };

    document.addEventListener("click", handleClickOutsideOptions);
    return () => {
      document.removeEventListener("click", handleClickOutsideOptions);
    };
  }, [showOptions, responseEditorState]);

  const handleTick = () => {
    const contentState = responseEditorState.getCurrentContent();
    const blocks = contentState.getBlockMap();

    let newContentState = contentState;

    // Remove ORANGE style from all blocks
    blocks.forEach((block) => {
      const blockKey = block.getKey();
      const length = block.getLength();
      const blockSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: 0,
        focusOffset: length
      });

      newContentState = Modifier.removeInlineStyle(
        newContentState,
        blockSelection,
        "ORANGE"
      );
    });

    let newEditorState = EditorState.push(
      responseEditorState,
      newContentState,
      "change-inline-style"
    );

    // Clear the selection
    const firstBlockKey = newEditorState
      .getCurrentContent()
      .getFirstBlock()
      .getKey();
    const emptySelection = SelectionState.createEmpty(firstBlockKey);
    newEditorState = EditorState.forceSelection(newEditorState, emptySelection);

    setResponseEditorState(newEditorState);
    setShowOptions(false);
    setIsCopilotVisible(false);
    setSelectedText("");
    setSelectedOptionIndex(null);

    console.log("handleTick - clearedText");
  };

  const handleEditorChange = (editorState) => {
    const selectionState = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const anchorKey = selectionState.getAnchorKey();
    const focusKey = selectionState.getFocusKey();
    const anchorOffset = selectionState.getAnchorOffset();
    const focusOffset = selectionState.getFocusOffset();
    const isBackward = selectionState.getIsBackward();

    const startKey = isBackward ? focusKey : anchorKey;
    const endKey = isBackward ? anchorKey : focusKey;
    const startOffset = isBackward ? focusOffset : anchorOffset;
    const endOffset = isBackward ? anchorOffset : focusOffset;

    const startBlock = currentContent.getBlockForKey(startKey);
    const endBlock = currentContent.getBlockForKey(endKey);

    let selectedText = "";

    if (startBlock === endBlock) {
      selectedText = startBlock.getText().slice(startOffset, endOffset);
    } else {
      const startText = startBlock.getText().slice(startOffset);
      const endText = endBlock.getText().slice(0, endOffset);
      const middleText = currentContent
        .getBlockMap()
        .skipUntil((block) => block.getKey() === startKey)
        .skip(1)
        .takeUntil((block) => block.getKey() === endKey)
        .map((block) => block.getText())
        .join("\n");

      selectedText = [startText, middleText, endText]
        .filter(Boolean)
        .join("\n");
    }

    console.log("handleEditorChange - selectedText:", selectedText);

    setSelectedText(selectedText);
    setSelectionRange({
      anchorKey: selectionState.getAnchorKey(),
      anchorOffset: selectionState.getAnchorOffset(),
      focusKey: selectionState.getFocusKey(),
      focusOffset: selectionState.getFocusOffset()
    });

    setResponseEditorState(editorState); // Always update the state
  };

  useEffect(() => {
    if (selectedText.trim() && selectedText.trim().length > 0) {
      // added extra check because sometimes an empty string would be passed to the copilot
      console.log(selectedText);
      setIsCopilotVisible(true);
    } else {
      setIsCopilotVisible(false);
    }
  }, [selectedText, responseEditorState]);

  // Dummy state to force re-render of the editor component
  const [dummyState, setDummyState] = useState(false);

  const [highlightedRange, setHighlightedRange] = useState(null);

  const handleLinkClick = (linkName) => (e) => {
    e.preventDefault();
    const copilot_mode = linkName.toLowerCase().replace(/\s+/g, "_");
    const instructions = "";

    setOriginalEditorState(responseEditorState);

    const contentState = responseEditorState.getCurrentContent();
    const selection = responseEditorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();

    let newContentState = contentState;

    // Store the highlighted range
    setHighlightedRange({
      startKey,
      endKey,
      startOffset,
      endOffset
    });

    // Apply ORANGE style (rest of the function remains the same)
    if (startKey === endKey) {
      const blockSelection = SelectionState.createEmpty(startKey).merge({
        anchorOffset: startOffset,
        focusOffset: endOffset
      });
      newContentState = Modifier.applyInlineStyle(
        newContentState,
        blockSelection,
        "ORANGE"
      );
    } else {
      // If the selection spans multiple blocks
      const blocks = contentState.getBlockMap();
      let isWithinSelection = false;

      newContentState = blocks.reduce((updatedContent, block, blockKey) => {
        if (blockKey === startKey) {
          isWithinSelection = true;
          const blockSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: startOffset,
            focusOffset: block.getLength()
          });
          return Modifier.applyInlineStyle(
            updatedContent,
            blockSelection,
            "ORANGE"
          );
        } else if (blockKey === endKey) {
          isWithinSelection = false;
          const blockSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: 0,
            focusOffset: endOffset
          });
          return Modifier.applyInlineStyle(
            updatedContent,
            blockSelection,
            "ORANGE"
          );
        } else if (isWithinSelection) {
          const blockSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: 0,
            focusOffset: block.getLength()
          });
          return Modifier.applyInlineStyle(
            updatedContent,
            blockSelection,
            "ORANGE"
          );
        }
        return updatedContent;
      }, newContentState);
    }

    let newEditorState = EditorState.push(
      responseEditorState,
      newContentState,
      "change-inline-style"
    );
    newEditorState = EditorState.forceSelection(newEditorState, selection);

    setResponseEditorState(newEditorState);

    setTimeout(() => {
      askCopilot(selectedText, instructions, "1" + copilot_mode);
      setShowOptions(true);
      setIsCopilotVisible(false);
    }, 0);
  };

  const handleOptionSelect = (option, index) => {
    console.log("handleOptionSelect called", {
      option,
      index,
      highlightedRange
    });
    if (!highlightedRange) {
      console.log("No highlighted range, exiting");
      return;
    }

    const contentState = responseEditorState.getCurrentContent();
    const { startKey, endKey, startOffset, endOffset } = highlightedRange;

    console.log("Creating highlight selection", {
      startKey,
      endKey,
      startOffset,
      endOffset
    });
    const highlightSelection = SelectionState.createEmpty(startKey).merge({
      anchorOffset: startOffset,
      focusKey: endKey,
      focusOffset: endOffset
    });

    console.log("Removing highlighted text");
    let newContentState = Modifier.removeRange(
      contentState,
      highlightSelection,
      "backward"
    );

    console.log("Inserting new option text");
    newContentState = Modifier.insertText(
      newContentState,
      highlightSelection.merge({
        focusKey: startKey,
        focusOffset: startOffset
      }),
      option
    );

    console.log("Applying ORANGE style to new text");
    const styledSelection = SelectionState.createEmpty(startKey).merge({
      anchorOffset: startOffset,
      focusOffset: startOffset + option.length
    });
    newContentState = Modifier.applyInlineStyle(
      newContentState,
      styledSelection,
      "ORANGE"
    );

    console.log("Creating new editor state");
    let newEditorState = EditorState.push(
      responseEditorState,
      newContentState,
      "insert-fragment"
    );
    newEditorState = EditorState.forceSelection(
      newEditorState,
      styledSelection
    );

    console.log("Setting new editor state");
    setResponseEditorState(newEditorState);
    setTempText(option);
    setSelectedOption(option);
    setSelectedOptionIndex(index);
    setShowOptions(true);

    console.log("Clearing highlighted range");
    setHighlightedRange(null);

    setDummyState((prev) => !prev);
  };

  const handleCustomPromptFocus = () => {
    console.log("handleCustomPromptFocus called");
    setOriginalEditorState(responseEditorState);

    const contentState = responseEditorState.getCurrentContent();
    const selection = responseEditorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();

    console.log("Current selection", {
      isCollapsed: selection.isCollapsed(),
      startKey,
      endKey,
      startOffset,
      endOffset
    });

    // Always set the highlighted range, even if the selection is collapsed
    setHighlightedRange({
      startKey,
      endKey,
      startOffset,
      endOffset
    });

    let newContentState = contentState;

    // Apply ORANGE style
    if (startKey === endKey) {
      const blockSelection = SelectionState.createEmpty(startKey).merge({
        anchorOffset: startOffset,
        focusOffset: endOffset
      });
      newContentState = Modifier.applyInlineStyle(
        newContentState,
        blockSelection,
        "ORANGE"
      );
    } else {
      // If the selection spans multiple blocks
      const blocks = contentState.getBlockMap();
      let isWithinSelection = false;

      newContentState = blocks.reduce((updatedContent, block, blockKey) => {
        if (blockKey === startKey) {
          isWithinSelection = true;
          const blockSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: startOffset,
            focusOffset: block.getLength()
          });
          return Modifier.applyInlineStyle(
            updatedContent,
            blockSelection,
            "ORANGE"
          );
        } else if (blockKey === endKey) {
          isWithinSelection = false;
          const blockSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: 0,
            focusOffset: endOffset
          });
          return Modifier.applyInlineStyle(
            updatedContent,
            blockSelection,
            "ORANGE"
          );
        } else if (isWithinSelection) {
          const blockSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: 0,
            focusOffset: block.getLength()
          });
          return Modifier.applyInlineStyle(
            updatedContent,
            blockSelection,
            "ORANGE"
          );
        }
        return updatedContent;
      }, newContentState);
    }

    console.log("Applying ORANGE style");
    const newEditorState = EditorState.push(
      responseEditorState,
      newContentState,
      "change-inline-style"
    );
    setResponseEditorState(newEditorState);

    console.log("Set highlighted range", {
      startKey,
      endKey,
      startOffset,
      endOffset
    });
  };

  let isSubmitButtonClicked = false;

  const handleMouseDownOnSubmit = () => {
    isSubmitButtonClicked = true;
  };

  const handleCustomPromptBlur = () => {
    if (!isSubmitButtonClicked) {
      const contentState = responseEditorState.getCurrentContent();
      const blocks = contentState.getBlockMap();

      // Remove ORANGE style from all blocks
      let newContentState = contentState;
      blocks.forEach((block) => {
        const blockKey = block.getKey();
        const length = block.getLength();
        const blockSelection = SelectionState.createEmpty(blockKey).merge({
          anchorOffset: 0,
          focusOffset: length
        });

        newContentState = Modifier.removeInlineStyle(
          newContentState,
          blockSelection,
          "ORANGE"
        );
      });

      const newEditorState = EditorState.push(
        responseEditorState,
        newContentState,
        "change-inline-style"
      );
      setResponseEditorState(newEditorState);

      // Clear the highlighted range
      //setHighlightedRange(null);
    }
    isSubmitButtonClicked = false; // Reset flag after handling
  };

  const handleCustomPromptSubmit = () => {
    console.log("handleCustomPromptSubmit called", {
      inputValue: inputValue.trim()
    });
    if (inputValue.trim()) {
      isSubmitButtonClicked = true;

      const copilot_mode = inputValue.toLowerCase().replace(/\s+/g, "_");
      const instructions = "";

      const contentState = responseEditorState.getCurrentContent();

      let selectedText;
      if (highlightedRange) {
        const { startKey, endKey, startOffset, endOffset } = highlightedRange;
        console.log("Using highlighted range", {
          startKey,
          endKey,
          startOffset,
          endOffset
        });

        selectedText = getTextFromRange(responseEditorState, highlightedRange);
      } else {
        console.log("No highlighted range, using full content");
        selectedText = contentState.getPlainText();
      }

      console.log("Selected text", { selectedText });

      setTimeout(() => {
        console.log("Calling askCopilot");
        askCopilot(selectedText, instructions, "4" + copilot_mode);
        setShowOptions(true);
        setSelectedDropdownOption("library-chat");
      }, 0);

      setInputValue("");
      setIsCopilotVisible(false);
    }
  };

  // Helper function to get text from a range
  const getTextFromRange = (editorState, range) => {
    const contentState = editorState.getCurrentContent();
    const startBlock = contentState.getBlockForKey(range.startKey);
    const endBlock = contentState.getBlockForKey(range.endKey);
    let text = "";

    if (startBlock === endBlock) {
      text = startBlock.getText().slice(range.startOffset, range.endOffset);
    } else {
      const blockMap = contentState.getBlockMap();
      const blocksInRange = blockMap
        .skipUntil((_, k) => k === range.startKey)
        .takeUntil((_, k) => k === range.endKey)
        .concat(Map([[range.endKey, endBlock]]));

      blocksInRange.forEach((block, blockKey) => {
        let blockText = block.getText();
        if (blockKey === range.startKey) {
          blockText = blockText.slice(range.startOffset);
        }
        if (blockKey === range.endKey) {
          blockText = blockText.slice(0, range.endOffset);
        }
        text += blockText + "\n";
      });
    }

    return text.trim();
  };

  /////////////////////////////////////////////////////////////////////////////////////////////

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("messages");
    console.log("Saved messages:", savedMessages);

    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (parsedMessages.length > 0) {
        return parsedMessages;
      }
    }

    return [
      {
        type: "bot",
        text: "Welcome to Bid Pilot! Ask questions about your company library data or search the internet for up to date information. Select text in the response box to use copilot and refine the response."
      }
    ];
  });

  useEffect(() => {
    // Save messages to localStorage whenever they change
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const [inputValue, setInputValue] = useState("");

  const [bidPilotchoice, setBidPilotChoice] = useState("2");
  const [bidPilotbroadness, setBidPilotBroadness] = useState("4");
  const [isBidPilotLoading, setIsBidPilotLoading] = useState(false);

  const [choice, setChoice] = useState("3a");
  const [broadness, setBroadness] = useState("4");

  const [isLoading, setIsLoading] = useState(false);
  const [questionAsked, setQuestionAsked] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [apiChoices, setApiChoices] = useState([]);
  const [wordAmounts, setWordAmounts] = useState({});

  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Add this ref for the messages container
  const messagesContainerRef = useRef(null);

  // Add this function to handle scrolling
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Modify the typeMessage function to scroll while typing
  const typeMessage = (message) => {
    setIsTyping(true);
    setTypingText("");
    let index = 0;

    const typeChar = () => {
      if (index < message.length) {
        setTypingText((prev) => prev + message[index]);
        index++;
        scrollToBottom(); // Add scroll after each character
        setTimeout(typeChar, 1);
      } else {
        setIsTyping(false);
      }
    };

    typeChar();
  };

  // Add useEffect to scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("inputText", inputText);
  }, [inputText]);

  useEffect(() => {
    let interval = null;
    if (isLoading && startTime) {
      interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000); // Update elapsed time in seconds
      }, 100);
    } else if (!isLoading) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLoading, startTime]);

  const handleSendMessage = () => {
    console.log("handleMessage");
    if (inputValue.trim() !== "") {
      if (showOptions == true) {
        resetEditorState();
      }

      setIsCopilotVisible(false);
      setShowOptions(false);
      setMessages([...messages, { type: "user", text: inputValue }]);
      sendQuestion(inputValue);
      setInputValue("");
    }
  };

  const handleInternetSearch = () => {
    // Implement your internet search logic here
    console.log("Internet Search function called");
    if (inputValue.trim() !== "") {
      if (showOptions == true) {
        resetEditorState();
      }

      setIsCopilotVisible(false);
      setShowOptions(false);
      setMessages([...messages, { type: "user", text: inputValue }]);
      sendInternetQuestion(inputValue);
      setInputValue("");
    }
  };

  const sendInternetQuestion = async (question) => {
    handleGAEvent("Chatbot", "Submit Question", "Submit Button");
    setQuestionAsked(true);
    setIsBidPilotLoading(true);
    setStartTime(Date.now()); // Set start time for the timer
    console.log(dataset);
    // Add a temporary bot message with loading dots
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: "loading" }
    ]);

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/perplexity`,
        {
          input_text: question + "Respond in a full sentence format.",
          dataset: "default"
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      // Replace the temporary loading message with the actual response
      const formattedResponse = formatResponse(result.data);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { type: "bot", text: formattedResponse }
      ]);
      typeMessage(formattedResponse); // Start typing animation
    } catch (error) {
      console.error("Error sending question:", error);
      // Replace the temporary loading message with the error message
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        {
          type: "bot",
          text:
            error.response?.status === 400
              ? "Message failed, please contact support..."
              : error.message
        }
      ]);
    }
    setIsBidPilotLoading(false);
  };

  useEffect(() => {
    if (showOptions) {
      setSelectedDropdownOption("library-chat");
    }
  }, [selectedDropdownOption]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isBidPilotLoading) {
      if (selectedDropdownOption === "internet-search") {
        handleInternetSearch();
      } else if (
        selectedDropdownOption === "custom-prompt" &&
        isCopilotVisible
      ) {
        handleCustomPromptSubmit();
      } else {
        handleSendMessage();
      }
    }
  };

  useEffect(() => {
    if (isCopilotVisible) {
      setSelectedDropdownOption("custom-prompt");
    } else {
      setSelectedDropdownOption("library-chat");
    }
  }, [isCopilotVisible]);

  const formatResponse = (response) => {
    // Handle numbered lists
    response = response.replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>");
    if (response.includes("<li>")) {
      response = `<ol>${response}</ol>`;
    }

    // Handle bullet points
    response = response.replace(/^[-•]\s(.+)$/gm, "<li>$1</li>");
    if (response.includes("<li>") && !response.includes("<ol>")) {
      response = `<ul>${response}</ul>`;
    }

    // Handle bold text
    response = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Handle italic text
    response = response.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Replace any newlines with a single <br>
    response = response.replace(/\n/g, "<br>");

    response = response.replace(/(<br>)\s*(<br>)/g, "<br><br>");
    response = response.replace(/(<\/li>)(<br>)+/g, "</li><br>");

    return response;
  };

  const sendQuestion = async (question) => {
    handleGAEvent("Chatbot", "Submit Question", "Submit Button");
    setQuestionAsked(true);
    setIsBidPilotLoading(true);
    setStartTime(Date.now()); // Set start time for the timer

    // Add a temporary bot message with loading dots
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: "loading" }
    ]);

    const chatHistory = messages
      .map((msg) => `${msg.type}: ${msg.text}`)
      .join("\n");
    console.log(chatHistory);
    console.log(bidPilotbroadness);
    console.log(bidPilotchoice);
    console.log(selectedBidId);

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/question`,
        {
          choice: bidPilotchoice,
          broadness: bidPilotbroadness,
          input_text: question,
          extra_instructions: chatHistory,
          datasets: ["default"],
          bid_id: selectedBidId
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      // Replace the temporary loading message with the actual response
      const formattedResponse = formatResponse(result.data);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { type: "bot", text: formattedResponse }
      ]);
      typeMessage(formattedResponse); // Start typing animation
    } catch (error) {
      console.error("Error sending question:", error);
      // Replace the temporary loading message with the error message
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        {
          type: "bot",
          text:
            error.response?.status === 400
              ? "Message failed, please contact support..."
              : error.message
        }
      ]);
    }
    setIsBidPilotLoading(false);
  };

  const sendQuestionToChatbot = async () => {
    handleGAEvent("Chatbot", "Submit Question", "Submit Button");
    setQuestionAsked(true);
    localStorage.setItem("questionAsked", "true");
    setResponseEditorState(EditorState.createEmpty());
    setIsLoading(true);
    setStartTime(Date.now()); // Set start time for the timer
    console.log("DATASET");
    console.log(selectedFolders);
    console.log(selectedBidId);

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/question`,
        {
          choice: choice,
          broadness: broadness,
          input_text: inputText,
          extra_instructions: "",
          datasets: selectedFolders,
          bid_id: selectedBidId
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      if (choice != "3a") {
        const contentState = ContentState.createFromText(result.data);
        setResponseEditorState(EditorState.createWithContent(contentState));
      }
      if (choice === "3a") {
        let choicesArray = [];
        console.log(result.data);

        try {
          // First, try splitting by semicolons
          if (result.data && result.data.includes(";")) {
            choicesArray = result.data
              .split(";")
              .map((choice) => choice.trim());
          }

          // If semicolon splitting didn't work, try parsing as a numbered list
          if (choicesArray.length === 0 && typeof result.data === "string") {
            choicesArray = result.data
              .split("\n")
              .filter((line) => /^\d+\./.test(line.trim()))
              .map((line) => line.replace(/^\d+\.\s*/, "").trim());
          }

          // If we still don't have any choices, throw an error
          if (choicesArray.length === 0) {
            throw new Error("Failed to parse API response into choices");
          }
        } catch (error) {
          console.error("Error processing API response:", error);
          // Optionally, you could set an error state here to display to the user
          // setError("Failed to process the response. Please try again.");
        }

        setApiChoices(choicesArray);
      }
    } catch (error) {
      console.error("Error sending question:", error);
      const contentState = ContentState.createFromText(error.message);
      setResponseEditorState(EditorState.createWithContent(contentState));
    }
    setIsLoading(false);
  };

  const handleChoiceSelection = (selectedChoice) => {
    if (selectedChoices.includes(selectedChoice)) {
      setSelectedChoices(
        selectedChoices.filter((choice) => choice !== selectedChoice)
      );
      setWordAmounts((prevWordAmounts) => {
        const newWordAmounts = { ...prevWordAmounts };
        delete newWordAmounts[selectedChoice];
        return newWordAmounts;
      });
    } else {
      setSelectedChoices([...selectedChoices, selectedChoice]);
      setWordAmounts((prevWordAmounts) => ({
        ...prevWordAmounts,
        [selectedChoice]: 250 // Default word amount
      }));
    }
  };

  const renderChoices = () => {
    return (
      <div className="space-y-1">
        {apiChoices
          .filter((choice) => choice && choice.trim() !== "")
          .map((choice, index) => (
            <div key={index} className="flex items-center gap-3">
              <Checkbox
                checked={selectedChoices.includes(choice)}
                onCheckedChange={() => handleChoiceSelection(choice)}
              />
              {selectedChoices.includes(choice) ? (
                <Input
                  type="text"
                  value={choice}
                  onChange={(e) => handleChoiceEdit(index, e.target.value)}
                  className="flex-1"
                />
              ) : (
                <span
                  onClick={() => handleChoiceSelection(choice)}
                  className="flex-1 flex items-center cursor-pointer text-sm h-10 py-1 px-3 border border-transparent"
                >
                  {choice}
                </span>
              )}
              {selectedChoices.includes(choice) && (
                <Input
                  type="number"
                  value={wordAmounts[choice] || 250}
                  onChange={(e) =>
                    setWordAmounts({
                      ...wordAmounts,
                      [choice]: parseInt(e.target.value, 10)
                    })
                  }
                  min={1}
                  placeholder="250"
                  className="w-20"
                />
              )}
            </div>
          ))}
      </div>
    );
  };

  const handleChoiceEdit = (index, newValue) => {
    const updatedChoices = [...apiChoices];
    updatedChoices[index] = newValue;
    setApiChoices(updatedChoices);

    // Update selectedChoices and wordAmounts if the edited choice was selected
    if (selectedChoices.includes(apiChoices[index])) {
      const updatedSelectedChoices = selectedChoices.map((choice) =>
        choice === apiChoices[index] ? newValue : choice
      );
      setSelectedChoices(updatedSelectedChoices);

      const updatedWordAmounts = { ...wordAmounts };
      if (updatedWordAmounts[apiChoices[index]]) {
        updatedWordAmounts[newValue] = updatedWordAmounts[apiChoices[index]];
        delete updatedWordAmounts[apiChoices[index]];
      }
      setWordAmounts(updatedWordAmounts);
    }
  };

  const submitSelections = async () => {
    setIsLoading(true);
    setStartTime(Date.now()); // Set start time for the timer
    try {
      console.log(selectedFolders);
      const word_amounts = selectedChoices.map((choice) =>
        String(wordAmounts[choice] || "250")
      );
      console.log("selectedChoices");
      console.log(selectedChoices);
      console.log(word_amounts);
      const compliance_requirements = Array(word_amounts.length).fill("");
      const evaluation_criteria = Array(word_amounts.length).fill("");
      const derived_insights = Array(word_amounts.length).fill("");
      const differentiating_factors = Array(word_amounts.length).fill("");
      const writingplans = Array(word_amounts.length).fill("");
      console.log(compliance_requirements);
      console.log(selectedBidId);

      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/question_multistep`,
        {
          choice: "3b",
          broadness: broadness,
          input_text: inputText,
          extra_instructions: "",
          selected_choices: selectedChoices,
          datasets: selectedFolders,
          word_amounts,
          compliance_requirements: compliance_requirements,
          evaluation_criteria: evaluation_criteria,
          derived_insights: derived_insights,
          differentiating_factors: differentiating_factors,
          writingplans: writingplans,
          bid_id: selectedBidId
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      const contentState = ContentState.createFromText(result.data);
      setResponseEditorState(EditorState.createWithContent(contentState));
      setApiChoices([]); // Clear choices
      setSelectedChoices([]); // Clear selected choices
      setWordAmounts({}); // Clear word amounts
      setContentLoaded(true);
    } catch (error) {
      console.error("Error submitting selections:", error);
      let errorMessage = "";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        errorMessage = `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request:", error.request);
        errorMessage = "No response received from server";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        errorMessage = `Error: ${error.message}`;
      }

      const contentState = ContentState.createFromText(errorMessage);
      setResponseEditorState(EditorState.createWithContent(contentState));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contentLoaded) {
      makeReferencesBold();
      setContentLoaded(false);
    }
  }, [contentLoaded, responseEditorState]);

  const makeReferencesBold = () => {
    const contentState = responseEditorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();

    let newContentState = contentState;

    blockMap.forEach((block) => {
      const text = block.getText();
      const key = block.getKey();

      // Pattern to match [Extracted...] sections
      const pattern = /\[(?=.*Extracted).*?\]/g;

      let matchArray;
      while ((matchArray = pattern.exec(text)) !== null) {
        const start = matchArray.index;
        const end = start + matchArray[0].length;

        const selectionState = SelectionState.createEmpty(key).merge({
          anchorOffset: start,
          focusOffset: end
        });

        newContentState = Modifier.applyInlineStyle(
          newContentState,
          selectionState,
          "BOLD"
        );
      }
    });

    if (newContentState !== contentState) {
      const newEditorState = EditorState.push(
        responseEditorState,
        newContentState,
        "change-inline-style"
      );
      setResponseEditorState(newEditorState);
    }
  };

  const removeReferences = () => {
    const contentState = responseEditorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();

    let newContentState = contentState;

    // Updated pattern to be more flexible with endings and handle line breaks
    const pattern = /\s*Extracted from:.*?(?:\[.*?\](?:,\s*)?)+[.\n]?/g;

    blockMap.forEach((block) => {
      const text = block.getText();
      const key = block.getKey();

      let match;
      const ranges = [];

      // Find all matches in the current block
      while ((match = pattern.exec(text)) !== null) {
        ranges.push({
          start: match.index,
          end: pattern.lastIndex
        });
      }

      // Remove ranges in reverse order to maintain correct indices
      for (let i = ranges.length - 1; i >= 0; i--) {
        const { start, end } = ranges[i];
        const selectionState = SelectionState.createEmpty(key).merge({
          anchorOffset: start,
          focusOffset: end
        });

        newContentState = Modifier.removeRange(
          newContentState,
          selectionState,
          "backward"
        );
      }
    });

    const newEditorState = EditorState.push(
      responseEditorState,
      newContentState,
      "remove-range"
    );
    setResponseEditorState(newEditorState);
  };

  const parentPages = [] as Array<{ name: string; path: string }>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-14">
        <BreadcrumbNavigation
          currentPage="Q&A Generator"
          parentPages={parentPages}
        />
      </div>
      <div className="flex flex-col py-4 px-6 space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <span className="block text-2xl font-semibold">
            Complete Questions One-by-One
          </span>
          <span className="block text-base text-gray-hint_text">
            For when your tender questions are on a portal or want to
            individually respond to questions.
          </span>
        </div>
        <div className="w-full">
          <div className="hidden">
            <FolderLogic
              tokenRef={tokenRef}
              setAvailableCollections={setAvailableCollections}
              setFolderContents={setFolderContents}
              availableCollections={availableCollections}
              folderContents={folderContents}
            />
          </div>
          <div className="space-y-3">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold" id="question-section">
                  Question:
                </h1>
                <div className="flex items-center space-x-2">
                  <BidDropdown
                    onBidSelect={setSelectedBidId}
                    token={tokenRef.current}
                  />
                  <SelectFolderModal
                    onSaveSelectedFolders={handleSaveSelectedFolders}
                    initialSelectedFolders={selectedFolders}
                  />
                  <Button
                    onClick={sendQuestionToChatbot}
                    disabled={inputText.trim() === ""}
                  >
                    <PlusIcon />
                    Generate Ideas
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Enter question here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex items-center justify-between h-6">
                <span className="block text-gray-hint_text text-sm">
                  Word Count: {inputText.split(/\s+/).filter(Boolean).length}
                </span>
                {isLoading && (
                  <div className="flex items-center space-x-3">
                    <Spinner />
                    <span className="text-sm">
                      Elapsed Time: {elapsedTime.toFixed(1)}s
                    </span>
                  </div>
                )}
              </div>
              {choice === "3a" && apiChoices.length > 0 && (
                <div className="space-y-4">
                  {renderChoices()}
                  <Button
                    onClick={submitSelections}
                    disabled={selectedChoices.length === 0}
                  >
                    Generate answers for selected subsections
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-4 flex-1 min-h-[500px]">
          <div className="flex flex-col h-full w-full space-y-3">
            <div className="flex justify-between items-center h-9">
              <h1 id="answer-section" className="text-lg font-semibold">
                Answer:
              </h1>
              <div className="flex items-center gap-4">
                <span className="block text-gray-hint_text text-sm">
                  Word Count:{" "}
                  {
                    convertToRaw(responseEditorState.getCurrentContent())
                      .blocks.map((block) => block.text)
                      .join("\n")
                      .split(/\s+/)
                      .filter(Boolean).length
                  }
                </span>
                <Button variant="secondary" onClick={removeReferences}>
                  Remove References
                </Button>
              </div>
            </div>
            <div className="flex flex-col space-y-2 h-full">
              <div
                className="flex-1 border rounded-lg px-4 bg-white text-sm overflow-y-auto"
                ref={responseBoxRef}
              >
                <div ref={editorRef} className="max-h-60">
                  <Editor
                    editorState={responseEditorState}
                    placeholder="Your response will be generated here..."
                    onChange={handleEditorChange}
                    customStyleMap={{
                      ...styleMap,
                      BOLD: { fontWeight: "bold" }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full w-full space-y-3">
            <div className="flex items-center h-9">
              <h1 id="bid-pilot-section" className="text-lg font-semibold">
                Bid Pilot
              </h1>
            </div>
            <div className="flex flex-col bg-white rounded-lg p-4 border border-gray-line h-full gap-4">
              {showOptions ? (
                <div ref={optionsContainerRef} className="flex-1">
                  {copilotLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner />
                      <span className="text-sm">Generating Options...</span>
                    </div>
                  ) : (
                    copilotOptions.map((option, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleOptionSelect(option, index)}
                          >
                            <span>Click to replace</span>
                          </Button>
                          {selectedOptionIndex === index && (
                            <Button onClick={handleTick} variant={"ghost"}>
                              <FontAwesomeIcon icon={faCheck} className="" />
                            </Button>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="bg-gray-100 p-3 rounded-lg">{option}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : isCopilotVisible ? (
                <div
                  className={`${!isCopilotVisible ? "opacity-0" : "opacity-100"} flex-1 transition-all duration-300`}
                  ref={promptsContainerRef}
                >
                  <div className="grid grid-cols-1">
                    {[
                      "Summarise",
                      "Expand",
                      "Rephrase",
                      "Inject Company Voice",
                      "Inject Tender Context",
                      "Improve Grammar",
                      "Add Statistics",
                      "For Example",
                      "Translate to English",
                      "We will"
                    ].map((text, index) => (
                      <Button
                        variant="outline"
                        key={index}
                        onClick={handleLinkClick(text)}
                        className="border-b-0 last:border-b text-xs h-fit"
                      >
                        {text}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  ref={messagesContainerRef}
                  className="flex-1 space-y-2 overflow-y-auto scrollbar-none"
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`py-3 rounded-lg text-black items-start ${
                        message.type === "bot"
                          ? "bg-transparent"
                          : "bg-gray-light px-2"
                      }`}
                    >
                      {message.text === "loading" ? (
                        <div className="flex justify-start items-center h-full text-2xl tracking-wider leading-none font-semibold">
                          <span className="animate-[blink_1.4s_infinite] text-black">
                            .
                          </span>
                          <span className="animate-[blink_1.4s_infinite_0.2s] text-black">
                            .
                          </span>
                          <span className="animate-[blink_1.4s_infinite_0.4s] text-black">
                            .
                          </span>
                        </div>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              isTyping && index === messages.length - 1
                                ? typingText
                                : message.text
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {selectedDropdownOption === "custom-prompt" ? (
                    <Select value={selectedDropdownOption}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom-prompt">
                          Custom Prompt
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      onValueChange={(value) =>
                        setSelectedDropdownOption(value)
                      }
                      value={selectedDropdownOption}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internet-search">
                          Internet Search
                        </SelectItem>
                        <SelectItem value="library-chat">
                          Library Chat
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="outline"
                    className="w-16"
                    onClick={handleClearMessages}
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex gap-2" ref={bidPilotRef}>
                  <Input
                    type="text"
                    placeholder={
                      selectedDropdownOption === "internet-search"
                        ? "Please type your question in here..."
                        : selectedDropdownOption === "custom-prompt"
                          ? "Type in a custom prompt here..."
                          : "Please type your question in here..."
                    }
                    value={inputValue}
                    onFocus={
                      selectedDropdownOption === "custom-prompt"
                        ? handleCustomPromptFocus
                        : undefined
                    }
                    onBlur={handleCustomPromptBlur}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    className="w-16 min-w-16"
                    onMouseDown={handleMouseDownOnSubmit}
                    onClick={
                      !isBidPilotLoading
                        ? selectedDropdownOption === "internet-search"
                          ? handleInternetSearch
                          : selectedDropdownOption === "custom-prompt" &&
                              isCopilotVisible
                            ? handleCustomPromptSubmit
                            : handleSendMessage
                        : null
                    }
                    disabled={isBidPilotLoading}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(QAGenerator);
