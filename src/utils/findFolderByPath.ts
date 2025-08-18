import { Folder } from "@/types/types";

export const findFolderByPath = (
  folder: Folder,
  path: string
): Folder | null => {
  const parts = path;
  let currentFolder: any = folder;

  for (const part of parts) {
    const foundFolder: any = currentFolder?.subFolder?.find(
      (subfolder: any) => subfolder.id === Number(part)
    );
    if (!foundFolder) {
      return null;
    }
    currentFolder = foundFolder;
  }

  return currentFolder;
};
