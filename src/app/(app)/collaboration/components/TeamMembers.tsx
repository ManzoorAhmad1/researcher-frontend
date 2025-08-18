import { Text, Empty, Avatar } from "rizzui";

interface TeamMembersProps {
  isLoading: boolean;
  projectsFiles: any;
}

const TeamMembers: React.FC<TeamMembersProps> = ({
  isLoading,
  projectsFiles,
}) => {
  const uniqueTeamMembers = projectsFiles?.data?.reduce(
    (acc: any[], project: any) => {
      project?.members?.forEach((member: any) => {
        if (!acc.find((m) => m.id === member.id)) {
          acc.push(member);
        }
      });
      return acc;
    },
    []
  );

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
              d="M7 8C8.65685 8 10 6.65685 10 5C10 3.34315 8.65685 2 7 2C5.34315 2 4 3.34315 4 5C4 6.65685 5.34315 8 7 8Z"
              fill="#8D17B5"
            />
            <path
              d="M13 14.5H1C0.58579 14.5 0.25 14.1642 0.25 13.75V12.5C0.25 10.8431 1.59315 9.5 3.25 9.5H10.75C12.4069 9.5 13.75 10.8431 13.75 12.5V13.75C13.75 14.1642 13.4142 14.5 13 14.5ZM12.25 13V12.5C12.25 11.5335 11.4665 10.75 10.5 10.75H3.5C2.5335 10.75 1.75 11.5335 1.75 12.5V13H12.25Z"
              fill="#8D17B5"
            />
          </svg>
        </span>
        TEAM MEMBERS
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
      ) : !uniqueTeamMembers?.length ? (
        <Empty
          text="No Team Members found"
          textClassName="text-gray-300 mt-2"
          className="w-full mt-2"
          imageClassName="stroke-gray-200 fill-black"
        />
      ) : (
        <div className="mt-4 space-y-4">
          {uniqueTeamMembers.map((member: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-[#E5E5E566] rounded-lg"
            >
              <Avatar
                customSize="40"
                src={
                  member?.avatar ||
                  "https://randomuser.me/api/portraits/men/48.jpg"
                }
                name={member?.name}
                className="relative inline-flex object-cover ring-2 ring-background"
              />
              <div className="flex-1">
                <h3 className="text-sm font-medium dark:text-[#CCCCCC] text-[#4D4D4D]">
                  {member?.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {member?.role}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {member?.projects?.length || 0} Projects
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
