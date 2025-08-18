import Tree from "rc-tree";
import { useState } from "react";
import { CiFolderOn } from "react-icons/ci";
import toast from "react-hot-toast";
import "./index.css";
import "rc-tree/assets/index.css";
import { FaFileAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

interface File {
  fileName: string;
  id: string; // assuming `id` is a string
}

interface Folder {
  name: string;
  id: string;
  subFolder: Folder[];
  subFolderMove: Folder[];
  files: File[];
}

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
}

interface DropInfo {
  node: TreeNode;
  dragNode: TreeNode;
  dropPosition: number;
  dropToGap: boolean;
}

export interface MoveModelProps {
  gData: TreeNode[];
  setGData: (gData: TreeNode[]) => void;
  id: string;
  folderType: string;
}

export const convertDataToTree = (
  data: Folder[],
  parentKey = "0"
): TreeNode[] => {
  return data?.map((item, index) => {
    const key = `${parentKey}-${index}`;
    const node: TreeNode = {
      title: item?.name,
      key: item?.id,
    };

    const hasSubfolders = item?.subFolderMove && item?.subFolderMove.length > 0;
    const hasFiles = item?.files && item?.files.length > 0;

    const children: TreeNode[] = [];

    if (hasSubfolders) {
      children.push(...convertDataToTree(item?.subFolderMove, key));
    }
    if (hasFiles) {
      children.push(
        ...item.files.map((file) => {
          const shortTitle = file.fileName
            ? file.fileName.length > 35
              ? file.fileName.substring(0, 35) + "..."
              : file.fileName
            : "";

          return {
            title: shortTitle,
            key: file.id,
            ...file,
          };
        })
      );
    }

    if (children.length > 0 || !hasSubfolders) {
      node.children = children;
    }

    return node;
  });
};

export const convertTreeToData = (nodes: TreeNode[]): Folder[] => {
  const mapNodeToFolder = (node: TreeNode): Folder => {
    const id = node.key;
    const name = node.title;

    const subfolder: any = [];
    const files: any = [];

    if (node.children) {
      node.children.forEach((child: TreeNode) => {
        if (child.children && child.children.length > 0) {
          subfolder.push(mapNodeToFolder(child));
        } else {
          if (child.children === undefined) {
            files.push({
              id: child.key,
              fileName: child.title,
              ...(child as any),
            });
          } else {
            subfolder.push(mapNodeToFolder(child));
          }
        }
      });
    } else {
      return {
        id,
        name,
        subFolder: [],
        subFolderMove: [],
        files: [
          {
            id,
            fileName: name,
          },
        ],
      };
    }

    return {
      id,
      name,
      subFolder: subfolder,
      subFolderMove: subfolder,
      files,
    };
  };

  return nodes.map(mapNodeToFolder);
};

export const MoverModel = ({
  gData,
  setGData,
  id,
  folderType,
}: MoveModelProps) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([id]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const onDrop = (info: any) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split("-");
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (
      data: TreeNode[],
      key: any,
      callback: (item: TreeNode, index: number, arr: TreeNode[]) => void
    ) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr);
          return;
        }
        if (item.children) {
          loop(item.children, key, callback);
        }
      });
    };

    const data = [...gData];
    let dragObj: TreeNode | undefined;
    let dropTargetNode: TreeNode | undefined;

    // Find the dragged node
    loop(data, dragKey, (item) => {
      dragObj = item;
    });

    // Find the target node
    loop(data, dropKey, (item) => {
      dropTargetNode = item;
    });

    if (!dragObj || !dropTargetNode) return;

    // Check if trying to drop onto a file (node without children)
    const isTargetFile = !dropTargetNode.children;
    if (isTargetFile) {
      toast.error("Cannot move items onto files. Please select a folder instead.");
      return;
    }

    const itemType = dragObj.children ? 'Folder' : 'File';
    const destinationFolder = dropTargetNode.title;

    // Remove dragged node from its original position
    loop(data, dragKey, (_, index, arr) => {
      arr.splice(index, 1);
    });

    if (dropPosition === 0) {
      // Dropping into a folder
      dropTargetNode.children = dropTargetNode.children || [];
      dropTargetNode.children.unshift(dragObj);
    } else {
      // Dropping between nodes - find the parent array to insert into
      let ar: TreeNode[] | undefined;
      let i: number | undefined;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (ar && i !== undefined) {
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      }
    }

    setGData(data);
    toast.success(`${itemType} moved to "${destinationFolder}" Folder successfully`);
  };

  const onExpand = (expandedKeys: any[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const allowDrop = () => {
    return true; 
  };

  const titleRender = (node: TreeNode) => {
    return (
      <div
        className={`dark:bg-[#cccc] dark:text-black flex items-center p-2.5 w-full rounded-lg transition-all duration-200 ${
          node.children ? "hover:bg-blue-50 bg-gray-50" : ""
        }`}
      >
        {node.children ? (
          <div className="flex items-center">
            <span
              className={`transition-transform duration-200 ${
                expandedKeys.includes(node.key) ? "rotate-0" : "-rotate-90"
              }`}
            >
              <IoIosArrowDown className="h-4 w-4 dark:text-white text-gray-500 mr-1" />
            </span>
            <CiFolderOn className="mr-3 h-5 w-5 dark:text-white text-blue-500" />
          </div>
        ) : folderType === "file" ? (
          <FaFileAlt className="mr-3 h-4 w-4 dark:text-white text-gray-500" />
        ) : (
          <FaFileAlt className="mr-3 h-4 w-4 dark:text-white text-gray-500" />
        )}
        <span className="text-sm font-medium dark:text-white text-gray-700 truncate">
          {node.title}
        </span>
      </div>
    );
  };
  return (
    <div className="dark:bg-[#3A474B]  moveFolder overflow-y-auto overflow-x-hidden h-full w-full max-h-[400px] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0">
      <Tree
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        autoExpandParent={autoExpandParent}
        className="mb-6"
        draggable={true}
        titleRender={titleRender}
        onDrop={onDrop}
        allowDrop={allowDrop}
        treeData={gData}
        expandAction="click"
        itemHeight={100}
        virtual={false}
        showIcon={false}
        selectable={false}
        switcherIcon={false}
        showLine={true}
      />
    </div>
  );
};
