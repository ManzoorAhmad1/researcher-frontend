import React, { useState } from "react";
import { HiOutlineDocumentPlus } from "react-icons/hi2";
import { RiPagesLine, RiGroupLine } from "react-icons/ri";
import { MdOutlineManageSearch } from "react-icons/md";
import { GoLock } from "react-icons/go";
import { useSelector } from "react-redux";
import Link from "next/link";

const SkeletonLoader = () => {
  return (
    <div className="h-6 w-full mb-3 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
  );
};

const WelcomeSection = ({
  workspace,
  projects,
  fileCount,
  resources,
  trendingTopics,
  loading,
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const userData = useSelector((state: any) => state?.user?.user?.user );

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openProjectsModal: () => void = () => {
    setIsProjectsModalOpen(true);
  };

  const closeProjectsModal = () => {
    setIsProjectsModalOpen(false);
  };

  const toggleProject = (index: number) => {
    setActiveProject(activeProject === index ? null : index);
  };

  const bookmarksCount =resources&& resources?.filter(
    (item: any) => item?.type === "file"
  ).length;

  const notesCount = resources && resources?.filter(
    (item: any) => item?.type === "note"
  ).length;

  const sections = [
    {
      title: "Welcome ",
      subtitle: userData?.first_name,
      description: trendingTopics,
      buttons: [
        {
          icon: (
            <RiPagesLine className="h-[18px] w-[18px] dark:text-[#cccccc]" />
          ),
          text: "Explore Topics",
          link: "/web-search",
        },
        {
          icon: (
            <MdOutlineManageSearch className="h-[18px] w-[18px] dark:text-[#cccccc]" />
          ),
          text: "Search Papers",
          link: "/papers",
        },
        {
          icon: (
            <HiOutlineDocumentPlus className="h-[18px] w-[18px] dark:text-[#cccccc]" />
          ),
          text: "Add to Knowledge Bank",
          link: "/knowledge-bank",
        }
      ],
    },
    {
      title: projects?.length || 0,
      subtitle: "Projects",
      bgColor: "#1B539B",
      onClick: openProjectsModal,
    },
    {
      title: resources?.length || 0,
      subtitle: "Resources",
      bgColor: "#FFFFFF2E",
      tooltip: [`${bookmarksCount || 0} Bookmarks`, `${notesCount || 0} Notes`],
    },
    {
      title: workspace?.count || 0,
      subtitle: "Workspaces",
      bgColor: "#FFFFFF2E",
      onClick: openModal,
    },
    {
      title: fileCount || 0,
      subtitle: "Papers",
      bgColor: "#FFFFFF2E",
    },
  ];

  return (
    <div className="w-full rounded-lg grid grid-cols-1 xl:grid-cols-12 gap-2 items-center bg-[url('https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/uploads/560/Mask%20group.png')] bg-cover bg-center h-auto">
      <div className="p-3 text-white col-span-12 xl:col-span-8">
        <div className="p-4 ">
          <h1 className="font-size-xlarge  font-semibold dark:text-[#cccccc]">
            {loading ? <SkeletonLoader /> : `Welcome, ${sections[0]?.subtitle}`}
          </h1>
          <p className="font-size-normal  font-medium w-full pr-6  dark:text-[#cccccc]">
            {loading ? <SkeletonLoader /> : sections[0]?.description || ""}
          </p>
        </div>
        <div className="flex p-4 text-center gap-4 lg:gap-[32px] w-auto px-3">
          {loading ? (
            <SkeletonLoader />
          ) : (
            sections[0]?.buttons?.map((button, index) => (
              <div
                key={index}
                className="flex justify-center items-center flex-col"
              >
                <Link href={button?.link} className="flex flex-col items-center">
                  <div
                    className="h-[44px] w-[44px] flex items-center justify-center rounded-2xl mb-2"
                    style={{ backgroundColor: "#07377E99" }}
                  >
                    {button?.icon}
                  </div>
                  <h2 className="font-size-normal font-semibold dark:text-[#cccccc] ">
                    {button?.text}
                  </h2>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-wrap md:flex-nowrap xl:flex-col items-center gap-3 mx-5 justify-center md:justify-start col-span-12 xl:col-span-4 py-4">
        <div className="flex  gap-3 ">
          <div
            className="text-center text-[#FFFFFF] p-5 rounded-2xl w-[80px] cursor-pointer"
            style={{ backgroundColor: "#07377E99" }}
            onClick={sections[1].onClick}
          >
            {loading ? <SkeletonLoader /> : (
              <>
                <h1 className="font-size-xlarge font-semibold dark:text-[#cccccc]">
                  {sections[1]?.title}
                </h1>
                <h2 className="font-size-normal font-semibold dark:text-[#cccccc]">
                  {sections[1]?.subtitle}
                </h2>
              </>
            )}
          </div>
          <div className="relative group">
            <div
              className="text-center text-[#FFFFFF] p-5 rounded-2xl w-[120px]"
              style={{ backgroundColor: "#FFFFFF2E" }}
            >
              {loading ? <SkeletonLoader /> : (
                <>
                  <h1 className="text-[20px] font-semibold dark:text-[#cccccc]">
                    {sections[2]?.title}
                  </h1>
                  <h2 className="font-size-normal font-semibold dark:text-[#cccccc]">
                    {sections[2]?.subtitle}
                  </h2>
                </>
              )}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-full w-max bg-white dark:bg-gray-800 text-blue-600 dark:text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity px-8 py-2 flex flex-col items-center mb-7">
              {sections[2]?.tooltip &&
                sections[2]?.tooltip?.map((tip, index) => (
                  <h2 key={index} className="font-size-small">
                    {tip}
                  </h2>
                ))}
              <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-black"></div>
            </div>
          </div>
        </div>
        <div className="flex  gap-3 ">
          <div
            className="text-center text-[#FFFFFF] p-5 rounded-2xl w-[120px] cursor-pointer"
            style={{ backgroundColor: "#FFFFFF2E" }}
            onClick={sections[3].onClick}
          >
            {loading ? <SkeletonLoader /> : (
              <>
                <h1 className="text-[20px] font-semibold dark:text-[#cccccc]">
                  {sections[3]?.title}
                </h1>
                <h2 className="font-size-normal font-semibold dark:text-[#cccccc]">
                  {sections[3]?.subtitle}
                </h2>
              </>
            )}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div
                className="fixed inset-0 bg-black opacity-50"
                onClick={closeModal}
              ></div>

              <div className="bg-white text-black dark:bg-[#1F2E34] rounded-lg p-3 md:p-10 z-50 w-full max-w-lg md:max-w-3xl lg:max-w-4xl h-auto max-h-screen md:h-auto overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <h1 className="font-semibold text-[18px] md:text-[20px] dark:text-[#cccccc]">
                    {workspace?.count} Workspaces
                  </h1>
                  <a
                    className="hover:cursor-pointer h-[20px] w-[20px] dark:text-[#cccccc]"
                    onClick={closeModal}
                  >
                    ✖
                  </a>
                </div>

                <div className="space-y-5">
                  {workspace?.workspaces?.map((workspace: any, index: any) => (
                    <div
                      key={index}
                      className={`w-full p-3 pb-3 px-3 bg-[#0E70FF33] rounded-lg shadow hover:shadow-lg transition-shadow`}
                    >
                      <div className="flex gap-2 mt-5 items-center justify-between">
                        <div className="flex gap-2 items-center">
                          <div className="text-[#666666] dark:text-[#cccccc]">
                            <RiGroupLine className="h-[15px] w-[15px]" />
                          </div>
                          <h1 className="text-[#4D4D4D] text-sm font-semibold uppercase dark:text-[#cccccc]">
                            {workspace?.name} 
                          </h1>
                        </div>
                        <div>
                          <h2 className="text-[#4D4D4D] text-[13px] font-normal dark:text-[#cccccc]">
                            {workspace?.projects?.length} Projects 
                          </h2>
                        </div>
                      </div>
                      <div className="p-[0.5px] bg-[#CCCCCC] mt-2 mb-3"></div>
                        <div className="p-3">
                        <ul className="list-disc pl-5 text-[#0E70FF] text-sm md:text-[15px] font-medium">
                          {workspace?.projects?.map(
                          (project: any, idx: any) => (
                            <li key={idx}>
                            <Link 
                              href="/manage-projects"
                              className="hover:underline cursor-pointer"
                            >
                              {project?.name}
                            </Link>
                            </li>
                          )
                          )}
                        </ul>
                        </div>
                    </div>
                  ))}
                </div>
                <div className="p-[0.5px] bg-[#CCCCCC] mt-6 mb-9"></div>

                <div className="text-right mt-7">
                  <a
                    className="bg-gradient-to-t from-[#0F55BA] to-[#0E70FF] text-white text-[13px] md:text-sm font-medium rounded-full px-12 py-2 hover:cursor-pointer border-[#3686FC] border-[2px]"
                    onClick={closeModal}
                  >
                    Close
                  </a>
                </div>
              </div>
            </div>
          )}

          {isProjectsModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div
                className="fixed inset-0 bg-black opacity-50"
                onClick={closeProjectsModal}
              ></div>

              <div className="bg-white dark:bg-[#1F2E34] rounded-lg p-5 md:p-10 z-50 w-full max-w-lg md:max-w-3xl lg:max-w-4xl h-auto max-h-screen md:h-auto overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <h1 className="font-semibold text-[20px] md:text-[20px] text-[#333333] dark:text-[#cccccc]">
                    {projects?.length} Projects
                  </h1>
                  <a
                    className="hover:cursor-pointer h-[20px] w-[20px] dark:text-[#cccccc]"
                    onClick={closeProjectsModal}
                  >
                    ✖
                  </a>
                </div>

                <div className="space-y-5">
                  {projects?.map((project: any, index: any) => (
                    <div
                      key={project?.projectId}
                      className={`p-4 border-[#E5E5E5] bg-[#E5E5E566] dark:bg-transparent dark:border dark:border-white rounded-sm shadow hover:shadow-lg transition-shadow ${
                        activeProject === index
                          ? "bg-[#0E70FF1C]"
                          : "bg-[#E5E5E566]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          <RiPagesLine className="h-[15px] w-[15px] text-[#333333] dark:text-[#cccccc] mt-1" />
                          <div>
                            <h2 className="font-medium text-[15px] text-[#333333] dark:text-[#cccccc]">
                              {project?.projectName}
                            </h2>
                            <h2 className="text-[#333333] dark:text-[#cccccc]">
                              {project?.files?.count || 0} Papers
                            </h2>
                          </div>
                        </div>
                        <button
                          className="text-[#666666] text-[18px] mr-2 dark:text-[#cccccc]"
                          onClick={() => toggleProject(index)}
                        >
                          {activeProject === index ? "-" : "+"}
                        </button>
                      </div>

                      {activeProject === index && (
                        <div className="mt-2">
                            <div className="p-[0.5px] bg-[#CCCCCC] mt-2 mb-3"></div>
                            {project?.files?.data?.length > 0 ? (
                            project?.files?.data?.map((file: any, idx: any) => (
                              <Link 
                              href="/explorer"
                              key={idx}
                              className="block"
                              >
                              <p className="text-[#0E70FF] text-sm md:text-[15px] font-medium p-2 hover:underline cursor-pointer">
                                {file?.file_name ||
                                file?.file_original_name ||
                                "Unknown file"}
                              </p>
                              </Link>
                            ))
                            ) : (
                            <p className="text-[#666666] dark:text-[#CCCCCC] text-sm text-center">
                              No papers uploaded.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-[0.5px] bg-[#CCCCCC] mt-6 mb-9"></div>

                <div className="text-right mt-7">
                  <a
                    className="bg-gradient-to-t from-[#0F55BA] to-[#0E70FF] text-white text-[13px] md:text-sm font-medium rounded-full px-12 py-2 hover:cursor-pointer border-[#3686FC] border-[2px]"
                    onClick={closeProjectsModal}
                  >
                    Close
                  </a>
                </div>
              </div>
            </div>
          )}

          <div
            className="text-center text-[#FFFFFF] p-5 rounded-2xl w-[80px]"
            style={{ backgroundColor: "#FFFFFF2E" }}
          >
            {loading ? <SkeletonLoader /> : (
              <>
                <h1 className="font-size-xlarge font-semibold dark:text-[#cccccc]">
                  {sections[4]?.title}
                </h1>
                <h2 className="font-size-normal font-semibold dark:text-[#cccccc]">
                  {sections[4]?.subtitle}
                </h2>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;

