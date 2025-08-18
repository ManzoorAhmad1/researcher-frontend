"use client";

import { Button } from "@/components/ui/button";
import { Download, Share2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import {
  useAddToFavoritesMutation,
  useDeleteFromFavoritesMutation,
  useGetAllFavoritesQuery,
} from "@/redux/services/favoritesApi";
import { useGetUserQuery } from "@/redux/services/authApi";
import { useDispatch, useSelector } from "react-redux";
import { refreshData } from "@/redux/services/folderSlice";
import { RootState } from "@/reducer/store";
import { useRouter } from "next/navigation";
import { folderAiChatDialog } from "@/reducer/services/folderSlice";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface ActionButtonsProps {
  itemId: string | number;
  itemType: "folder" | "file";
  ai_loading?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  itemId,
  itemType,
  ai_loading,
}) => {
  const router = useRouter();
  const { data: user } = useGetUserQuery();
  const { data: favoritesData, refetch } = useGetAllFavoritesQuery(user?.id, {
    skip: !user,
  });
  const [addToFavorites] = useAddToFavoritesMutation();
  const [deleteFromFavorites] = useDeleteFromFavoritesMutation();
  const dispatch = useDispatch();
  const refreshTrigger = useSelector(
    (state: RootState) => state.folder.refreshData
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    if (favoritesData) {
      const favoriteItem =
        favoritesData.files.find((file: any) => file.id === itemId) ||
        favoritesData.subFolder.find((folder: any) => folder.id === itemId);
      if (favoriteItem) {
        setIsFavorite(true);
        setFavoriteId(favoriteItem.id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    }
  }, [favoritesData, itemId, refreshTrigger]);

  const handleFavoriteClick = async () => {
    if (!user) return;

    if (isFavorite) {
      if (favoriteId) {
        const result = await deleteFromFavorites(favoriteId).unwrap();
        if (result.success) {
          setFavoriteId(null);
          setIsFavorite(false);
          dispatch(refreshData());
          refetch();
        }
      }
    } else {
      const result = await addToFavorites({
        userId: user.id,
        itemId,
        itemType,
      }).unwrap();
      if (result.success) {
        setFavoriteId(result.data.id);
        setIsFavorite(true);
        dispatch(refreshData());
        refetch();
      }
    }
  };

  const handleNavigate = () => {
    if (itemType === "folder") {
      dispatch(folderAiChatDialog({ show: true, id: itemId }));
    } else {
      router.push(`/info/${itemId}?tab=chat`);
    }
  };
  const status = ["false", "", undefined];
  return (
    <>
      <div className="w-full flex justify-end items-center">
        <OptimizedImage
          width={ImageSizes.avatar.md.width}
          height={ImageSizes.avatar.md.height}
          onClick={handleNavigate}
          src={
            ai_loading === "true"
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//AI-icon-color.svg`
              : ai_loading === "unread"
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//AI-icon-color-success.svg`
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//AI-icon.svg`
          }
          alt="AI-icon"
          className={`${
            ai_loading === "true" ? "blink" : ""
          } w-[40px] top-0 mix-blend-multiply cursor-pointer`}
        />

        <Button variant={"ghost"}>
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant={"ghost"}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant={"ghost"} onClick={handleFavoriteClick}>
          <Star className={`h-4 w-4 ${isFavorite ? "text-yellow-500" : ""}`} />
        </Button>
      </div>
    </>
  );
};

export default ActionButtons;
