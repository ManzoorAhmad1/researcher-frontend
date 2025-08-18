import { Text, Empty, Avatar } from "rizzui";
import Image from "next/image";
import { useState } from "react";

interface SharedBookmarksProps {
  isLoading: boolean;
  projectsFiles: any[];
  notesAndBookmarks: any;
}

const SharedBookmarks: React.FC<SharedBookmarksProps> = ({
  isLoading,
  projectsFiles,
  notesAndBookmarks,
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionName: string) => {
    setOpenSection((prev) => (prev === sectionName ? null : sectionName));
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-[#1F2E33]">
      <h2 className="flex gap-2 font-semibold text-[13px] dark:text-[#CCCCCC] text-[#4D4D4D]">
        <span>
          <svg
            width="14"
            height="16"
            viewBox="0 0 14 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 15.5H1C0.58579 15.5 0.25 15.1642 0.25 14.75V1.25C0.25 0.83579 0.58579 0.5 1 0.5H13C13.4142 0.5 13.75 0.83579 13.75 1.25V14.75C13.75 15.1642 13.4142 15.5 13 15.5ZM12.25 14V2H1.75V14H12.25ZM3.25 3.5H6.25V6.5H3.25V3.5ZM3.25 8H10.75V9.5H3.25V8ZM3.25 11H10.75V12.5H3.25V11ZM7.75 4.25H10.75V5.75H7.75V4.25Z"
              fill="#F59B14"
            />
          </svg>
        </span>
        SHARED BOOKMARKS
      </h2>
      {isLoading ? (
        <div className="flex flex-col gap-4 mt-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          {projectsFiles?.map((project: any) => {
            const projectBookmarks = notesAndBookmarks?.data?.filter(
              (item: any) =>
                item?.project_id === project?.projectId &&
                item?.type === "file" &&
                item?.members?.length > 0 &&
                item?.members?.filter((member: any) => member?.role !== "Owner")
                  .length > 0
            );

            return projectBookmarks?.length ? (
              <div
                key={project.projectId}
                className="mt-4 rounded-lg border border-gray-200 dark:bg-[#E5E5E566] dark:bg-[#1F2E33]"
              >
                <div
                  className="p-2 flex justify-between items-center rounded-t-lg cursor-pointer"
                  onClick={() => toggleSection(project.projectId)}
                >
                  <h3 className="flex gap-2 font-medium items-center font-size-medium dark:text-[#CCCCCC] text-[#4D4D4D]">
                    <span>
                      <Image
                        src={
                          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//collaborationFolderIcon.svg`
                        }
                        alt="Folder Icon"
                        className="h-4 w-4"
                      />
                    </span>
                    {project?.project?.name}
                  </h3>
                  <button className="text-gray-500 hover:text-gray-700 dark:text-white">
                    {openSection === project.projectId ? "-" : "+"}
                  </button>
                </div>
                {openSection === project.projectId && <hr />}
                {openSection === project.projectId && (
                  <div className="p-2 space-y-2">
                    {projectBookmarks?.map((bookmark: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <a
                            href={
                              bookmark?.link?.startsWith("http")
                                ? bookmark?.link
                                : `https://${bookmark?.link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-medium hover:underline dark:text-white cursor-pointer"
                          >
                            <p className="flex gap-2 items-center">
                              <Image
                                src={
                                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//link.svg`
                                }
                                alt="Link Icon"
                                className="h-4 w-4"
                              />
                              <span className="font-size-normal">
                                {bookmark?.title}
                              </span>
                            </p>
                          </a>
                          <p className="text-blue-600 ml-6 font-size-md dark:text-white">
                            {bookmark?.description
                              ?.replace(/<[^>]*>/g, "")
                              ?.replace(/\s+/g, " ")
                              ?.trim()
                              ?.split(".")?.length > 0
                              ? bookmark?.description
                                  ?.replace(/<[^>]*>/g, "")
                                  ?.replace(/\s+/g, " ")
                                  ?.trim()
                                  ?.split(".")
                                  ?.slice(0, 1)
                                  ?.join(".") + "."
                              : bookmark?.description
                                  ?.replace(/<[^>]*>/g, "")
                                  ?.replace(/\s+/g, " ")
                                  ?.trim()}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-sm font-normal bg-blue-100 h-[26px] text-center text-[#0E70FF] rounded">
                          {bookmark.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null;
          })}
          {!projectsFiles?.some((project: any) =>
            notesAndBookmarks?.data?.some(
              (item: any) =>
                item?.project_id === project?.projectId &&
                item?.type === "file" &&
                item?.members?.length > 0 &&
                item?.members?.filter((member: any) => member?.role !== "Owner")
                  .length > 0
            )
          ) && (
            <Empty
              text="No bookmarks available"
              textClassName="text-gray-300 mt-2"
              className="w-full mt-2"
              imageClassName="stroke-gray-200 fill-black"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SharedBookmarks;
