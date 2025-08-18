"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import { AppDispatch, RootState } from "@/reducer/store";
import { FaCoins } from "react-icons/fa";
import { logout } from "@/reducer/auth/authSlice";
import localStorageService from "@/utils/localStorage";
import sessionStorageService from "@/utils/sessionStorage";
import { useDispatch, useSelector } from "react-redux";
import { MdKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Headset } from "lucide-react";
import { GiClassicalKnowledge } from "react-icons/gi";
import Cookies from "js-cookie";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

export default function UserMenu() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [open, setOpen] = useState(false);
  const { subscriptionData } = useSelector(
    (state: RootState) => state.subscription ?? {}
  );
  const params = new URLSearchParams(window.location.search);
  const login = params.get("login");
  const userData = useSelector((state: any) => state?.user?.user?.user);
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (userData) {
      const fullName = userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : userData.first_name;
      setUserName(fullName);
      setUserEmail(userData.email);
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      router.push("/login");

      {
        login && dispatch(logout());
        localStorageService.clear();
        sessionStorageService.clear();
        sessionStorage.clear();
        Cookies.remove("lastApiCall");
      }
    } catch (error) {
      console.error("Logout error:", error);
      localStorageService.clear();
      sessionStorageService.clear();
      sessionStorage.clear();
      Cookies.remove("lastApiCall");
      router.push("/login");
    }
  };
  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        tw-ring-offset-width
        className="focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none"
      >
        <Button
          variant="secondary"
          size="icon"
          className="bg-transparent h-auto w-auto rounded-full p-0 flex items-center gap-2"
        >
          {userData && userData.profile_image ? (
            <OptimizedImage
              src={userData.profile_image}
              alt="User"
              width={ImageSizes.avatar.md.width}
              height={ImageSizes.avatar.md.height}
              className="object-cover h-10 w-10 rounded-full border-1 border-[#0e70ff]"
              loading="lazy"
              quality={75}
              priority={false}
              sizes="(max-width: 768px) 40px, 40px"
            />
          ) : (
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <UserAvatar />
            </div>
          )}
          <MdKeyboardArrowDown className="text-[#0E70FF] font-bold text-xl" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={`p-3 bg-profileDropDown  mt-3`}
        onMouseLeave={handleMouseLeave}
        onClick={handleMouseLeave}
      >
        <DropdownMenuItem>
          <div className="flex flex-col space-y-1 mb-2 text-left">
            <span className="font-size-mediumup text-lightGray font-normal">
              {userName}
            </span>
            <span className="text-lightGray font-size-normal font-normal">
              {userEmail}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="text-lightGray" />
        <DropdownMenuItem
          className={`${
            userData?.research_interests?.length > 0
              ? "cursor-pointer"
              : "cursor-not-allowed"
          } `}
          onClick={() =>
            userData?.research_interests?.length > 0
              ? router.push("/account/ai-credits")
              : {}
          }
        >
          <div className="flex items-center space-x-3 w-full">
            <FaCoins
              className="inline"
              size={16}
              style={{ color: "#9b9ea2" }}
            />
            <span
              className={`text-lightGray  ${
                userData?.research_interests?.length > 0
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              } font-normal font-size-normal`}
            >
              {Math.max(
                0,
                (subscriptionData?.data?.credit_limit ?? 0) +
                  (subscriptionData?.data?.bonusCredits ?? 0) +
                  (subscriptionData?.data?.refferal_credits ?? 0) +
                  (subscriptionData?.data?.addOnCredits ?? 0) -
                  (subscriptionData?.data?.credit ?? 0)
              ) || 0}
              &nbsp; Credits
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${
            userData?.research_interests?.length > 0
              ? "cursor-pointer"
              : "cursor-not-allowed"
          } `}
          onClick={() =>
            userData?.research_interests?.length > 0
              ? router.push("/account")
              : {}
          }
        >
          <div className="flex items-center space-x-3 w-full">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//userdrop.svg`}
              alt="User icon"
              width={12}
              height={16}
              className="h-4 w-3"
              loading="lazy"
              quality={75}
            />
            <span
              className={`text-lightGray  ${
                userData?.research_interests?.length > 0
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              } font-normal font-size-normal`}
            >
              My Account
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${
            userData?.research_interests?.length > 0
              ? "cursor-pointer"
              : "cursor-not-allowed"
          } `}
          onClick={() =>
            userData?.research_interests?.length > 0
              ? router.push("/account/usage-statistic")
              : {}
          }
        >
          <div className={`flex items-center space-x-2`}>
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//dropwave.svg`}
              alt="Wave icon"
              width={16}
              height={16}
              className="h-4 w-4"
              loading="lazy"
              quality={75}
            />
            <span
              className={`text-lightGray font-normal font-size-normal ${
                userData?.research_interests?.length > 0
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              } `}
            >
              Activity Log
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${
            userData?.research_interests?.length > 0
              ? "cursor-pointer"
              : "cursor-not-allowed"
          } `}
          onClick={() =>
            userData?.research_interests?.length > 0
              ? router.push("/account/subscriptions")
              : {}
          }
        >
          <div className="flex items-center space-x-2">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//dropplain.svg`}
              alt="Plain icon"
              width={16}
              height={16}
              className="h-4 w-4"
              loading="lazy"
              quality={75}
            />
            <span
              className={`text-lightGray  ${
                userData?.research_interests?.length > 0
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              } font-normal font-size-normal`}
            >
              Upgrade Account
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() =>
            userData?.research_interests?.length > 0
              ? window.open(
                  "https://product.researchcollab.ai/t/knowledgebase",
                  "_blank"
                )
              : {}
          }
        >
          <div className="flex items-center space-x-2">
            <GiClassicalKnowledge className="w-4 h-4" color="#9b9ea2" />

            <span className="text-lightGray font-normal font-size-normal">
              Knowledge Base
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() =>
            userData?.research_interests?.length > 0
              ? window.open(
                  "https://chat.cloud.board.support/969665972?ticket",
                  "_blank"
                )
              : {}
          }
        >
          <div className="flex items-center space-x-2">
            <Headset className="w-4 h-4" color="#9b9ea2" />

            <span className="text-lightGray font-normal font-size-normal">
              Live Support
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className={"cursor-pointer"}>
          <div className="flex gap-x-2">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//droplogout.svg`}
              alt="Logout icon"
              width={16}
              height={16}
              className="h-4 w-4"
              loading="lazy"
              quality={75}
            />
            <button className="w-full text-left text-lightGray font-normal font-size-normal" type="button">
              Logout
            </button>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
