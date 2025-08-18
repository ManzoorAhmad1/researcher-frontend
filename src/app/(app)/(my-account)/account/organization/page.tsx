"use client";
import { TableSection } from "./TableSection";
import { getOrganizationTeam } from "@/apis/team";
import { useState, useEffect, useRef } from "react";
import { useSelector, shallowEqual } from "react-redux";
import OrganizationDetail from "./OrganizationDetail";
import toast from "react-hot-toast";

export default function Tags() {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateData, setUpdateData] = useState<any>({});
  const [pageNo, setPageNo] = useState<any>(1);
  const [limit] = useState<any>(10);
  const [totalTeams, setTotalTeams] = useState<any>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const accountType = useSelector(
    (state: any) => state.user?.user?.user?.account_type,
    shallowEqual
  );

  const user = useSelector(
    (state: any) => state.user?.user?.user,
    shallowEqual
  );
  const [allowEdit, SetAllowEdit] = useState<boolean>(false);

  useEffect(() => {
    if (accountType === "owner" && user) {
      SetAllowEdit(true);
    }
  }, [user]);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
  }, [user?.id]);

  const getTeam = async () => {
    try {
      setLoading(true);
      let response: any = await getOrganizationTeam({
        pageNo: pageNo,
        limit: limit,
        search: searchQuery,
      });
      if (response?.success === false) {
        toast.error(response?.message);
      }
      setTotalTeams(response?.data?.totalOrganizations);
      setTeamData(response?.data?.organizations);
    } catch (error: any) {
      toast.error(error?.response?.message || error?.message || "An error occurred");
      setLoading(false);
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeam();
  }, [pageNo, searchQuery]);

  return (
    <main className="flex flex-1 flex-col gap-4  lg:gap-6 max-w-[calc(100%-32px)] mx-auto">
      <div className="flex justify-end gap-2">
        {allowEdit && !loading && (!teamData || teamData?.length < 1) && (
          <OrganizationDetail getTeam={getTeam} updatedFormData={updateData} />
        )}
      </div>
      <TableSection
        teamData={teamData}
        getTeam={getTeam}
        loading={loading}
        setPageNo={setPageNo}
        pageNo={pageNo}
        limit={limit}
        totalTeams={totalTeams}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />
    </main>
  );
}
