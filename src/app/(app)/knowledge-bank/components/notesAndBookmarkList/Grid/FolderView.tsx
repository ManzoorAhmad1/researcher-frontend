import React from "react";
import { PiFolderSimpleThin } from "react-icons/pi";
import { CopyIcon, Dotes, FavoriteIcon } from "../../../icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/reducer/store";
import { NotFavoriteIcon } from "@/app/(app)/creative-thinking/icons/icons";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { folderAddToFavorite } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import toast from "react-hot-toast";
import { useRouter } from "next-nprogress-bar";
import { usePathname } from "next/navigation";
import { notesBookmarksFolder, updateKnoledgeBankFolder } from "@/apis/notes-bookmarks";

const FolderView = ({
  i,
  item,
  openDropdownId,
  setOpenDropdownId,
  handleDropdownToggle,
  setDeleteDialogInfo,
}: any) => {
  const router = useRouter();
  const pathName = usePathname();
  const supabase: SupabaseClient = createClient();
  const dispatch = useDispatch<AppDispatch>();

  const addToFavorite = async (id: number) => {
    try {
      
        const response = await notesBookmarksFolder(id);
        const currentData = response?.data;
      if (response?.isSuccess == false) {
        console.error("Error fetching current favorite status:", response?.message);
        return;
      }

      const isCurrentlyFavorite = currentData?.favorite;

      const newFavoriteState = !isCurrentlyFavorite;

      if (newFavoriteState) {
        toast.success("Add to favorite successfully");
      }

      
        const data = await updateKnoledgeBankFolder(id.toString(), { favorite: newFavoriteState });

      if (data?.isSuccess == false) {
        console.error("Error toggling favorite status:", data?.message);
        return;
      }

      dispatch(folderAddToFavorite(id));
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div
      key={i}
      onClick={() => router.push(`${pathName}/${item.id}`)}
      className="col-span-1 border p-5 dark:bg-[#202D32] cursor-pointer"
      style={{ borderRadius: "40px 10px 40px 10px" }}
    >
      <h4 className="font-medium flex items-center gap-2">
        {item?.folder_name}{" "}
        <span className="bg-slate-500 text-white w-5 h-5 rounded-full flex justify-center items-center text-[15px]">
          {item?.folderDataLength}
        </span>
      </h4>
      <div className="h-[150px] rounded-xl mb-2 flex items-center justify-center">
        <PiFolderSimpleThin className="text-[150px]" />
      </div>
      <div className="flex items-center gap-3 justify-end mt-3 mb-2">
        <div
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            addToFavorite(item?.id);
          }}
        >
          {item.favorite ? <FavoriteIcon /> : <NotFavoriteIcon />}
        </div>
        <div className="cursor-pointer">
          <CopyIcon />
        </div>

        <DropdownMenu open={openDropdownId === i}>
          <DropdownMenuTrigger className="dropdownMenuTrigger">
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleDropdownToggle(i);
              }}
            >
              <Dotes />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              onPointerDownOutside={(e) => {
                e.stopPropagation();
                setOpenDropdownId(null);
              }}
              className="dropdownMenu p-2 bg-inputBackground"
              side="right"
              align="start"
            >
              <DropdownMenuItem
                className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDropdownToggle(i);
                  setDeleteDialogInfo({
                    id: item?.id,
                    show: true,
                    name: item?.folder_name,
                    type: "folder",
                  });
                }}
              >
                <Trash className="h-[18px] w-[18px]" color="#E92222" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default FolderView;
