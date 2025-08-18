import React from "react";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface TeamMemberActivityProps {
  name: string;
  activity: number;
}

const TeamMemberActivity = ({ name, activity }: TeamMemberActivityProps) => {
  const progressPercentage = (activity / 40) * 100;

  return (
    <div className="w-full  flex  items-center justify-center gap-4 lg:mt-2 ">
      <div className="flex-shrink-0">
        <OptimizedImage
          src={
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//user_profile_image.jpg`
          }
          alt="Profile User"
          className="rounded-full h-10 w-10 object-cover"
          width={ImageSizes.avatar.md.width}
          height={ImageSizes.avatar.md.height}
        />
      </div>
      <div className=" w-full flex flex-col mb-4">
        <span className="font-size-normal font-normal text-lightGray">
          {name}
        </span>
        <div className=" w-full flex gap-4 items-center h-2 rounded">
          <div
            className="h-full bg-secondaryGreen rounded"
            style={{ width: `${progressPercentage}%` }}
          ></div>
          <span className="font-size-md font-normal text-lightGray">
            {activity}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberActivity;
