import dashboard from "@/images/userProfileIcon/dashboard";
import userProfile from "@/images/userProfileIcon/userProfile";
import subscription from "@/images/userProfileIcon/subscription";
import AICredits from "@/images/userProfileIcon/AICridet";
import organization from "@/images/userProfileIcon/organization";
import preferences from "@/images/userProfileIcon/userPreferences";
import integrations from "@/images/userProfileIcon/integrations";
import workspace from "@/images/userProfileIcon/workspace";
import usageStatistic from "@/images/userProfileIcon/usageStatistic";
import teamsIcon from "@/images/userProfileIcon/teamsIcon";
import { CalendarIcon } from "lucide-react";

export const sideBarMenuItems: any = [
  {
    label: "Dashboard",
    value: "Dashboard",
    icon: dashboard,
    path: "/account",
  },
  {
    label: "User Profile",
    value: "User Profile",
    icon: userProfile,
    path: "/profile",
  },
  {
    label: "Subscription",
    value: "Subscription",
    icon: subscription,
    path: "/subscriptions",
  },
  {
    label: "AI Credits",
    value: "AI Credits",
    icon: AICredits,
    path: "/ai-credits",
  },
  {
    label: "Organization",
    value: "Organization",
    icon: organization,
    path: "/organization",
  },
  {
    label: "Teams",
    value: "Teams",
    icon: teamsIcon,
    path: "/teams",
  },
  {
    label: "User Preferences",
    value: "User Preferences",
    icon: preferences,
    path: "/user-preferences",
  },
  {
    label: "Integrations",
    value: "Integrations",
    icon: integrations,
    path: "/integrations",
  },

  {
    label: "Workspace",
    value: "Workspace",
    icon: workspace,
    path: "/workspace",
  },
  {
    label: "Templates",
    value: "Templates",
    icon: workspace,
    path: "/templates",
  },
  {
    label: "Usage Statistics",
    value: "Usage Statistics",
    icon: usageStatistic,
    path: "/usage-statistic",
  },
  {
    label: "Reminders",
    value: "Reminders",
    icon: CalendarIcon,
    path: "/reminder",
  },
];
