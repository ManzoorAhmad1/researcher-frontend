import { RiDashboard3Fill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa6";
import { IoNotifications } from "react-icons/io5";
import { MdSubscriptions } from "react-icons/md";

export const TEMPLATE_STATUS = [
  { label: "Unread", value: "unread" },
  { label: "Supporting", value: "supporting" },
  { label: "Disregarded", value: "disregarded" },
  { label: "Abstract", value: "abstract" },
  { label: "Full", value: "full" },
  { label: "Key", value: "key" },
  { label: "Cited", value: "cited" },
  { label: "Controversial", value: "controversial" },
  { label: "Pioneering", value: "pioneering" },
];

export const TEMPLATE_PRIVACY = [
  { label: "Private", value: "true" },
  { label: "Public", value: "false" },
];
export const AUTO_IMPORT_PDF_TYPE = [
  { label: "DOI", value: "doi" },
  { label: "Author", value: "author" },
  { label: "Title", value: "title" },
];
export const WORKSPACE_BADGES = [
  { label: "Public Health", value: "Public Health" },
  { label: "Clinical Research", value: "Clinical Research" },
  { label: "Biomedical Sciences", value: "Biomedical Sciences" },
  { label: "Climate Change", value: "Climate Change" },
  { label: "Conservation", value: "Conservation" },
  { label: "Sustainable Development", value: "Sustainable Development" },
  { label: "Sociology", value: "Sociology" },
  { label: "Psychology", value: "Psychology" },
  { label: "Anthropology", value: "Anthropology" },
  { label: "Information Technology", value: "Information Technology" },
  { label: "Mechanical Engineering", value: "Mechanical Engineering" },
  { label: "Electrical Engineering", value: "Electrical Engineering" },
  { label: "Literature", value: "Literature" },
  { label: "History", value: "History" },
  { label: "Philosophy", value: "Philosophy" },
  { label: "Physics", value: "Physics" },
  { label: "Chemistry", value: "Chemistry" },
  { label: "Biology", value: "Biology" },
  { label: "Management", value: "Management" },
  { label: "Finance", value: "Finance" },
  { label: "Marketing", value: "Marketing" },
  { label: "Educational Psychology", value: "Educational Psychology" },
  { label: "Curriculum Development", value: "Curriculum Development" },
  { label: "E-learning", value: "E-learning" },
  { label: "International Law", value: "International Law" },
  { label: "Human Rights", value: "Human Rights" },
  { label: "Corporate Law", value: "Corporate Law" },
  { label: "Cognitive Science", value: "Cognitive Science" },
  { label: "Behavioral Psychology", value: "Behavioral Psychology" },
  { label: "Neuroscience", value: "Neuroscience" },
  { label: "Artificial Intelligence", value: "Artificial Intelligence" },
  { label: "Cybersecurity", value: "Cybersecurity" },
  { label: "Data Science", value: "Data Science" },
  { label: "Agronomy", value: "Agronomy" },
  { label: "Food Technology", value: "Food Technology" },
  { label: "Nutrition", value: "Nutrition" },
  { label: "Astronomy", value: "Astronomy" },
  { label: "Geology", value: "Geology" },
  { label: "Meteorology", value: "Meteorology" },
  { label: "Pure Mathematics", value: "Pure Mathematics" },
  { label: "Applied Mathematics", value: "Applied Mathematics" },
  { label: "Statistical Analysis", value: "Statistical Analysis" },
  { label: "Comparative Politics", value: "Comparative Politics" },
  { label: "International Relations", value: "International Relations" },
  { label: "Public Policy", value: "Public Policy" },
  { label: "Journalism", value: "Journalism" },
  { label: "Digital Media", value: "Digital Media" },
  { label: "Communication Studies", value: "Communication Studies" },
  { label: "Public Administration", value: "Public Administration" },
  { label: "Policy Analysis", value: "Policy Analysis" },
  { label: "Governance", value: "Governance" },
  { label: "Moral Philosophy", value: "Moral Philosophy" },
  { label: "Bioethics", value: "Bioethics" },
  { label: "Political Philosophy", value: "Political Philosophy" },
  { label: "Gender Studies", value: "Gender Studies" },
  { label: "Cultural Studies", value: "Cultural Studies" },
  { label: "Urban Studies", value: "Urban Studies" },
  { label: "Other", value: "Other" },
];

export const SKELETONROW = [
  [
    { width: "h-4 w-12" },
    { width: "h-4 w-12" },
    { width: "h-4 w-4" },
    { width: "h-4 w-12" },
    { width: "h-4 w-1" },
    { width: "h-4 w-12" },
  ],

  [
    { width: "h-4 w-4" },
    { width: "h-4 w-12" },
    { width: "h-4 w-16" },
    { width: "h-4 w-16" },
    { width: "h-4 w-12" },
  ],

  [
    { width: "h-4 w-4" },
    { width: "h-4 w-12" },
    { width: "h-4 w-12" },
    { width: "h-4 w-16" },
  ],
  [
    { width: "h-4 w-16" },
    { width: "h-4 w-12" },
    { width: "h-4 w-16" },
    { width: "h-4 w-4" },
    { width: "h-4 w-12" },
  ],
];

export const sideMenuScreen = [
  { name: "Dashboard", path: "/admin-dashboard", Icon: RiDashboard3Fill },
  { name: "User Management", path: "/admin-user-management", Icon: FaUsers },
  {
    name: "Notifications",
    path: "/admin-notifications",
    Icon: IoNotifications,
  },
  {
    name: "Subscription Management",
    path: "/admin-subscription-managment",
    Icon: MdSubscriptions ,
  },
];
