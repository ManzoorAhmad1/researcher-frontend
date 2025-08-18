import React, { useEffect, useRef ,useCallback} from "react";
import SubscriptionIcon from "@/images/userProfileIcon/subscription";
import SearchIcon from "@/images/userProfileIcon/searchIcon";
import TeamMember from "@/images/userProfileIcon/teamMember";
import Credit from "@/images/userProfileIcon/credit";
import DashboardActivity from "./DashboardActivity";
import { axiosInstancePrivate } from "@/utils/request";
import { Loader, Popover } from "rizzui";
import AICreditChart from "@/components/Account/AICreditChart";
import { getAccountDashboardAnalytics } from "@/apis/collaborates";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import moment from "moment";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { fetchSubscription } from "@/reducer/services/subscriptionApi";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const [accountDashboardAnalytics, setAccountDashboardAnalytics] =
    React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [firstLoader, setFirstLoader] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const userData = useSelector((state: any) => state?.user?.user?.user);
  const { subscriptionData } = useSelector(
    (state: RootState) => state.subscription
  );
  const projectId = useSelector((state: any) => state?.project?.project?.id);
  const [seriesData, setSeriesData] = React.useState<
    { name: string; data: number[] | [] }[]
  >([{ name: "series1", data: [] }]);
  const [allMonths, setAllMonths] = React.useState<string[]>([]);
  const dispatch: AppDispatch = useDispatch();
  const supabase: SupabaseClient = createClient();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAccountDashboardAnalytics();
        setAccountDashboardAnalytics(response?.data?.data);
        setLoading(false);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      }
    };
    fetchData();
    getCreditAPI();
  }, [userData?.id]);

  const getCreditAPI = useCallback(async () => {
    setFirstLoader(true);
    await dispatch(fetchSubscription({ id: userData?.id }));
    try {
      const { data } = await axiosInstancePrivate.post(`/users/aicredit-data`, {
        userID: userData?.id,
      });
      if (data.data) setSeriesData(data.data);
      if (data.dates) setAllMonths(data.dates);
    } catch (error: any) {
      console.error(
        `History Table API Error: ${error?.response?.data?.message}`
      );
    }
    setFirstLoader(false);
  }, [userData?.id, dispatch]);

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
  }, [userData?.id]);

  const currentProjects = accountDashboardAnalytics?.filter(
    (item: any) => item?.projectId === projectId
  );

  return (
    <div className="flex flex-col w-full max-w-[calc(100%-32px)] mx-auto">
      <div className="flex w-full ">
        <div className="flex flex-wrap xl:flex-nowrap w-full  items-center justify-center gap-3">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-[248px] h-[117px] cards_bg bg-[#F59B1436]  rounded-md flex gap-6 items-center justify-center">
              <div className="w-10 h-10 mr-4 flex items-center OrangeBoxShadow justify-center bg-orange rounded-full">
                <SubscriptionIcon iconColor />
              </div>
              <div>
                <p className="font-size-md font-semibold text-secondaryDark">
                  {" "}
                  MY CURENT PLAN
                </p>
                <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
                  {userData?.subscription_plan === "free"
                    ? "Free"
                    : userData?.subscription_plan === "pro-plan-stripe" ||
                      userData?.subscription_plan === "pro-plan-discount"
                    ? "Pro"
                    : "Plus"}
                </p>
                <p className="font-size-small font-normal text-secondaryDark">
                  Until{" "}
                  {moment(userData?.subscription?.billingCycleEndDate).format(
                    "DD-MM-YYYY"
                  )}
                </p>
              </div>
            </div>
            <div className="w-[248px] cards_bg h-[117px] bg-[#0E70FF33] rounded-md flex gap-6 items-center justify-center">
              <Popover isOpen={popoverOpen} setIsOpen={setPopoverOpen} placement="right">
                <Popover.Trigger>
                  <div
                    className="w-[248px] cards_bg h-[117px] bg-[#0E70FF33] rounded-md flex gap-6 items-center justify-center"
                    onMouseEnter={() => setPopoverOpen(true)}
                    onMouseLeave={() => setPopoverOpen(false)}
                  >
                    <div className="w-10 h-10 mr-4 blueBoxShadow flex items-center bg-primaryGreen justify-center rounded-full">
                      <Credit />
                    </div>
                    <div>
                      <p className="font-size-md font-semibold text-secondaryDark">
                        {" "}
                        AI CREDITS
                      </p>
                      <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
                        {Math.max(
                          0,
                          (subscriptionData?.data?.credit_limit ?? 0) +
                            (subscriptionData?.data?.bonusCredits ?? 0) +
                            (subscriptionData?.data?.refferal_credits ?? 0) +
                            (subscriptionData?.data?.addOnCredits ?? 0) -
                            (subscriptionData?.data?.credit ?? 0)
                        ) || 0}
                      </p>
                    </div>
                  </div>
                </Popover.Trigger>
                <Popover.Content>
                  <div className="space-y-2 text-sm popover-arrow-white">
                    <div className="flex justify-between gap-1">
                      <span>Subscription Credits:{' '}</span>
                      <span>{' '}{subscriptionData?.data?.credit_limit ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus Credits:{' '}</span>
                      <span>{subscriptionData?.data?.bonusCredits ?? 0}</span>
                    </div>
                     <div className="flex justify-between">
                      <span>Referral Credits:{' '}</span>
                      <span>{subscriptionData?.data?.refferal_credits ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Add-on Credits:{' '}</span>
                      <span>{subscriptionData?.data?.addOnCredits ?? 0}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Total Credits:{' '}</span>
                      <span>
                        {(subscriptionData?.data?.credit_limit ?? 0) +
                          (subscriptionData?.data?.addOnCredits ?? 0) +
                          (subscriptionData?.data?.bonusCredits ?? 0) +
                          (subscriptionData?.data?.refferal_credits ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used Credits:{' '}</span>
                      <span>{subscriptionData?.data?.credit ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Credits:{' '}</span>
                      <span>
                        {Math.max(
                          0,
                          (subscriptionData?.data?.credit_limit ?? 0) +
                            (subscriptionData?.data?.bonusCredits ?? 0) +
                            (subscriptionData?.data?.refferal_credits ?? 0) +
                            (subscriptionData?.data?.addOnCredits ?? 0) -
                            (subscriptionData?.data?.credit ?? 0)
                        ) || 0} {" "}
                      </span>
                    </div>
                  </div>
                </Popover.Content>
              </Popover>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-[248px] h-[117px] cards_bg bg-[#079E2833] rounded-md flex gap-6 items-center justify-center">
              <div className="w-10 h-10 mr-4 flex items-center bg-primaryBlue greenBoxShadow justify-center  rounded-full">
                <SearchIcon dashboardSarchIcon />
              </div>
              <div>
                <p className="font-size-md font-semibold text-secondaryDark">
                  {" "}
                  RECENT RESEARCH
                </p>
                <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
                  {currentProjects?.[0]?.activities.length || 0}
                </p>
              </div>
            </div>
            <div className="w-[248px] h-[117px] cards_bg bg-[#AF2FEC33] rounded-md flex gap-6 items-center justify-center">
              <div className="w-10 h-10 mr-4 flex items-center bg-primaryPurple purpleBoxShadow justify-center  rounded-full">
                <TeamMember />
              </div>
              <div>
                <p className="font-size-md font-semibold text-secondaryDark">
                  TEAM MEMBERS
                </p>
                <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
                  {(currentProjects && currentProjects[0]?.members?.length) ||
                    0}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full h-[246px] border border-borderColor rounded-lg pr-2 bg-bgGray overflow-y-auto">
            <DashboardActivity
              filterActivities={
                currentProjects && currentProjects?.[0]?.activities
              }
              loading={loading}
            />
          </div>
        </div>
      </div>
      <div className="w-full flex flex-wrap xl:flex-nowrap items-center justify-center gap-4 mt-4">
        <div className="w-full  border border-borderColor rounded-lg  w-full h-auto lg:h-72 bg-bgGray">
        {firstLoader ? (
            <div className="flex items-center justify-center h-full">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <AICreditChart
            seriesData={seriesData && seriesData}
            allMonths={allMonths}
          />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;