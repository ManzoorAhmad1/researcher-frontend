/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Layers } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ShowMoreDialog({ Reason, Section }: any) {
  const [open, setOpen] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>(["00"]);

  const handleAccordionChange = (values: string[]) => {
    setOpenItems(values);
  };

  return (
    <>
      <div className="flex" onClick={() => setOpen(true)}>
        <button
          className="flex items-center space-x-2 px-2 py-1 whitespace-nowrap text-xs cursor-pointer rounded-2xl border border-blue-400 text-blue-400"
          type="button"
        >
          <span>Details</span>
          <Layers
            className="text-sm font-normal cursor-pointer h-[15px]"
          />
        </button>
      </div>

      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false);
        }}
      >
        <DialogContent
          className="max-w-[900px] max-h-[600px] overflow-scroll"
          onFocusOutside={() => {
            setOpen(false);
          }}
        >
          <div>
            <DialogHeader className="mb-3 flex justify-center items-center text-2xl">
              All Details
            </DialogHeader>
            <Accordion
              type="multiple"
              className="w-full"
              value={openItems}
              onValueChange={handleAccordionChange}
            >
              <div>
                <div className="my-4">
                  <h5>Reason why it is related to the title?</h5>
                  <AccordionItem value={"00"}>
                    <div
                      className="bg-white border border-[#E5E5E5] dark:bg-[#2C3A3F] dark:border-[#2C3A3F] rounded-lg mt-5 p-4 relative "
                      key={"00"}
                    >
                      <div className="flex justify-between gap-2 items-center">
                        <div className="flex gap-2 items-center">
                          <div className="mt-2 font-semibold whitespace-nowrap">
                            Reason
                          </div>
                          <AccordionTrigger
                            className="hover:no-underline mt-2"
                            iconStyle="h-6 w-6"
                          >
                            <span>{""}</span>
                          </AccordionTrigger>
                        </div>
                      </div>
                      {openItems.includes("00") && <hr className="my-3" />}
                      <AccordionContent>
                        {Reason || "No reason available"}
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                </div>

                {Section?.length > 0 &&
                <div>
                  <h5>Relevant Section</h5>
                  {Section?.length > 0 ? (
                    Section?.map((i: any, index: number) => (
                      <AccordionItem value={String(index)}>
                        <div
                          className="bg-white border border-[#E5E5E5] dark:bg-[#2C3A3F] dark:border-[#2C3A3F] rounded-lg mt-5 p-4 relative "
                          key={index}
                        >
                          <div className="flex justify-between gap-2 items-center">
                            <div className="flex gap-2 items-center">
                              <div className="mt-2 font-semibold whitespace-nowrap">
                                {i?.title || "Untitled"}
                              </div>
                              <AccordionTrigger
                                className="hover:no-underline mt-2"
                                iconStyle="h-6 w-6"
                              >
                                <span>{""}</span>
                              </AccordionTrigger>
                            </div>
                          </div>
                          {openItems.includes(String(index)) && <hr className="my-3" />}
                          <AccordionContent>
                            {i?.abstract || "No abstract available"}
                          </AccordionContent>
                        </div>
                      </AccordionItem>
                    ))
                  ) : (
                    <span className="text-sm">N/A</span>
                  )}
                </div>
                }
              </div>
            </Accordion>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
