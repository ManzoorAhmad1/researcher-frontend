import React from 'react'

const workspace = ({ activeTab, isDarkMode }: { activeTab: boolean, isDarkMode?: any }) => {
    return (
        <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 10H14V1.75H2V10ZM8.75 11.5V13H11.75V14.5H4.25V13H7.25V11.5H1.24385C0.833037 11.5 0.5 11.1633 0.5 10.7444V1.00561C0.5 0.588303 0.841482 0.25 1.24385 0.25H14.7561C15.167 0.25 15.5 0.58669 15.5 1.00561V10.7444C15.5 11.1617 15.1585 11.5 14.7561 11.5H8.75Z" fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"} />
        </svg>

    )
}

export default workspace
