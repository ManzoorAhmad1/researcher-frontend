import Exported from '@/images/userProfileIcon/exported';
import React, { useState, useMemo } from 'react';
import moment from 'moment';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link';
import RecentActivity from '@/images/userProfileIcon/recentActivity';
import { useSelector } from 'react-redux';

const formatTime = (dateString: string) => {
    return moment(dateString).fromNow();
}

const DashboardActivity = ({ filterActivities, loading }: any) => {
    const userData = useSelector((state: any) => state?.user?.user?.user);

    const [selectedFilter, setSelectedFilter] = useState("Activity this week");
    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
    };

    const filteredActivities = useMemo(() => {
        if (!filterActivities) return [];

        switch (selectedFilter) {
            case "Activity this week":
                return filterActivities?.filter((activity: any) =>
                    moment(activity.created_at).isSameOrAfter(moment().subtract(7, 'days'))
                );
            case "Activity this month":
                return filterActivities?.filter((activity: any) =>
                    moment(activity.created_at).isSameOrAfter(moment().subtract(1, 'months'))
                );
            case "Recent Activity":
                return filterActivities.filter((activity: any) =>
                    moment(activity.created_at).isSame(moment(), 'day') // Filters activities from today
                );
            case "View all":
                return filterActivities;
            default:
                return filterActivities;
        }
    }, [filterActivities, selectedFilter]);

    const activities = filteredActivities.filter((activity: any) => activity?.user_id === userData?.id).map((activity: any) => ({
        id: activity?.id,
        action: activity?.activity,
        type: activity?.type,
        icon: <Exported />,
        time: formatTime(activity?.created_at),
    }));

    return (
        <div className='pt-3 px-3 max-h-[240px] scrollbar'>
            <div className='flex items-center justify-between mr-0.5'>
                <p className='font-medium font-size-normal text-lightGray'>RECENT ACTIVITY</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className='border border-borderColor rounded-full p-1 flex items-center justify-center bg-bgPrimaryGray'>
                            <RecentActivity />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className="flex flex-col gap-1 px-1 py-1 dropDown bg-dropDown">
                        <DropdownMenuItem
                            onClick={() => handleFilterChange("Recent Activity")}
                            className={selectedFilter === "Recent Activity" ? "text-blue-500 cursor-pointer" : "text-lightGray cursor-pointer"}
                        >
                            Recent Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleFilterChange("Activity this week")}
                            className={selectedFilter === "Activity this week" ? "text-blue-500 cursor-pointer" : "text-lightGray cursor-pointer"}
                        >
                            Activity this week
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleFilterChange("Activity this month")}
                            className={selectedFilter === "Activity this month" ? "text-blue-500 cursor-pointer" : "text-lightGray cursor-pointer"}
                        >
                            Activity this month
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleFilterChange("View all")}
                            className={selectedFilter === "View all" ? "text-blue-500 cursor-pointer" : "text-lightGray cursor-pointer"}
                        >
                            View all
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {loading ? (
                <div className="flex flex-col gap-4 mt-3">
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
                        ></div>
                    ))}
                </div>
            ) : (
                <div className="mt-2 mr-1">
                    {activities.length > 0 ? (
                        activities.map((activity: any) => (
                            <div
                                key={activity?.id}
                                className="flex items-center justify-between py-2 border-b last:border-b-0"
                            >
                                <div className="w-full flex items-center space-x-2 py-2">
                                    <div className="border border-borderColor rounded-full p-2 bg-bgPrimaryGray">
                                        {activity?.icon}
                                    </div>
                                    <div className="w-full flex flex-col">
                                        <div className="w-full flex items-center justify-between">
                                            <div className='flex flex-col'>
                                                <p className="text-blue-500 font-size-small font-normal whitespace-nowrap">
                                                    {activity?.type}
                                                </p>
                                                <p className="text-darkGray font-size-small font-normal break-words">
                                                    {activity?.action}
                                                </p>
                                            </div>
                                            <p className="font-size-small font-normal text-secondaryGray truncate mb-7">
                                                {activity?.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-lightGray font-size-small font-normal mt-20">
                            NO RECENT ACTIVITY FOUND
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardActivity;