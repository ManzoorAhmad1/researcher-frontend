import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector } from "react-redux";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Lock, TriangleAlert } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

interface DropdownProps {
  workspaces: any[];
  isDisable: boolean;
  selectedWorkspace: any | null;
  onSelectWorkspace: (workspace: any) => void;
}

const WorksSpaceDropdown: React.FC<DropdownProps> = ({
  workspaces,
  selectedWorkspace,
  isDisable,
  onSelectWorkspace,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const workspace: any = useSelector((state: any) => state?.workspace);
  const router = useRouter();
  const [userWorkspaces, setUserWorkspaces] = useState<any>([]);

  useEffect(() => {
    setUserWorkspaces(() => workspaces);
  }, [workspaces]);
  const onSearchChange = (e: any) => {
    const value = e.target.value;
    if (value) {
      const searchWorkspaces: any = workspaces?.filter((space: any) =>
        space?.name?.toLowerCase()?.startsWith(value?.toLowerCase() || "")
      );
      setUserWorkspaces(searchWorkspaces);
    } else {
      setUserWorkspaces(() => workspaces);
    }
  };
  return (
    <div className="select-none workspace-padding outline-none">
      <DropdownMenu open={isOpen}>
        <DropdownMenuTrigger className="w-full">
          <div
            className="workspace cursor-pointer outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
                         <div className="rounded-full h-[28px] w-[28px] grid place-items-center text-white text-[13px] bg-[#E68C07] flex-shrink-0">

                 {workspace?.workspace?.name
                   ? workspace?.workspace?.name?.slice(0, 2)?.toUpperCase()
                   : "AR"}
              </div>
              <div className="leading-[17px] workspace-dropdown text-start">
                <label
                  htmlFor="Workspace"
                  className="font-medium text-[10px] text-[#666666] dark:text-[#CCCCCC]"
                >
                  Workspace
                </label>
                <div className="text-[13px] font-medium flex items-center gap-2">
                {workspace?.workspace?.name
                    ? workspace?.workspace?.name &&
                      workspace?.workspace?.type &&
                      workspace?.workspace?.type !== "owner"
                      ? workspace?.workspace?.name + " (Shared Workspace)"
                      : workspace?.workspace?.name
                    : selectedWorkspace
                    ? selectedWorkspace.name &&
                      selectedWorkspace.type &&
                      selectedWorkspace.type !== "owner"
                      ? selectedWorkspace.name + " (Shared Workspace)"
                      : selectedWorkspace.name
                    : ""}

                  {(workspace?.workspace?.is_default_workspace ||
                    selectedWorkspace?.is_default_workspace) && (
                    <Lock size={14} color="#999999" />
                  )}
                </div>
              </div>
            </div>
            <RiArrowDropDownLine className="text-2xl text-[#666666] dark:text-[#FFFFFF]" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            onPointerDownOutside={() => setIsOpen(false)}
            className="dropdownMenu ms-4 bg-inputBackground w-72"
            side="bottom"
            align="end"
          >
            <div
              id="dropdownSearch"
              className=" bg-white rounded-lg shadow  dark:bg-gray-700 w-full "
              style={{ boxShadow: "0px 4px 16px 0px #0000001F" }}
            >
              <div className="p-3">
                <label htmlFor="input-group-search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Search />
                  </div>
                  <input
                    type="text"
                    id="input-group-search"
                    className="block w-full p-2 ps-10 text-sm bg-transparent  text-gray-900 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                    placeholder="Search Workspaces"
                    onChange={onSearchChange}
                  />
                </div>
              </div>
              <hr className="mx-5 mb-3 border-[#E5E5E5] dark:border-[#94999b]" />
              <ul
                className="max-h-48  pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200 mx-3"
                aria-labelledby="dropdownSearchButton"
              >
                {userWorkspaces && userWorkspaces?.length > 0 ? (
                  userWorkspaces.map((item: any) =>
                    !item?.projects ||
                    item?.projects === null ||
                    item?.projects?.length === 0 ? (
                      <TooltipProvider key={item?.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <li
                              key={item.id}
                              onClick={() => {
                                if (workspace?.workspace?.id !== item?.id) {
                                  onSelectWorkspace(item?.id);
                                  const currentPath = window.location.pathname;
                                  if (
                                    redirectToExplorerPaths.some((path) =>
                                      currentPath.includes(path)
                                    )
                                  ) {
                                    router.push("/explorer");
                                  }
                                  setIsOpen(false);
                                }
                              }}
                              className={`flex gap-2 items-center p-2 rounded-lg cursor-pointer dark:text-black ${
                                selectedWorkspace?.id === item.id
                                  ? "bg-[#FCE6C4]"
                                  : ""
                              }`}
                            >
                              <div className="rounded-full h-[28px] w-[28px] grid place-items-center text-white  text-[13px] bg-[#E68C07]">
                                {item?.name?.slice(0, 2)?.toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="dark:text-white truncate block">
                                          {item?.name}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="border border-tableBorder text-left w-full max-w-[220px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                                        <span className="text-[#666666] dark:text-[#CCCCCC] text-[13px] font-normal text-left">
                                          {item?.name}
                                        </span>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {item?.type && item?.type !== "owner" && (
                                                                <span className="text-[11px] whitespace-nowrap flex-shrink-0 text-[#666666] dark:text-[#CCCCCC]">
                              (Shared Workspace)
                            </span>
                                  )}
                                </div>
                              </div>
                              {item?.is_default_workspace && (
                                <Lock size={16} color="#999999" />
                              )}
                              {!item?.projects ||
                                item?.projects === null ||
                                (item?.projects?.length === 0 && (
                                  <TriangleAlert size={16} color="#E68C07" />
                                ))}
                            </li>
                          </TooltipTrigger>

                          <TooltipContent className="border border-tableBorder text-left w-full max-w-[220px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray  transition-opacity duration-200 group-hover:opacity-100 ">
                            <span
                              className={`text-[#666666] dark:text-[#CCCCCC] text-[13px] font-normal  text-left  `}
                            >
                              This workspace has no projects. Before switching,
                              please create a project by clicking on the
                              workspace name.
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <li
                        key={item.id}
                        onClick={() => {
                          if (workspace?.workspace?.id !== item?.id) {
                            onSelectWorkspace(item?.id);
                            const currentPath = window.location.pathname;
                            if (
                              redirectToExplorerPaths.some((path) =>
                                currentPath.includes(path)
                              )
                            ) {
                              router.push("/explorer");
                            }
                            setIsOpen(false);
                          }
                        }}
                        className={`flex gap-2 items-center p-2 rounded-lg cursor-pointer dark:text-black ${
                          selectedWorkspace?.id === item.id
                            ? "bg-[#FCE6C4]"
                            : ""
                        }`}
                      >
                        <div className="rounded-full h-[28px] w-[28px] grid place-items-center text-white  text-[13px] bg-[#E68C07]">
                          {item?.name?.slice(0, 2)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="dark:text-white truncate block">
                                    {item?.name}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="border border-tableBorder text-left w-full max-w-[220px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                                  <span className="text-[#666666] dark:text-[#CCCCCC] text-[13px] font-normal text-left">
                                    {item?.name}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {item?.type && item?.type !== "owner" && (
                            <span className="text-[11px] whitespace-nowrap flex-shrink-0 text-[#666666] dark:text-[#CCCCCC]">
                              (Shared Workspace)
                            </span>
                             )}
                          </div>
                        </div>
                        {item?.is_default_workspace && (
                          <Lock size={16} color="#999999" />
                        )}
                      </li>
                    )
                  )
                ) : (
                  <span className="dark:text-white">No Workspace Found</span>
                )}
              </ul>
              <hr className="mx-5 border-[#E5E5E5] dark:border-[#94999b]" />
              <div
                className="flex items-center p-3 text-sm font-medium text-[#333333] dark:text-white border-t0 rounded-b-lg mx-3 cursor-pointer"
                onClick={() => {
                  setIsOpen(!isOpen);
                  router.push(isDisable ? "/account/workspace" : "");
                }}
              >
                +<div className="ms-3">Add New Workspace</div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
};

export default WorksSpaceDropdown;
const Search = () => (
  <svg
    className="w-4 h-4 text-gray-500 dark:text-gray-400"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
    />
  </svg>
);

const redirectToExplorerPaths = ["/info"];
