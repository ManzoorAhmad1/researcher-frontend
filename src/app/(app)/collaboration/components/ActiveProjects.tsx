import { Text, Avatar, Empty } from "rizzui";

interface ActiveProjectsProps {
  isLoading: boolean;
  projectsFiles: any[];
  notesAndBookmarks: any;
  onShowMore: () => void;
}

const ActiveProjects: React.FC<ActiveProjectsProps> = ({
  isLoading,
  projectsFiles,
  notesAndBookmarks,
  onShowMore,
}) => {
  let projectsFileData: any = [];

  projectsFiles?.map((project: any) => {
    const filteredItems = notesAndBookmarks?.data?.filter(
      (item: any) => item?.project_id === project?.projectId
    );

    projectsFileData.push({ ...project, filteredItems });
  });

  return (
    <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6">
      <div className="w-full flex items-center justify-between">
        <Text className="flex gap-2 font-semibold text-[13px] dark:text-[#CCCCCC] text-[#4D4D4D]">
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
          ACTIVE RESEARCH PROJECTS
        </Text>
        {projectsFileData?.length >= 3 && (
          <Text className="text-blue-500 cursor-pointer" onClick={onShowMore}>
            Show More
          </Text>
        )}
      </div>
      <div className="mt-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col gap-4 mt-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
              ></div>
            ))}
          </div>
        ) : projectsFileData?.length ? (
          projectsFileData?.slice(0, 2)?.map((project: any, index: number) => {
            const notesLenght = project?.filteredItems?.filter(
              (note: any) => note?.type === "note"
            );
            const fileLength = project?.filteredItems?.filter(
              (note: any) => note?.type === "file"
            );

            return (
              <div
                key={index}
                className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow h-auto"
              >
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4">
                  <div className="mt-2 flex flex-col gap-2 w-full lg:w-3/4">
                    <h3 className="text-sm font-medium dark:text-[#CCCCCC] text-[#4D4D4D]">
                      {project?.project?.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <div className="px-2 py-1 text-sm font-normal bg-blue-100 h-[26px] text-center text-[#0E70FF] rounded">
                        {project?.files?.length} papers
                      </div>
                      <div className="px-2 py-1 text-sm font-normal bg-blue-100 h-[26px] text-center text-[#0E70FF] rounded">
                        {notesLenght?.length || 0} resources
                      </div>
                      <div className="px-2 py-1 text-sm font-normal bg-blue-100 h-[26px] text-center text-[#0E70FF] rounded">
                        {fileLength?.length || 0} bookmarks
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 w-full lg:w-1/4">
                    <h4 className="text-sm font-medium text-[#4D4D4D] dark:text-[#CCCCCC]">
                      Team Members
                    </h4>
                    <div className="flex items-center -space-x-3">
                      {project?.members?.length
                        ? project?.members
                            ?.slice(0, 3)
                            .map((member: any, idx: any) => (
                              <Avatar
                                key={idx}
                                customSize="32"
                                src={
                                  member?.profile_image ||
                                  "https://randomuser.me/api/portraits/women/40.jpg"
                                }
                                name={member?.first_name || "John Doe"}
                                className="relative inline-flex object-cover ring-2 ring-background"
                              />
                            ))
                        : null}
                      {project?.members?.length > 4 && (
                        <div className="relative inline-flex h-[32px] w-[32px] items-center justify-center rounded-full text-sm font-medium text-gray-900 bg-gray-200">
                          +{project?.members?.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div>
            <Empty
              text="Active Research Projects Empty"
              textClassName="text-gray-300 mt-2"
              className="w-full mt-2"
              imageClassName="stroke-gray-200 fill-black"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjects;
