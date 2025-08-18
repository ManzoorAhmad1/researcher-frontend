import React from "react";

const ProgressBar = ({ label, value }: { label: string; value: number }) => {
  return (
    <div
      className={`${
        value > 0 && "bg-[#E7EFFA] dark:bg-[#e7effa1c]"
      } py-4 px-4 pe-3 me-4 rounded-lg w-[100%]`}
    >
      <div className="flex gap-2 items-center">
        <div
          className={`w-[10px] h-[10px] rounded-full bg-[transparent] bg-red border-2 ${
            value > 0 ? "border-[#0E70FF]" : "border-[#999999]"
          }`}
        />
        <div
          className={`${
            value > 0 ? "text-[#0E70FF]" : "text-[#666666] dark:text-[#CCCCCC] "
          } text-[13px]`}
        >
          {label}
        </div>
      </div>
      {value === 0 &&
      (label === "Information Search" || label === "Content Inclusion") ? (
        <div className="flex gap-2 items-center text-[#FF9839] italic text-[12px] mt-2">
          Click on Start Research
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <div className="w-full h-[5px] bg-[#D9D9D9] relative rounded-md overflow-hidden mt-2">
            <div
              style={{ width: `${value}%` }}
              className={`absolute top-0 left-0  h-full bg-[#0E70FF]`}
            ></div>
          </div>
          <div>{value}%</div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
