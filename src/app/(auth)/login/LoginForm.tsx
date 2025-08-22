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
   <div className="flex items-center justify-center h-full w-full px-4 py-8">
      <div className="w-full max-w-md bg-white space-y-6">

        {/* Logo & Brand */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />
            <span className="text-4xl font-bold text-black">AIScholarix</span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600 font-medium text-base">Login to continue your research journey</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <MdOutlineEmail size={20} />
            </span>
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              {...register("email", {
                required: "Email is required",
                pattern: { value: emailRegex, message: "Invalid email address" },
              })}
              onChange={(e) => {
                const cleanedValue = e.target.value.replace(/\s/g, "");
                setValue("email", cleanedValue, { shouldValidate: true });
              }}
            />
            {isSubmitted && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <FiLock size={20} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              {...register("password", { required: "Password is required" })}
              onChange={(e) => {
                const cleanedValue = e.target.value.replace(/\s/g, "");
                setValue("password", cleanedValue, { shouldValidate: true });
              }}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={manageViewPassword}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
            {isSubmitted && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot */}
          <div className="flex justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={checkReminder}
                onChange={manageReminder}
                className="form-checkbox text-black"
              />
              <span className="text-black">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-black underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition"
            onClick={() => trigger()}
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="text-center text-sm text-gray-500">Or Sign In With</div>

        {/* Google Auth */}
        <div className="flex justify-center">
          <OAuthForm />
        </div>

        {/* Sign up prompt */}
        <p className="text-center text-sm text-black">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-semibold underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
