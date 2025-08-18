import React from "react";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";

const DataNotFound = () => {
  const rount = useRouter();
  return (
    <div className="absolute top-[1px] left-0 w-full bg-white dark:bg-[#020818] py-16">
      <Image
        src={
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//datanotfound.png`
        }
        width={1000}
        height={500}
        alt=""
        className="w-[30%] m-auto rounded-lg"
      />
      <div className="text-center">
        <div className="text-xl text-[#666666]">This document are deleted</div>
        <div
          className="text-blue-600 underline mt-1 cursor-pointer"
          onClick={() => rount?.push("/notes-bookmarks")}
        >
          Please go back
        </div>
      </div>
    </div>
  );
};

export default DataNotFound;
