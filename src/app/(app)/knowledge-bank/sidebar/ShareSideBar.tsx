import { Sidebar } from "primereact/sidebar";
import React, { useEffect, useState } from "react";
import {
  customHeader,
  customIcons,
} from "@/components/Sidebar(Drower)/customHeader";
import { Button } from "@/components/ui/button";
import { shareDatas } from "../utils/const";
import { ShareSideBarProps, Tags } from "../utils/types";
import { getNote } from "@/apis/notes-bookmarks";
import { LoaderCircle } from "lucide-react";

const ShareSideBar: React.FC<ShareSideBarProps> = ({
  shareId,
  shareVisible,
  setShareVisible,
}) => {
  const [selectedShareData, setSelectedShareData] = useState("");
  const [singleData, setSingleData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const handleChange = (value: string) => {
    setSelectedShareData(value);
  };

  const productInfo: any = {
    externalLink: `${window.location.origin}$/knowledge-bank/note/${shareId}`,
    title: `Researchcollab`,
  };

  const handleShare = (platform: any) => {
    let url: string | undefined;

    switch (platform) {
      case "Facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          productInfo.externalLink
        )}`;
        break;
      case "Whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          productInfo.title
        )}%0A${encodeURIComponent(productInfo.externalLink)}`;
        break;
      case "Gmail":
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(
          productInfo.title
        )}&body=${encodeURIComponent(productInfo.externalLink)}`;
        break;
      default:
        return;
    }

    if (url) {
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    const fetchNote = async () => {
      const data = await getNote(shareId);
      if (data?.success) {
        setSingleData(data?.data);
        setLoading(false);
      }
    };

    fetchNote();
  }, [shareId, shareVisible]);

  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5DE14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];

  const compareColor = (color: string) => {
    const matchedColor = colors.find((c) => c.color === color);
    if (matchedColor) {
      return matchedColor?.borderColor;
    } else {
      return color.slice(0, -2);
    }
  };

  return (
    <Sidebar
      header={customHeader("Share")}
      icons={customIcons}
      className="bg-white p-6 w-[25rem] dark:bg-[#3A474B]"
      style={{ boxShadow: "-2px 0px 6px 0px #00000040" }}
      visible={shareVisible}
      position="right"
      onHide={() => setShareVisible(false)}
    >
      <hr className="my-4 dark:border-[#BEBFBF]" />
      {loading ? (
        <div className="h-[calc(100%-33px)] flex justify-center items-center">
          <LoaderCircle className="animate-spin h-10 w-10 mx-auto" />
        </div>
      ) : (
        <>
          <h4 className="text-[#0E70FF] mb-2 font-semibold text-[18px]">
            {singleData?.title}
          </h4>
          <p
            className="text-[#666666] mb-3 dark:text-[#BEBFBF] line-clamp-4"
            dangerouslySetInnerHTML={{ __html: singleData?.description }}
          />
          <div>
            <h6 className="text-[12px] text-[#666666] dark:text-[#BEBFBF] mb-1">
              TAGS
            </h6>
            {singleData?.tags && singleData?.tags?.length > 0 ? (
              <div>
                <div className="flex">
                  {singleData?.tags?.map((tag: Tags, index: number) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: tag.color && tag.color,
                        color: compareColor(tag.color),
                      }}
                      className="inline-block px-2 py-1 me-1 my-1 whitespace-nowrap text-sm rounded-lg cursor-pointer"
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground bg-slate-200 px-2 py-1 mt- text-sm rounded-lg ">
                No Tag
              </span>
            )}
          </div>
          <hr className="my-4 dark:border-[#BEBFBF]" />
          {shareDatas?.map((item, i) => (
            <div
              key={i}
              className="cursor-pointer"
              onChange={() => handleChange(item.name)}
            >
              <div className="flex gap-2 items-center">
                <input type="radio" name="exportDataGroup" id={`radio-${i}`} />
                {item.icon}
                <label htmlFor={`radio-${i}`}>{item.name}</label>{" "}
              </div>
              <hr className="my-4 dark:border-[#BEBFBF]" />
            </div>
          ))}
          <div className="flex gap-2 justify-end items-center py-4">
            <Button
              onClick={() => setShareVisible(false)}
              className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
              variant={"outline"}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleShare(selectedShareData)}
              className=" rounded-[26px] btn text-white h-9"
            >
              Share
            </Button>
          </div>
        </>
      )}
    </Sidebar>
  );
};

export default ShareSideBar;
