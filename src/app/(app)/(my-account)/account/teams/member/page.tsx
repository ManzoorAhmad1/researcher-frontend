"use client";
import React, { useState, useEffect } from "react";
import { TableSection } from "./TableSection";
import { getOrganizationTeam, getTeamMember } from "@/apis/team";
import { useSelector ,shallowEqual} from "react-redux";
import { Card } from "@/components/ui/card";
import MemberDetail from "./MemberDetail";
import toast from "react-hot-toast";

export default function Tags() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNo, setPageNo] = useState<any>(1);
  const [limit, setLimit] = useState<any>(10);
  const [totalTeamsMember, setTotalTeamsMember] = useState<any>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationData, setOrganizationData] = useState<any[]>([]);
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
    setTeamId(id);
  };

  const fetchTeamMembers = async (restrictRefresh?: boolean) => {
    if (teamId) {
      try {
        if (!restrictRefresh) {
          setLoading(true);
        }
        const response: any = await getTeamMember({
          team_id: teamId,
          pageNo: pageNo === -1 ? 1 : pageNo,
          limit,
          search: searchQuery,
          allFilters,
        });
        if (response?.success === false) {
          toast.error(response?.message);
        }
        setTotalTeamsMember(response?.data);

        const emails: any = response?.data?.members?.map(
          (member: any) => member?.email
        );
        const roles = response?.data?.members?.map(
          (member: any) => member?.role
        );
        const statuses = response?.data?.members?.map(
          (member: any) => member?.status
        );
        const uniqueEmails = handleFilterItems(emails);
        const uniqueRoles = handleFilterItems(roles);
        const uniqueStatuses = handleFilterItems(statuses);
        setTeamMembers(response?.data?.members || []);
        const updatedFilters = allFilters?.filter(
          (item: any) =>
            item.name !== "Role" &&
            item.name !== "Email" &&
            item.name !== "Status"
        );
        const EmailSelectedFIlters = allFilters?.find(
          (item: any) => item.name === "Email"
        );
        const RolesSelectedFIlters = allFilters?.find(
          (item: any) => item.name === "Role"
        );
        const StatusSelectedFIlters = allFilters?.find(
          (item: any) => item.name === "Status"
        );

        setAllFilters?.([
          ...updatedFilters,
          {
            name: "Role",
            filters: uniqueRoles,
            selectedFilters: RolesSelectedFIlters?.selectedFilters,
            order: "order-2",
          },
          {
            name: "Email",
            filters: uniqueEmails,
            selectedFilters: EmailSelectedFIlters?.selectedFilters,
            order: "order-3",
          },
          {
            name: "Status",
            filters: uniqueStatuses,
            selectedFilters: StatusSelectedFIlters?.selectedFilters,
            order: "order-4",
          },
        ]);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
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
        pageNo: "",
        limit: "",
        search: "",
      });
      if (response?.success === false) {
        toast.error(response?.message);
      }
      setOrganizationData(response?.data?.organizations);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.message || error?.message || "An error occurred");
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (pageNo === -1) setPageNo(1);
    fetchTeamMembers();
  }, [teamId, pageNo, searchQuery]);
  const user = useSelector((state: any) => state.user?.user?.user,shallowEqual);
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
          isTeamMember={totalTeamsMember?.isTeamMember}
        />
        <TableSection
          teamMembers={teamMembers}
          loading={loading}
          fetchTeamMembers={fetchTeamMembers}
          setPageNo={setPageNo}
          pageNo={pageNo}
          totalTeamsMember={totalTeamsMember}
          allowEdit={allowEdit}
          setLimit={setLimit}
          limit={limit}
        />
      </Card>
    </main>
  );
}
