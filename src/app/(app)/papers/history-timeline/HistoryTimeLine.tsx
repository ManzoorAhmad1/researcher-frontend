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
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Loader } from "rizzui";
import { DataType, scamperDataType } from "../utils/types";
import HistoryDialog from "./HistoryDialog";
import { getFileHistory } from "@/apis/files";

const workIcon = {
  icon: <GoDotFill />,
  iconStyle: { background: "black", color: "#fff" },
};

function HistoryTimeLine() {
  const supabase: SupabaseClient = createClient();
  const userData: string | null =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const userInfo = userData ? JSON.parse(userData) : "";
  const [historytimeline, setHistoryTimeLine] = useState<any[]>([]);
  const [papersDatas, setPapersDatas] = useState<any[]>([]);
  const [historyDialog, setHistoryDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const historyGet = async (userId: number) => {
    setLoading(true);
    const response = await getFileHistory(userId)
    if (response?.data?.data && response?.data?.data?.length > 0) {
      const updateData = response?.data?.data
        ?.map((item: any) => ({ ...item, icon: workIcon }))
        .sort((a: any, b: any) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      if (updateData) {
        setHistoryTimeLine(updateData);
      }
    }
    setLoading(false);
  };

  function formatTimestamp(timestamp: string): { date: string; time: string } {
    const dateObject = new Date(timestamp);

    const optionsDate: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const date = dateObject.toLocaleDateString("en-US", optionsDate);
    const time = dateObject.toLocaleTimeString("en-US", optionsTime);

    return { date, time };
  }

  const handleShow = (item: any) => {
    setHistoryDialog(true);
    setQuestion(item.search);
    setPapersDatas(item?.history);
  };

  useEffect(() => {
    if (userInfo.id) {
      window.scroll(0, 0);
      historyGet(userInfo.id);
    }
  }, [userInfo.id]);

  return (
    <div className="w-full">
      {historytimeline?.length > 0 ? (
        <VerticalTimeline lineColor="black">
          {historytimeline.map((item, i) => {
            const { date, time } = formatTimestamp(item?.created_at);
            const contentStyle = { background: "white", color: "black" };
            const arrowStyle = { borderRight: "7px solid  white" };

            return (
              <VerticalTimelineElement
                key={i}
                className="vertical-timeline-element--work"
                visible={true}
                contentStyle={contentStyle}
                contentArrowStyle={arrowStyle}
                date={
                  <>
                    <span className="me-1 dark:text-[#cccccc]">{time}</span>-
                    <span className="ms-1 dark:text-[#cccccc]">{date}</span>
                  </>
                }
                {...item.icon}
              >
                {item?.search ? (
                  <React.Fragment>
                    {item.search && (
                      <p className="dark:text-[#cccccc]">{item?.search}</p>
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
          {loading ? <Loader variant="threeDot" size="lg" /> : " No Data Found"}
        </div>
      )}

      {historyDialog && (
        <HistoryDialog
          question={question}
          papersDatas={papersDatas}
          historyDialog={historyDialog}
          setHistoryDialog={setHistoryDialog}
        />
      )}
    </div>
  );
}

export default HistoryTimeLine;
