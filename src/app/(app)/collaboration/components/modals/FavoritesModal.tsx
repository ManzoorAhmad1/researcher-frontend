import { Modal, Text } from "rizzui";
import { X } from "lucide-react";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoritesDoc: any;
  isLoading: boolean;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favoritesDoc,
  isLoading,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="p-6 bg-white dark:bg-[#1F2E33] rounded-lg shadow-lg max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Favorites</h2>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
                ></div>
              ))}
            </div>
          ) : favoritesDoc?.data?.favorites?.length ? (
            favoritesDoc.data.favorites.slice(4).map((favorite: any) => (
              <div
                key={favorite.id}
                className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="text-sm font-medium text-[#4D4D4D] dark:text-[#CCCCCC]">
                  {favorite.item_name}
                </h3>
                <p className="text-sm text-[#4D4D4D] mt-2 dark:text-[#CCCCCC]">
                  {favorite.author_name || 'Unknown Author'}
                </p>
                <div className="mt-2">
                  <span className="px-2 py-1 text-sm font-normal bg-blue-100 text-blue-800 rounded">
                    {favorite.item_type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No favorites found</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FavoritesModal; 