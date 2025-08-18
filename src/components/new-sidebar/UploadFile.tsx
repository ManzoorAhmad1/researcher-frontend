import React from "react";
import Uploader from "../Uploader/Uploader";

const UploadFile = () => {
  return (
    <div className="upload-file">
      <div className="rounded-full h-7 w-7 grid place-items-center text-white text-[13px] bg-[#F59B14] text-xl">
        +
      </div>
      <span className="text-[#666666] text-[16px] name-1 dark:text-[#CCCCCC]">
        Upload Files
      </span>
      <span className="text-[#999999] text-[13px] dark:text-[#999999]">
        drag and drop file here
      </span>
    </div>
  );
};

export default UploadFile;
