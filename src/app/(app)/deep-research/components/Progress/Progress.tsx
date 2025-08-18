import React, { useEffect, useState } from "react";
import MainProgressBar from "./MainProgressBar";
import { FiCheckCircle } from "react-icons/fi";
import ProgressBar from "./ProgressBar";

const Progress = ({ steps, mainProgress }: any) => {
  return (
    <div className="bg-white border border-[#E5E5E5] dark:bg-[#2C3A3F] dark:border-[#2C3A3F] rounded-lg">
      <h4 className="ps-6 pt-6 font-medium text-[18px]">Progress</h4>
      <div className="flex flex-row lg:flex-col justify-between">
        <div className="layout-container">
          <MainProgressBar value={mainProgress} />
          <div className="layout-container-inner-EstTime">
            <span className="text-[#666666] dark:text-[#CCCCCC] text-nowrap">
              Estimated time :
            </span>
            <span>2mins</span>
          </div>
        </div>
        <div className="text-[15px]">
          {steps?.map((item: any, i: any) => {
            if (item?.label === "Final Review") {
              return (
                <div className="flex gap-2 items-center ps-3 w-full">
                  <div className="py-4 px-4 pe-3 me-4 rounded-lg w-[100%]">
                    <div className="flex gap-2 items-center">
                      <div
                        className={`w-[10px] h-[10px] rounded-full bg-[transparent] bg-red border-2  border-[#999999]`}
                      />
                      <div
                        className={`text-[#666666] dark:text-[#CCCCCC]  text-[13px]`}
                      >
                        {item?.label}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center text-[#FF9839] italic text-[12px] mt-2">
                      This part is in progress. We will notify you once done.
                    </div>
                  </div>
                </div>
              );
            } else if (item?.progress === 100)
              return (
                <div key={i} className="flex gap-2 items-center py-3 ps-6">
                  <FiCheckCircle color="#079E28" />
                  <span className="text-[#079E28]">{item?.label}</span>
                </div>
              );
            else if (item?.progress > 0)
              return (
                <div key={i} className="flex gap-2 items-center py-3 ps-3">
                  <ProgressBar label={item?.label} value={item?.progress} />
                </div>
              );
            else if (item?.progress === 0) {
              return (
                <div key={i} className="flex gap-2 items-center ps-3 w-full">
                  <ProgressBar label={item?.label} value={0} />
                </div>
              );
            }
          })}

          <div className="px-6 pt-3 pb-6">
            <button
              disabled={true}
              className="save-to-project w-[100%]"
              type="button"
            >
              Save to Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
