import { GoLightBulb } from "react-icons/go";
import {
  MdOutlineLightbulbCircle,
  MdOutlineScreenSearchDesktop,
} from "react-icons/md";
import { TbListSearch } from "react-icons/tb";

export interface DropdownItem {
  icon: React.ReactNode;
  active_icon: React.ReactNode;
  name: string;
  href: string;
}

export const topicExplorerDropdownItems: DropdownItem[] = [
  {
    active_icon: <MdOutlineScreenSearchDesktop size={20} />,
    icon: <MdOutlineScreenSearchDesktop size={20} />,
    name: "Web Search",
    href: "/web-search",
  },
  {
    active_icon: <GoLightBulb size={20} />,
    icon: <GoLightBulb size={20} />,
    name: "Creative Tool",
    href: "/creative-thinking",
  },
  {
    active_icon: <TbListSearch size={20} />,
    icon: <TbListSearch size={20} />,
    name: "Topic Analysis",
    href: "/topic-analysis",
  },
  {
    active_icon: <MdOutlineLightbulbCircle size={20} />,
    icon: <MdOutlineLightbulbCircle size={20} />,
    name: "Outline Generator",
    href: "/outline-generator",
  },
];

export const projectDropdownItems: DropdownItem[] = [
  {
    active_icon: (
      <div className="w-[10px] h-[10px] rounded-full bg-[#0E70FF] bg-red border-2 border-[#0E70FF]" />
    ),
    icon: (
      <div className="w-[10px] h-[10px] rounded-full bg-[#D9D9D9] bg-red border-2 border-[#999999]" />
    ),
    name: "Project Overview",
    href: "/project-overview",
  },
  {
    active_icon: (
      <div className="w-[10px] h-[10px] rounded-full bg-[#0E70FF] bg-red border-2 border-[#0E70FF]" />
    ),
    icon: (
      <div className="w-[10px] h-[10px] rounded-full bg-[#D9D9D9] bg-red border-2 border-[#999999]" />
    ),
    name: "Papers",
    href: "/explorer",
  },
  {
    active_icon: (
      <div className="w-[10px] h-[10px] rounded-full bg-[#0E70FF] bg-red border-2 border-[#0E70FF]" />
    ),
    icon: (
      <div className="w-[10px] h-[10px] rounded-full bg-[#D9D9D9] bg-red border-2 border-[#999999]" />
    ),
    name: "Knowledge Bank",
    href: "/knowledge-bank",
  },
];
