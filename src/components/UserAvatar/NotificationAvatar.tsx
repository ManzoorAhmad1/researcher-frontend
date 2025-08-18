"use client";
import { OptimizedImage } from "../ui/optimized-image";

export default function UserAvatar() {
  return (
    <OptimizedImage
      src={
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//bell.png`
      }
      alt={"avatar"}
      width={25}
      height={25}
      className="rounded-full"
    />
  );
}
