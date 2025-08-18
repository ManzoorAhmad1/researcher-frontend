import { Text } from "rizzui";
import { cardsData } from "@/utils/collaboratesData";

interface DashboardCardsProps {
  isLoading: boolean;
  projectsFiles: any[];
  notesAndBookmarks: any;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  isLoading,
  projectsFiles,
  notesAndBookmarks,
}) => {
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
      {isLoading ? (
        [...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-[117px] rounded-md flex items-center pl-7 bg-gray-200 dark:bg-gray-700 animate-pulse"
          >
            <div className="w-10 h-10 mr-4 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))
      ) : (
        cardsData.map((card, index) => (
          <div
            key={index}
            className={`h-[117px] ${card?.bgColor} rounded-md flex items-center pl-7`}
          >
            <div className="w-10 h-10 mr-4 flex items-center justify-center rounded-full">
              {<card.icon />}
            </div>
            <div>
              <p className="font-semibold text-sm uppercase text-secondaryDark">
                {card?.title}
              </p>
              <p className="font-medium text-[24px] text-primaryDark mt-3">
                {card?.title === "ACTIVE PROJECTS"
                  ? projectsFiles?.length || 0
                  : card?.title === "RESEARCH PAPERS"
                    ? projectsFiles?.reduce(
                      (total: any, item: any) => total + item?.files?.length || 0,
                      0
                    )
                    : card.title === "IDEAS BANK"
                      ? notesAndBookmarks?.data?.length || 0
                      : 0}
              </p>
              <p className="font-normal text-[11px] text-secondaryDark">
                {card?.description}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardCards; 