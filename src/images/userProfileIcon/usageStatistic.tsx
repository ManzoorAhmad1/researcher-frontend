import React from 'react'

const usageStatistic = ({ activeTab, isDarkMode }: { activeTab: boolean, isDarkMode?: any }) => {
    return (
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.75 0.25V12.25H13.75V13.75H0.25V0.25H1.75ZM13.2197 2.71967L14.2803 3.78033L10 8.06065L7.75 5.81125L4.53033 9.03032L3.46967 7.96968L7.75 3.68934L10 5.93875L13.2197 2.71967Z" fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"} />
        </svg>

    )
}

export default usageStatistic
