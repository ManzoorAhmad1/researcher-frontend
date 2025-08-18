import { Text, Empty } from "rizzui";

interface FavoritesProps {
  isLoading: boolean;
  favoritesDoc: any;
  onShowMore: () => void;
}

const Favorites: React.FC<FavoritesProps> = ({
  isLoading,
  favoritesDoc,
  onShowMore,
}) => {

  return (
    <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6">
      <div className="w-full flex items-center justify-between">
        <Text className="flex gap-2 dark:text-[#CCCCCC] font-semibold text-[13px] text-[#4D4D4D]">
          <span>
              <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.00002 0.75C9.28548 0.75 9.5462 0.912054 9.67255 1.16803L11.8157 5.50985L16.6085 6.21039C16.8909 6.25167 17.1254 6.44967 17.2135 6.72118C17.3015 6.99268 17.2278 7.29062 17.0233 7.48977L13.5559 10.867L14.3742 15.6382C14.4225 15.9196 14.3068 16.204 14.0758 16.3718C13.8448 16.5396 13.5386 16.5617 13.2859 16.4288L9.00002 14.1749L4.71411 16.4288C4.46142 16.5617 4.1552 16.5396 3.92422 16.3718C3.69324 16.204 3.57755 15.9196 3.62581 15.6382L4.44413 10.867L0.976722 7.48977C0.772259 7.29062 0.698554 6.99268 0.786587 6.72118C0.874621 6.44967 1.10913 6.25167 1.39155 6.21039L6.18432 5.50985L8.32749 1.16803C8.45384 0.912054 8.71456 0.75 9.00002 0.75ZM9.00002 3.19444L7.35505 6.52697C7.2459 6.7481 7.03501 6.90145 6.79099 6.93712L3.11133 7.47495L5.77332 10.0677C5.95023 10.24 6.03097 10.4884 5.98923 10.7318L5.36116 14.3938L8.65093 12.6637C8.86947 12.5488 9.13057 12.5488 9.34911 12.6637L12.6389 14.3938L12.0108 10.7318C11.9691 10.4884 12.0498 10.24 12.2267 10.0677L14.8887 7.47495L11.209 6.93712C10.965 6.90145 10.7541 6.7481 10.645 6.52697L9.00002 3.19444Z"
                  fill="#F59B14"
                />
              </svg>
          </span>
          FAVORITES
        </Text>
        {favoritesDoc?.data?.favorites?.length > 4 && (
          <Text className="text-blue-500 cursor-pointer" onClick={onShowMore}>
            Show More
          </Text>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 mt-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : favoritesDoc?.data?.favorites?.length ? (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {favoritesDoc?.data?.favorites?.slice(0, 4).map((favorite: any, index: number) => (
            <div
              key={favorite.id}
              className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-sm font-medium dark:text-[#CCCCCC] text-[#4D4D4D]">
                {favorite?.item_name}
              </h3>
              <p className="text-sm text-[#4D4D4D] dark:text-[#CCCCCC] mt-2">
               <span className="font-medium text-sm">Author:</span> {favorite?.author_name || 'Unknown Author'}
              </p>
              <p>
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="px-2 py-1 text-sm font-normal bg-blue-100 text-blue-800 rounded">
                  {favorite?.item_type}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Added on: {new Date(favorite?.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          text="No favorites found"
          textClassName="text-gray-300 mt-2"
          className="w-full mt-2"
          imageClassName="stroke-gray-200 fill-black"
        />
      )}
    </div>
  );
};

export default Favorites; 