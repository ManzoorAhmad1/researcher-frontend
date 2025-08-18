import React from 'react'

const organization = ({ activeTab, isDarkMode }: { activeTab: boolean, isDarkMode?: any }) => {
    return (
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.75 14H17.25V15.5H0.75V14H2.25V1.25C2.25 0.83579 2.58579 0.5 3 0.5H15C15.4142 0.5 15.75 0.83579 15.75 1.25V14ZM14.25 14V2H3.75V14H14.25ZM6 7.25H8.25V8.75H6V7.25ZM6 4.25H8.25V5.75H6V4.25ZM6 10.25H8.25V11.75H6V10.25ZM9.75 10.25H12V11.75H9.75V10.25ZM9.75 7.25H12V8.75H9.75V7.25ZM9.75 4.25H12V5.75H9.75V4.25Z" fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"} />
        </svg>

    )
}

export default organization
