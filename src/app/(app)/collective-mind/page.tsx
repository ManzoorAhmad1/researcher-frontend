/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import Menu from "./menu/Menu";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import CollectiveNetWorkChart from "./chart/CollectiveNetWorkChart";
import CollectiveFileCharts from "./chart/CollectiveFileCharts";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import ListView from "./ListView";
import { collectiveMindFetchChartData } from "@/reducer/collective-mide/collectiveMindSlice";
import { AppDispatch } from "@/reducer/store";
import { collectiveMindNetWorkData } from "@/apis/collective-maind";

const Page = () => {
  const dispatch = useDispatch<AppDispatch>()
  const supabase: SupabaseClient = createClient();
  const [activeTab, setActiveTab] = useState<string>("network-chart");
  const [loading, setLoading] = useState<boolean>(true);
  const [apiDatas, setApiDatas] = useState<any>([]);
  const user_id = useSelector((state: any) => state?.user?.user?.user?.id);
  const { netWorkloading, netWorkChartData } = useSelector((state: any) => state.collectiveMind)

  const fetchData = async () => {
    try {
      const response = await collectiveMindNetWorkData(user_id);

      if (response?.data && response?.data?.length > 0) {
        setApiDatas(response?.data);
      }
    } catch (error) {
      console.error("🚀 ~ fetchData ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (user_id) {
      fetchData();
    }
  }, [user_id]);

  useEffect(() => {
    dispatch(collectiveMindFetchChartData(user_id))
  }, [dispatch])

  return (
    <main className="bg-[#FAFAFA] dark:bg-[#020818] h-full overflow-scroll pb-0">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <section className="bg-[#F1F1F1] dark:bg-[#142328] flex justify-center pt-12 flex-col items-center">
          <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
            Collective Mind
          </h1>
          <p className="text-sm font-normal text-[#666666] mt-3 dark:text-[#999999]">
            Collecting and presenting shared data in the application
          </p>
          <div className="self-start ms-3 my-3">
            <Menu />
          </div>
        </section>
        <div className="mt-[-10px] px-[24px] pt-[24px]">
          <TabsContent value="network-chart">
            <CollectiveNetWorkChart apiDatas={netWorkChartData} loading={netWorkloading} />
          </TabsContent>
          <TabsContent value="FileCharts">
            <CollectiveFileCharts apiDatas={apiDatas} loading={loading} />
          </TabsContent>
          <TabsContent value="list-view"><ListView apiDatas={apiDatas} loading={loading} fetchData={fetchData} /></TabsContent>
          <TabsContent value="items"></TabsContent>
        </div>
      </Tabs>
    </main>
  );
};

export default Page;
