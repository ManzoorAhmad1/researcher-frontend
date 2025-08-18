"use client";
import { TableSection } from "./TableSection";
import { getAllTeam } from "@/apis/team";
import { useState, useEffect } from "react";
import { useSelector ,shallowEqual} from "react-redux";
import { useSearchParams } from "next/navigation";
import TeamDetail from "./TeamDetail";
import { toast } from "react-hot-toast";
export default function Tags() {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateData, setUpdateData] = useState<any>({});
  const [pageNo, setPageNo] = useState<any>(1);
  const [limit] = useState<any>(10);
  const [totalTeams, setTotalTeams] = useState<any>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const params = useSearchParams();
  const organizationId = params.get("id");

  const getTeam = async () => {
    try {
      setLoading(true);
      let response = await getAllTeam({
        pageNo: pageNo,
        limit: limit,
        search: searchQuery,
        organizationId,
      });
      setTotalTeams(response?.data);
      setTeamData(response?.data?.teams);
     
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching team data:", error);
     
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeam();
  }, [pageNo, searchQuery]);

  const accountType = useSelector(
    (state: any) => state.user?.user?.user?.account_type,shallowEqual
  );
  const [allowEdit, SetAllowEdit] = useState<boolean>(false);
  useEffect(() => {
    if (accountType === "owner") {
      SetAllowEdit(true);
    }
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 lg:gap-6 max-w-[calc(100%-32px)] mx-auto">
      {allowEdit && (
        <TeamDetail getTeam={getTeam} updatedFormData={updateData} />
      )}
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
