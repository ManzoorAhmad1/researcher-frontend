"use client";
import React, { useEffect, useState, useRef } from "react";
import Paper from "./Paper";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { ChevronDown, X } from "lucide-react";
import { RootState } from "@/reducer/store";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

const Tooltip = ({ children, content }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          {content}
        </div>
      )}
    </div>
  );
};

const Page = () => {
  const [searchBy, setSearchBy] = useState<string>("Title");
  const [filteredPapers, setFilteredPapers] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [filterShow, setFilterShow] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: [] as string[],
    date: "All Research",
    yearRange: "",
  });
  const [customYearRange, setCustomYearRange] = useState("");
  const [isYearRangeDropdownOpen, setIsYearRangeDropdownOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.user?.user || "");

  const publicationTypes = [
    "Review",
    "Journal Article",
    "Case Report",
    "Conference",
    "Editorial",
    "Letters And Comments",
    "News",
    "Study",
    "Book",
    "BookSection",
  ];

  const publicationDates = [
    "All Research",
    "Last 6 Months",
    "Last 1 Year",
    "Last 2 Years",
    "Last 5 Years",
    "Last 10 Years",
  ];

  const handleFilterChange = (key: string, value: string | string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilter = () => {
    setSelectedFilters({
      type: [],
      date: "All Research",
      yearRange: "",
    });
    setCustomYearRange("");
    toast.success("Filter cleared successfully!");
  };

  const filterData = async () => {
    const lastCheckTime = localStorage.getItem("lastCreditCheckTime");
    const currentTime = new Date().getTime();
    if (!lastCheckTime || currentTime - parseInt(lastCheckTime) > 3600000) {
      const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };
      localStorage.setItem("lastCreditCheckTime", currentTime.toString());
    }
  };

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData();
  }, [user?.id]);

  useEffect(() => {
    setFilteredPapers(papers);
  }, [papers]);

  const applyFilters = () => {
    let filtered = [...papers];

    if (selectedFilters.type.length > 0) {
      filtered = filtered.filter((paper) =>
        selectedFilters.type.some((type) =>
          paper?.publicationTypes?.includes(type)
        )
      );
    }

    if (selectedFilters.date !== "All Research") {
      const currentDate = new Date();
      const timeMapping: Record<string, number> = {
        "Last 6 Months": 6 * 30 * 24 * 60 * 60 * 1000,
        "Last 1 Year": 12 * 30 * 24 * 60 * 60 * 1000,
        "Last 2 Years": 2 * 12 * 30 * 24 * 60 * 60 * 1000,
        "Last 5 Years": 5 * 12 * 30 * 24 * 60 * 60 * 1000,
        "Last 10 Years": 10 * 12 * 30 * 24 * 60 * 60 * 1000,
      };

      const timeLimit = timeMapping[selectedFilters.date];

      filtered = filtered.filter((paper) => {
        const publicationDate = new Date(paper.publicationDate);
        return currentDate.getTime() - publicationDate.getTime() <= timeLimit;
      });
    }

    if (selectedFilters.yearRange) {
      const [start, end] = selectedFilters.yearRange.split("-").map(Number);
      filtered = filtered.filter((paper) => {
        const publicationYear = new Date(paper.publicationDate).getFullYear();
        return publicationYear >= start && publicationYear <= end;
      });
    }
    toast.success("Filter applied successfully!");

    setFilteredPapers(filtered);
  };

  const handlePublicationTypeChange = (type: string) => {
    setSelectedFilters((prev) => {
      const newTypes = prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type];
      return { ...prev, type: newTypes };
    });
  };

  const handleCustomYearRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomYearRange(e.target.value);
  };

  const handleCustomYearRangeApply = () => {
    if (customYearRange) {
      handleFilterChange("yearRange", customYearRange);
      setIsYearRangeDropdownOpen(false);
    }
  };

  return (
    <>
      <main className="bg-[#FAFAFA] dark:bg-[#020818] h-full overflow-scroll pb-0 relative mb-12">
        <section className="bg-[#F1F1F1] dark:bg-[#142328] flex justify-center pt-2 pb-20 flex-col items-center">
          <h1 className="text-xl mt-4 font-medium text-[#333333] dark:text-[#CCCCCC]">
            Search Papers
          </h1>
          <p className="text-sm font-normal text-[#666666] mt-3 dark:text-[#999999]">
            Search by Title or Author
          </p>
          <div
            className="absolute top-4 right-4 cursor-pointer"
            onClick={() => setFilterShow((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <OptimizedImage
                width={ImageSizes.icon.xs.width}
                height={ImageSizes.icon.xs.height}
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//filter.svg`
                }
                alt="filter"
                className="cursor-pointer "
              />
              <span className="text-sm font-normal text-[#666666] dark:text-[#cccccc]">
                Filter
              </span>
            </div>
          </div>

          {filterShow && (
            <Card className="shadow-none bg-[#f2f2f284] dark:bg-secondaryBackground mt-4 py-[13px] px-12 mb-4 border">
              <h2 className="text-xs font-semibold ps-[.5px]">FILTER</h2>
              <div className="flex justify-center items-center gap-3 mt-1">
                <div className="border bg-white dark:bg-transparent dark:border-[#cccccc] px-2 py-2 rounded-lg flex gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="dropdownMenuTrigger flex justify-between gap-2 items-center w-32">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-normal dark:text-[#cccccc] truncate">
                          Publication Type
                        </p>
                        {selectedFilters.type.length > 0 && (
                          <div className="bg-[#0E70FF] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {selectedFilters.type.length}
                          </div>
                        )}
                      </div>
                      <ChevronDown size={"12px"} color="#0E70FF" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dropdownMenu">
                      {publicationTypes.map((type) => (
                        <DropdownMenuCheckboxItem
                          key={type}
                          checked={selectedFilters.type.includes(type)}
                          onCheckedChange={() =>
                            handlePublicationTypeChange(type)
                          }
                          className="cursor-pointer"
                        >
                          {type}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <X
                    size={13}
                    onClick={() => handleFilterChange("type", [])}
                    className="cursor-pointer text-gray-500"
                  />
                </div>

                <div className="border bg-white dark:bg-transparent dark:border-[#cccccc] px-2 py-2 rounded-lg flex gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="dropdownMenuTrigger flex justify-between gap-2 items-center w-32">
                      <p className="text-xs font-normal dark:text-[#cccccc]">
                        {selectedFilters.date === "All Research"
                          ? "Publication Date"
                          : selectedFilters.date}
                      </p>
                      <ChevronDown size={"12px"} color="#0E70FF" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dropdownMenu">
                      {publicationDates.map((date) => (
                        <DropdownMenuItem
                          key={date}
                          className="cursor-pointer"
                          onClick={() => handleFilterChange("date", date)}
                        >
                          {date}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <X
                    size={13}
                    onClick={() => handleFilterChange("date", "All Research")}
                    className="cursor-pointer text-gray-500"
                  />
                </div>

                <div className="border bg-white dark:bg-transparent dark:border-[#cccccc] px-2 py-2 rounded-lg flex gap-4">
                  <DropdownMenu
                    open={isYearRangeDropdownOpen}
                    onOpenChange={setIsYearRangeDropdownOpen}
                  >
                    <DropdownMenuTrigger className="dropdownMenuTrigger flex justify-between gap-2 items-center w-32">
                      <p className="text-xs font-normal dark:text-[#cccccc]">
                        {selectedFilters.yearRange || "Year Range"}
                      </p>
                      <ChevronDown size={"12px"} color="#0E70FF" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dropdownMenu">
                      {["2020-2023", "2010-2015", "2000-2005"].map((range) => (
                        <DropdownMenuItem
                          key={range}
                          className="cursor-pointer"
                          onClick={() => {
                            handleFilterChange("yearRange", range);
                            setIsYearRangeDropdownOpen(false);
                          }}
                        >
                          {range}
                        </DropdownMenuItem>
                      ))}
                      <div className="p-2 flex flex-col">
                        <input
                          type="text"
                          placeholder="Enter custom range (e.g., 2015-2020)"
                          value={customYearRange}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCustomYearRangeChange(e);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCustomYearRangeApply();
                            }
                          }}
                          className="w-auto p-1.5 border rounded-lg bg-transparent text-black text-sm dark:text-[#cccccc] dark:bg-gray-800"
                        />
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCustomYearRangeApply();
                          }}
                          className="mt-2 bg-gradient-to-t from-[#0F55BA] to-[#0E70FF] text-white text-[13px] font-medium rounded-full hover:cursor-pointer border-[#3686FC] border-[2px]"
                        >
                          Apply Custom Range
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <X
                    size={13}
                    onClick={() => handleFilterChange("yearRange", "")}
                    className="cursor-pointer text-gray-500"
                  />
                </div>

                <div className="flex gap-[6px] ml-6 ">
                  <Button
                    variant="outline"
                    className="rounded-full hover:text-white text-[13px] btn px-[12px] text-white py-[6px] font-normal h-8 dark:text-[#cccccc] w-20"
                    onClick={applyFilters}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full text-[13px] border-[#0E70FF] text-[#0E70FF] px-[12px] py-[6px] font-normal h-8 w-20"
                    onClick={handleClearFilter}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </section>

        <Paper
          papers={filteredPapers}
          setPapers={setPapers}
          selectedFilters={selectedFilters}
        />
      </main>
    </>
  );
};

export default Page;
