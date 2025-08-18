import React from 'react';
import { RxDotFilled } from "react-icons/rx";
import { Card, CardContent } from "@/components/ui/card";
import { addSpaceBeforeCapitalWords } from "@/utils/commonUtils";

interface PaperAnalysisProps {
   analysisData: any;
 }

const PaperAnalysis: React.FC<PaperAnalysisProps>  = ({analysisData}) => {

   return (<>
      <Card className="overflow-hidden w-full h-full flex flex-col" x-chunk="dashboard">
         <CardContent className="p-6 text-sm h-full dark:bg-[#152428]">
            {Object.entries(analysisData).map(([key, value]: any, index: number) => {
               return (<div className="flex mt-2" key={index}>
                  <div>
                     <span className="font-poppins text-base font-medium leading-[25.5px] text-[#333333] dark:text-[#CCCCCC]">
                        {addSpaceBeforeCapitalWords(key)}
                     </span>
                     <div className="mt-1">
                        {value?.map((lineValue: string, index: number) => {
                           return lineValue.length > 0 ? (
                              <>
                                 <div className="flex">
                                    <RxDotFilled
                                       width="30px"
                                       height="30px"
                                       className="dark:text-[#CCCCCC] text-[#333333] m-[0.3rem_8px] min-w-fit"
                                    />
                                    <div className="text-base dark:text-[#CCCCCC]" key={index}>
                                       {lineValue}
                                    </div>
                                 </div>
                              </>
                           ) : null
                        }
                        )}
                     </div>
                  </div>
               </div>)
            })}
         </CardContent>
      </Card>
   </>)
};

export default PaperAnalysis;
