"use client";

import { MdOutlineEmail } from "react-icons/md";
import { FiEyeOff } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import { Si2Fas } from "react-icons/si";
import Cookies from "js-cookie";
import { ImCheckboxUnchecked } from "react-icons/im";
import { ImCheckboxChecked } from "react-icons/im";
import LayoutBar from "@/components/LayoutBar/LayoutBar";
import ThemeInput from "@/components/ui/ThemeInput";
import RoundButton from "@/components/ui/RoundButton";
import { Label } from "@/components/ui/label";
import { logout } from "@/reducer/auth/authSlice";
import { emptyRolesAndGoals } from "@/reducer/roles_goals/rolesGoals";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../reducer/store";
import { useForm } from "react-hook-form";
import OAuthForm from "../signup/OAuthForm";
import { signInApi, verify2FAApi, encryptPassword } from "@/apis/user";
import MESSAGES from "@/constant/Messages";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface FormValues {
  email: string;
  password: string;
  two_factor_otp: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [checkReminder, setCheckReminder] = useState<boolean>(false);
  const user = useSelector((state: any) => state.user?.user?.user);
  const [currentuser, setCurrentUser] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const dispatche: AppDispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const redirect = searchParams.get("redirect");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    setValue,
    watch,
    trigger,
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const storedUsername: string | undefined = Cookies.get("username");
    const storedPassword: string | undefined = Cookies.get("password");
    if (storedUsername && storedPassword) {
      const finalPassword: string = encryptPassword(storedPassword as string);
      setValue("email", storedUsername);
      setValue("password", finalPassword);
    }
  }, []);

  useEffect(() => {
    const userToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (userToken) {
      if (user) {
        if (user.is_user_plan_active === true) {
          if (
            !user?.research_interests ||
            user?.research_interests === null ||
            user?.research_interests?.length === 0
          ) {
            router.push("/main-topic-explorer");
          } else if (search) {
            router.push(`${search}`);
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/account/subscriptions");
        }
      }
    } else {
      if (user?.id) {
        dispatche(logout());
        dispatche(emptyRolesAndGoals());
      }
    }
  }, [user]);
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (data?.two_factor_otp) {
        const result = await dispatch(
          verify2FAApi({
            email: currentuser?.email,
            otp: data?.two_factor_otp,
            checkReminder,
          })
        );
        if (verify2FAApi.fulfilled.match(result)) {
          const resultData = result.payload as {
            token?: string;
            refreshToken?: string;
            [key: string]: any;
          };
          if (resultData.token) {
            toast.success(MESSAGES.SUCCESSFULL_LOGIN);
          }
        } else if (verify2FAApi.rejected.match(result)) {
          const error: any = result.payload as
            | { message?: string; code?: string }
            | undefined;
          toast.error(error?.message);
        }
      } else {
        const result = await dispatch(signInApi({ data: data, checkReminder }));
        if (result.payload.step === "2FA_REQUIRED") {
          setCurrentUser(result.payload.user);
        } else {
          if (signInApi.fulfilled.match(result)) {
            const resultData = result.payload as {
              token?: string;
              refreshToken?: string;
              [key: string]: any;
            };
            setCurrentUser(null);
            if (resultData.token) {
              if (redirect) {
                router.push(redirect);
              } else {
                toast.success(MESSAGES.SUCCESSFULL_LOGIN);
              }
            }
          } else if (signInApi.rejected.match(result)) {
            const error: any = result.payload as
              | { message?: string; code?: string }
              | undefined;
              if (error?.message && /password/i.test(error.message)) {
                setError("password", { message: "Invalid password." });
              }
            toast.error(error?.message);
          }
        }
      }
    } catch (error) {
      let errorMessage = MESSAGES.UNKNOWN_ERROR;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const manageViewPassword = () => {
    setShowPassword(!showPassword);
  };
  const manageReminder = () => {
    setCheckReminder(!checkReminder);
  };

  const removeSpaces = (value: string): string => value.replace(/\s+/g, " ");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

  const email = watch("email");
  const password = watch("password");

  useEffect(() => {
    if (isSubmitted && errors.email && email) {
      trigger("email");
    }
  }, [email, errors, trigger]);

  useEffect(() => {
    if (isSubmitted && errors.password && password) {
      trigger("password");
    }
  }, [password, errors, trigger]);

  return (
    <>
      <LayoutBar>
        <div className="rounded-bl-[12px] sm:rounded-bl-[0px] bg-[#39393933] backdrop-blur-[12px] flex sm:px-[76px] px-[16px] py-[25.5px] sm:py-[44.5px] rounded-tr-[12px] md:rounded-tr-[12px] md:rounded-br-[12px] sm:rounded-tr-[0px] rounded-br-[12px] sm:rounded-br-[0px] h-full">
          <div className="min-w-full">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-[23.5px]">
                <h1
                  className={`font-poppins text-[28px] text-center sm:text-left ${
                    !currentuser ? "font-medium" : "leading-[42px]"
                  } text-left mb-8 text-[#E5E5E5] font-poppins text-2xl ${
                    currentuser ? "text-2xl" : "text-3xl"
                  }`}
                >
                  {currentuser
                    ? "Enter Your Two-Factor Authentication Token"
                    : "Welcome Back"}
                </h1>
                {!currentuser ? (
                  <>
                    <div className="mb-5">
                      <ThemeInput
                        placeholder="Email"
                        register={{
                          ...register("email", {
                            required: "Email is required.",
                            pattern: {
                              value: emailRegex,
                              message: "Please enter a valid email address.",
                            },
                          }),
                        }}
                        onChange={(e) => {
                          const cleanedValue = e.target.value.replace(
                            /\s/g,
                            ""
                          );
                          setValue("email", cleanedValue, {
                            shouldValidate: true,
                          });
                        }}
                        StartAdornment={() => (
                          <MdOutlineEmail
                            color="white"
                            style={{ height: "22px", width: "22px" }}
                          />
                        )}
                      />
                      {isSubmitted && errors.email && (
                        <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="mb-5">
                      <ThemeInput
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        StartAdornment={() => (
                          <FiLock
                            color="white"
                            style={{ height: "22px", width: "22px" }}
                          />
                        )}
                        EndAdornment={() => {
                          return showPassword ? (
                            <FiEye
                              style={{
                                color: "#CCCCCC",
                                height: "22px",
                                width: "22px",
                                cursor: "pointer",
                              }}
                              onClick={manageViewPassword}
                            />
                          ) : (
                            <FiEyeOff
                              style={{
                                color: "#CCCCCC",
                                height: "22px",
                                width: "22px",
                                cursor: "pointer",
                              }}
                              onClick={manageViewPassword}
                            />
                          );
                        }}
                        register={{
                          ...register("password", {
                            required: "Password is required.",
                            // pattern: {
                            //   value: passwordRegex,
                            //   message:
                            //     "Invalid password.",
                            // },
                            // minLength: {
                            //   value: 8,
                            //   message:
                            //     "Password must be at least 8 characters long.",
                            // },
                          }),
                        }}
                        onChange={(e) => {
                          const cleanedValue = e.target.value.replace(
                            /\s/g,
                            ""
                          );
                          setValue("password", cleanedValue, {
                            shouldValidate: true,
                          });
                        }}
                      />
                      {isSubmitted && errors.password && (
                        <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center text-[#CCCCCC] flex-col sm:flex-row">
                      <Label className="font-poppins text-sm font-normal leading-[19.5px] text-left items-center text-center flex w-full sm:w-max">
                        {checkReminder ? (
                          <ImCheckboxChecked
                            color="#999999"
                            onClick={manageReminder}
                            className="cursor-pointer h-4 w-4 mr-2"
                          />
                        ) : (
                          <ImCheckboxUnchecked
                            color="#999999"
                            onClick={manageReminder}
                            className="cursor-pointer h-4 w-4 mr-2"
                          />
                        )}
                        Remember me
                      </Label>

                      <Link
                        href="/forgot-password"
                        className="sm:ml-auto inline-block text-sm mt-3 sm:mt-0 w-full sm:w-max text-left"
                      >
                        <label className="font-poppins text-sm font-semibold leading-[19.5px] text-left cursor-pointer">
                          Forgot password?
                        </label>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="mb-5">
                    <ThemeInput
                      placeholder="Please enter your Two-Factor Authentication Token"
                      type={"text"}
                      StartAdornment={() => (
                        <Si2Fas
                          color="white"
                          style={{ height: "22px", width: "22px" }}
                        />
                      )}
                      register={{
                        ...register("two_factor_otp", {
                          required:
                            "Two-Factor Authentication Token is required",
                        }),
                      }}
                    />
                    {errors.two_factor_otp && (
                      <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                        {errors.two_factor_otp.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-5 sm:mt-10 mb-10">
                  <RoundButton
                    type="submit"
                    label={"Login"}
                    isLoading={isLoading}
                    onClick={() => {
                      trigger();
                    }}
                  />
                </div>
              </div>
            </form>
            {!currentuser && (
              <div>
                <Label className="text-[#E5E5E5] font-poppins text-[13px] font-normal leading-[19.5px] text-left">
                  Or Sign In With
                </Label>
                <div className="mt-6 mb-6 flex justify-center gap-4">
                  <OAuthForm />
                </div>
                <label>
                  <Label className="text-[#E5E5E5] font-poppins text-[13px] font-normal leading-[19.5px] text-left tracking-[1px]">
                    Don&apos;t have an account?
                    <span className="font-poppins text-[13px] font-semibold leading-[19.5px] text-left cursor-pointer">
                      &nbsp; <Link href="/signup">Sign up here</Link>
                    </span>
                  </Label>
                </label>
              </div>
            )}
          </div>
        </div>
      </LayoutBar>
    </>
  );
}
