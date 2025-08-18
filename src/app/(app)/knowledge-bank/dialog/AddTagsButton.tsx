/* eslint-disable react-hooks/exhaustive-deps */
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, createRef, useState } from "react";

import { Loader } from "rizzui";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { refreshData } from "@/reducer/services/folderSlice";
import { RxCross2 } from "react-icons/rx";
import { Button } from "@/components/ui/button";
import {
  addNotesBookmarksTag,
  deleteNotesBookmarksTag,
  getNotesBookmarksTags,
  updateNotesBookmarksTag,
} from "@/apis/notes-bookmarks";
import {
  getNotesBookmarkAllData,
  getRefetchNotesBookmarkAllData,
} from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { useParams } from "next/navigation";
import { Tags } from "../utils/types";

interface AddTagsProps {
  tageId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const AddTagsButton: React.FC<AddTagsProps> = ({
  tageId,
  isOpen,
  onOpenChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const { slug } = params;
  const user = useSelector((state: RootState) => state.user?.user?.user);
  const [newTag, setNewTag] = useState<string>("");
  const [newTagColor, setNewTagColor] = useState<string>("#E9222229");
  const [selectedTagColor, setSelectedTagColor] = useState<string>("#000000");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tags, setAllTag] = useState<{ color: string; name: string }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { project } = useSelector((state: any) => state?.project);

  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5DE14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];

  function lightenColor(hex: string, percent: number) {
    hex = hex.replace(/^#/, "");

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    const newHex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;

    return `${newHex}29`;
  }

  const colorInputRef = createRef<HTMLInputElement | HTMLButtonElement>();

  const compareColor = (color: string) => {
    const matchedColor = colors.find((c) => c.color === color);
    if (matchedColor) {
      return matchedColor?.borderColor;
    } else {
      return color.slice(0, -2);
    }
  };

  const handleButtonClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTagColor(e.target.value);
    const lightenedColor = lightenColor(e.target.value, 8);
    setNewTagColor(lightenedColor);
  };

  const handlePredefinedColorClick = (color: string) => {
    setNewTagColor(color);
  };

  const onAddTags = async () => {
    setIsLoading(true);
    try {
      if (editingIndex === -1) {
        const body = {
          userId: user?.id,
          name: newTag,
          color: newTagColor,
        };
        const result = await addNotesBookmarksTag(tageId, body);
        if (result) {
          toast.success("Tag added successfully.");
          setNewTag("");
          setNewTagColor("#000000");
          dispatch(refreshData());
        }
      } else {
        const body = {
          oldName: tags[editingIndex].name,
          newName: newTag,
          newColor: newTagColor,
        };

        const result = await updateNotesBookmarksTag(tageId, body);
        if (result) {
          setAllTag((prevTags) =>
            prevTags.map((tag, i) =>
              i === editingIndex
                ? { ...tag, name: newTag, color: newTagColor }
                : tag
            )
          );
          toast.success("Tag updated successfully.");
          setEditingIndex(-1);
          setNewTag("");
          setNewTagColor("#E9222229");
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      onOpenChange(false);
      const body = { workspace_id: workspace?.id, project_id: project?.id };
      dispatch(
        getRefetchNotesBookmarkAllData({
          id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
          currentPage: 1,
          perPageLimit: 10,
          body,
        })
      );
    }
  };

  const handleDelete = async (index: number) => {
    const body = { index };
    const result = await deleteNotesBookmarksTag(tageId, body);
    if (result) {
      setAllTag((prevTags) => prevTags.filter((_, i) => i !== index));
      toast.success("Tag deleted successfully.");
      const body = { workspace_id: workspace?.id, project_id: project?.id };
      dispatch(
        getNotesBookmarkAllData({
          id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
          currentPage: 1,
          perPageLimit: 10,
          body,
        })
      );
    }
  };

  const getAllTags = async () => {
    const allTags = await getNotesBookmarksTags(tageId);
    setAllTag(allTags?.data[0]?.tags);
  };

  const handleTagClick = (index: number) => {
    setEditingIndex(index);
    setNewTag(tags[index].name);
    setNewTagColor(tags[index].color);
  };

  useEffect(() => {
    if (isOpen) {
      getAllTags();
    }
  }, [tageId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={"sm:max-w-[418px]"}>
        <DialogHeader>
          <DialogTitle className="font-size-large font-semibold text-lightGray">
            MANAGE TAG(S){" "}
          </DialogTitle>
        </DialogHeader>
        <div className="">
          <div className="mt-1 mb-3 w-full">
            <label
              htmlFor="name"
              className="block font-size-small font-semibold text-darkGray mb-2"
            >
              TAG NAME
            </label>
            <input
              value={newTag}
              id="name"
              name="name"
              onChange={(e) => setNewTag(e.target.value)}
              className=" mb-4 p-2 text-darkGray font-size-normal font-normal rounded-lg h-[32px]  w-[370px] bg-inputBg border border-inputBorder shadow-sm focus:border-gray-400 focus:outline-none transition duration-200 ease-in-out"
              required
            />
            <label className="block  font-size-small font-semibold text-darkGray">
              TAG COLOR
            </label>
            <div className="flex items-center mt-2">
              <div className="flex gap-x-2">
                {colors?.map((color) => (
                  <div
                    key={color?.color}
                    className={`w-[30.13px] h-[24px]  cursor-pointer rounded-sm relative ${
                      newTagColor === color?.color
                    }`}
                    style={{
                      backgroundColor: color?.color,
                      border: `1px solid ${color?.borderColor}`,
                    }}
                    onClick={() => handlePredefinedColorClick(color?.color)}
                  >
                    {newTagColor === color?.color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold">
                          <svg
                            width="12"
                            height="9"
                            viewBox="0 0 13 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.27651 7.83398L11.7668 0.939697L12.7653 2.00035L5.27651 9.95528L0.783203 5.18236L1.78172 4.12171L5.27651 7.83398Z"
                              fill={color?.borderColor}
                            />
                          </svg>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center relative">
                <Button
                  variant="outline"
                  className="flex items-center justify-center w-[30.13px] h-[24px] border-2 border-[#0E70FF] rounded-sm ml-2"
                  onClick={handleButtonClick}
                  style={{ borderColor: selectedTagColor }}
                >
                  <span className="text-gray-500 text-center leading-none">
                    +
                  </span>
                </Button>
              </div>
              <input
                type="color"
                id="color"
                name="color"
                value={newTagColor}
                onChange={handleColorChange}
                className="  opacity-0 cursor-pointer  z-0 w-1 "
                ref={colorInputRef as any}
              />
            </div>
          </div>
          <hr className="border-b border-borderColor" />
          <div className="flex flex-wrap gap-x-3 gap-y-3 my-4">
            {tags?.map((tag: Tags, index: number) => (
              <span
                key={index}
                className={`flex justify-between items-center px-3 h-[28px] rounded-2xl text-xs font-medium text-gray-800 cursor-pointer ${
                  editingIndex === index ? "border-2" : ""
                }`}
                style={{
                  backgroundColor: tag && tag?.color,
                  color: tag.color && compareColor(tag.color),
                  borderColor:
                    editingIndex === index ? tag.color : "transparent",
                }}
                onClick={() => handleTagClick(index)}
              >
                {tag.name}
                <button
                  className="ml-2 text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                >
                  <RxCross2 className="text-secondaryDark" />
                </button>
              </span>
            ))}
          </div>
          {tags && tags?.length ? (
            <hr className="border-b border-borderColor " />
          ) : null}
        </div>
        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="text-blue-600 border mr-2 border-blue-600 font-size-normal font-medium w-[71px] h-[32px] rounded-[26px]"
          >
            Cancel
          </button>

          <button
            onClick={onAddTags}
            className="flex items-center rounded-[26px] justify-center p-2 font-size-normal font-medium  text-white btn whitespace-nowrap  w-[130px] h-[32px] "
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader variant="threeDot" size="lg" />
            ) : (
              "Save Changes"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
