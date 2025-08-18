import { LoaderCircle } from "lucide-react";
import React from "react";

const SaveKnowledgeBankBtn = ({
  alreadyNoted,
  handleOpen,
  folderLoading,
}: {
  alreadyNoted: Boolean;
  handleOpen: () => void;
  folderLoading: Boolean;
}) => {
  return (
    <>
      {alreadyNoted ? (
        <button
          type="button"
          className="!bg-[#28c76f29] text-[#28c76f] p-1 px-[1.25rem] h-[32px] flex items-center justify-center rounded-full text-[13px] font-medium border border-[#28c76f] w-full"
        >
          Already Noted
        </button>
      ) : (
        <button
          type="button"
          className="button-full w-full"
          onClick={() => handleOpen()}
        >
          {folderLoading ? (
            <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
          ) : (
            "Save to Knowledge Bank"
          )}
        </button>
      )}
    </>
  );
};

export default SaveKnowledgeBankBtn;
