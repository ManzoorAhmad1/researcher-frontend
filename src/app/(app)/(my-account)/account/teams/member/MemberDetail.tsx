import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useSelector, shallowEqual } from "react-redux";
import SearchIcon from "@/images/search.svg";

import AddMemberDrawer from "../../(drawer)/AddMemberDrawer";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface FormData {
  email: string;
  role: string;
  team_id: string;
}

interface MemberDetailProps {
  onIdRetrieve: (id: string) => void;
  fetchTeamMembers: any;
  searchQuery: any;
  setSearchQuery: (value: any) => void;

  isTeamMember: boolean;
}

const MemberDetail: React.FC<MemberDetailProps> = ({
  onIdRetrieve,
  fetchTeamMembers,
  searchQuery,
  setSearchQuery,

  isTeamMember,
}) => {
  const methods = useForm<FormData>({
    defaultValues: {
      email: "",
      role: "",
      team_id: "",
    },
  });
  const {
    formState: { errors },
    setValue,
  } = methods;
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id");
  const teamId = searchParams.get("id");
  const user = useSelector(
    (state: any) => state.user?.user?.user,
    shallowEqual
  );
  const [allowEdit, SetAllowEdit] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (teamId) {
      setValue("team_id", teamId);
    }
    if (memberId) {
      onIdRetrieve(memberId);
    }
  }, [memberId, onIdRetrieve, setValue]);

  useEffect(() => {
    if (user?.account_type === "owner") {
      SetAllowEdit(true);
    }
  }, []);
  const teamName = searchParams.get("name");
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  return (
    <>
      <div className="p-4 border-b border-tableBorder bg-secondaryBackground">
        <p className="font-size-medium mb-[12px]">{teamName}</p>
        <div className="flex flex-wrap justify-between lg:flex-nowrap  items-center gap-3">
          <div className="flex  max-w-sm gap-4 w-full lg:w-fit">
            <div className="relative w-full">
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-500">
                  <OptimizedImage
                    src={
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//search.svg`
                    }
                    alt="search icon"
                    width={ImageSizes.icon.xs.width}
                    height={ImageSizes.icon.xs.height}
                  />
                </span>

                <input
                  id="content"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-inputBackground border outline-none tableBorder text-foreground text-sm rounded-full block w-full pl-10 p-2.5"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-[12px] items-center justify-center lg:justify-start  w-full lg:w-fit">
            {allowEdit && !isTeamMember && (
              <>
                <Button
                  onClick={() => setShow(true)}
                  className="rounded-[26px] btn text-[#ffff] w-full"
                >
                  + Add Team Member
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {show && (
        <AddMemberDrawer
          handleDrawerClose={() => setShow(false)}
          fetchTeamMembers={fetchTeamMembers}
          teamSpace={true}
        />
      )}
    </>
  );
};

export default MemberDetail;
