/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { getFolder } from "@/apis/explore";
import { Breadcrumbs } from "@/components/coman/Breadcrumbs";
import { useRouter } from "next-nprogress-bar";
import { Inter } from "next/font/google";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Loader } from "rizzui";
import { notesBookmarksFolder } from "@/apis/notes-bookmarks";

const inter = Inter({ subsets: ["latin"] });

export default function ExplorerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const { slug }: any = params;
  const router = useRouter();
  const pathname = usePathname();
  const supabase: SupabaseClient = createClient();
  const currentProject = useSelector((state: any) => state?.project);

  const initialBreadcrumbs = [
    { type: "icon", icon: "" },
    {
      type: "select",
      value: pathname === "/knowledge-bank" ? "knowledge-bank" : "#",
      title: currentProject?.project?.name,
      options: [
        { label: "Project Overview", value: "project-overview" },
        { label: "Papers", value: "explorer" },
        { label: "Knowledge Bank", value: "knowledge-bank" },
      ],
      handleSelect: (status: string) => {
        if (status === "explorer") router.push(`/${status}`);
        if (status === "knowledge-bank") router.push(`/${status}`);
      },
    },

    {
      type: "label",
      value: "knowledge bank",
      handleBack: () => {
        router.push("/knowledge-bank");
        setBreadcrums(initialBreadcrumbs);
      },
    },
  ];
  const [breadcrums, setBreadcrums] = useState<any[]>(initialBreadcrumbs);
  console.log("🚀 ~ breadcrums:", breadcrums);

  const fetchFolderById = async (folderId: number) => {
   
      const data = await notesBookmarksFolder(folderId);

    if (data.isSuccess == false) {
      console.error("Error fetching folder:", data?.message);
      throw data?.message;
    }
    return data?.data;
  };

  const handleFoldeeBreadcrum = async (
    items: any,
    value: boolean,
    isRoot?: string
  ) => {
    if (isRoot) {
      setBreadcrums([
        ...initialBreadcrumbs,
        {
          type: "label",
          value: "note detail",
          handleBack: () => {},
        },
      ]);
      return;
    }
    const updatedItems = [{ type: "icon", icon: "" }];

    const folderBreadCrum: any = await Promise?.all(
      items?.map(async (folderIdsItem: any) => {
        const folder = await fetchFolderById(folderIdsItem);
        return folder?.folder_name;
      })
    );

    if (folderBreadCrum && folderBreadCrum?.length > 0) {
      const updatedFolderBreadCrums = [...folderBreadCrum]?.map(
        (item: any, index: number) => ({
          type: "label",
          value: item,
          handleBack: () => {
            const stepsBack = index - (folderBreadCrum.length - 1);

            if (stepsBack !== 0) {
              for (let i = 0; i < Math.abs(stepsBack); i++) {
                router.back();
              }
            }
          },
        })
      );

      updatedFolderBreadCrums.forEach((item: any, index: number) => {
        const isLastItem = index === updatedFolderBreadCrums?.length - 1;
        updatedItems.push(item);

        if (!isLastItem) updatedItems.push({ type: "icon", icon: "" });
      });

      const breadcrumbs = [...initialBreadcrumbs, ...updatedItems];

      // Only add the "note detail" if value is true
      if (value) {
        breadcrumbs.push({
          type: "label",
          value: "note detail",
          handleBack: () => {},
        });
      }

      setBreadcrums(breadcrumbs);
    }
  };

  useEffect(() => {
    setBreadcrums(initialBreadcrumbs);

    if (slug?.length > 0) {
      if (slug.includes("note")) {
        const slugArray = [...slug];
        slugArray.splice(slug?.length - 2, slug?.length - 1);
        const allWithoutHyphen = slugArray.some((value) => value.includes("-"));

        if (!allWithoutHyphen) {
          handleFoldeeBreadcrum(slugArray, true);
        } else {
          handleFoldeeBreadcrum(slugArray, true, "isRoot");
        }
      } else {
        handleFoldeeBreadcrum(slug, false);
      }
    }
  }, [slug?.length, currentProject]);

  return (
    <main className="flex flex-1 flex-col relative">
      <div className=" flex flex-col gap-2 bg-headerBackground px-[24px] py-[18px]">
        <div className="flex items-center justify-between">
          <Breadcrumbs
            breadcrums={breadcrums}
            primaryColor="#0E70FF"
            secondaryColor="#999999"
          />
          {currentProject?.project?.name ?
            <div className="uppercase text-[#0E70FF] font-semibold border border-[#0E70FF] px-3 py-1 rounded-md">
            {currentProject?.project?.name}
          </div>:
          <div className="h-6 w-[100px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
          }
        </div>
      </div>
      {children}
    </main>
  );
}
