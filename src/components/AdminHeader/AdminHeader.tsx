"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sideMenuScreen } from "@/constant/index";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const AdminHeader = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const getCurrentScreen = sideMenuScreen.find((value) => {
    return value.path == pathname;
  }) || { name: "", path: "", Icon: null };
  const headerTitle =
    getCurrentScreen.name == "Dashboard"
      ? "Dashboard Overview"
      : getCurrentScreen.name;
  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);
  const logout = () => {
    router.push("/admin-login");
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_token");
    Cookies.remove("lastApiCall");
  };
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "white",
        zIndex: "1",
        boxShadow: "3px 3px 5px 6px #cccccc45",
        position: "relative",
      }}
      className="p-[0.5rem] pt-2"
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontWeight: "700",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            color: "#f59b14",
          }}
          className="px-[0.8rem]"
        >
          {headerTitle}
        </span>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            asChild
            onMouseEnter={handleMouseEnter}
            tw-ring-offset-width
            className="focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none"
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "1rem",
                fontWeight: "500",
              }}
              className="px-[0.8rem]"
            >
              <OptimizedImage
                width={ImageSizes.avatar.md.width}
                height={ImageSizes.avatar.md.height}
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//profile_user.jpg`
                }
                style={{ borderRadius: "25px" }}
                alt="new"
              />
              &nbsp;&nbsp;Admin User
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={`p-3 bg-profileDropDown  mt-3`}
            onMouseLeave={handleMouseLeave}
            onClick={handleMouseLeave}
          >
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AdminHeader;
