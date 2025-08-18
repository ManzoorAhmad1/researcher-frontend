/* eslint-disable react-hooks/exhaustive-deps */
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { SubmitHandler, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/reducer/store";
import { applyCss } from "@/reducer/services/explorerTableSlice";

interface TableDialogProps {
  isOpen: string | boolean;
  onOpenChange: () => void;
  isViewFontSizeOnly?: boolean;
}

interface FormData {
  width: number | null;
  font_size: number | null;
  truncate: boolean;
}

export const TableDialog: React.FC<TableDialogProps> = ({
  isOpen,
  onOpenChange,
  isViewFontSizeOnly,
}) => {
  const tableColumnsOptions = useSelector(
    (state: any) => state?.ExporerOptionalFilterData?.filterOptions
  );
  const singleData = !isViewFontSizeOnly
    ? tableColumnsOptions?.find((item: any) => item.id === isOpen)
    : tableColumnsOptions[0];
  const dispatch = useDispatch<AppDispatch>();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      width: parseFloat(singleData?.width?.split("px")?.[0]),
      font_size: null,
      truncate: false,
    },
  });
  const [loading, setLoading] = useState(false);

  const handleDialogContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const body = {
      id: isOpen,
      width: `${data?.width}px`,
      font_size: `${data?.font_size}px`,
      truncate: data?.truncate,
    };
    dispatch(applyCss(body));
    onOpenChange();
    reset();
  };

  useEffect(() => {
    setValue("width", parseFloat(singleData?.width?.split("px")?.[0]));
    setValue("font_size", parseFloat(singleData?.font_size?.split("px")?.[0]));
    setValue("truncate", singleData?.truncate);
  }, [singleData]);

  return (
    <Dialog open={Boolean(isOpen)} onOpenChange={onOpenChange}>
      <DialogContent
        className="FolderChatAI max-h-full overflow-y-auto"
        onClick={handleDialogContentClick}
      >
        <div className="mt-4">
          <form className="h-full mt-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-2 mb-5">
              {!isViewFontSizeOnly && (
                <div className="w-full">
                  <label className="text-[12px] mt-1" htmlFor="width">
                    Width
                  </label>
                  <Input
                    type="number"
                    {...register("width", {
                      required: "Width is required",
                      min: {
                        value: 150,
                        message: "Width must be at least 150",
                      },
                    })}
                    className="focus-visible:ring-none focus-visible:ring-0"
                    placeholder="Width"
                  />
                  {errors.width && (
                    <p className="text-red-500  mt-1 text-[12px]">
                      {errors.width.message}
                    </p>
                  )}
                </div>
              )}
              <div className="w-full">
                <label className="text-[12px] mt-1  " htmlFor="font_size">
                  Font size
                </label>
                <Input
                  type="number"
                  {...register("font_size", {
                    required: "Font size is required",
                    min: {
                      value: 10,
                      message: "Font size must be at least 10",
                    },
                    max: {
                      value: 20,
                      message: "Font size must not exceed 20",
                    },
                  })}
                  className="focus-visible:ring-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border border-tableBorder mt-1"
                  placeholder="Font size"
                />
                {errors.font_size && (
                  <p className="text-red-500  mt-1 text-[12px]">
                    {errors.font_size.message}
                  </p>
                )}
              </div>
            </div>
            {!isViewFontSizeOnly && (
              <div className="w-full flex gap-2 items-center">
                <label className="text-[12px] mt-1" htmlFor="truncate">
                  Truncate
                </label>
                <Input
                  {...register("truncate")}
                  type="checkbox"
                  className="focus-visible:ring-none focus-visible:ring-0 w-[1rem] h-[1rem]"
                />
              </div>
            )}
            <DialogFooter className="mt-7">
              <div className="flex gap-2 justify-end items-center">
                <Button
                  className="rounded-[26px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
                  variant="outline"
                  onClick={onOpenChange}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-[26px] btn text-white h-9 w-20"
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    <span className="text-nowrap">Save</span>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
