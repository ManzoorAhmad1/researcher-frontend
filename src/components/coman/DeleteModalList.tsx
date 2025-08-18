import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Loader } from "rizzui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OTPExpireTimer from "./OTPExpireTimer";

interface DeleteModelProps {
  isDeleteItem: boolean;
  setIsDeleteItem: any;
  loading: boolean;
  handleDelete: (otp?: string) => void;
  Title: string;
  heading: string;
  subheading?: string;
  message?: string;
  isDeletable?: boolean | undefined;
  optExpireTime?: any;
  handleCancel?: () => void;
  isOTPExpired?: boolean;
}
const DeleteModalList: React.FC<DeleteModelProps> = ({
  isDeleteItem,
  setIsDeleteItem,
  loading,
  handleDelete,
  Title,
  heading,
  subheading,
  message,
  isDeletable,
  optExpireTime,
  handleCancel,
  isOTPExpired,
}) => {
  const [deleteText, setDeleteText] = useState("");
  return (
    <Dialog
      open={isDeleteItem}
      onOpenChange={(isOpen) => {
        setIsDeleteItem(isOpen);
        if (!isOpen) {
          setDeleteText("");
          handleCancel?.();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{Title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2">
          <p>{heading}</p>
          {!optExpireTime && (
            <>
              {subheading && <p>{subheading}</p>}
              {message && <p className="text-[#FFCC00]">{message}</p>}
            </>
          )}
        </div>
        {optExpireTime && !isOTPExpired && (
          <div>
            <OTPExpireTimer optExpireTime={optExpireTime} />
          </div>
        )}
        <DialogFooter>
          <div className="flex flex-col w-full gap-3">
            {!isOTPExpired &&
              (Title === "Delete Project" ||
                Title === "Delete Organization" ||
                Title === "Add OTP") && (
                <div>
                  <Input
                    id="new"
                    type="text"
                    className="outline-none"
                    placeholder={optExpireTime && "Add OTP Code"}
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                  />
                  {!optExpireTime && (
                    <p className="text-xs mt-3">{`To confirm deletion,please type "DELETE"`}</p>
                  )}
                </div>
              )}

            {Title === "Delete Workspace" && isDeletable && (
              <div>
                <p className="text-xs mt-1">{`Please Delete Projects Within this Workspace to Continue deletion.`}</p>
              </div>
            )}
             {Title === "Delete Template" && isDeletable && (
              <div>
                <p className="text-xs mt-1">{`Template is associated with projects. Please detach the template from the projects to continue deletion.`}</p>
              </div>
            )}


            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                  className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] hover:text-[#0E70FF]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteItem("");
                  setDeleteText("");
                  handleCancel?.();
                }}
              >
                Cancel
              </Button>

              <Button
                variant="outline"
                // className={optExpireTime ? "rounded-[20px] text-[#0E70FF] border-[#0E70FF] hover:text-[#0E70FF]" : ""}
                 className="rounded-[26px] btn text-white hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(
                    optExpireTime && !isOTPExpired ? deleteText : undefined
                  );
                  setDeleteText("");
                }}
                disabled={
                  isOTPExpired
                    ? false
                    : optExpireTime
                    ? !deleteText || deleteText?.length < 5
                    : Title === "Delete Project" ||
                      Title === "Delete Organization"
                    ? deleteText?.toLowerCase() !== "delete" || loading
                    : Title === "Delete Workspace" ||
                      Title === "Delete Template"
                    ? isDeletable
                    : loading
                }
              >
                {loading ? (
                  <Loader variant="threeDot" size="lg" />
                ) : isOTPExpired ? (
                  "Regenerate OTP"
                ) : optExpireTime ? (
                  "Add"
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModalList;
