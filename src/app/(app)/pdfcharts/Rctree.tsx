"use client";

import { Provider } from "rc-motion";
import { FileText } from "lucide-react";
import Tree from "rc-tree";
import React from "react";
import "rc-tree/assets/index.css";

const STYLE = `
.rc-tree-child-tree {
  display: block;
}

.node-motion {
  transition: all .3s;
  overflow-y: hidden;
}
`;

const defaultExpandedKeys = ["0", "0-2", "0-9-2"];

const motion = {
  motionName: "node-motion",
  motionAppear: false,
  onAppearStart: () => ({ height: 0 }),
  onAppearActive: (node: HTMLElement) => ({ height: node.scrollHeight }),
  onLeaveStart: (node: HTMLElement) => ({ height: node.offsetHeight }),
  onLeaveActive: () => ({ height: 0 }),
};

const processString = (input: string) => {
  const words = input.split(" ");
  let result = "";
  words.forEach((word, index) => {
    if (index < 2) result += word.slice(0, 1);
  });
  return result.toUpperCase();
};

const getRandomBgColor = () => {
  const colors = [
    "bg-red-600",
    "bg-pink-700",
    "bg-gray-700",
    "bg-green-700",
    "bg-blue-700",
    "bg-purple-700",
    "bg-teal-700",
    "bg-orange-700",
    "bg-yellow-700",
    "bg-indigo-700",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const convertIntoDiv = (text: string, length = 0, parent = false) => {
  return (
    <div className="text-sm flex gap-1 items-center justify-between max-w-[200px]">
      <div className="flex gap-1 items-center title truncate w-[200px]">
        <span
          className={`flex items-center justify-center rounded text-center text-white text-xs py-0.5 px-2 ${getRandomBgColor()} h-[25px] w-[32px]`}
        >
          {processString(text)}
        </span>
        <span className="truncate">{text}</span>
      </div>
      {parent && (
        <div className="text-right text-sky-700 font-medium text-xs">
          {length}
        </div>
      )}
    </div>
  );
};

const convertIntoNode = (text: string, link?: string) => {
  const handleClick = () => {
    link && window.open(link);
  };

  return (
    <div
      className="w-full text-sm flex items-center justify-between"
      onClick={handleClick}
    >
      <div className="text-sm flex gap-1 items-center">
        <span className="ml-1">
          <FileText className="text-xl" />
        </span>
        {text}
      </div>
    </div>
  );
};

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  className?: string;
}

const getTreeData = (): TreeNode[] => {
  return [
    {
      key: "0",
      title: convertIntoDiv("Design Thinking", 5, true),
      children: [
        {
          key: "0-0",
          title: convertIntoNode(
            "Proj-1",
            "https://www.academia.edu/download/43520771/p02_brown-design-thinking.pdf"
          ),
        },
        { key: "0-1", title: convertIntoNode("Proj-2") },
        {
          key: "0-2",
          title: convertIntoDiv("History"),
          children: [
            { key: "0-2-0", title: convertIntoNode("History-1") },
            { key: "0-2-1", title: convertIntoNode("History-2") },
          ],
        },
        { key: "0-3", title: convertIntoNode("Report") },
      ],
      className: "testing-tree",
    },
    {
      key: "1",
      title: convertIntoDiv("Implementation Plan", 1, true),
      className: "testing-tree",
      children: [
        {
          key: "1-0",
          title: convertIntoDiv("Documentation"),
          children: [
            { key: "1-0-0", title: convertIntoNode("Documentation-1") },
            {
              key: "1-0-1",
              title: convertIntoDiv("All Folders"),
              children: [
                { key: "1-0-1-0", title: convertIntoNode("Folder-1") },
                { key: "1-0-1-1", title: convertIntoNode("Folder-2") },
              ],
            },
          ],
        },
      ],
    },
    {
      key: "12",
      title: convertIntoDiv("Digital Transformation Manager", 0, true),
    },
    { key: "13", title: convertIntoDiv("IT Management Reporting", 0, true) },
    {
      key: "14",
      title: convertIntoDiv("Digital Transformation Manager", 0, true),
    },
  ];
};

const RcTreeFolder: React.FC = () => {
  const treeRef = React.useRef<any>();
  const [enableMotion, setEnableMotion] = React.useState(true);

  return (
    <Provider motion={enableMotion}>
      <React.StrictMode>
        <div className="animation">
          <h2>Demo Files Tree 1</h2>
          <style dangerouslySetInnerHTML={{ __html: STYLE }} />

          <div style={{ display: "flex" }}>
            <div style={{ width: "100%" }}>
              <Tree
                defaultExpandAll={false}
                expandAction="click"
                selectable={false}
                ref={treeRef}
                defaultExpandedKeys={defaultExpandedKeys}
                motion={motion}
                itemHeight={20}
                treeData={getTreeData()}
                className="file-tree"
                showIcon={false}
              />
            </div>
          </div>
        </div>
      </React.StrictMode>
    </Provider>
  );
};

export default RcTreeFolder;
