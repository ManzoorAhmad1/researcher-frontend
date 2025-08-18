/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  CornerRightUp,
  Layers,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";

export function AcademicPapersDialog({ papersData }: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Layers
        onClick={() => setOpen(true)}
        className="text-sm font-normal cursor-pointer h-[15px]"
      />

      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false);
        }}
      >
        <DialogContent
          className="max-w-[800px]"
          onFocusOutside={() => {
            setOpen(false);
          }}
        >
          <div>
            <DialogHeader className="mb-3 flex justify-center items-center text-2xl" >
              Academic Papers
            </DialogHeader>
            <div className="max-h-[100vh] overflow-hidden">
              <div>
                <div className="max-h-[74vh] overflow-auto mt-3">
                  {papersData?.length > 0 ? (
                    <>
                      {papersData?.length > 0 && (
                        <div>
                          {papersData?.map((websource: any, i: number) => (
                            <div className="p-2">
                              {i + 1}.{" "}
                              <a
                                href={
                                  websource?.openAccessPdf?.url
                                    ? websource?.openAccessPdf?.url
                                    : ""
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${
                                  websource?.openAccessPdf?.url
                                    ? "text-blue-700 cursor-pointer"
                                    : ""
                                }`}
                              >
                                {websource?.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-40 grid place-content-center">
                      There is no papers to show.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
