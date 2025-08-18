"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserQuery } from "@/redux/services/authApi";
import { OptimizedImage } from "@/components/ui/optimized-image";
import UserProfile from "@/images/avatar.png";
import bell from "@/images/bell.png";
import { ImageSizes } from "@/utils/image-optimizations";

export default function UserAvatar() {
  const { data: user, error, isLoading } = useGetUserQuery();

  if (isLoading) {
    return <Skeleton className="h-12 w-12 rounded-full" />;
  }

  const profile_image =
    user?.profile_image ||
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/userProfileImage/uploads/19/images.png`;

  return (
    <OptimizedImage
      src={profile_image}
      alt="User avatar"
      width={40}
      height={40}
      className="rounded-full object-cover"
      loading="lazy"
      quality={75}
      priority={false}
      sizes="(max-width: 768px) 40px, 40px"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = UserProfile.src;
      }}
    />
  );
}
