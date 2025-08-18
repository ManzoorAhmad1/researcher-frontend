
import React from "react";
import { RiNewspaperLine } from "react-icons/ri";


const Reminders = ({ reminders, loading }: any) => {

    // Don't render anything if no reminders exist and not loading
    if (!loading && (!reminders || (!reminders?.pending?.length && !reminders?.completed?.length))) {
        return null;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (type: string, status: string) => {
        const iconColor = status === 'pending' ? '#f59e0b' : '#10b981';
        
        switch (type) {
            case 'note':
            case 'bookmark':
                return (
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1.5 15H16.5V16.5H1.5V15ZM3 9H4.5V14.25H3V9ZM6.75 9H8.25V14.25H6.75V9ZM9.75 9H11.25V14.25H9.75V9ZM13.5 9H15V14.25H13.5V9ZM1.5 5.25L9 1.5L16.5 5.25V8.25H1.5V5.25ZM3 6.17705V6.75H15V6.17705L9 3.17705L3 6.17705ZM9 6C8.58577 6 8.25 5.66421 8.25 5.25C8.25 4.83579 8.58577 4.5 9 4.5C9.41422 4.5 9.75 4.83579 9.75 5.25C9.75 5.66421 9.41422 6 9 6Z"
                            fill={iconColor}
                        />
                    </svg>
                );
            case 'paper':
                return (
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6.75 1.50239V1.5H14.9984C15.4135 1.5 15.75 1.84148 15.75 2.24385V15.7561C15.75 16.167 15.4163 16.5 15.0049 16.5H2.99505C2.58357 16.5 2.25 16.1626 2.25 15.7449V6L6.75 1.50239ZM4.37188 6H6.75V3.62314L4.37188 6ZM8.25 3V6.75C8.25 7.16421 7.91423 7.5 7.5 7.5H3.75V15H14.25V3H8.25Z"
                            fill={iconColor}
                        />
                    </svg>
                );
            default:
                return (
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1.5 15H16.5V16.5H1.5V15ZM3 9H4.5V14.25H3V9ZM6.75 9H8.25V14.25H6.75V9ZM9.75 9H11.25V14.25H9.75V9ZM13.5 9H15V14.25H13.5V9ZM1.5 5.25L9 1.5L16.5 5.25V8.25H1.5V5.25ZM3 6.17705V6.75H15V6.17705L9 3.17705L3 6.17705ZM9 6C8.58577 6 8.25 5.66421 8.25 5.25C8.25 4.83579 8.58577 4.5 9 4.5C9.41422 4.5 9.75 4.83579 9.75 5.25C9.75 5.66421 9.41422 6 9 6Z"
                            fill={iconColor}
                        />
                    </svg>
                );
        }
    };

    const renderReminderItem = (item: any) => (
        <div key={item.id} className={`group relative border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 ${
            item.status === 'pending' 
                ? 'bg-amber-50 dark:bg-amber-900/20'
                : 'bg-emerald-50 dark:bg-emerald-900/20'
        }`}>
            <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                    <div className={`w-5 h-5 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-gray-600 transition-colors ${
                        item.status === 'pending' 
                            ? 'bg-amber-100 dark:bg-amber-800/30'
                            : 'bg-emerald-100 dark:bg-emerald-800/30'
                    }`}>
                        {getTypeIcon(item.type, item.status)}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-xs leading-4 line-clamp-1 flex-1 mr-2">
                            {item.description}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
                            {formatDate(item.scheduled_at)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSection = (title: string, items: any[], emptyMessage: string) => (
        items?.length> 0 &&<div className="mb-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                    {title}
                </h3>
              
            </div>
            {items?.length === 0 ? null : (
                <div className="space-y-1">
                    {items?.map(renderReminderItem)}
                </div>
            )}
        </div>
    );

    return (
        <div className="mt-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <RiNewspaperLine className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Reminders</h2>
                    </div>
                </div>
            </div>

            <div className="p-3">
                {loading ? (
                    <div className="space-y-1">
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="animate-pulse"
                            >
                                <div className="flex items-start gap-2 p-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mr-2"></div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3 flex-shrink-0"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )  : (
                    <div>
                        {renderSection(
                            "Pending Reminders", 
                            reminders?.pending || [], 
                            "No pending reminders"
                        )}
                        {renderSection(
                            "Completed Reminders", 
                            reminders?.completed || [], 
                            "No completed reminders"
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reminders;
