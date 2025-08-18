import { getTrendsPapers } from "@/apis/dashboard";
import React, { useEffect, useState, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { FiFileText, FiVideo, FiTrendingUp, FiGlobe } from "react-icons/fi";
import { Empty, Text, Loader } from "rizzui";
import { LuX } from "react-icons/lu";
import { createBookmark } from "@/apis/notes-bookmarks";
import { useDispatch, useSelector } from "react-redux";
import { CheckIcon } from "lucide-react";
import { fetchSubscription } from "@/reducer/services/subscriptionApi";
import { AppDispatch } from "@/reducer/store";
import { IoStar } from "react-icons/io5";
import toast from "react-hot-toast";

const typeLabels: Record<string, string> = {
  paper: "Latest Paper",
  video: "Video",
  article: "Web Article",
  trend: "Trending Topic",
};

const typeIcons: Record<string, React.ReactNode> = {
  paper: <FiFileText className="inline-block mr-1" />,
  video: <FiVideo className="inline-block mr-1" />,
  article: <FiGlobe className="inline-block mr-1" />,
  trend: <FiTrendingUp className="inline-block mr-1" />,
};
const SkeletonLoader = () => {
  return (
    <div className="h-6 w-full mb-3 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
  );
};

const WhatsNewFeed: React.FC<{ researchArea: string }> = ({ researchArea }) => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = React.useState<any>({});

  const apiCalledRef = useRef(false);
  const { workspace } = useSelector((state: any) => state.workspace);
  const { project } = useSelector((state: any) => state?.project);
  const user: any = useSelector((state: any) => state.user?.user?.user);
  const dispatch = useDispatch<AppDispatch>();
  const fetchTrendsPaper = async (isLoadingRun: boolean = true) => {
    isLoadingRun && setLoading(true);
    try {
      const response = await getTrendsPapers();
      await dispatch(fetchSubscription({ id: user?.id }));
      setApiData(response?.data?.data?.trending_data?.aiTrends || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching:", error);
      setLoading(false);

      setApiData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!apiCalledRef.current) {
      apiCalledRef.current = true;
      fetchTrendsPaper(true);
    }
  }, []);

  const renderSection = (
    title: string,
    items: any[],
    type: string,
    sectionKey: string,
    date?: string
  ) => {
    const showAll = !!expandedSections[sectionKey];
    const maxVisible = 1;
    const visibleItems = showAll ? items : items.slice(0, maxVisible);

    const hasMore = items.length > maxVisible;
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Text className="text-lg font-semibold text-primaryDark dark:text-gray-200">
            {title}
          </Text>
          {hasMore && (
            <button
              className="text-sm text-blue-600 font-medium hover:underline"
              onClick={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  [sectionKey]: !prev[sectionKey],
                }))
              }
            >
              {showAll ? "Show less" : "See more"}
            </button>
          )}
        </div>
        <ul className="space-y-4">
          {visibleItems.map((item: any, idx: number) => {
            const uniqueKey = `${sectionKey}-${idx}`;
            return (
              <li
                key={uniqueKey}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <Text className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-[#2D3A4A] dark:text-blue-400 mb-2">
                      {typeIcons[type]} {typeLabels[type] || type}
                    </Text>
                    <div className="flex gap-2 text-sm font-medium text-primaryDark dark:text-gray-200">
                      <Text className="font-medium text-blue-500 text-sm">
                        Keywords:{" "}
                      </Text>
                      {item.Keywords.join(" - ")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2 mt-1">
                      {item.Keywords?.[0] && (
                        <span className="text-green-500">Reference Links</span>
                      )}
                      {Array.isArray(item.referenceLinks) &&
                        item.referenceLinks.length > 0 && (
                          <div className="flex flex-row flex-wrap gap-2">
                            {item.referenceLinks.map(
                              (link: string, i: number) => (
                                <a
                                  key={i}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-blue-500"
                                >
                                  {link}
                                </a>
                              )
                            )}
                          </div>
                        )}
                    </div>
                    {item.Abstract && (
                      <p className="text-sm text-gray-600 mt-2 dark:text-gray-300">
                        {item.Abstract}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 md:mt-0">
                    <button
                      className={`px-3 py-1 text-xs border rounded transition-all duration-200 w-[90px] h-8 flex items-center justify-center
    ${
      item?.bookmark
        ? "text-blue-600 bg-blue-50 cursor-pointer border-blue-300"
        : "bg-gray-100 hover:bg-blue-50 border-gray-300 dark:bg-[#2a2a2a] dark:text-gray-200 dark:border-gray-600"
    }`}
                      onClick={() => addBookMark(item, date, uniqueKey)}
                    >
                      {item?.bookmark && !bookmarkLoading[uniqueKey] ? (
                        <span className="flex items-center justify-center">
                          <IoStar className="w-4 h-4 text-blue-500" />
                        </span>
                      ) : bookmarkLoading[uniqueKey] ? (
                        <Loader
                          className="h-5 w-5 text-blue-500"
                          variant="threeDot"
                        />
                      ) : (
                        <span className="flex items-center gap-1">
                          Bookmark
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderDataObject = (dataObj: any, idx: number, showData?: boolean) => {
    return (
      <div key={idx} className="mb-8">
        <Text className="text-base font-semibold text-gray-700 mb-2 dark:text-gray-300">
          {showData && dataObj.date}
        </Text>
        {dataObj.papers?.length > 0 &&
          renderSection(
            "Latest Papers",
            dataObj.papers,
            "paper",
            `papers-${idx}`,
            dataObj?.date
          )}
        {dataObj.trends?.length > 0 &&
          renderSection(
            "Trending Topics",
            dataObj.trends,
            "trend",
            `trends-${idx}`,
            dataObj?.date
          )}
        {dataObj.news?.length > 0 &&
          renderSection(
            "News & Articles",
            dataObj.news,
            "article",
            `news-${idx}`,
            dataObj?.date
          )}
      </div>
    );
  };

  // Find the last index where at least one of papers, news, or trends has length > 0
  const lastValidIndex = [...apiData]
    .reverse()
    .findIndex(
      (item) =>
        (item.papers && item.papers.length > 0) ||
        (item.news && item.news.length > 0) ||
        (item.trends && item.trends.length > 0)
    );
  const latestData =
    lastValidIndex !== -1
      ? apiData[apiData.length - 1 - lastValidIndex]
      : undefined;
  const previousData =
    lastValidIndex !== -1
      ? apiData.slice(0, apiData.length - 1 - lastValidIndex)
      : [];
  const addBookMark = async (data: any, date: any, key: string) => {
    try {
      setBookmarkLoading((prev: any) => ({ ...prev, [key]: true }));
      const formData = new FormData();
      formData.append("title", data.Authors);
      formData.append("link", data.referenceLinks?.[0]);
      formData.append("type", "trends");
      formData.append("description", data.Abstract);
      formData.append("project_id", project?.id);
      formData.append("trending_date", date);
      if (data.image) {
        formData.append("file", data.image);
      }
      await createBookmark(workspace?.id, formData);
      await fetchTrendsPaper(false);
      !data?.bookmark
        ? toast.success("Bookmark added successfully!")
        : toast.success("Bookmark removed successfully!");
    } catch (error) {
      console.error("Error adding bookmark:", error);
    } finally {
      setBookmarkLoading((prev: any) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <section className="bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6 mt-6 border border-gray-200 dark:border-gray-700 relative">
      <div className="flex items-center justify-between mb-6">
        <Text className="text-xl font-semibold text-primaryDark dark:text-gray-200">
          What’s New in{" "}
          <span className="text-blue-600">
            {user?.research_keywords?.[0] || workspace?.name}
          </span>
        </Text>

        {previousData.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            See previous days
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-8">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      ) : latestData ? (
        renderDataObject(latestData, apiData.length - 1)
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Empty
            text="TRENDING TOPIC IS EMPTY"
            textClassName="text-gray-300 mt-2 "
            className=" w-52 h-48 mt-2 "
            imageClassName="stroke-gray-200 fill-black "
          />
        </div>
      )}

      {/* Modal for previous data */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1F2E33] rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primaryDark dark:text-gray-100">
                Previous Updates - {user?.research_keywords?.[0]}
              </h2>
              <button className="text-sm" onClick={() => setIsModalOpen(false)}>
                <LuX className="h-6 w-6" />
              </button>
            </div>

            {previousData.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No previous records found.
              </p>
            ) : (
              [...previousData]
                .reverse()
                .map((dataObj, idx) => renderDataObject(dataObj, idx, true))
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </section>
  );
};

export default WhatsNewFeed;
