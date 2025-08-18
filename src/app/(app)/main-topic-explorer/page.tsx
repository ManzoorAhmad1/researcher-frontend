"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useRouter,useSearchParams } from "next/navigation";

import SearchParamsWrapper from "@/components/wrapper/SearchParamsWrapper";
import ResearchInterestForm from "@/app/(app)/topic-explorer/ResearchInterestForm";
import { Loader } from "rizzui";
import ResearchInterestsPage from "./research-interests";
import RoleSelectionPage from "./role-selection";
import toast from "react-hot-toast";
import { fetchSubscription } from "@/reducer/services/subscriptionApi";
import { AppDispatch } from "@/reducer/store";
const TopicExporerForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgName = searchParams.get("org_name") as string;
  const teamName = searchParams.get("team_name") as string;
  const [isMounted, setIsMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const user = useSelector((state: any) => state.user?.user?.user );
  const dispatch: AppDispatch = useDispatch();
  React.useEffect(() => {
    if(orgName){
     toast.success(`Invitation from "${orgName}" Organization has been accepted successfully. Congratulations!`)
     router.push(`/main-topic-explorer`);
    }
    if(teamName){
      toast.success(`Invitation from "${teamName}" Team has been accepted successfully. Congratulations!`)
     router.push(`/main-topic-explorer`);
    }
   
 }, [orgName,teamName]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

   React.useEffect(() => {
        if(user?.id){
          const getSubasctiptionData = async () => {  
           await dispatch(fetchSubscription({ id: user.id }))
          };
          getSubasctiptionData()
        }
      },[user])

  React.useEffect(() => {
    if (user?.research_interests && user?.research_interests?.length > 0) {
      router.push("/dashboard");
    }
  }, [user]);
  return (
    <div>
    
      <RoleSelectionPage />
    </div>
  );
};

export default TopicExporerForm;
