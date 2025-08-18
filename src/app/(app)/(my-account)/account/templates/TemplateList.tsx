"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Filter, MoreVertical, ChevronDown, ListTodo, File, Dot, SquarePen, Copy, Share2, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader } from "rizzui";
import { debounce } from "lodash";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import TemplatesListDialog from "./TemplatesListDialog";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
 } from "@/components/ui/review-stage-select ";
import DeleteModal from "@/components/coman/DeleteModal";
import DeleteModalList from "@/components/coman/DeleteModalList";
import toast from "react-hot-toast";
import Image from "next/image";
import dash from '@/images/userProfileIcon/dash.jpg';
import { deleteTemplate, getNewTemplates, updateTemplateStatus } from "@/apis/templates";
import useDebounce from "@/hooks/useDebounce";
import LoadingText from "@/components/LoadingText";
import { Badge } from "@/components/ui/badge";


interface Template {
   id: number;
   title: string;
   status: string;
   projectsUsing: number;
   documentsUsing: number;
   date: string;
   imageUrl: string;
   total_documents: number;
   total_projects: number;
   created_at: string;
   template_name: string
   projects_using: number;
   total_files: number;
   type: string;
   community_public_template:boolean;
}

const TemplateList = () => { 
   const [pageNo, setPageNo] = useState<number>(1);
   const [limit, setLimit] = useState<number>(5);
   const [totalTemplates, setTotalTemplates] = useState<number>(0);
   const [isOpenAddTemplate, setIsOpenAddTemplate] = useState("");
   const [tableRowData, setTableRowData] = useState<any>(null);
   const [sortDirection, setSortDirection] = useState<string>("DESC");
   const [orderBy, setOrderBy] = useState<string>("created_at");
   const [fileId, setFileId] = useState<number | null>(null);
   const [isDeleteItem, setIsDeleteItem] = useState<any>(null);
   const [isDeleteLoading, setIsDeleteLoading] = useState(false);
   const [selectedTab, setSelectedTab] = useState("all");
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("All Templates");
   const [loadingStatus, setLoadingStatus] = useState<{ [key: number]: boolean }>({});
   const [previousStatus, setPreviousStatus] = useState<{ [key: number]: string }>({});
   const [templateData, setTemplateData] = useState<Template[]>([]);
   const [loading, setLoading] = useState(true);
   const [isFetchingMore, setIsFetchingMore] = useState(false);
   const [hasMore, setHasMore] = useState(true);
   const [queuedTab, setQueuedTab] = useState<string | null>(null);

   const debouncedQuery = useDebounce<string>(searchQuery, 1000);
   const searchRef = useRef<HTMLInputElement>(null);
   const listContainerRef = useRef<HTMLDivElement>(null);
   const latestTabRef = useRef<string | null>(null);

   const tabs = [
      { title: "All Templates", value: "all" },
      { title: "My Templates", value: "my templates" },
      { title: "Recently Used", value: "recent" },
      { title: "Community Templates", value: "community" },
      { title: "Shared with Me", value: "shared with me" },
   ];
   const observerRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      setPageNo(1);
      setHasMore(true);
      handleGetTemplates(false, 1);
   }, [debouncedQuery, selectedTab, selectedCategory, orderBy, sortDirection]);

   useEffect(() => {
      const handleScroll = () => {

         const container = listContainerRef.current || window;
         const scrollTop = container === window ? window.scrollY : (container as any).scrollTop;
         const clientHeight = container === window ? window.innerHeight : (container as any).clientHeight;
         const scrollHeight = container === window ? document.documentElement.scrollHeight : (container as any).scrollHeight;
         if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !loading && !isFetchingMore) {
            handleGetTemplates(true, pageNo + 1);
         }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, [hasMore, loading, isFetchingMore, pageNo, templateData]);

   useEffect(() => {
      if (loading || !hasMore) return;
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !isFetchingMore) {
          handleGetTemplates(true, pageNo + 1);
        }
      });
  
      if (observerRef.current) observer.observe(observerRef.current);
      return () => observer.disconnect();
    }, [loading, hasMore, isFetchingMore, pageNo, templateData]);

    const handleGetDuplicateTemplates = async (loadMore = false, page = 1) => {
      const foundTab = tabs?.find((value: any) =>{  return value.title == selectedCategory});
      try {
        if (!loadMore) {
         //  setLoading(true);
        } else {
          setIsFetchingMore(true);
        }
        let response = await getNewTemplates({
         selectedTab:selectedTab,
          pageNo: page,
          limit: limit,
          search: searchQuery,
          orderBy: orderBy,
          sortDirection: sortDirection,
          currentTab: foundTab?.value
        });
        const newTemplates = response?.data?.templates?.data || [];
        const count = response?.data?.templates?.count || 0;
        
        setTotalTemplates(count);
        if (loadMore) {
          setTemplateData(prev => [ ...newTemplates]);
          setPageNo(page);
        } else {
          setTemplateData(newTemplates);
          setPageNo(1);
        }
        setHasMore((loadMore ? templateData.length + newTemplates.length : newTemplates.length) < count);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || error?.message || "An error occurred."
        );
      } finally {
      //   setLoading(false);
        setIsFetchingMore(false);
      }
    };

   const handleGetTemplates = async (loadMore = false, page = 1) => {
      const foundTab = tabs?.find((value: any) =>{  return value.title == selectedCategory});
      try {
        if (!loadMore) {
          setLoading(true);
        } else {
          setIsFetchingMore(true);
        }
        let response = await getNewTemplates({
         selectedTab:selectedTab,
          pageNo: page,
          limit: limit,
          search: searchQuery,
          orderBy: orderBy,
          sortDirection: sortDirection,
          currentTab: foundTab?.value
        });
        const newTemplates = response?.data?.templates?.data || [];
        const count = response?.data?.templates?.count || 0;
        
        setTotalTemplates(count);
        if (loadMore) {
          setTemplateData(prev => [...prev, ...newTemplates]);
          setPageNo(page);
        } else {
          setTemplateData(newTemplates);
          setPageNo(1);
        }
        setHasMore((loadMore ? templateData.length + newTemplates.length : newTemplates.length) < count);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || error?.message || "An error occurred."
        );
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };


   const handleFileStatus = async (status: string, id: number) => {
      setPreviousStatus(prev => ({...prev, [id]: templateData.find(t => t.id === id)?.status || ''}));
      setLoadingStatus(prev => ({...prev, [id]: true}));
      try {
        const response = await updateTemplateStatus({ status }, id);
        if (response) {
          await new Promise(resolve => setTimeout(resolve, 500));
          handleGetDuplicateTemplates().then(() => {
            setLoadingStatus(prev => ({...prev, [id]: false}));
            setPreviousStatus(prev => ({...prev, [id]: ''}));
          });
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
        setLoadingStatus(prev => ({...prev, [id]: false}));
        setPreviousStatus(prev => ({...prev, [id]: ''}));
      }
    };

    useEffect(() => {
      if (!loading && queuedTab) {
        setSelectedTab(queuedTab);
        setQueuedTab(null);
        latestTabRef.current = null;
      }
    }, [loading, queuedTab]);
    
   const categories = ["All Category", "Research", "Academic", "Business", "Personal"];

   const debouncedTabClick = useRef(
      debounce((value: string) => {
        if (!loading) {
          setSelectedTab(value);
        } else {
          latestTabRef.current = value;
          setQueuedTab(value);
        }
      }, 200) 
    ).current;
    
    
    const handleTabChange = (value: string) => {
      debouncedTabClick(value);
    };

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
   };

   const handleCategoryChange = (category: string) => {
      setSelectedCategory(category);
   };

   const handleDeleteTemp = async () => {
      setIsDeleteLoading(true);
  
      try {
        let result: any;
        result = await deleteTemplate(isDeleteItem?.id);
        if (result) {
          toast.success(
            `Template "${isDeleteItem.template_name}" has been successfully deleted.`
          );
          setIsDeleteItem(null);
          handleGetTemplates();
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || error?.message || "An error occurred."
        );
      } finally {
        setIsDeleteLoading(false);
      }
    };

   const newData =
      selectedTab === "all"
         ? templateData
         : selectedTab === "recent"
            ? templateData?.filter((value) => value.projects_using > 0 || value.total_files > 0)
            : selectedTab === "my templates"
               ? templateData?.filter((value) => value.type == "Custom")
               : selectedTab === "community"
                  ? templateData?.filter((value) => value.community_public_template == true)
                  : selectedTab === "shared with me"
                     ? templateData
                     : [];

   const uniqueData = Array.from(
      new Map(newData.map(item => [item.id, item])).values()
   );

   const sortedData = uniqueData.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
   );

   return (
      <div className="">
         <div className="flex flex-col space-y-6">

            <div className="sm:flex-row justify-between items-start sm:items-center gap-4">
               <h1 className="font-poppins text-base font-medium leading-none tracking-[0%]">Templates</h1>

               <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-between mt-4">
   
                  <div className="relative w-full sm:w-64">
                     <div className="bg-inputBackground border outline-none border-gray-300 text-gray-900 text-sm rounded-full w-full p-1.5 dark:text-white flex items-center">
                        <span className="text-gray-500 mx-2">
                           <Search className="h-4 w-4" />
                        </span>
                        <input
                           ref={searchRef}
                           type="text"
                           id="template-search"
                           onChange={handleSearchChange}
                           value={searchQuery}
                           className="bg-transparent border-0 focus-visible:outline-none w-full"
                           placeholder="Search template"
                           required
                        />
                     </div>
                  </div>

                  <div className="flex">
                     <div className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-3 py-3 rounded-full hover:bg-blue-700 transition-colors"
                       onClick={() => setIsOpenAddTemplate("create_template")}>
                        <Plus className="h-5 w-5" />
                      Add Template
                     </div>
                  </div>
               </div>
            </div>
            <div className={"bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33] h-[1px] w-full mt-1"}/>

            <div className="flex justify-between">
               <div className="flex items-center m-[1px] bg-gray-100 rounded-full border border-[#E7E7E7] dark:border-[#e7e7e73b] dark:bg-[#152428] w-max">
                  {tabs.map((tab, index) => (
                       <div
                       key={index}
                       style={{
                          background:
                             selectedTab === tab.value
                                ? "linear-gradient(0deg, #DB8606 -32.81%, #F59B14 107.89%)"
                                : "",
                          border:
                             selectedTab === tab.value
                                ? "2px solid #FDAB2F"
                                : "2px solid #fdab2f00",
                       }}
                       className={`cursor-pointer px-4 py-[5px] rounded-full text-sm font-medium transition-all relative group
                       ${
                          selectedTab === tab.value
                             ? "bg-orange-400 text-white shadow-md text-[#FFFFFF]"
                             : "text-gray-500 text-[#666666] dark:text-[#999999]"
                       }`}
                       onClick={() => handleTabChange(tab.value)}
                    >
                        <div
                           className="max-w-[120px] truncate lg:max-w-none lg:truncate-none"
                        >
                           <TooltipProvider>
                              <Tooltip>
                                 <TooltipTrigger asChild>
                                    <span>{tab.title}</span>
                                 </TooltipTrigger>
                                 <TooltipContent className="border border-tableBorder text-left w-full max-w-[300px] font-size-small z-10 rounded-full bg-headerBackground px-2 py-2 text-darkGray">
                                    {tab.title}
                                 </TooltipContent>
                              </Tooltip>
                           </TooltipProvider>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div ref={listContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto">
               {loading ? (
                  <div className="col-span-full flex justify-center items-center mt-[8rem]">
                     <Loader
                        variant="threeDot"
                        size="sm"
                     />
                  </div>
               ) : sortedData.length > 0 ? (<>
                  {sortedData.map((template: Template) => {
                     return (
                        <div
                           key={template.id}
                           className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow dark:bg-[#1a282e] dark:border-[#E5E5E514]"
                        >

                           <div className="p-4 space-y-3 flex" style={{
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                           }}>
                              <div >
                                 <div className="flex items-center justify-between">
                                    <h3 className="font-medium dark:text-[#CCCCCC]">{template.template_name}</h3>
                                 </div>
                                 <Select
                                    disabled={template.type == "Standard"||selectedTab === "shared with me"}
                                    defaultValue={template.status}
                                    onValueChange={(status: string) => {
                                       handleFileStatus(status, template.id);
                                    }}
                                 >
                                    <SelectTrigger
                                       className="w-max border-none bg-transparent focus:ring-0 focus:ring-offset-0 mt-0"
                                       style={{ padding: "0px", margin: '5px 0px' }}
                                    >
                                       {loadingStatus[template.id] ? (
                                          <Badge variant={previousStatus[template.id] === "draft" ? "draft" : "live"}>
                                             <Loader variant="threeDot" size="sm" />
                                          </Badge>
                                       ) : (
                                          <>
                                             {template?.status && (
                                                <Badge
                                                   variant={template?.status === "draft" ? "draft" : "live"}>
                                                   <span className="capitalize">
                                                      {template.status}
                                                   </span>
                                                   <ChevronDown
                                                      size={"12px"}
                                                      className=""
                                                   />
                                                </Badge>
                                             )}
                                          </>
                                       )}
                                    </SelectTrigger>
                                    <SelectContent className="bg-headerBackground">
                                       <SelectItem value="live" className="text-xs">
                                          Live
                                       </SelectItem>
                                       <SelectItem value="draft" className="text-xs">
                                          Draft
                                       </SelectItem>
                                    </SelectContent>
                                 </Select>
                                 <div className=" items-center gap-4 text-sm text-gray-600">
                                    <div className="flex">
                                       <div className="flex font-medium pr-1 font-semibold dark:text-[#CCCCCC]"> <ListTodo className="h-4 w-4 mr-1" />{template.projects_using}</div> <span className="dark:text-[#CCCCCC]">Project Using</span>
                                    </div>
                                    <div className="flex mt-1">
                                       <div className=" flex font-medium pr-1 font-semibold dark:text-[#CCCCCC]"> <File className="h-4 w-4 mr-1" />{template.total_files}</div> <span className="dark:text-[#CCCCCC]">Document Using</span>
                                    </div>
                                 </div>
                              </div>
                              <div style={{
                                 height: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 justifyContent: 'end',
                              }}>
                                 <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33] mx-2 w-full my-[10px] p-[0.5px] size-auto ml-0`}></div>

                                 <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-[#CCCCCC]">{new Date(template.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    <div>
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                             <button className="p-1 rounded-full bg-white/80 hover:bg-white transition-colors dark:bg-[#2c393e00] hover:dark:bg-[#0E70FF33]">
                                                <MoreVertical className="h-5 w-5 text-gray-600 dark:text-[#CCCCCC]" />
                                             </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuPortal>
                                             <DropdownMenuContent align="end" className="p-2 bg-inputBackground mt-2 border border-gray-200 min-w-[130px] rounded-[6px] dark:border-[#E5E5E514] dark:bg-[#152428]">
                                                {template.type != "Standard"&& selectedTab !== "shared with me"&&<DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-[#333333] hover:bg-gray-100 rounded-[6px] dark:text-[#CCCCCC]"
                                                   onClick={() => {
                                                      setIsOpenAddTemplate("edit_template");
                                                      setTableRowData(template);
                                                   }}
                                                ><SquarePen className="text-[#666666] mr-2" size={17} /> Edit</DropdownMenuItem>}
                                                <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-[#333333] hover:bg-ray-100 rounded-[6px] dark:text-[#CCCCCC]"
                                                   onClick={(e) => {
                                                      setIsOpenAddTemplate("template_name");
                                                      setTableRowData(template);
                                                   }}><Copy className="text-[#666666] mr-2" size={17} />Duplicate</DropdownMenuItem>
                                                {template.type != "Standard"&& selectedTab !== "shared with me" && <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-[#333333] hover:bg-gray-100 rounded-[6px] dark:text-[#CCCCCC]"
                                                   onClick={() => setIsDeleteItem(template)}
                                                ><Trash2 className="text-[#E92222] mr-2" size={17} />Delete</DropdownMenuItem>}
                                             </DropdownMenuContent>
                                          </DropdownMenuPortal>
                                       </DropdownMenu>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )
                  })}
                  <div ref={observerRef} className="h-1" />
                  {/* {isFetchingMore && (
                     <div className="col-span-full flex justify-center py-4 mt-8">
                        <Loader variant="threeDot" size="sm" />
                     </div>
                  )} */}
               </>) : (
                  <div className="col-span-full text-center py-12">
                     <p>No templates found.</p>
                  </div>
               )}

            </div>
            
            {/* <div ref={listContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-scroll">
               {loading ? (
                  <div className="col-span-full flex justify-center items-center">
                     <Loader
                        variant="threeDot"
                        size="sm"
                     />
                  </div>
               ) : (selectedTab === "recent"
                  ? [...templateData].filter((t: any) => (t.projects_using || 0) > 0 || (t.total_files || 0) > 0).sort(
                     (a: any, b: any) => {
                        if ((b.projects_using || 0) !== (a.projects_using || 0)) {
                           return (b.projects_using || 0) - (a.projects_using || 0);
                        }
                        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
                     }
                  )
                  : templateData
               ).length > 0 ? (<>
                  {(selectedTab === "recent"
                     ? [...templateData].filter((t: any) => (t.projects_using || 0) > 0 || (t.total_files || 0) > 0).sort(
                        (a: any, b: any) => {
                           if ((b.projects_using || 0) !== (a.projects_using || 0)) {
                              return (b.projects_using || 0) - (a.projects_using || 0);
                           }
                           return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
                        }
                     )
                     : templateData
                  ).map((template:Template) => {
console.log("template",template)
                     return (
                        <div
                           key={template.id}
                           className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow dark:bg-[#1a282e] dark:border-[#E5E5E514]"
                        >

                           <div className="p-4 space-y-3 flex" style={{
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                           }}>
                              <div >
                                 <div className="flex items-center justify-between">
                                    <h3 className="font-medium dark:text-[#CCCCCC]">{template.template_name}</h3>
                                 </div>
                                 <Select
                                 disabled={template.type == "Standard"}
                                    defaultValue={template.status}
                                    onValueChange={(status: string) => {
                                       handleFileStatus(status, template.id);
                                    }}
                                 >
                                    <SelectTrigger
                                       className="w-max border-none bg-transparent focus:ring-0 focus:ring-offset-0 mt-0"
                                       style={{ padding: "0px", margin: '5px 0px' }}
                                    >
                                       {loadingStatus[template.id] ? (
                                          <Badge variant={previousStatus[template.id] === "draft" ? "draft" : "live"}>
                                             <Loader variant="threeDot" size="sm" />
                                          </Badge>
                                       ) : (
                                          <>
                                             {template?.status && (
                                                <Badge
                                                   variant={template?.status === "draft" ? "draft" : "live"}>
                                                   <span className="capitalize">
                                                      {template.status}
                                                   </span>
                                                   <ChevronDown
                                                      size={"12px"}
                                                      className=""
                                                   />
                                                </Badge>
                                             )}
                                          </>
                                       )}
                                    </SelectTrigger>
                                    <SelectContent className="bg-headerBackground">
                                       <SelectItem value="live" className="text-xs">
                                          Live
                                       </SelectItem>
                                       <SelectItem value="draft" className="text-xs">
                                          Draft
                                       </SelectItem>
                                    </SelectContent>
                                 </Select>
                                 <div className=" items-center gap-4 text-sm text-gray-600">
                                    <div className="flex">
                                       <div className="flex font-medium pr-1 font-semibold dark:text-[#CCCCCC]"> <ListTodo className="h-4 w-4 mr-1" />{template.projects_using}</div> <span className="dark:text-[#CCCCCC]">Project Using</span>
                                    </div>
                                    <div className="flex mt-1">
                                       <div className=" flex font-medium pr-1 font-semibold dark:text-[#CCCCCC]"> <File className="h-4 w-4 mr-1" />{template.total_files}</div> <span className="dark:text-[#CCCCCC]">Document Using</span>
                                    </div>
                                 </div>
                              </div>
                              <div style={{
                                 height: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 justifyContent: 'end',
                              }}>
                                 <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33] mx-2 w-full my-[10px] p-[0.5px] size-auto ml-0`}></div>

                                 <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-[#CCCCCC]">{new Date(template.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    <div>
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                             <button className="p-1 rounded-full bg-white/80 hover:bg-white transition-colors dark:bg-[#2c393e00] hover:dark:bg-[#0E70FF33]">
                                                <MoreVertical className="h-5 w-5 text-gray-600 dark:text-[#CCCCCC]" />
                                             </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuPortal>
                                             <DropdownMenuContent align="end" className="p-2 bg-inputBackground mt-2 border border-gray-200 min-w-[130px] rounded-[6px] dark:border-[#E5E5E514] dark:bg-[#152428]">
                                                {template.type != "Standard" && <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-[#333333] hover:bg-gray-100 rounded-[6px] dark:text-[#CCCCCC]"
                                                   onClick={() => {
                                                      setIsOpenAddTemplate("edit_template");
                                                      setTableRowData(template);
                                                   }}
                                                ><SquarePen className="text-[#666666] mr-2" size={17} /> Edit</DropdownMenuItem>}
                                                <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-[#333333] hover:bg-ray-100 rounded-[6px] dark:text-[#CCCCCC]"
                                                   onClick={(e) => {
                                                      setIsOpenAddTemplate("template_name");
                                                      setTableRowData(template);
                                                   }}><Copy className="text-[#666666] mr-2" size={17} />Duplicate</DropdownMenuItem>
                                                {template.type != "Standard" && <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-[#333333] hover:bg-gray-100 rounded-[6px] dark:text-[#CCCCCC]"
                                                   onClick={() => setIsDeleteItem(template)}
                                                ><Trash2 className="text-[#E92222] mr-2" size={17} />Delete</DropdownMenuItem>}
                                             </DropdownMenuContent>
                                          </DropdownMenuPortal>
                                       </DropdownMenu>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )
                  })}
                  <div ref={observerRef} className="h-1" />
                  {isFetchingMore && (
                     <div className="col-span-full flex justify-center py-4">
                        <Loader variant="threeDot" size="sm" />
                     </div>
                  )}
               </>) : (
                  <div className="col-span-full text-center py-12">
                     <p>No templates found.</p>
                  </div>
               )}
               {loading && <div>Loading more...</div>}

            </div> */}
            {isOpenAddTemplate && (
          <TemplatesListDialog
            template={tableRowData}
            isOpen={isOpenAddTemplate}
            handleGetTemplates={handleGetDuplicateTemplates}
            onOpenChange={() => {
              setIsOpenAddTemplate("");
              setTableRowData(null);
            }}
          />
        )}
         </div>
         <DeleteModalList
          isDeleteItem={!!isDeleteItem}
          setIsDeleteItem={setIsDeleteItem}
          loading={isDeleteLoading}
          handleDelete={handleDeleteTemp}
          Title={"Delete Template"}
          heading={"Are you sure you want to delete this Template?"}
          subheading={
            isDeleteItem?.projects_using || isDeleteItem?.total_files
              ? `This template is associated with ${
                  isDeleteItem?.projects_using
                    ? `${isDeleteItem.projects_using} project${
                        isDeleteItem.projects_using > 1 ? "s" : ""
                      }`
                    : ""
                }${
                  isDeleteItem?.projects_using && isDeleteItem?.total_files
                    ? " and "
                    : ""
                }${
                  isDeleteItem?.total_files
                    ? `${isDeleteItem.total_files} document${
                        isDeleteItem.total_files > 1 ? "s" : ""
                      }`
                    : ""
                }.`
              : undefined
          }
          message={"This action cannot be undone."}
          isDeletable={!!isDeleteItem?.projects_using}
        />
      </div>
   );
}
export default TemplateList;