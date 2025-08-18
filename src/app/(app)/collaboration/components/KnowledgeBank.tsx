import { Text, Empty } from "rizzui";

interface KnowledgeBankProps {
  isLoading: boolean;
  notesAndBookmarks: any;
  onShowMore: () => void;
}

const KnowledgeBank: React.FC<KnowledgeBankProps> = ({
  isLoading,
  notesAndBookmarks,
  onShowMore,
}) => {
  return (
    <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6">
      <div className="w-full flex items-center justify-between">
        <Text className="text-md flex gap-2 dark:text-[#CCCCCC] font-semibold text-[13px] text-[#4D4D4D]">
          <span>
            <svg
              width="18"
              height="17"
              viewBox="0 0 18 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.15675 3.243L2.04394 3.50037C1.96135 3.68877 1.69925 3.68877 1.61671 3.50037L1.50385 3.243C1.30274 2.78413 0.940541 2.41875 0.488531 2.21888L0.140965 2.06515C-0.0469883 1.98203 -0.0469883 1.7101 0.140965 1.62698L0.469105 1.48185C0.932725 1.27684 1.30145 0.897954 1.4991 0.423476L1.61492 0.14536C1.69569 -0.0484533 1.96491 -0.0484533 2.04568 0.14536L2.1615 0.423476C2.35919 0.897954 2.72792 1.27684 3.19154 1.48185L3.51964 1.62698C3.70764 1.7101 3.70764 1.98203 3.51964 2.06515L3.17207 2.21888C2.7201 2.41875 2.35787 2.78413 2.15675 3.243ZM7.47981 12.5H8.25H9.75H10.5202C10.6192 11.5988 11.0791 10.8549 11.8257 10.042C11.8545 10.0106 11.9367 9.9245 12.0349 9.8216C12.2235 9.6242 12.471 9.365 12.5131 9.31258C13.1488 8.51982 13.5 7.53875 13.5 6.5C13.5 4.01472 11.4853 2 9 2C6.51472 2 4.5 4.01472 4.5 6.5C4.5 7.53823 4.8508 8.51877 5.48596 9.3113C5.52815 9.36395 5.77702 9.62465 5.96575 9.82235L5.96968 9.82647C6.06579 9.92716 6.14568 10.0109 6.17365 10.0413C6.92074 10.8548 7.38077 11.5988 7.47981 12.5ZM7.5 14V14.75H10.5V14H7.5ZM4.31546 10.2494C3.49234 9.22227 3 7.91862 3 6.5C3 3.18629 5.68629 0.5 9 0.5C12.3137 0.5 15 3.18629 15 6.5C15 7.91937 14.5071 9.22363 13.6832 10.251C13.5761 10.3846 13.4292 10.536 13.2664 10.7038C12.7218 11.265 12 12.009 12 12.875V14.75C12 15.5784 11.3284 16.25 10.5 16.25H7.5C6.67157 16.25 6 15.5784 6 14.75V12.875C6 12.0094 5.27829 11.2653 4.73345 10.7036C4.57025 10.5353 4.42275 10.3833 4.31546 10.2494ZM7.27655 7.07035C7.24372 6.93207 7.22635 6.78778 7.22635 6.63946C7.22635 6.49113 7.24372 6.3469 7.27654 6.20861L6.75 5.90464L7.28099 4.9849L7.80787 5.28913C8.01667 5.09166 8.27115 4.94209 8.55382 4.85795V4.25H9.61575V4.85795C9.8985 4.94208 10.153 5.09166 10.3617 5.28907L10.8886 4.98485L11.4197 5.90458L10.8931 6.20856C10.9259 6.34684 10.9432 6.49113 10.9432 6.63946C10.9432 6.78778 10.9259 6.93202 10.8931 7.0703L11.4197 7.37435L10.8887 8.294L10.3618 7.9898C10.153 8.18728 9.8985 8.33683 9.61582 8.42098V9.02893H8.5539V8.42098C8.27122 8.33683 8.01667 8.18728 7.80795 7.98988L7.28101 8.29408L6.75 7.37435L7.27655 7.07035ZM9.08482 7.43593C9.5247 7.43593 9.88132 7.07933 9.88132 6.63946C9.88132 6.19958 9.5247 5.84296 9.08482 5.84296C8.64495 5.84296 8.28832 6.19958 8.28832 6.63946C8.28832 7.07933 8.64495 7.43593 9.08482 7.43593ZM16.0439 13.5004L16.1567 13.243C16.3579 12.7841 16.7201 12.4187 17.1721 12.2189L17.5196 12.0652C17.7076 11.982 17.7076 11.7101 17.5196 11.627L17.1915 11.4818C16.7279 11.2768 16.3592 10.898 16.1615 10.4235L16.0457 10.1454C15.9649 9.95155 15.6957 9.95155 15.6149 10.1454L15.4991 10.4235C15.3015 10.898 14.9327 11.2768 14.4691 11.4818L14.141 11.627C13.953 11.7101 13.953 11.982 14.141 12.0652L14.4885 12.2189C14.9405 12.4187 15.3027 12.7841 15.5039 13.243L15.6167 13.5004C15.6993 13.6888 15.9613 13.6888 16.0439 13.5004Z"
                fill="#8D17B5"
              />
            </svg>
          </span>
          KNOWLEDGE BANK
        </Text>
        {notesAndBookmarks?.data?.length >= 3 && (
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
        ) : notesAndBookmarks?.data?.length ? (
          notesAndBookmarks?.data
            ?.slice(0, 2)
            ?.map((idea: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow h-auto"
              >
                <h3 className="text-sm font-medium dark:text-[#CCCCCC] text-[#4D4D4D]">
                  {idea.title}
                </h3>
                <p className="text-sm font-normal text-[#4D4D4D] dark:text-[#CCCCCC]">
                  {idea?.description
                   ?.replace(/<[^>]*>/g, "")
                   ?.replace(/\s+/g, " ")
                   ?.trim()
                   ?.split(".")
                   ?.length > 0
                   ? (idea?.description
                       ?.replace(/<[^>]*>/g, "")
                       ?.replace(/\s+/g, " ")
                       ?.trim()
                       ?.split(".")
                       ?.slice(0, 2)
                       ?.join(".") + ".")
                   : idea?.description
                       ?.replace(/<[^>]*>/g, "")
                       ?.replace(/\s+/g, " ")
                       ?.trim()}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    key={index}
                    className="px-2 py-1 text-sm font-normal bg-blue-100 h-[26px] text-center text-blue-800 rounded"
                  >
                    {idea?.type}
                  </span>
                </div>
              </div>
            ))
        ) : (
          <div>
            <Empty
              text="Knowledge Bank Empty"
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

export default KnowledgeBank; 