/* eslint-disable @next/next/no-img-element */

import { Label } from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./switch.css";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  createOrganizationMember,
  createTeamMemberApi,
  getAllOwnerUserOrgMembers,
} from "@/apis/team";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { AiOutlineLoading } from "react-icons/ai";
import { Loader } from "rizzui";

interface EditAddMemberDrawerProps {
  handleDrawerClose: () => void;
  fetchTeamMembers: () => void;
  teamSpace?: boolean;
  teamMembers?: any;
}

interface Option {
  id: string;
  email: string;
}

const AddMemberDrawer = ({
  handleDrawerClose,
  fetchTeamMembers,
  teamSpace,
  teamMembers,
}: EditAddMemberDrawerProps) => {
  const searchParams = useSearchParams();
  const orgId = searchParams.get("id") as string;
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (teamSpace) {
      const fetchOrgMembers = async () => {
        try {
          setMemberLoading(true);
          const response = await getAllOwnerUserOrgMembers({
            activeUser: true,
          });
          if (response?.isSuccess) {
            setOrgMembers(response?.members);
          } else {
            toast.error(
              response?.response?.data?.message ||
                response?.message ||
                "An error occurred."
            );
          }
        } catch (error: any) {
          console.log("error", error);
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "An error occurred."
          );
        } finally {
          setMemberLoading(false);
        }
      };
      fetchOrgMembers();
    }
  }, []);

  const filteredOptions = orgMembers.filter((option: any) =>
    option?.email?.toLowerCase?.()?.includes(searchTerm?.toLowerCase?.() || "")
  );
  const toggleOption = (option: Option) => {
    setError("");
    setSelectedValues((current) =>
      current.find((el) => el.email === option.email)
        ? current.filter((el) => el.email !== option.email)
        : [...current, option]
    );
  };

  const removeValue = (
    optionToRemove: { id: string; email: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedValues((current) =>
      current.filter((option) => option.email !== optionToRemove.email)
    );
  };
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      role: "team_member",
      is_team_member_active: true,
    },
  });
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const role = watch("role");
  const handleFileChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const validFormats = ["image/jpeg", "image/png", "image/gif"];
      if (!validFormats.includes(file.type)) {
        toast.error("Only JPG, PNG, and GIF formats are allowed.");
        event.target.value = "";
        return;
      }

      setUploadedImage(file);
    }
  };
  const onSubmit = async (data: any) => {
    if (teamSpace && (!selectedValues || selectedValues.length === 0)) {
      setError("Please select at least one member");
      return;
    }

    setError("");

    let obj;
    if (!teamSpace) {
      obj = {
        email: data.email,
        orgId: orgId,
      };
    } else {
      obj = {
        role: data.role,
        is_team_member_active: data.is_team_member_active,
        team_id: orgId,
        member_emails: selectedValues.map((value) => value.email),
      };
    }
    setIsLoading(true);
    try {
      let response: any;
      if (!teamSpace) {
        response = await createOrganizationMember(obj);
      } else {
        response = await createTeamMemberApi(obj);
      }
      if (response?.success === false) {
        toast.error(response?.message);
      }
      reset();
      handleDrawerClose();

      if (response?.data?.isSuccess) {
        if (response?.data?.message && response?.data?.message !== null) {
          toast.success(response?.data?.message);
          fetchTeamMembers();
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    } finally {
      setIsLoading(false);
      fetchTeamMembers();
    }
  };

  return (
    <div ref={drawerRef}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          className={`p-6 z-20 top-0 absolute w-full max-w-[338px] right-0 h-[100vh] bg-secondaryBackground`}
          style={{ boxShadow: "-2px 0px 6px 0px #00000040" }}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold uppercase">
              {teamSpace ? "add team member" : "add organization member"}
            </h2>
            <X
              onClick={() => handleDrawerClose()}
              className="cursor-pointer"
              color="#9A9A9A"
              width={20}
              height={20}
            />
          </div>
          <br />

          {teamSpace ? (
            <Popover open={open} onOpenChange={setOpen}>
              <Label className="text-[11px] font-semibold mb-1">
                SELECT EMAIL
              </Label>
              <PopoverTrigger asChild>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between hover:bg-inputBackground border border-tableBorder  relative h-auto min-h-10 flex items-center rounded-md  bg-inputBackground px-3 py-2 text-sm "
                  >
                    <div className="flex flex-wrap gap-1 ">
                      {selectedValues.length === 0 ? (
                        <span className="text-[#666666] dark:text-[#93a1b6] font-light ">
                          Select email
                        </span>
                      ) : (
                        selectedValues.map(
                          (option: { id: string; email: string }) => (
                            <div
                              key={option.email}
                              className="bg-blue-100 dark:bg-[#1f2d32]  border border-tableBorder text-[#0f6fff] rounded px-1 py-0.5 text-[11px] flex items-center gap-1"
                            >
                              {option.email}
                              <X
                                className="h-3 w-3 hover:text-red-500 cursor-pointer"
                                onClick={(e) => removeValue(option, e)}
                              />
                            </div>
                          )
                        )
                      )}
                    </div>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                  </Button>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-inputBackground"
                align="start"
              >
                {filteredOptions.length > 0 && (
                  <div className="p-2">
                    <Label className="text-[11px] pt-2 font-semibold mb-1 uppercase ">
                      Add Existing Members
                    </Label>
                    <Input
                      placeholder="Search email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-[13px] font-normal bg-inputBackground border outline-none border-tableBorder text-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                )}
                <div className="">
                  <div className="p-2 space-y-1">
                    {memberLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader variant="threeDot" size="lg" />
                      </div>
                    ) : (
                      <div className="space-y-4 ">
                        <div className=" max-h-[180px] overflow-y-auto">
                          {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-500">
                              No emails found
                            </div>
                          ) : (
                            filteredOptions.map((option) => {
                              const isSelected = selectedValues.find(
                                (el) => el.email === option.email
                              );
                              return (
                                <div
                                  key={option.EmailSelectedFIlters}
                                  className={`flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer
                        ${
                          isSelected
                            ? "bg-blue-50  dark:bg-[#1f2d32]"
                            : "hover:bg-gray-100 dark:hover:bg-[#2d3c42]"
                        }`}
                                  onClick={() => toggleOption(option)}
                                >
                                  <div
                                    className={`flex h-4 w-4 items-center justify-center rounded-sm border
                        ${
                          isSelected
                            ? "bg-blue-500 border-[#0f6fff]"
                            : "border-gray-300"
                        }`}
                                  >
                                    {isSelected && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <span
                                    className={`
                                font-medium text-[11px]
                                text-[#666666] dark:text-[#999999]
                               ${isSelected && "text-[#0f6fff]"}
                                `}
                                  >
                                    {option.email}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <hr className=" border border-tableBorder " />
                        <div className=" ">
                          <Label className="text-[11px] font-semibold mb-1 uppercase ">
                            Add External Members
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="Email"
                              className="text-[13px] font-normal bg-inputBackground border outline-none border-tableBorder text-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <Button
                              className="rounded-md btn text-white h-[32px]"
                              onClick={() => {
                                if (newEmail) {
                                  toggleOption({
                                    id: newEmail,
                                    email: newEmail,
                                  });
                                  setNewEmail("");
                                }
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="pt-6">
              <Label className="text-[11px] font-semibold mb-1">EMAIL</Label>
              <Input
                {...register("email", {
                  required: "Email is required",
                })}
                placeholder="Email"
                className="text-[13px] font-normal bg-inputBackground border outline-none border-tableBorder text-foreground"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors?.email?.message as string}
                </p>
              )}
            </div>
          )}

          {teamSpace && (
            <>
              <div className="pt-6">
                <Label className="text-[11px] font-semibold mb-1">
                  USER ROLE
                </Label>
                <Select
                  onValueChange={(value: any) => {
                    setValue("role", value, { shouldValidate: true });
                    trigger("role");
                  }}
                  {...register("role", { required: "User role is required" })}
                  value={role}
                >
                  <SelectTrigger className="text-[13px] font-normal outline- bg-inputBackground border outline-none border-tableBorder text-foreground cursor-pointer py-[.6rem] px-3 rounded flex justify-between items-center focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
                    <div className="flex items-center gap-1">
                      <h1 className="text-[13px] text-muted-foreground  font-normal mb-1 capitalize">
                        {role?.replace(/_/g, " ") || "Please select a role"}
                      </h1>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="p-2 bg-inputBackground text-muted-foreground  border border-tableBorder rounded-md w-full shadow-lg">
                    <SelectItem value="team_owner">Team Owner</SelectItem>
                    <SelectItem value="team_member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.role?.message as string}
                  </p>
                )}
              </div>

              <div className="pt-6 flex justify-between">
                <Label className="text-[11px] font-semibold mb-1">
                  USER STATUS
                </Label>
                <div className="flex items-center gap-2">
                  <div className="text-[11px] font-semibold mb-1">Active</div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      {...register("is_team_member_active")}
                      defaultChecked={true}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 justify-end items-center py-6">
            <Button
              className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] text-[13px] h-[32px]"
              variant={"outline"}
              onClick={() => handleDrawerClose()}
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              type="submit"
              className={`rounded-[26px] btn text-white text-[13px] h-[32px]`}
            >
              {isLoading ? (
                <AiOutlineLoading className="animate-spin" size={20} />
              ) : (
                "Save & Invite"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMemberDrawer;

const Avatar = () => (
  <svg
    width="104"
    height="102"
    viewBox="0 0 104 102"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50.2842" r="50" fill="#F2F2F2" />
    <g clip-path="url(#clip0_1034_4251)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M51 0.28418C79.1478 0.28418 102 22.9124 102 50.7842C102 78.656 79.1478 101.284 51 101.284C22.8522 101.284 0 78.656 0 50.7842C0 22.9124 22.8522 0.28418 51 0.28418ZM85.5398 81.9679C84.3413 80.2804 82.2588 79.2157 78.6377 78.3908C62.2838 74.5781 61.2255 72.0741 60.1418 69.7259C59.041 67.3482 59.3343 64.5496 61.013 61.406C68.3485 47.6995 69.8955 36.055 65.3778 28.6231C62.5133 23.914 57.409 21.3258 51 21.3258C44.5358 21.3258 39.389 23.9603 36.5117 28.7451C31.9812 36.2738 33.5665 47.8678 40.97 61.3892C42.6785 64.5118 42.993 67.3061 41.905 69.6964C40.7787 72.1625 39.3083 74.7043 23.3538 78.3908C19.7327 79.2157 17.6502 80.2804 16.456 81.9595C25.007 91.2473 37.3235 97.0759 51 97.0759C64.6765 97.0759 76.9888 91.2473 85.5398 81.9679ZM88.3023 78.677C94.231 70.9168 97.75 61.2545 97.75 50.7842C97.75 25.2354 76.8018 4.49251 51 4.49251C25.1982 4.49251 4.25 25.2354 4.25 50.7842C4.25 61.2503 7.76475 70.9126 13.6935 78.6686C15.4317 76.7664 18.1517 75.2598 22.4017 74.2877C31.008 72.3435 36.7498 70.7696 38.0333 67.9668C38.5518 66.8221 38.2925 65.324 37.2342 63.3923C29.087 48.5159 27.5357 35.4448 32.8568 26.5905C36.482 20.5683 43.0908 17.1175 51 17.1175C58.8413 17.1175 65.4118 20.5178 69.02 26.4516C74.3367 35.2007 72.828 48.3139 64.77 63.3755C63.7287 65.324 63.478 66.8306 64.0092 67.9794C65.3055 70.7906 70.9963 72.3477 79.594 74.2877C83.844 75.2556 86.564 76.7706 88.3023 78.677Z"
        fill="#CCCCCC"
      />
    </g>
    <circle
      cx="87"
      cy="84.5684"
      r="15.5"
      fill="#0E70FF"
      stroke="white"
      stroke-width="3"
    />
    <path
      d="M87 85.0077L90.182 88.1897L89.1213 89.2503L87.75 87.8796V92.0684H86.25V87.8781L84.8787 89.2503L83.818 88.1897L87 85.0077ZM87 77.0684C89.6951 77.0684 91.9158 79.0991 92.2156 81.7138C93.9644 82.192 95.25 83.7926 95.25 85.6934C95.25 87.845 93.6027 89.6118 91.5005 89.8016L91.5007 88.2917C92.7725 88.1094 93.75 87.0155 93.75 85.6934C93.75 84.2436 92.5748 83.0684 91.125 83.0684C90.9684 83.0684 90.815 83.0821 90.6665 83.1089C90.7212 82.854 90.75 82.5895 90.75 82.3184C90.75 80.2473 89.0711 78.5684 87 78.5684C84.9289 78.5684 83.25 80.2473 83.25 82.3184C83.25 82.5895 83.2788 82.854 83.334 83.1083C83.185 83.0821 83.0316 83.0684 82.875 83.0684C81.4253 83.0684 80.25 84.2436 80.25 85.6934C80.25 86.9686 81.1593 88.0314 82.3649 88.2689L82.5 88.2918L82.5003 89.8016C80.3977 89.6123 78.75 87.8453 78.75 85.6934C78.75 83.7926 80.0357 82.192 81.7849 81.7139C82.0842 79.0991 84.305 77.0684 87 77.0684Z"
      fill="white"
    />
    <defs>
      <clipPath id="clip0_1034_4251">
        <rect
          width="102"
          height="101"
          fill="white"
          transform="translate(0 0.28418)"
        />
      </clipPath>
    </defs>
  </svg>
);
