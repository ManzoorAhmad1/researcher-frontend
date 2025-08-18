/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FilePlus,
  FolderPlus,
  LayoutGrid,
  LayoutList,
  LoaderCircle,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next-nprogress-bar";
import { useParams, usePathname } from "next/navigation";
import GridView from "./Grid/GridView";
import CreateFolderDialog from "../../dialog/CreateFolderDialog";
import { TableColumnData } from "../../utils/types";
import { Card } from "@/components/ui/card";
import {
  activeTab,
  clearData,
  filterNotesBookmarkAllData,
  getNotesBookmarkAllData,
  getRefetchNotesBookmarkAllData,
  searchFilterNotesBookmarksAllData,
  searchLoader,
} from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { debounce } from "lodash";
import { IoChevronBack } from "react-icons/io5";
import TableView from "./Table/TableView";
import ShowHideColumns from "../../dialog/ShowHideColumns";
import MultipleFileDeleteDialog from "../../dialog/MultipleFileDeleteDialog";
import { multipleFileDelete } from "@/apis/notes-bookmarks";
import toast from "react-hot-toast";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import AddBookmarkDialog from "../../dialog/AddBookmarkDialog";

export const NotesAndBookmarksView = () => {
  const uuId = uuidv4();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { slug } = params;
  const [add, setAdd] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [selectedColumn, setSelectedColumn] = useState<TableColumnData[]>();
  const [createFolderShow, setCreateFolderShow] = useState(false);
  const option = ["Bookmarks", "Notes"];
  const [lastSelectedOption, setLastSelectedOption] = useState("");
  const [selectedOption, setSelectedOption] = useState<any>([]);
  const [applyFilter, setApplyFilter] = useState("");
  const [search, setSearch] = useState("");
  const [filterShow, setFilterShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [isTableColumns, setISTableColumns] = useState(selectedColumn);
  const [isHideShowOpen, setIsHideShowOpen] = useState(false);
  const [bookmarkInfo, setBookmarkInfo] = useState({
    show: false,
    id: ''
  });

  const { workspace } = useSelector((state: RootState) => state.workspace);
  const {
    filterLoading,
    notesBookmarksDatas,
    loading,
    searchLoading,
    activeTabValue,
  } = useSelector((state: RootState) => state.notesbookmarks);
  const { tableColumnsData } = useSelector(
    (state: RootState) => state.notesbookmarksColumn
  );
  const { project } = useSelector((state: any) => state?.project);

  const handleTabChange = (value: string) => {
    dispatch(activeTab(value));
    dispatch(clearData());
  };

  const handleChangeOption = (item: string) => {
    setLastSelectedOption(item);
    // setSelectedOption((prev: string[]) => {
    //   const filtered = prev.filter((opt) => opt !== item);
    //   return filtered.length === prev.length ? [...prev, item] : filtered;
    // });
    setSelectedOption((prev: string[]) => {
      const filtered = prev.filter((opt) => opt !== item);
      return filtered.length === prev.length ? [item] : filtered;
    });
  };
  const handleScroll = (direction: "left" | "right") => {
    if (!tableRef.current) return;

    const scrollAmount = 300;
    const currentScroll = tableRef.current.scrollLeft;
    const newScroll =
      direction === "left"
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    tableRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  };

  const checkScrollable = () => {
    if (!tableRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener("scroll", checkScrollable);
      checkScrollable();

      setTimeout(checkScrollable, 500);
    }

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("scroll", checkScrollable);
      }
    };
  }, [notesBookmarksDatas, isTableColumns]);

  const handleFilterSubmit = async (item? : any) => {
    // setApplyFilter(selectedOption);
    setSearch("");
    if (JSON.stringify(selectedOption) === JSON.stringify(item)) {
      const body = { workspace_id: workspace?.id, project_id: project?.id };
      await dispatch(
        getNotesBookmarkAllData({
          id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
          currentPage: 1,
          perPageLimit: 10,
          body,
        })
      );
      setFilterShow(false);
      setApplyFilter("");
      setLastSelectedOption("");
      setSelectedOption([]);
    } else {
      await dispatch(
        filterNotesBookmarkAllData({
          id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
          body: {
            type: ["Folder", ...item],
            workspace_id: workspace?.id,
            project_id: project?.id,
          },
          currentPage: 1,
          perPageLimit: 10,
        })
      );
      setApplyFilter(item);
    }
  };

  const handleClearFilter = async () => {
    const body = { workspace_id: workspace?.id, project_id: project?.id };
    await dispatch(
      getNotesBookmarkAllData({
        id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
        currentPage: 1,
        perPageLimit: 10,
        body,
      })
    );

    setFilterShow(false);
    setApplyFilter("");
    setLastSelectedOption("");
    setSelectedOption([]);
  };

  const handleSearch = useCallback(
    debounce((query) => {
      const id = slug?.length > 0 ? slug?.[slug.length - 1] : 0;
      dispatch(
        searchFilterNotesBookmarksAllData({
          id,
          body: {
            search: query,
            workspace_id: workspace?.id,
            project_id: project?.id,
            type: selectedOption,
          },
          currentPage: 1,
          perPageLimit: 10,
        })
      );
    }, 800),
    [dispatch, slug, workspace?.id, selectedOption, project?.id]
  );

  const deleteFunction = async () => {
    const data = await multipleFileDelete(selectedItems);
    if (data?.success) {
      setShow(false);
      setSelectAll(false);
      toast.success(data?.message);
      setSelectedItems([]);
      const body = { workspace_id: workspace?.id, project_id: project?.id };
      dispatch(
        getRefetchNotesBookmarkAllData({
          id: slug?.length > 0 ? slug[slug.length - 1] : 0,
          currentPage: 1,
          perPageLimit: 10,
          body,
        })
      );
    }
  };

  useEffect(() => {
    setSelectedColumn(tableColumnsData);
  }, [tableColumnsData]);

  return (
    <>
      <Tabs value={activeTabValue} onValueChange={handleTabChange}>
        <div className=" bg-headerBackground px-[24px] pb-[18px]">
          <div className="flex items-center gap-1 mb-4">
            <IoChevronBack
              className="text-3xl cursor-pointer"
              onClick={() => router.back()}
            />

            <h2 className="font-size-bold font-poppins text-black dark:text-white">
              Knowledge Bank
            </h2>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <DropdownMenu onOpenChange={setIsOpen}>
                <DropdownMenuTrigger className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray outline-none">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-[150px] flex justify-between items-center border-[#0E70FF]  rounded-[26px]  "
                  >
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap font-size-normal">
                      Actions
                    </span>
                    {isOpen ? (
                      <ChevronUp width={18} height={18} />
                    ) : (
                      <ChevronDown width={18} height={18} />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2 bg-inputBackground border border-tableBorder ">
                  <DropdownMenuItem className="cursor-pointer">
                    <div
                      onClick={() => setCreateFolderShow(true)}
                      className="flex gap-3 items-center justify-between"
                    >
                      <FolderPlus
                        width={18}
                        height={18}
                        className="dark:text-[#CCCCCC] text-[#666666]"
                      />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap font-size-normal dark:text-[#CCCCCC] text-[#333333] ">
                        Add Folder
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu open={add}>
                <DropdownMenuTrigger className=" outline-none border-0">
                  <Button
                    onClick={() => setAdd(!add)}
                    variant="outline"
                    size="sm"
                    className="h-8 btn rounded-[26px] text-white hover:text-white"
                  >
                    New...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    onClickCapture={() => setAdd(false)}
                    onPointerDownOutside={() => setAdd(false)}
                    className="dropdownMenu p-2 bg-inputBackground w-30 cursor-pointer"
                    side="bottom"
                    align="start"
                  >
                    <DropdownMenuItem
                      onClick={() => router.push(`${pathname}/note/${uuId}`)}
                      className="cursor-pointer"
                    >
                      <div className="flex gap-3 items-center justify-between">
                        <FilePlus
                          width={18}
                          height={18}
                          className="dark:text-[#CCCCCC] text-[#666666]"
                        />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap font-size-normal dark:text-[#CCCCCC] text-[#333333] ">
                          Add Note
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      // onClick={() =>
                      //   router.push(`${pathname}/bookmark/${uuId}`)
                      // }
                      onClick={() => setBookmarkInfo({ show: true, id : "" })}
                      className="cursor-pointer"
                    >
                      <div className="flex gap-3 items-center justify-between">
                        <Bookmark
                          width={18}
                          height={18}
                          className="dark:text-[#CCCCCC] text-[#666666]"
                        />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap font-size-normal dark:text-[#CCCCCC] text-[#333333] ">
                          Add Bookmark
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>

              {selectedItems?.length > 0 && (
                <div className="flex items-center pag-2 rounded-lg bg-inputBackground ">
                  <div className="pl-2 pr-4 text-lightGray  text-sm ">
                    Selected: {selectedItems.length} item(s)
                  </div>
                  <div className="flex items-center">
                    <div className="border-l border-[#E5E5E5] h-[27px]" />

                    <Button size="sm" className="h-8 gap-1" variant="link">
                      <Trash2
                        className="h-4 w-4 dark:text-[#CCCCCC] text-[#666666]"
                        onClick={() => setShow(true)}
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <TabsList className="border border-[#E7E7E7] dark:border-[#364146] rounded-[32px] p-2 gap-1">
              <TabsTrigger
                value="list"
                className="rounded-full p-1 data-[state=active]:text-[#FFFFFF] data-[state=active]:border-2 data-[state=active]:border-[#FDAB2F]
              data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
              data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
              >
                <LayoutList width={18} height={18} />
              </TabsTrigger>
              <TabsTrigger
                value="folder"
                className="rounded-full p-1 data-[state=active]:text-[#FFFFFF] data-[state=active]:border-2 data-[state=active]:border-[#FDAB2F]
              data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
              data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
              >
                <LayoutGrid width={18} height={18} />
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="p-[24px]">
          <TabsContent value="list">
            <TableView
              tableRef={tableRef}
              selectAll={selectAll}
              setSelectAll={setSelectAll}
              selectedOption={applyFilter}
              allSelectedOption={selectedOption}
              selectedItems={selectedItems}
              tableColumns={selectedColumn}
              setSelectedItems={setSelectedItems}
              setISTableColumns={setISTableColumns}
              isTableColumns={isTableColumns}
              ImageSizes={ImageSizes}
              handleSearch={handleSearch}
              setSearch={setSearch}
              search={search}
              searchLoading={searchLoading}
              canScrollLeft={canScrollLeft}
              handleScroll={handleScroll}
              canScrollRight={canScrollRight}
              setFilterShow={setFilterShow}
              activeTabValue={activeTabValue}
              setIsHideShowOpen={setIsHideShowOpen}
              isHideShowOpen={isHideShowOpen}
              selectedColumn={selectedColumn}
              setSelectedColumn={setSelectedColumn}
              filterShow={filterShow}
              lastSelectedOption={lastSelectedOption}
              option={option}
              handleChangeOption={handleChangeOption}
              handleClearFilter={handleClearFilter}
              filterLoading={filterLoading}
              handleFilterSubmit={handleFilterSubmit}
              setBookmarkInfo={setBookmarkInfo}
              setCreateFolderShow={setCreateFolderShow}
            />
          </TabsContent>
          <TabsContent value="folder">
            <GridView selectedOption={applyFilter} />
          </TabsContent>
        </div>
      </Tabs>

      <CreateFolderDialog
        createFolderShow={createFolderShow}
        setCreateFolderShow={setCreateFolderShow}
      />

      <MultipleFileDeleteDialog
        show={show}
        selectedItems={selectedItems?.length}
        setShow={setShow}
        deleteFunction={deleteFunction}
      />

      <AddBookmarkDialog
        bookmarkInfo={bookmarkInfo}
        setBookmarkInfo={setBookmarkInfo}
      />
    </>
  );
};
