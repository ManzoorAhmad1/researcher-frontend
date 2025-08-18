import { Text, Empty, Avatar } from "rizzui";

interface SharedNotesProps {
  isLoading: boolean;
  notesAndBookmarks: any;
}

const SharedNotes: React.FC<SharedNotesProps> = ({
  isLoading,
  notesAndBookmarks,
}) => {
  return (
    <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6">
      <h2 className="flex gap-2 dark:text-[#CCCCCC] font-semibold text-[13px] text-[#4D4D4D]">
        <span>
          <svg
            width="14"
            height="16"
            viewBox="0 0 14 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 15.5H1C0.58579 15.5 0.25 15.1642 0.25 14.75V1.25C0.25 0.83579 0.58579 0.5 1 0.5H13C13.4142 0.5 13.75 0.83579 13.75 1.25V14.75C13.75 15.1642 13.4142 15.5 13 15.5ZM12.25 14V2H1.75V14H12.25ZM4 4.25H10V5.75H4V4.25ZM4 7.25H10V8.75H4V7.25ZM4 10.25H7.75V11.75H4V10.25Z"
              fill="#8D17B5"
            />
          </svg>
        </span>
        NOTES SHARED
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
      ) : notesAndBookmarks?.data?.filter(
          (note: any) =>
            note?.members?.length > 0 &&
            note?.members?.filter((member: any) => member?.role !== "Owner")
              .length > 0
        ).length === 0 ? (
        <Empty
          text="No Shared Notes found"
          textClassName="text-gray-300 mt-2"
          className="w-full mt-2"
          imageClassName="stroke-gray-200 fill-black"
        />
      ) : (
        <div className="mt-4 space-y-4">
          {notesAndBookmarks?.data
            ?.filter(
              (note: any) =>
                note?.type === "note" &&
                note?.members?.length > 0 &&
                note?.members?.filter((member: any) => member?.role !== "Owner")
                  .length > 0
            )
            ?.slice(0, 2)
            .map((note: any, index: any) => (
              <div
                key={index}
                className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow h-auto"
              >
                <h3 className="text-sm font-medium dark:text-[#CCCCCC] text-[#4D4D4D]">
                  {note?.title}
                </h3>
                <p className="text-sm font-normal text-[#4D4D4D] dark:text-[#CCCCCC]">
                  {note?.description
                    ?.replace(/<[^>]*>/g, "")
                    ?.replace(/\s+/g, " ")
                    ?.trim()
                    ?.split(".")
                    ?.length > 0
                    ? note?.description
                        ?.replace(/<[^>]*>/g, "")
                        ?.replace(/\s+/g, " ")
                        ?.trim()
                        ?.split(".")
                        ?.slice(0, 1)
                        ?.join(".") + "."
                    : note?.description
                        ?.replace(/<[^>]*>/g, "")
                        ?.replace(/\s+/g, " ")
                        ?.trim()}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-sm mr-5 font-normal text-[#4D4D4D] dark:text-[#CCCCCC]">
                    shared to :
                  </span>

                  <div className="flex items-center -space-x-3">
                    {note?.members?.length &&
                      note?.members
                        ?.filter((member: any) => member?.role !== "Owner")
                        .slice(0, 5)
                        .map((member: any, idx: any) => (
                          <Avatar
                            key={idx}
                            customSize="32"
                            src={
                              member?.avatar ||
                              "https://randomuser.me/api/portraits/men/48.jpg"
                            }
                            name={member.role}
                            className="relative inline-flex object-cover ring-2 ring-background"
                          />
                        ))}
                    {note?.members?.length && note?.members?.length > 5 && (
                      <div className="bordered relative inline-flex h-[32px] w-[32px] items-center justify-center rounded-full text-sm font-medium text-gray-900 bg-gray-200">
                        +{note?.members?.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SharedNotes; 