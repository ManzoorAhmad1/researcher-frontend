"use client"
import React, { useEffect } from "react";
import { useRouter,useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
const Subscription = dynamic(() => import('@/components/Account/Subcription'), {
  ssr: false,
});

const Page = ({ isDarkMode }: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgName = searchParams.get("org_name") as string;

  useEffect(() => {
    if(orgName){
     toast.success(`Invitation from "${orgName}" Organization has been accepted successfully. Congratulations!`)
     router.push(`/account/subscriptions`);
    }
   
 }, [orgName]);
  return (
    <div>
      <Subscription isDarkMode={isDarkMode} />
    </div>
  );
};

export default Page;
