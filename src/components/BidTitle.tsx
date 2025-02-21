import React, { useContext, useEffect, useRef, useState } from "react";
import { BidContext } from "../views/BidWritingStateManagerView";
import { toast } from "react-toastify";

const BidTitle: React.FC<{
  canUserEdit: boolean;
  initialBidName: string;
  showViewOnlyMessage: () => void;
}> = ({ canUserEdit, initialBidName, showViewOnlyMessage }) => {
  const { sharedState, setSharedState } = useContext(BidContext);
  const [isEditing, setIsEditing] = useState(false);
  const bidInfo = sharedState.bidInfo || initialBidName;
  const bidNameTempRef = useRef(bidInfo);
  const bidNameRef = useRef(null);

  const handleBlur = () => {
    const newBidName = bidNameTempRef.current.trim();
    if (!newBidName) {
      toast.warning("Bid name cannot be empty");
      bidNameRef.current.innerText = bidInfo;
      return;
    }

    setSharedState((prevState) => ({
      ...prevState,
      bidInfo: newBidName,
      isSaved: false
    }));
    setIsEditing(false);
  };

  const handleBidNameChange = (e) => {
    bidNameTempRef.current = e.target.innerText;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      bidNameRef.current.blur();
    }
  };

  useEffect(() => {
    bidNameTempRef.current = bidInfo;
    if (bidNameRef.current) {
      bidNameRef.current.innerText = bidInfo;
    }
  }, [bidInfo]);

  return (
    <div className="w-full max-w-full overflow-visible mt-0">
      <h1 className="m-0 p-0 font-semibold relative flex items-center leading-normal text-[2.5rem]">
        <div
          className="flex items-center w-full max-w-sm relative cursor-pointer"
          onClick={canUserEdit ? () => setIsEditing(true) : showViewOnlyMessage}
        >
          <span
            contentEditable={isEditing && canUserEdit}
            suppressContentEditableWarning={true}
            onBlur={handleBlur}
            onInput={handleBidNameChange}
            onKeyDown={handleKeyDown}
            className={`block relative flex-1 text-2xl font-semibold min-w-0 max-w-sm overflow-hidden text-ellipsis whitespace-nowrap text-left text-black ${
              isEditing
                ? "outline-none border-2 border-[#86b7fe] rounded px-1"
                : ""
            }`}
            ref={bidNameRef}
            spellCheck="false"
          >
            {bidInfo}
          </span>
        </div>
      </h1>
    </div>
  );
};

export default BidTitle;
