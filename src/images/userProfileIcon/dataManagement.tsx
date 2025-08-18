import React from 'react'

const dataManagement = ({ activeTab, isDarkMode }: { activeTab: boolean, isDarkMode?: any }) => {
    return (
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.25 12.25V4.75H2V12.25H7.25ZM7.25 3.25V1C7.25 0.58579 7.58577 0.25 8 0.25H14.75C15.1642 0.25 15.5 0.58579 15.5 1V13C15.5 13.4142 15.1642 13.75 14.75 13.75H1.25C0.83579 13.75 0.5 13.4142 0.5 13V4C0.5 3.58579 0.83579 3.25 1.25 3.25H7.25ZM8.75 1.75V12.25H14V1.75H8.75ZM2.75 10H6.5V11.5H2.75V10ZM9.5 10H13.25V11.5H9.5V10ZM9.5 7.75H13.25V9.25H9.5V7.75ZM9.5 5.5H13.25V7H9.5V5.5ZM2.75 7.75H6.5V9.25H2.75V7.75Z" fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"}
            />
        </svg>

    )
}

export default dataManagement
