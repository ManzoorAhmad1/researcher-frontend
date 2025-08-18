import { FileClock, FileText, Folder, Plus, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const ActionBar: React.FC = () => {
  return (
    <div className="fixed h-18 bottom-0 left-0 right-0 bg-black text-white flex justify-around py-4">
      <Link href={"/dashboard"}>
        <Button
          variant={"outline"}
          className="flex flex-col items-center bg-transparent border-none">
          <FileText className="w-6 h-6" />
        </Button>
      </Link>
      <Link href={"/explorer"}>
        <Button
          variant={"outline"}
          className="flex flex-col items-center bg-transparent border-none">
          <Folder className="w-6 h-6" />
        </Button>
      </Link>
      <Link href={"#"}>
        <Button
          variant={"outline"}
          className="flex flex-col items-center bg-transparent border-none">
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
      <Link href={"/history"}>
        <Button
          variant={"outline"}
          className="flex flex-col items-center bg-transparent border-none">
          <FileClock className="w-6 h-6" />
        </Button>
      </Link>
      <Link href={"/settings"}>
        <Button
          variant={"outline"}
          className="flex flex-col items-center bg-transparent border-none">
          <Settings className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
};

export default ActionBar;
