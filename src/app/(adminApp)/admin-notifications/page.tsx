"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import WrapperBox from "@/components/ui/WrapperBox";
import { FaFilter } from "react-icons/fa";
import { SupabaseClient } from "@supabase/supabase-js";
import { FaUpload } from "react-icons/fa6";
import { axiosInstancePublic } from "@/utils/request";
import Pagination from "@/components/coman/Pagination";
import { createClient } from "@/utils/supabase/client";
import { PiWarningCircleFill } from "react-icons/pi";
import moment from "moment";
import { IoIosWarning } from "react-icons/io";
import { GoDotFill } from "react-icons/go";

const Notification = () => {
  const [userNotification, setUserNotification] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [emailNotification, setEmailNotification] = useState(false);

  const supabase: SupabaseClient = createClient();

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const getUsersNotificationData = async () => {
    try {
      const response = await axiosInstancePublic.get(
        `/admin/admin-user-active-notification-data?page=${pageNo}&limit=${limit}`
      );
      if (response.data.isSuccess) {
        setUserNotification(response.data.data);
        setTotalPages(response.data.totalRecords);
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };
  useEffect(() => {
    getUsersNotificationData();
  }, [pageNo, limit]);

  const getnotificationData = async () => {
    const res = await axiosInstancePublic.get(
      `/admin/admin-user-active-notification-data`
    );
    setUserNotification(res?.data.data);
  };

  const subscribeToNotificationTableChanges = () => {

    const channel = supabase
      .channel("admin_notification-watcher")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notification" },
        (payload) => {
          getnotificationData();
          console.log("Received INSERT event:", payload);
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status: ${status}`);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to admin_notification table.");
        }
      });

    setTimeout(() => {
      console.log("Current channel state:", channel.state);
      if (channel.state === "closed") {
        console.error("Subscription was closed. Check Supabase logs.");
      }
    }, 5000);
  };

  useEffect(() => {
    subscribeToNotificationTableChanges();
    getUsersNotificationData();
    getEmailNotification();
  }, []);

  const manageEmailNotification = async () => {
    const response = await axiosInstancePublic.get(
      `/admin/admin-email-notification?emailactivity=${!emailNotification}`
    );
    setEmailNotification(response.data.data.email_notification);
  };

  const getEmailNotification = async () => {
    const response = await axiosInstancePublic.get(
      `/admin/admin-email-notification-data`
    );
    setEmailNotification(response.data.data[0].email_notification);
  };

  return (
    <WrapperBox>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Label style={{ fontSize: "1.3rem", fontWeight: "600" }}>
          {" "}
          Notification & Alerts
        </Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-5 py-4">
        <div className="bg-white p-4 rounded-lg flex flex-col gap-[0.8rem]">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Label
              className="text-lg font-semibold py-1"
              style={{ fontWeight: "700" }}
            >
              System Notifications
            </Label>
          </div>

          <div className="bg-[#fdf2f2] h-full rounded-[0.7rem]">
            <div className="p-4 flex">
              <div className="w-max">
                <PiWarningCircleFill
                  style={{
                    color: "#d7002b",
                    fontSize: "1.2rem",
                    marginTop: "0.3rem",
                  }}
                />
              </div>
              <div className="flex flex-col px-1">
                <Label
                  className=" font-semibold p-[0.1rem] text-[#892933]"
                  style={{ fontWeight: "500" }}
                >
                  Database Storage Critical
                </Label>
                <Label
                  className=" font-semibold  text-[#c8505a] p-[0.1rem] text-[0.8rem]"
                  style={{ fontWeight: "500" }}
                >
                  N/A
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-[#fffbec] h-full rounded-[0.7rem]">
            <div className="p-4 flex">
              <div className="w-max">
                <IoIosWarning
                  style={{
                    color: "#d56f24",
                    fontSize: "1.2rem",
                    marginTop: "0.3rem",
                  }}
                />
              </div>
              <div className="flex flex-col px-1">
                <Label
                  className=" font-semibold p-[0.1rem] text-[#d56f24]"
                  style={{ fontWeight: "500" }}
                >
                  Scheduled Maintenance
                </Label>
                <Label
                  className=" font-semibold  text-[#be6b3a] p-[0.1rem] text-[0.8rem]"
                  style={{ fontWeight: "500" }}
                >
                  N/A
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-5 py-4">
        <div className="bg-white p-4 rounded-lg flex flex-col gap-[0.8rem]">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Label
              className="text-lg font-semibold py-1"
              style={{ fontWeight: "700" }}
            >
              Custom Alerts
            </Label>
          </div>

          {userNotification.map(
            (
              value: { title: string; message: string; email: string },
              index
            ) => {
              return (
                <div
                  key={index}
                  className="h-full rounded-[0.7rem]"
                  style={{ border: "1px solid #ededed" }}
                >
                  <div
                    className="p-[0.8rem] flex"
                    style={{
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      <div className="w-max">
                        <GoDotFill
                          className="text-[#27b67d]"
                          style={{ fontSize: "1.2rem", marginTop: "0.3rem" }}
                        />
                      </div>
                      <div className="flex flex-col px-1">
                        <Label
                          className=" font-semibold p-[0.1rem] "
                          style={{ fontWeight: "500" }}
                        >
                          {value.title} ({value.email})
                        </Label>
                        <Label
                          className=" font-semibold  text-[#848a95] p-[0.1rem] text-[0.8rem]"
                          style={{ fontWeight: "500" }}
                        >
                          {value.message}
                        </Label>
                      </div>
                    </div>
                    <div style={{ display: "flex" }}></div>
                  </div>
                </div>
              );
            }
          )}
          <div className="bg-secondaryBackground border-t-0 border-tableBorder rounded-bl-xl rounded-br-xl border pb-3 dark:border-[#393F49]">
            <Pagination
              totalPages={totalPages}
              handlePagination={handlePageChange}
              currentPage={pageNo}
              perPageLimit={limit}
              setPerPageLimit={setLimit}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-5 py-4">
        <div className="bg-white p-4 rounded-lg flex flex-col gap-[0.8rem]">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Label
              className="text-lg font-semibold py-1"
              style={{ fontWeight: "700" }}
            >
              Notification Settings
            </Label>
          </div>

          <div className="h-full rounded-[0.7rem]">
            <div
              className="p-[0.8rem] flex"
              style={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex" }}>
                <div className="flex flex-col px-1">
                  <Label
                    className=" font-semibold p-[0.1rem] "
                    style={{ fontWeight: "500" }}
                  >
                    Email Notifications
                  </Label>
                  <Label
                    className=" font-semibold  text-[#848a95] p-[0.1rem] text-[0.8rem]"
                    style={{ fontWeight: "500" }}
                  >
                    Receive alerts via email
                  </Label>
                </div>
              </div>
              <div style={{ display: "flex" }}>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer "
                    onClick={() => {
                      manageEmailNotification();
                    }}
                    checked={emailNotification}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#2c69e5]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WrapperBox>
  );
};

export default Notification;
