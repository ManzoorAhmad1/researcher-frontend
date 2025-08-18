/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useParams, usePathname } from "next/navigation";
import { RootState } from "@/reducer/store";
import { useSelector } from "react-redux";
import { FormValues, BookmarkShareDialogProps, AllEmail } from "../utils/types";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Select, SelectItem } from "@/components/ui/select";
import {
  SelectContent,
  SelectTrigger,
} from "@/components/ui/review-stage-select ";
import { ChevronDown, LoaderCircle } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import { MultiValue } from "react-select";
import { getNoteMembersAndrRequest } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ShareSaveNotesBody } from "@/apis/notes-bookmarks/types";
import {
  getBookmark,
  removeBookmarkAccessAPI,
  sendShareBookmarkEmail,
  shareBookmark,
} from "@/apis/notes-bookmarks";
import { getAllUserList } from "@/apis/user";

interface Member {
  id: string | number;
  [key: string]: any;
}

interface FormInputs {
  email: string;
  role: string;
  general_access: string;
  public_role: string;
  members: Member[];
  accepte_request_role: string;
}

const BookmarkShareDialog: React.FC<BookmarkShareDialogProps> = ({
  showBookmarkDialog,
  setShowBookmarkDialog,
}) => {
  const pathName = usePathname();
  const mainUrl = window.location.origin;
  const params = useParams();
  const { slug } = params;
  const id = slug?.[slug?.length - 1];
  const supabase: SupabaseClient = createClient();
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const [selectedEmails, setSelectedEmails] = useState<MultiValue<AllEmail>>();
  const [allEmailList, setAllEmailList] = useState<AllEmail[]>([]);
  const [isMeambers, setIsMeambers] = useState<Member[]>([]);
  const [memberLoader, setMemberLoader] = useState(false);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      members:
        isMeambers.map((member: Member) => ({ role: member.role })) || [],
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const ownerInfo = isMeambers?.find(
      (item: Member) => item?.role === "Owner"
    );

    const newMembersList = isMeambers?.map((item: Member, i: number) => ({
      email: item?.email,
      role: "Viewer",
    }));

    const newSelectedEmailsList = selectedEmails
      ?.map((item, i) => ({
        email: item?.value,
        role: "Viewer",
      }))
      .filter((nemMember) => nemMember?.email !== ownerInfo?.email);

    const updatedMembersList = newMembersList?.map((member: any, i: number) => {
      const selectedEmail = newSelectedEmailsList?.find(
        (elected) => elected.email === member.email
      );

      if (selectedEmail && member?.role !== "Owner") {
        return {
          ...member,
          role: "Viewer",
        };
      } else {
        return {
          ...member,
          role: "Viewer",
        };
      }
    });

    const mergedList = [
      ...updatedMembersList,
      ...((newSelectedEmailsList &&
        newSelectedEmailsList?.filter(
          (elected) =>
            !newMembersList.some(
              (member: any) => member.email === elected.email
            )
        )) ||
        []),
    ];

    const body: any = {
      members: mergedList,
    };

    if (newSelectedEmailsList && newSelectedEmailsList?.length > 0) {
      const emailBody = {
        url: `${mainUrl}?search=${pathName}`,
        firstName: userInfo?.first_name,
        lastName: userInfo?.last_name,
        newMembers: newSelectedEmailsList,
      };

      await sendShareBookmarkEmail(emailBody);
    }

    const apiRes = await shareBookmark(body, id);
    if (apiRes?.success) {
      setShowBookmarkDialog(false);
    }
  };

  const handleCreateOption = (newEmail: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailRegex.test(newEmail)) {
      setSelectedEmails([
        ...(selectedEmails || []),
        { label: newEmail, value: newEmail },
      ]);
    } else {
      toast.error("Please enter a valid email address.");
    }
  };

  const fetchUserData = async () => {
  
      const response = await getAllUserList()
      const existing = response?.data?.data;
        const error = response?.data?.isSuccess !== true;

    if (!error && existing && existing?.length > 0) {
      setAllEmailList(
        existing?.map((item: any) => ({
          label: item.email.trim(),
          value: item.email.trim(),
        }))
      );
    } else {
      setAllEmailList([]);
    }
    return { existing, error };
  };

  const getMembers = async () => {
    setMemberLoader(true);
    const apiRes = await getBookmark(id);
    setIsMeambers(
      apiRes?.data?.members?.filter((member: any) => member.role !== "Owner")
    );
    setMemberLoader(false);
  };

  const handleRemove = async (email: string) => {
    setIsMeambers((prevMembers: any) =>
      prevMembers.filter((member: any) => member.email !== email)
    );
    const body = { id };
    await removeBookmarkAccessAPI(email, body);
  };

  useEffect(() => {
    if (id) {
      fetchUserData();
      getMembers();
    }
  }, [id, showBookmarkDialog]);

  return (
    <Dialog
      open={showBookmarkDialog}
      onOpenChange={() => setShowBookmarkDialog(false)}
    >
      <DialogContent className="w-[28rem]">
        <DialogHeader className="text-lg font-semibold">
          <span className="font-light">Share</span>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <CreatableSelect
              styles={{
                option: (provided, state) => ({
                  ...provided,
                  fontSize: "14px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  backgroundColor: "",
                  ":hover": {
                    backgroundColor: "#D8E8FF",
                    color: "black",
                  },
                }),
              }}
              isMulti
              placeholder="Search email"
              value={selectedEmails}
              onChange={setSelectedEmails}
              options={allEmailList}
              onCreateOption={handleCreateOption}
            />
          </div>

          {memberLoader ? (
            <LoaderCircle className="animate-spin h-5 w-5 mx-auto my-8" />
          ) : (
            isMeambers?.length > 0 && (
              <>
                <hr className="mt-5 mb-4 border-[#ccc]" />
                <div className="mb-2">People with access</div>
                <div className="max-h-44 overflow-auto">
                  {isMeambers?.map((item: any, i: number) => {
                    return (
                      <div
                        className="flex items-center justify-between py-1 cursor-pointer hover:bg-[#8c8c8c26] transition-all duration-100 px-2 rounded-md"
                        key={i}
                      >
                        <div className="flex gap-2 items-center">
                          <div className="h-[42px] w-[42px] flex justify-center items-center rounded-full bg-[#D8E8FF] border border-[#7CADFF] dark:text-black">
                            {item?.email?.charAt(0)?.toLocaleUpperCase()}
                          </div>
                          <div className="text-[14px]">{item?.email}</div>
                        </div>
                        <div
                          className="bg-[#ff000024] text-[#ff0000ad] w-[30px] h-[30px] rounded-full flex justify-center items-center"
                          onClick={() => handleRemove(item?.email)}
                        >
                          X
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )
          )}

          <div className="flex items-center justify-end gap-2 mt-7">
            <Button
              className="rounded-[26px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
              variant="outline"
              type="button"
              onClick={() => setShowBookmarkDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-[26px] btn text-white h-9 w-20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                "Share"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkShareDialog;
