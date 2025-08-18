"use client";
import { getFolder } from "@/apis/explore";
import { Breadcrumbs } from "@/components/coman/Breadcrumbs";
import { useRouter } from "next-nprogress-bar";
import { Inter } from "next/font/google";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Loader } from "rizzui";

const inter = Inter({ subsets: ["latin"] });

export default function ExplorerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const params = useParams();
  const { slug }: any = params;
  const currentProject = useSelector((state: any) => state?.project);
  const pathname = usePathname();
  const [breadcrums, setBreadcrums] = useState<any[]>([]);

  useEffect(() => {
    setBreadcrums([
      { type: "icon", icon: "" },
      {
        type: "select",
        value: pathname === "/explorer" ? "explorer" : "#",
        title: currentProject?.project?.name,
        options: [
          { label: "Project Overview", value: "project-overview" },
          { label: "Papers", value: "explorer" },
          { label: "Knowledge Bank", value: "knowledge-bank" },
        ],
        handleSelect: (status: string) => {
          router.push(`/${status}`);
        },
      },
      {
        type: "label",
        value: "PAPERS",
        handleBack: () => {
          router.push("/explorer");
        },
      },
    ]);

    if (slug && slug?.length > 0) {
      handleFoldeeBreadcrum();
    }
  }, [currentProject, slug]);

  const handleFoldeeBreadcrum = async () => {
    const updatedItems = [{ type: "icon", icon: "" }];
    const folderBreadCrum: any = await Promise.all(
      slug?.map(async (slugItem: any) => {
        const folder = await getFolder(slugItem);
        return folder?.data?.folder_name;
      })
    );
    if (folderBreadCrum && folderBreadCrum?.length > 0) {
      const updatedFolderBreadCrums = folderBreadCrum?.map(
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
      setBreadcrums([
        { type: "icon", icon: "" },
        {
          type: "select",
          value: pathname.includes("/explorer") ? "explorer" : "#",
          title: currentProject?.project?.name,
          options: [
            { label: "Project Overview", value: "project-overview" },
            { label: "Papers", value: "explorer" },
            { label: "Knowledge Bank", value: "knowledge-bank" },
          ],
          handleSelect: (status: string) => {
            router.push(`/${status}`);
          },
        },
        {
          type: "label",
          value: "PAPERS",
          handleBack: () => {
            router.push("/explorer");
          },
        },
        ...updatedItems,
      ]);
    }
  };
  return (
    <main className="flex flex-1 flex-col ">
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
            </div>
          :
            <div className="h-6 w-[100px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
          }
        </div>
        <div className="flex items-center gap-1">
          <IoChevronBack
            className="text-3xl cursor-pointer"
            onClick={() => router.back()}
          />
          {pathname?.includes("/explorer") && (
            <h2 className="font-size-bold font-poppins text-black dark:text-white">
              My Papers
            </h2>
          )}
        </div>
      </div>
      {children}
    </main>
  );
}
