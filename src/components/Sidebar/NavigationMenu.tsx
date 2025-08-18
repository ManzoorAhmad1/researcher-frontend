"use client";
import clsx from "clsx";
import {
  BotMessageSquare,
  ChevronDown,
  ChevronUp,
  CircleDot,
  CornerDownRight,
  FileClock,
  FileSearch,
  FolderGit,
  FolderKanban,
  FolderTree,
  Group,
  HandHelping,
  Home,
  Landmark,
  ListFilter,
  Star,
  Tags,
  Telescope,
  User,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Uploader from "../Uploader/Uploader";

import { Button } from "../ui/button";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Loader } from "rizzui";
import Dropdown from "./Dropdown";
import { projectDropdownItems, topicExplorerDropdownItems } from "./const";

export default function NavigationMenu() {
  const pathname = usePathname();

  const [topicExplorer, setTopicExplorer] = useState(false);
  const [projectExplorer, setProjectExplorer] = useState(false);
  const currentProject = useSelector((state: any) => state?.project);

  return (
    <>
      <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4 border-b border-white/50">
        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/dashboard"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <Home className="h-4 w-4" /> Dashboard
        </Link>

        <Dropdown
          label="Topic Explorer"
          setToggle={setTopicExplorer}
          toggle={topicExplorer}
          dropDownItems={topicExplorerDropdownItems}
        />

        <Link
          href="/papers"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/papers"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <FileSearch className="h-4 w-4" /> Search Papers
        </Link>
        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/#"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <FolderKanban className="h-4 w-4" /> My Projects
        </Link>

        {currentProject?.status === "loading" ? (
          <div className="py-2 flex justify-center">
            <Loader className="mr-4 text-white" variant="threeDot" size="sm" />
          </div>
        ) : (
          <Dropdown
            label={currentProject?.project?.name}
            setToggle={setProjectExplorer}
            toggle={projectExplorer}
            dropDownItems={projectDropdownItems}
          />
        )}
        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/#"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <UsersRound className="h-4 w-4" /> Collaboration
        </Link>
        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/#"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <Group className="h-4 w-4" /> Library
        </Link>
        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/#"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <Landmark className="h-4 w-4" /> Idea Bank
        </Link>

        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/#"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <HandHelping className="h-4 w-4" /> Help & Support
        </Link>
      </nav>
      <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4 border-b border-white/50">
        <Uploader button={true} />
      </nav>

      <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4">
        <Link
          href="/aichat"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/#"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <BotMessageSquare className="h-4 w-4" /> AI CHAT
        </Link>
        <Link
          href="/account"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === "/account"
              ? "bg-blueTh text-primary"
              : "text-white hover:text-white/70"
          )}
        >
          <User className="h-4 w-4" /> My account
        </Link>
      </nav>
    </>
  );
}
