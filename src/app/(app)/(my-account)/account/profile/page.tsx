"use client";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiOutlineLoading } from "react-icons/ai";
import UserProfileIcon from "@/images/userProfileIcon/userProfile";
import Security from "@/images/userProfileIcon/security";
import UploadUserProfile from "@/images/userProfileIcon/uploadUserProfile";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import toast from "react-hot-toast";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import { findById, updateUserProfile } from "@/apis/user";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import { Skeleton } from "@/components/ui/skeleton";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  newPassword: string;
  image?: FileList;
  is_two_factor_enabled: boolean;
}

const UserProfile: any = ({ isDarkMode }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [isSocialInfo, setIsSocialInfo] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const userData = useSelector(
    (state: any) => state?.user?.user?.user,
    shallowEqual
  );
  const [loading, setLoading] = useState(false);
  const [enable2FALoading, setEnable2FALoading] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    mode: "onChange",
  });
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,30}$/;

  useEffect(() => {
    async function getUser() {
      try {
        setUserLoading(true);
        const UserInfo = await findById(userData?.id);
        setIsSocialInfo(!!UserInfo?.data?.data?.isSocialLogin);
        setValue("email", userData?.email);
        setValue("first_name", userData?.first_name);
        setValue("last_name", userData?.last_name);
        setValue("is_two_factor_enabled", userData?.is_two_factor_enabled || false);
      } catch (error) {
        console.log("error", error);
      } finally {
        setUserLoading(false);
      }
    }
    if (userData?.id) {
      getUser();
    }
  }, [userData, setValue]);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  const handleFileChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file?.name;
      const invalidCharactersRegex = /^[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
      
      if (!invalidCharactersRegex.test(fileName)) {
        try {
          toast.error("Invalid filename. Use only letters, numbers, hyphens (-), and underscores (_).");
        } catch (error) {
          console.log("error", error);
        }
        event.target.value = "";
        return;
      }
      const validFormats = ["image/jpeg", "image/png", "image/gif"];
      if (!validFormats.includes(file.type)) {
        toast.error("Only JPG, PNG, and GIF formats are allowed.");
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue("image", event.target.files || {});
    }
  };
  const onSubmit: SubmitHandler<FormData> = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    newPassword: string;
    is_two_factor_enabled: boolean;
    image?: any;
  }) => {
    if (isPasswordChanged && !showModal) {
      setShowModal(true);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append(
      "is_two_factor_enabled",
      data.is_two_factor_enabled.toString()
    );
    if (data.password) formData.append("password", data.password);
    if (data.newPassword) formData.append("newPassword", data.newPassword);
    if (data.image && data.image[0]) formData.append("image", data.image[0]);
    try {
      const response = await updateUserProfile(formData);
      if (response) {
        setLoading(false);
        toast.success(response?.data?.message);
        reset();
        dispatch(updateUserPlan(response?.data?.user));
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  const enable2FA = async () => {
    setEnable2FALoading(true);
    const formData = new FormData();

    formData.append("is_two_factor_enabled", true.toString());

    try {
      const response = await updateUserProfile(formData);
      if (response) {
        setVerifyEmailOpen(false);
        toast.success(
          "Two-Factor Authentication has been enabled on your account"
        );
        dispatch(updateUserPlan(response?.data?.user));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setEnable2FALoading(false);
    }
  };
  const handlePasswordChange = (e: any) => {
    e.target.value !== ""
      ? setIsPasswordChanged(true)
      : setIsPasswordChanged(false);
  };
  const confirmPasswordChange = () => {
    setIsPasswordChanged(false);
    setShowModal(false);
    handleSubmit(onSubmit)();
  };

  const cancelPasswordChange = () => {
    setIsPasswordChanged(false);
    setShowModal(false);
  };

  const user = {
    name: "Ronald Richards",
    role: "Researcher",
    status: "Active",
    lastActive: "2 hours ago",
  };
  const isTwoFactorAuthEnabled = watch("is_two_factor_enabled");
  const userProfile =
    "https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/files/1735982935879-images.png";
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-secondaryBackground p-6 rounded-lg max-w-sm w-full">
            <p className="font-semibold mb-4">
              Are you sure you want to change your password?
            </p>
            <div className="flex justify-between gap-4">
              <Button
                onClick={cancelPasswordChange}
                className="w-1/2 bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPasswordChange}
                className="w-1/2 bg-blue-500"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      {userLoading ? (
        <div className="w-full flex lg:flex-row flex-col justify-center items-center lg:items-start gap-4 mr-4 max-w-[calc(100%-32px)] mx-auto">
          <div className="w-11/12 lg:w-1/3 py-4 border border-borderColor rounded-lg bg-bgGray">
            <div className="w-full flex flex-col items-center px-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="h-4 w-32 mt-4" />
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between my-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <hr className="border-b border-borderColor" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 px-4 h-auto">
            <div className="border border-borderColor rounded-lg p-4 mb-4 bg-bgGray">
              <div className="flex gap-2 items-center mb-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-4 w-24" />
              </div>
              <hr className="border-b border-borderColor" />
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <div className="border border-borderColor rounded-lg p-4 bg-bgGray">
              <div className="flex gap-2 items-center mb-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-4 w-40" />
              </div>
              <hr className="border-b border-borderColor" />
              <div className="mt-2">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-11" />
                </div>
                <hr className="border-b border-borderColor" />
                <div className="mt-2">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <hr className="border-b border-borderColor" />
                <div className="mt-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex lg:flex-row flex-col justify-center items-center lg:items-start gap-4 mr-4 max-w-[calc(100%-32px)] mx-auto"
        >
          <div className="w-11/12 lg:w-1/3  py-4 border border-borderColor rounded-lg bg-bgGray">
            <div className="w-full flex flex-col items-center px-4">
              <div className="relative w-20 h-20">
                <div
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="absolute inset-0 cursor-pointer"
                >
                  <OptimizedImage
                    src={uploadedImage || userData?.profile_image || userProfile ||`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//dummyImg.png`}
                    alt="User"
                    width={ImageSizes.logo.md.width}
                    height={ImageSizes.logo.md.height}
                    className="object-cover !w-full !h-full border-2 rounded-full border-[#0e70ff]"
                  />
                </div>

                <div className="absolute bottom-0 right-2 bg-textColor rounded-full shadow-md">
                  <div className="relative inline-block bg-[#0e70ff] border-white border-2 border-darkBlue p-1 rounded-full">
                    <Input
                      type="file"
                      id="file-upload"
                      className="absolute opacity-0 cursor-pointer w-full h-full rounded-full"
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple={false}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center cursor-pointer"
                    >
                      <UploadUserProfile />
                    </label>
                  </div>
                </div>
              </div>

              <p className="mt-4 font-size-large font-size-small text-lightGray">
                {userData && userData?.first_name}{" "}
                {userData && userData?.last_name}
              </p>

              <div className="mt-4 w-full">
                <p className="w-full flex items-center justify-between my-4">
                  <span className="font-size-normal font-normal text-darkGray">
                    User Role
                  </span>
                  <span className="font-size-normal font-normal text-lightGray">
                    {userData?.account_type}
                  </span>
                </p>
                <hr className="border-b border-borderColor" />
                <p className="w-full flex items-center justify-between mt-4">
                  <span className="font-normal font-size-normal text-darkGray">
                    Status
                  </span>
                  <span
                    className={`ml-2 py-1 px-2 rounded-full font-size-medium-large ${user.status === "Active"
                      ? "bg-[#079E281F] text-[#079E28]"
                      : ""
                      }`}
                  >
                    {user.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 px-4 h-auto">
            <div className="border border-borderColor rounded-lg p-4 mb-4 bg-bgGray">
              <p className="mb-4 flex gap-2 items-center">
                <UserProfileIcon isDarkMode={isDarkMode} />
                <span className="font-size-medium font-medium text-lightGray">
                  User Info
                </span>
              </p>
              <hr className="border-b border-borderColor" />
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="font-size-small mb-2 font-semibold text-darkGray">
                    First Name
                  </p>
                  <Input
                    id="first-name"
                    {...register("first_name", {
                      required: "First name is required",
                    })}
                    className="pl-4 bg-inputBg border border-inputBorder"
                    placeholder="Enter"
                  />

                  {errors.first_name && (
                    <p className="text-primaryRed font-normal font-size-normal mt-1.5">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-size-small mb-2 font-semibold text-darkGray">
                    Last Name
                  </p>
                  <Input
                    {...register("last_name", {
                      required: "Last name is required",
                    })}
                    id="last-name"
                    placeholder="Enter"
                    className="bg-inputBg border border-inputBorder"
                  />

                  {errors.last_name && (
                    <p className="text-primaryRed font-normal font-size-normal mt-1.5">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="font-size-small mb-2 font-semibold text-darkGray">
                    Email
                  </p>
                  <Input
                    id="email"
                    placeholder="Enter"
                    {...register("email")}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-300 dark:text-white text-black border border-inputBorder"
                  />
                  {errors.email && (
                    <p className="text-primaryRed font-normal font-size-normal mt-1.5">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              {isSocialInfo && (
                <div className="w-full flex justify-end mt-4">
                  <Button
                    type="submit"
                    className="btn text-white rounded-full font-size-large"
                  >
                    {loading ? (
                      <AiOutlineLoading className="animate-spin" size={20} />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              )}
            </div>
            {isSocialInfo ? null : (
              <div className="border border-borderColor rounded-lg p-4 bg-bgGray">
                <p className="mb-4 flex gap-2 items-center">
                  <Security isDarkMode={isDarkMode} />
                  <span className="font-size-medium font-medium text-lightGray">
                    Security & Password
                  </span>
                </p>

                <hr className="border-b border-borderColor" />

                <div className="mt-2">
                  <div className="w-full flex justify-between items-center mb-4">
                    <p className="font-size-normal font-normal text-darkGray">
                      Two Factor Authentication
                    </p>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        disabled={isSocialInfo}
                        type="checkbox"
                        className="sr-only peer "
                        {...register("is_two_factor_enabled", {
                          onChange: (e: any) => {
                            setVerifyEmailOpen(e.target.checked);
                          },
                        })}
                      />

                      {isTwoFactorAuthEnabled ? (
                        <span className="ms-3 font-size-md mr-3 text-darkGray">
                          Enabled
                        </span>
                      ) : (
                        <span className="ms-3 font-size-md mr-3 text-darkGray">
                          Disabled
                        </span>
                      )}

                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#079E28]"></div>
                    </label>
                  </div>

                  {isSocialInfo ? null : (
                    <hr className="border-b border-borderColor" />
                  )}

                  {isSocialInfo ? null : (
                    <div className="mt-2">
                      <p className="font-size-small font-semibold mb-2 text-darkGray">
                        Current Password
                      </p>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          disabled={isSocialInfo}
                          autoComplete="new-password"
                          placeholder="Enter your current password "
                          {...register("password")}
                          className={
                            isSocialInfo
                              ? "bg-gray-100 dark:bg-gray-300 text-black border border-inputBorder"
                              : "mb-4 bg-inputBg border border-inputBorder"
                          }
                        />
                        <span
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={toggleCurrentPasswordVisibility}
                        >
                          {showCurrentPassword ? (
                            <IoEyeOffOutline
                              size={24}
                              className="text-darkGray"
                            />
                          ) : (
                            <IoEyeOutline size={24} className="text-darkGray" />
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <hr className="border-b border-borderColor" />

                  {
                    <div className="mt-4">
                      <p className="font-size-small font-semibold mb-2 text-darkGray">
                        New Password
                      </p>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          autoComplete="off"
                          disabled={isSocialInfo}
                          className={
                            isSocialInfo
                              ? "bg-gray-100 dark:bg-gray-300 text-black border border-inputBorder"
                              : "mb-4 bg-inputBg border border-inputBorder"
                          }
                          {...register("newPassword", {
                            validate: (value) => {
                              const currentPassword = watch("password");
                              if (!currentPassword) {
                                return true;
                              }

                              if (value === currentPassword) {
                                return "New password cannot be the same as current password";
                              }

                              if (!passwordRegex.test(value)) {
                                return "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.";
                              }

                              return true;
                            },
                            pattern: {
                              value: passwordRegex,
                              message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
                            },
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters long.",
                            },
                            maxLength: {
                              value: 30,
                              message: "Password cannot exceed 30 characters.",
                            },
                            onChange: (e: any) => {
                              const cleanedValue = e.target.value.replace(/\s/g, '');
                              setValue("newPassword", cleanedValue, { shouldValidate: true });
                              handlePasswordChange(e);
                            },
                          })}
                        />
                        <span
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <IoEyeOffOutline
                              size={24}
                              className="text-darkGray"
                            />
                          ) : (
                            <IoEyeOutline size={24} className="text-darkGray" />
                          )}
                        </span>
                      </div>
                      {errors.newPassword && (
                        <p className="text-primaryRed font-normal font-size-normal mt-1.5 bg-red-50 p-2 rounded">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>
                  }
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    className="btn text-white rounded-full font-size-large"
                  >
                    {loading ? (
                      <AiOutlineLoading className="animate-spin" size={20} />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      <Dialog
        open={verifyEmailOpen}
        onOpenChange={(item: any) => {
          setVerifyEmailOpen(item);
          setValue(
            "is_two_factor_enabled",
            userData?.is_two_factor_enabled || false
          );
        }}
      >
        <DialogContent className="sm:max-w-md">
          <Card className="border-0 shadow-none bg-tableHeaderBackground">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-size-3xl font-medium ">
                  Verify Your Email
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>{`To enable Two-Factor Authentication, you'll need to verify your email address. Please confirm your email and click the "Confirm" button to apply this security enhancement to your account.`}</p>

                <div className="bg-gray-100 dark:bg-gray-300 text-black p-3 rounded-md text-center">
                  <p className="font-medium">{userData?.email}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="btn text-white rounded-full font-size-large ml-auto"
                onClick={() => enable2FA()}
                disabled={enable2FALoading}
              >
                {enable2FALoading ? (
                  <AiOutlineLoading className="animate-spin" size={20} />
                ) : (
                  "Confirm"
                )}
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;
