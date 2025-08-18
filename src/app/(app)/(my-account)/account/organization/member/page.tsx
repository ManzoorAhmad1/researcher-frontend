"use client";
import React, { useState, useEffect } from "react";
import { HeaderTitle } from "@/components/Header/HeaderTitle";
import { TableSection } from "./TableSection";
import { getOrganizationTeam, getAllOrganizationMembers } from "@/apis/team";
import { useSelector, shallowEqual } from "react-redux";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/review-stage-select ";
import { ChevronDown } from "lucide-react";
import MemberDetail from "./MemberDetail";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function Tags() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get("id");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNo, setPageNo] = useState<any>(1);
  const [limit, setLimit] = useState<any>(10);
  const [totalTeamsMember, setTotalTeamsMember] = useState<any>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationData, setOrganizationData] = useState<any[]>([]);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [allFilters, setAllFilters] = useState<any>([
    {
      name: "Name",
      filters: [],
      selectedFilters: [],
      order: "order-1",
    },
    {
      name: "Role",
      filters: [],
      selectedFilters: [],
      order: "order-2",
    },
    {
      name: "Email",
      filters: [],
      selectedFilters: [],
      order: "order-3",
    },
    {
      name: "Status",
      order: "order-4",
      filters: [],
      selectedFilters: [],
    },
  ]);

  const handleIdRetrieve = (id: string) => {
    setMemberId(id);
  };
  const fetchTeamMembers = async (restrictRefresh?: boolean) => {
    try {
      if (!orgId) {
        toast.error("Organization ID is required");
        return;
      }

      if (!restrictRefresh) {
        setLoading(true);
      }
      const response: any = await getAllOrganizationMembers({
        orgId: orgId,
        pageNo: pageNo === -1 ? 1 : pageNo,
        limit,
        search: searchQuery,
        allFilters,
      });
      if (response?.success === false) {
        toast.error(response?.message);
      }

      setTeamMembers(response.members || []);
      setIsMember(response.isMember);
      setTotalTeamsMember({
        totalMembers: response.totalMembers || 0,
        members: response.members || [],
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching organization members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterItems = (items: string[] | []) => {
    const UniqueItems: any = [...(new Set(items) as any)];
    return UniqueItems.map((item: string) => ({
      label:
        item === "team_member"
          ? "Team Member"
          : item === "team_owner"
          ? "Team Owner"
          : item,
      value: item,
    }));
  };

  const getOrganization = async () => {
    try {
      setLoading(true);
      let response: any = await getOrganizationTeam({
        pageNo: pageNo,
        limit: limit,
        search: "",
      });
      if (response?.success === false) {
        toast.error(response?.message);
      }
      setOrganizationData(response?.data?.organizations);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageNo === -1) setPageNo(1);
    fetchTeamMembers();
  }, [pageNo, searchQuery]);
  const user = useSelector(
    (state: any) => state.user?.user?.user,
    shallowEqual
  );
  const [allowEdit, SetAllowEdit] = useState<boolean>(false);
  useEffect(() => {
    getOrganization();
    if (user?.account_type === "owner") {
      SetAllowEdit(true);
    }
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 lg:gap-6 max-w-[calc(100%-32px)] mx-auto">
      <Card className="border border-tableBorder  bg-secondaryBackground py-1">
        <MemberDetail
          onIdRetrieve={handleIdRetrieve}
          fetchTeamMembers={fetchTeamMembers}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
          isMember={isMember || loading}
        />
        <TableSection
          teamMembers={teamMembers}
          loading={loading}
          fetchTeamMembers={fetchTeamMembers}
          setPageNo={setPageNo}
          pageNo={pageNo}
          totalTeamsMember={totalTeamsMember}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
          allowEdit={allowEdit}
          setLimit={setLimit}
          limit={limit}
        />
      </Card>
    </main>
  );
}
