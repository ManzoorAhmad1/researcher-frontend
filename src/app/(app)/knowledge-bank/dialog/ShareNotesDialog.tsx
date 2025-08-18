/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useParams, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { AppDispatch, RootState } from "@/reducer/store";
import {
  AccessRequest,
  AllEmail,
  FormInputs,
  Member,
  ShareNotesDialogProps,
} from "../utils/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { Select, SelectItem } from "@/components/ui/select";
import { general_access_dropdown, roles } from "../utils/const";
import { GrFormPreviousLink } from "react-icons/gr";
import {
  SelectContent,
  SelectTrigger,
} from "@/components/ui/review-stage-select ";
import { MdLockOutline, MdPublic } from "react-icons/md";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  accepteRequest,
  rejectRequestApi,
  removeAccessAPI,
  sendEmail,
  shareSaveNotes,
  transferOwnerShip,
} from "@/apis/notes-bookmarks";
import {
  acceptSingleRequest,
  getNoteMembersAndrRequest,
  rejectRequest,
  removeAccess,
} from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { Loader } from "rizzui";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import "./react-select.css";
import { MultiValue } from "react-select";
import {
  AccepteRequestBody,
  ShareSaveNotesBody,
} from "@/apis/notes-bookmarks/types";
import { IoLinkSharp } from "react-icons/io5";
import CopyToClipboard from "react-copy-to-clipboard";
import { getAllUserList } from "@/apis/user";

const ShareNotesDialog: React.FC<ShareNotesDialogProps> = ({
  show,
  setShow,
  noteTitle,
  isSingleNote,
  getSingleNote,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const supabase: SupabaseClient = createClient();
  const pathName = usePathname();
  const params = useParams();
  const { slug } = params;
  const id = slug?.[slug?.length - 1];
  const [requestAccept, setRequestAccept] = useState(false);
  const [requestInfo, setRequestInfo] = useState<AccessRequest>();
  const [allEmailList, setAllEmailList] = useState<AllEmail[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<MultiValue<AllEmail>>();
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const { members, accessRequestList, shareDialogLoading } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const { project } = useSelector((state: any) => state?.project);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      general_access: isSingleNote?.public
        ? "Anyone with the link"
        : "Restricted",
      public_role: isSingleNote?.public_role || "Viewer",
      role: "Viewer",
      members: members.map((member: Member) => ({ role: member.role })) || [],
      accepte_request_role: "Viewer",
    },
  });

  const generalAccess = watch("general_access");

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const ownerInfo = members?.find((item: Member) => item?.role === "Owner");

    const newMembersList = members?.map((item: Member, i: number) => ({
      email: item?.email,
      role: item?.role,
    }));

    const newSelectedEmailsList = selectedEmails
      ?.map((item, i) => ({
        email: item?.value,
        role: data?.role,
      }))
      .filter((nemMember) => nemMember?.email !== ownerInfo?.email);

    const updatedMembersList = newMembersList?.map(
      (member: Member, i: number) => {
        const selectedEmail = newSelectedEmailsList?.find(
          (elected) => elected.email === member.email
        );

        if (selectedEmail && member?.role !== "Owner") {
          return {
            ...member,
            role: selectedEmail.role,
          };
        } else {
          return {
            ...member,
            role: data.members?.[i]?.role,
          };
        }
      }
    );

    const mergedList = [
      ...updatedMembersList,
      ...((newSelectedEmailsList &&
        newSelectedEmailsList?.filter(
          (elected) =>
            !newMembersList.some(
              (member: Member) => member.email === elected.email
            )
        )) ||
        []),
    ];

    const body: ShareSaveNotesBody = {
      document_id: id,
      project_id: project?.id,
      public: data.general_access === "Anyone with the link",
      public_role:
        data.general_access === "Anyone with the link"
          ? data.public_role
          : undefined,
      members: mergedList,
    };

    if (newSelectedEmailsList && newSelectedEmailsList?.length > 0) {
      const emailBody = {
        url: pathName,
        firstName: userInfo?.first_name,
        lastName: userInfo?.last_name,
        newMembers: newSelectedEmailsList,
      };
      await sendEmail(emailBody);
    }

    const apiRes = await shareSaveNotes(body);
    if (apiRes?.success) {
      setShow(false);
      getSingleNote();
    }
  };

  const accepteRequestFunction: SubmitHandler<FormInputs> = useCallback(
    async (data) => {
      const body: AccepteRequestBody = {
        document_id: id,
        role: data?.accepte_request_role,
      };
      const existingMemberIndex = members?.findIndex(
        (item: Member) => item?.email == requestInfo?.email
      );

      if (existingMemberIndex !== -1) {
        setValue(
          `members.${existingMemberIndex}.role`,
          data?.accepte_request_role
        );
      }

      await accepteRequest(requestInfo?.email, body);

      dispatch(
        acceptSingleRequest({
          ...requestInfo,
          role: data?.accepte_request_role,
        })
      );
      setRequestAccept(false);
    },
    [dispatch, id, setValue, members?.length, requestInfo]
  );

  const fetchUserData = async () => {
   const response = await getAllUserList()
   const existing = response?.data?.data;
   const error = response?.data?.isSuccess !== true;

    if (!error && existing && existing?.length > 0) {
      setAllEmailList(
        existing.map((item:any) => ({
          label: item.email.trim(),
          value: item.email.trim(),
        }))
      );
    } else {
      setAllEmailList([]);
    }
    return { existing, error };
  };

  const handleRemoveAccess = async (itemEmail: string) => {
    dispatch(removeAccess(itemEmail));
    const body = { document_id: id };
    await removeAccessAPI(itemEmail, body);
  };

  const handleTransferOwnership = async (email: string) => {
    const ownerInfo = members?.find((item: Member) => item?.role === "Owner");
    const body = { transferEmail: email, ownerEmail: ownerInfo?.email };
    await transferOwnerShip(id, body);
    setShow(false);
  };

  const handleRejectRequest = async (item: AccessRequest) => {
    const body = { document_id: id };
    await rejectRequestApi(item?.email, body);
    isOwner && dispatch(rejectRequest(item?.email));
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

  useEffect(() => {
    if (userInfo?.email === members?.[0]?.email) {
      setIsOwner(true);
    }
  }, [userInfo?.id, members]);

  useEffect(() => {
    if (id) {
      dispatch(getNoteMembersAndrRequest({ id }));
      fetchUserData();
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (members && members?.length > 0)
      setValue(
        `members`,
        members.map((member: Member) => ({ role: member.role }))
      );
  }, [setValue, members]);

  return (
    <Dialog open={show} onOpenChange={() => setShow(false)}>
      <DialogContent>
        {shareDialogLoading ? (
          <div className="h-72 flex justify-center items-center">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <>
            {requestAccept ? (
              <div>
                <DialogHeader className="mb-3 text-xl font-normal">
                  <div className="flex items-center">
                    <GrFormPreviousLink
                      className="text-2xl cursor-pointer"
                      onClick={() => setRequestAccept(false)}
                    />
                    <span className="ms-3">Request for access</span>
                  </div>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit(accepteRequestFunction)}
                  className="mt-6"
                >
                  <div className="flex gap-2 mt-1 justify-between">
                    <div className="flex gap-2 text-[14px]">
                      <div className="h-[42px] w-[42px] flex justify-center items-center rounded-full bg-[#D8E8FF] border border-[#7CADFF] dark:text-black">
                        {requestInfo?.first_name
                          ?.charAt(0)
                          ?.toLocaleUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {requestInfo?.first_name}asked to be an editor
                        </div>
                        <div className="font-extralight text-[12px]">
                          {requestInfo?.email}
                        </div>
                      </div>
                    </div>

                    <Controller
                      name="accepte_request_role"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="cursor-pointer">
                            <div className="flex items-center justify-between border px-[10px] py-[11px] w-28 rounded-[7px] border-[#CCCCCC]">
                              <p className="text-xs font-normal">
                                {field.value || "Select a role"}
                              </p>
                              <ChevronDown
                                size={"12px"}
                                className="dark:text-white text-black"
                              />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-inputBackground text-darkGray">
                            {roles.map((item, index) => (
                              <SelectItem
                                className="cursor-pointer"
                                key={index}
                                value={item}
                              >
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="flex gap-2 justify-end items-center mt-6">
                    <Button
                      className="rounded-[26px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
                      variant="outline"
                      type="button"
                      onClick={() => setShow(false)}
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
                        "Save"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <DialogHeader className="mb-3 text-xl font-normal">
                  Share {`'${noteTitle || "Untitled Document"}'`}
                </DialogHeader>

                <div className="mb-3 max-h-44 overflow-auto">
                  {accessRequestList?.map((item: AccessRequest, i: number) => (
                    <div
                      className="py-2 bg-[#D3E3FD] rounded-lg px-2 flex justify-between text-[14px] items-center mb-2"
                      key={i}
                    >
                      <div className="text-[#436DB9]">
                        {item?.first_name} {item?.last_name} asked to be an{" "}
                        {item?.role ? item?.role : "Viewer"}
                      </div>
                      <div className="text-[#436DB9] flex items-center">
                        <div
                          className="cursor-pointer hover:bg-[#CCDDFA] px-2 py-1 rounded-md"
                          onClick={() => {
                            setRequestAccept(true);
                            setRequestInfo(item);
                            setValue("accepte_request_role", item.role);
                          }}
                        >
                          Review
                        </div>
                        <div
                          className="me-2 hover:bg-[#CCDDFA] px-2 py-1 rounded-md cursor-pointer"
                          onClick={() => handleRejectRequest(item)}
                        >
                          X
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex gap-2 mt-1">
                    <div className="w-full">
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

                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="cursor-pointer">
                            <div className="flex items-center justify-between border px-[10px] py-[11px] w-28 rounded-[7px] border-[#CCCCCC]">
                              <p className="text-xs font-normal">
                                {field.value || "Select a role"}
                              </p>
                              <ChevronDown
                                size={"12px"}
                                className="dark:text-white text-black"
                              />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-inputBackground text-darkGray">
                            {roles.map((item, index) => (
                              <SelectItem
                                className="cursor-pointer"
                                key={index}
                                value={item}
                              >
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {members?.length > 0 && (
                    <>
                      <hr className="mt-5 mb-4 border-[#ccc]" />
                      <div className="mb-2">People with access</div>
                      <div className="max-h-44 overflow-auto">
                        {members?.map(
                          (
                            item: {
                              email: string;
                              role: string;
                              document_id: string;
                              id: string;
                            },
                            i: number
                          ) => {
                            return (
                              <div
                                className="flex items-center justify-between py-1 cursor-pointer hover:bg-[#8c8c8c26] transition-all duration-100 px-2 rounded-md"
                                key={i}
                              >
                                <div className="flex gap-2 items-center">
                                  <div className="h-[42px] w-[42px] flex justify-center items-center rounded-full bg-[#D8E8FF] border border-[#7CADFF] dark:text-black">
                                    {item?.email
                                      ?.charAt(0)
                                      ?.toLocaleUpperCase()}
                                  </div>
                                  <div className="text-[14px]">
                                    {item?.email}
                                  </div>
                                </div>
                                <div>
                                  <Controller
                                    name={`members.${i}.role`}
                                    control={control}
                                    defaultValue={item.role}
                                    render={({ field }) => (
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger
                                          className="cursor-pointer"
                                          disabled={
                                            item?.role === "Owner" || !isOwner
                                          }
                                        >
                                          <div className="flex items-center justify-between rounded-[7px] gap-2 hover:bg-[#E3E3E3] transition-all duration-100 p-2 dark:hover:bg-[#202D32]">
                                            <p className="text-xs font-normal text-[14px]">
                                              {field.value || "Select a role"}
                                            </p>
                                            <ChevronDown
                                              size={"12px"}
                                              className="dark:text-white text-black"
                                            />
                                          </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-inputBackground text-darkGray">
                                          {roles.map((role, index) => (
                                            <>
                                              <SelectItem
                                                className="cursor-pointer"
                                                key={index}
                                                value={role}
                                              >
                                                {role}
                                              </SelectItem>
                                            </>
                                          ))}
                                          {item.role !== "Owner" && (
                                            <div className="cursor-pointer">
                                              <hr className="my-1" />
                                              <div
                                                className="px-3 text-[14px] pt-2"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRemoveAccess(
                                                    item.email
                                                  );
                                                }}
                                              >
                                                Remove access
                                              </div>
                                              <div
                                                className="px-3 text-[14px] py-2"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleTransferOwnership(
                                                    item.email
                                                  );
                                                }}
                                              >
                                                Transfer ownership
                                              </div>
                                            </div>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </>
                  )}

                  <hr className="mt-5 mb-4 border-[#ccc]" />
                  <div className="">General access</div>
                  <div className="flex items-center mt-3 justify-between px-2">
                    <div className="flex items-center">
                      <div className="h-[42] w-[42] rounded-full bg-[#E3E3E3] mt-2">
                        {generalAccess !== "Anyone with the link" ? (
                          <MdLockOutline className="text-4xl p-2 dark:text-black " />
                        ) : (
                          <MdPublic className="text-4xl p-2 dark:text-black " />
                        )}
                      </div>
                      <div>
                        <Controller
                          name="general_access"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange}>
                              <SelectTrigger
                                disabled={!isOwner}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center justify-between rounded-[7px] gap-3 hover:bg-[#E3E3E3] transition-all duration-100 p-1 ms-2 py-2 dark:hover:bg-[#202D32]">
                                  <p className="text-xs font-normal text-[14px]">
                                    {field.value || "Select a role"}
                                  </p>
                                  <ChevronDown
                                    size={"12px"}
                                    className="dark:text-white text-black"
                                  />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-inputBackground text-darkGray">
                                {general_access_dropdown.map((item, index) => (
                                  <SelectItem
                                    className="cursor-pointer"
                                    key={index}
                                    value={item?.label}
                                  >
                                    {item?.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <div className="text-[12px] text-[#979897] ms-2 ps-1">
                          {
                            general_access_dropdown.find(
                              (item) => item?.label === generalAccess
                            )?.description
                          }
                        </div>
                      </div>
                    </div>

                    {generalAccess === "Anyone with the link" && (
                      <div>
                        <Controller
                          name="public_role"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="cursor-pointer">
                                <div className="flex items-center justify-between border px-[10px] py-[11px] w-28 rounded-[7px] border-[#CCCCCC]">
                                  <p className="text-xs font-normal">
                                    {field.value || "Select a role"}
                                  </p>
                                  <ChevronDown size={"12px"} color="#999999" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-inputBackground text-darkGray">
                                {roles.map((item, index) => (
                                  <SelectItem
                                    className="cursor-pointer"
                                    key={index}
                                    value={item}
                                  >
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-between items-center mt-6">
                    <CopyToClipboard text={window.location.href}>
                      <div
                        className="flex items-center gap-2 border border-[black] dark:border-[white] rounded-[20px] px-[16px] py-[8px] text-[12px] cursor-pointer"
                        onClick={() => toast.success("Copy to clipboard!")}
                      >
                        <IoLinkSharp className="text-[15px]" />
                        <span>Copy link</span>
                      </div>
                    </CopyToClipboard>
                    <div className="flex items-center gap-2 ">
                      <Button
                        className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
                        variant="outline"
                        type="button"
                        onClick={() => setShow(false)}
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
                          "Save"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareNotesDialog;
