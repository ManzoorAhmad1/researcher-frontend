/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { RootState } from "@/reducer/store";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { CgProfile } from "react-icons/cg";
import { SiGoogledocs } from "react-icons/si";
import { useSelector } from "react-redux";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AccessPageProps } from "../../utils/types";
import { requestList, updateNote } from "@/apis/notes-bookmarks";
import { OptimizedImage } from "@/components/ui/optimized-image";
interface FormValues {
  message: string;
}

const AccessPage: React.FC<AccessPageProps> = ({ isSingleNote }) => {
  const params = useParams();
  const { slug } = params;
  const id = slug?.[slug?.length - 1];
  const [requestSend, setRequestSend] = useState(true);
  const supabase: SupabaseClient = createClient();
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const requestAllList = async () => {
    const apiRes = await requestList(id);
    return apiRes?.data;
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const list = await requestAllList();

    const currentRequest = list?.request || [];

    const updatedRequest = [
      ...currentRequest,
      {
        email: userInfo?.email,
        id: userInfo?.id,
        message: data?.message,
        first_name: userInfo?.first_name,
        last_name: userInfo?.last_name,
        role: "Viewer",
      },
    ];




    const response = await updateNote(id, { request: updatedRequest });

    if (response.isSuccess == false) {
      console.error("Error updating data:", response?.message);
    } else {
      console.log("Array updated successfully!", response?.data);
    }
    setRequestSend(true);
  };

  useEffect(() => {
    setRequestSend(
      isSingleNote?.request?.some((item) => item?.email === userInfo?.email) ??
        false
    );
  }, [isSingleNote]);

  return (
    <div>
      <div className="flex mt-5 max-w-[40%] mx-auto">
        <div>
          <div className="flex items-center">
            <SiGoogledocs color="#7CADFF" className="text-3xl" />
            <span className="text-lg ps-4 font-medium">
              ResearchCollab Docs
            </span>
          </div>
          {requestSend ? (
            <>
              <div className="text-3xl font-light mt-5">Request sent</div>
              <div className="mt-2 font-extralight text-[14px]">
                You&apos;ll get an email letting you know if your request was
                approved.
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-light mt-5">You need access</div>
              <div className="mt-2 font-extralight text-[14px]">
                Request access, or switch to an account with access.
              </div>
              <div className="text-blue-500 font-normal text-[14px]">
                Learn more
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <textarea
                    cols={45}
                    rows={3}
                    className="border rounded-lg border-[#ccc] p-2 mt-3 dark:bg-transparent outline-none"
                    {...register("message")}
                  ></textarea>
                </div>
                <Button
                  className="rounded-[26px] btn text-white h-9 w-36 mt-3 hover:text-white"
                  variant="outline"
                  type="submit"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    "Request Access"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
        <div>
          <OptimizedImage
            src={
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//access-control.png`
            }
            alt="access-control-icon"
            width={300}
            height={300}
          />
        </div>
      </div>
      {!requestSend && (
        <div className="mt-14 flex justify-center flex-col items-center">
          <div className="text-[13px] text-gray-500">
            {"You&apos;re signed in as"}
          </div>
          <div className="border border-[#ccc] rounded-full px-1 py-1 mt-1 flex items-center gap-1">
            <CgProfile className="text-xl" />
            <span className="text-[14px]">{userInfo?.email}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessPage;
