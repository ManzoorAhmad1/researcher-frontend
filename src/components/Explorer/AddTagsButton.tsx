import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, createRef, useState } from "react";
import { Button } from "../ui/button";
import { Loader } from "rizzui";
import toast from "react-hot-toast";
import { addTags, deleteTag, getTags, updateTag } from "@/apis/explore";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { refreshData } from "@/reducer/services/folderSlice";
import { RxCross2 } from "react-icons/rx";

interface AddTagsProps {
  fetchFolders?: any;
  itemId: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const AddTagsButton: React.FC<AddTagsProps> = ({
  fetchFolders,
  itemId,
  isOpen,
  onOpenChange,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user?.user?.user);
  const currentProject = useSelector((state: any) => state?.project);
  const [newTag, setNewTag] = useState<string>("");
  const [newTagColor, setNewTagColor] = useState<string>("#E9222229");
  const [selectedTagColor, setSelectedTagColor] = useState<string>("#000000");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tags, setAllTag] = useState<{ color: string; name: string }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [lastErrorTime, setLastErrorTime] = useState<number>(0);
  const [showError, setShowError] = useState<boolean>(true);
  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5DE14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];
  function lightenColor(hex: any, percent: any) {
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

  const compareColor: any = (color: any, per: any) => {
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
    const selectedColor = e.target.value;
    
   const isBlackOrNearBlack = isColorBlackOrNearBlack(selectedColor);
    
    if (isBlackOrNearBlack) {
       const lightBlueColor = "#0E70FF";
      setSelectedTagColor(lightBlueColor);
      const lightenedColor = lightenColor(lightBlueColor, 8);
      setNewTagColor(lightenedColor);
      
     const currentTime = Date.now();
      const timeSinceLastError = currentTime - lastErrorTime;
      
      if (lastErrorTime === 0 || timeSinceLastError > 10000) {
        toast.error("Please choose a brighter color. Dark colors may not be visible enough.");
        setLastErrorTime(currentTime);
      }
      return;
    }
    
    setSelectedTagColor(selectedColor);
    const lightenedColor = lightenColor(selectedColor, 8);
    setNewTagColor(lightenedColor);
  };

  const isColorBlackOrNearBlack = (hexColor: string): boolean => {
    hexColor = hexColor.replace(/^#/, '');
    
   const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    
    const threshold = 30;
    return r <= threshold && g <= threshold && b <= threshold;
  };

  const handlePredefinedColorClick = (color: string) => {
    setNewTagColor(color);
  };

  const onAddTags = async () => {
    setIsLoading(true);
    try {
      const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      if (editingIndex === -1) {
        const result = await addTags(
          user?.id,
          newTag,
          newTagColor,
          itemId,
          projectId
        );
        if (result) {
          toast.success("Tag added successfully.");
          setNewTag("");
          setNewTagColor("#000000");
          dispatch(refreshData());
        }
      } else {
        const result = await updateTag(
          itemId,
          tags[editingIndex].name,
          newTag,
          newTagColor,
          projectId
        );
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
          setIsEditing(false);
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      onOpenChange(false);
      fetchFolders(false);
    }
  };

  const handleDelete = async (index: any) => {
    const projectId: any =
      currentProject?.project?.id && currentProject?.project?.id !== null
        ? currentProject?.project?.id
        : localStorage.getItem("currentProject");
    const result = await deleteTag(itemId, index, projectId);
    if (result) {
      setAllTag((prevTags) => prevTags.filter((_, i) => i !== index));
      toast.success("Tag deleted successfully.");
      fetchFolders(false);
    }
  };

  const getAllTags = async () => {
    const allTags = await getTags(itemId);
    setAllTag(allTags?.data[0]?.tags);
  };

  const handleTagClick = (index: number) => {
    setEditingIndex(index);
    setNewTag(tags[index].name);
    setNewTagColor(tags[index].color);
    setIsEditing(true);
  };

  useEffect(() => {
    if (isOpen) {
      getAllTags();
    }
  }, [itemId, isOpen]);
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
                value={selectedTagColor}
                onChange={handleColorChange}
                className="  opacity-0 cursor-pointer  z-0 w-1 "
                ref={colorInputRef as any}
              />
            </div>
          </div>
          <hr className="border-b border-borderColor" />
          <div className="flex flex-wrap gap-x-3 gap-y-3 my-4">
            {tags?.map((tag: any, index: any) => (
              <span
                key={index}
                className={`flex justify-between items-center px-3 h-[28px] rounded-2xl text-xs font-medium text-gray-800 cursor-pointer ${
                  editingIndex === index ? "border-2" : ""
                }`}
                style={{
                  backgroundColor: tag && tag?.color,
                  color: tag.color && compareColor(tag.color, 1),
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
            className="flex items-center justify-center p-2 font-size-normal font-medium  text-white btn whitespace-nowrap  w-[130px] h-[32px] rounded-[26px]"
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
