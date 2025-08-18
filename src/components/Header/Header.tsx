import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Shield } from "lucide-react";
import { CommandMenu } from "../CommandMenu/command-menu";
import Logo from "../Sidebar/Logo";
import NavigationMenu from "../Sidebar/NavigationMenu";
import UserMenu from "../Sidebar/UserMenu";
import NotificationMenu from "../Sidebar/NotificationMenu";
import ReminderNotificationMenu from "../Sidebar/ReminderNotificationMenu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import socket from "@/app/(app)/info/[...slug]/socket";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { changeMode } from "@/reducer/services/userApi";
import Timer from "./Timer";
import Link from "next/link";
import toast from "react-hot-toast";
import { getNotications } from "@/apis/team";
import css from '../Sidebar/NotificaationMenu.module.css'
export default function Header() {
  const dispatch: AppDispatch = useDispatch();
  const { lightMode } = useSelector((state: RootState) => state.userUtils);

  const handleToggle = () => {
    dispatch(changeMode(!lightMode));
  };
  const [notifList, setNotifList] = useState<any>([]);
  const [totalNotification, setTotalNotification] = useState<number>(0);

  const getNotifications: any = async () => {
    try {
      const response: any = await getNotications({ pageNo: 1, limit: 10 });
      if (response?.success === false) {
        toast.error(
          <span className={css.errorMessage}>{response?.message}</span>
        );
      }
      setNotifList(response?.data?.data || []);
      const totalDocs = response?.data?.totalDocuments || 0;
      setTotalNotification(totalDocs);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching notifications:", error);
    }
  };
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-black/90 px-4 md:bg-muted/40 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col bg-black/70 border-none text-white"
        >
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <NavigationMenu />
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <CommandMenu />
      </div>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={lightMode}
          onChange={handleToggle}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Toggle me
        </span>
      </label>

      <Link
        href="/security"
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        title="Security Documentation"
      >
        <Shield className="h-4 w-4" />
        <span className="hidden md:inline">Security</span>
      </Link>

      <ReminderNotificationMenu
        getNotifications={getNotifications}
        notifList={notifList}
        setNotifList={setNotifList}
        setTotalNotification={setTotalNotification}
      />

      <NotificationMenu
        getNotifications={getNotifications}
        notifList={notifList}
        setNotifList={setNotifList}
        setTotalNotification={setTotalNotification}
        totalNotification={totalNotification}
      />

      <UserMenu />
    </header>
  );
}
