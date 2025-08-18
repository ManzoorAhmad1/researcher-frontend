/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { GoDotFill } from "react-icons/go";
import "react-vertical-timeline-component/style.min.css";
import { Button } from "rizzui";
import { Loader } from "rizzui";
import HistoryDialog from "../dialogs/HistoryDialog";
import { DataType, scamperDataType } from "../utils/types";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { getCreativeThinkingHistory } from "@/apis/topic-explorer";

const workIcon = {
  icon: <GoDotFill />,
  iconStyle: { background: "black", color: "#fff" },
};

function HistoryTimeLine() {
  const [historytimeline, setHistoryTimeLine] = useState<DataType[]>([]);
  const [historyDialog, setHistoryDialog] = useState<boolean>(false);
  const [scamperDatas, setScamperDatas] = useState<scamperDataType[]>([]);
  const [keywordType, setKeywordType] = useState("");
  const [loading, setLoading] = useState(true);

  const { workspace } = useSelector((state: RootState) => state.workspace);

  const getCreativeThinkingByUserId = async (id:string) => {
  
    const apiRes = await getCreativeThinkingHistory(id);
    if (apiRes?.success) {
      const updateData = apiRes?.data
        ?.map((item: any) => ({ ...item, icon: workIcon }))
        .sort((a: any, b: any) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      if (updateData) {
        setHistoryTimeLine(updateData);
      }
      setLoading(false);
    }

    // ...
  };
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  function formatTimestamp(
    timestamp: string,
    timeZone: string
  ): { date: string; time: string } {
    const dateObject = new Date(timestamp);

    const optionsDate: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: timeZone,
    };

    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timeZone,
    };

    const date = dateObject.toLocaleDateString("en-US", optionsDate);
    const time = dateObject.toLocaleTimeString("en-US", optionsTime);

    return { date, time };
  }

  const handleShow = (item: any) => {
    setHistoryDialog(true);
    setScamperDatas(item?.scamper_datas);
    setKeywordType(item?.keyword_type);
  };

  useEffect(() => {
    setLoading(true);
    if (workspace?.id) {
      window.scroll(0, 0);
      getCreativeThinkingByUserId(workspace?.id);
    }

  }, [workspace?.id]);

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-156px)]">
          <Loader variant="threeDot" size="lg" />
        </div>
      ) : (
        <>
          {historytimeline?.length > 0 ? (
            <VerticalTimeline lineColor="black">
              {historytimeline.map((item, i) => {
                const { date, time } = formatTimestamp(
                  item?.created_at,
                  localTimeZone
                );
                const contentStyle = { background: "white", color: "black" };
                const arrowStyle = { borderRight: "7px solid  white" };
                const dateStyle = { borderRight: "7px solid  white" };

                return (
                  <VerticalTimelineElement
                    key={i}
                    className="vertical-timeline-element--work"
                    visible={true}
                    contentStyle={contentStyle}
                    contentArrowStyle={arrowStyle}
                    date={
                      <>
                        <span className="me-1 dark:text-[#cccccc]">{time}</span>
                        -
                        <span className="ms-1 dark:text-[#cccccc]">{date}</span>
                      </>
                    }
                    {...item.icon}
                  >
                    {item?.keyword_type ? (
                      <React.Fragment>
                        <h3 className="text-2xl font-bold dark:text-[#cccccc]">
                          {item?.keyword_type}
                        </h3>

                        {item.keyword_name && (
                          <p className="dark:text-[#cccccc]">
                            {item?.keyword_name}
                          </p>
                        )}
                        <Button
                          className="w-25 mt-4"
                          onClick={() => handleShow(item)}
                        >
                          Read more
                        </Button>
                      </React.Fragment>
                    ) : undefined}
                  </VerticalTimelineElement>
                );
              })}
            </VerticalTimeline>
          ) : (
            <div className="flex justify-center items-center h-[calc(100vh-156px)]">
            No Data Found
          </div>
            
          )}
        </>
      )}

      <HistoryDialog
        keywordType={keywordType}
        historyDialog={historyDialog}
        setHistoryDialog={setHistoryDialog}
        scamperDatas={scamperDatas}
      />
    </div>
  );
}

export default HistoryTimeLine;
