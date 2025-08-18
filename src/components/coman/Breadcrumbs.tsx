"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectPaperItem,
  SelectTrigger,
} from "../ui/review-stage-select ";
import { OptimizedImage } from "../ui/optimized-image";

interface BreadcrumbsProps {
  breadcrums: any[];
  primaryColor: string;
  secondaryColor: string;
}
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  breadcrums,
  primaryColor,
  secondaryColor,
}) => {
  return (
    <div className="flex justify-between">
      <Breadcrumb>
        <BreadcrumbList className="text-2xl">
          <div className="flex flex-col gap-2">
            <BreadcrumbItem>
              <div className="flex items-center gap-[2px]">
                {breadcrums?.map((breadcrum: any, index: number) => {
                  const isLastItem = index === breadcrums?.length - 1;
                  if (breadcrum?.type === "icon") {
                    return (
                      <>
                        <OptimizedImage
                          src={
                            breadcrum?.value
                              ? breadcrum?.value
                              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//folder.svg`
                          }
                          alt="folder icon"
                          key={index}
                          width={16}
                          height={16}
                        />
                        {!isLastItem && (
                          <MdKeyboardArrowRight color="rgba(153, 153, 153, 1)" />
                        )}
                      </>
                    );
                  }
                  if (breadcrum?.type === "select") {
                    return (
                      <>
                        <Select
                          value={breadcrum?.value}
                          onValueChange={(status: string) => {
                            breadcrum?.handleSelect(status);
                          }}
                        >
                          {!breadcrum?.title ? (
                            <div className="h-6 w-[100px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          ) : (
                            <SelectTrigger>
                              <p className="text-[13px] font-[500] text-[#0E70FF] uppercase">
                                {breadcrum?.title}
                              </p>
                            </SelectTrigger>
                          )}
                          <SelectContent>
                            {!breadcrum?.options ? (
                              <>
                                <div className="h-6 w-[100px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
                                <div className="h-6 w-[100px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
                                <div className="h-6 w-[100px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                              </>
                            ) : (
                              breadcrum?.options?.map((selectItem: any) => (
                                <SelectPaperItem
                                  value={selectItem?.value}
                                  className="text-xs"
                                  key={selectItem?.label}
                                >
                                  {selectItem?.label}
                                </SelectPaperItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {!isLastItem && (
                          <MdKeyboardArrowRight color="rgba(153, 153, 153, 1)" />
                        )}
                      </>
                    );
                  }
                  if (breadcrum?.type === "label") {
                    return (
                      <>
                        {!breadcrum?.value?(
                            <div className="h-6 w-[100px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          ):(<p
                          onClick={() =>
                            breadcrum?.handleBack ? breadcrum?.handleBack() : {}
                          }
                          className={`text-[13px] font-[500] ${
                            isLastItem
                              ? `text-[${secondaryColor}]`
                              : `text-[${primaryColor}]`
                          } uppercase cursor-pointer`}
                        >
                          {breadcrum?.value}
                        </p>)}
                        {!isLastItem && (
                          <MdKeyboardArrowRight color="rgba(153, 153, 153, 1)" />
                        )}
                      </>
                    );
                  }
                })}
              </div>
              <br />
            </BreadcrumbItem>
          </div>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
