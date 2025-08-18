import { MockData } from "@/types/types";

export const mockData: any = {
  id: 1,
  name: "root",
  subfolders: [
    {
      id: 2,
      name: "Documents",
      createdDate: "2023-02-01",
      size: "20 MB",
      subfolders: [],
      files: [
        {
          name: "presentation_overview.pdf",
          id: 14,
          pages: 20,
          size: "4.5 MB",
          dateProcessed: "2024-06-14",
          status: "Processed",
          tags: [{ id: 5, name: "Overview", color: "#ffccbc" }],
        },
      ],
    },
  ],
  files: [],
};
