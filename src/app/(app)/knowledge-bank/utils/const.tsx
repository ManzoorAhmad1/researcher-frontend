import { Doc, Fb, Gmail, MSWord, Pdf, Rtf, WP } from "../icons";
export const tableColumnDatas = [
  { name: "Title", field: "title", visible: true, id: 1 },
  { name: "Description", field: "description", visible: true, id: 2 },
  { name: "Tags", field: "tags", visible: true, id: 3 },
  { name: "Links", field: "links", visible: true, id: 4 },
];
export const tags = [
  { name: "Science", color: "#9322B9", bgColor: "#F1C8FF" },
  { name: "AI", color: "#079E28", bgColor: "#D7EFDD" },
  { name: "Advance", color: "#0E70FF", bgColor: "#DBEAFF" },
  { name: "Knowlegde", color: "#E39909", bgColor: "#FBEFD8" },
  { name: "Advance", color: "#FF0E73", bgColor: "#FFD8E9" },
];

export const exportDatas = [
  {
    icon: <MSWord />,
    name: "MS Word",
    disabled: false,
  },
  {
    icon: <Pdf />,
    name: "PDF",
    disabled: false,
  },
];

export const shareDatas = [
  {
    icon: <Fb />,
    name: "Facebook",
  },
  {
    icon: <Gmail />,
    name: "Gmail",
  },
  {
    icon: <WP />,
    name: "Whatsapp",
  },
];

export const roles = ["Viewer", "Commenter", "Editor"];

export const general_access_dropdown = [
  {
    label: "Restricted",
    value: false,
    description: "Only people with access can open with the link",
  },
  {
    label: "Anyone with the link",
    value: true,
    description: "Anyone on the Internet with the link can view",
  },
];
