import React from 'react'

const AICridet = ({ activeTab, isDarkMode }: { activeTab: boolean, isDarkMode?: any }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.75 2L2.5 0.5L0.25 2V13.25C0.25 14.4927 1.25736 15.5 2.5 15.5H13C14.2427 15.5 15.25 14.4927 15.25 13.25V11H13.75V2L11.5 0.5L9.25 2L7 0.5L4.75 2ZM12.25 11H3.25V13.25C3.25 13.6642 2.91421 14 2.5 14C2.08579 14 1.75 13.6642 1.75 13.25V2.80278L2.5 2.30277L4.75 3.80277L7 2.30277L9.25 3.80277L11.5 2.30277L12.25 2.80278V11ZM13 14H4.62197C4.70489 13.7654 4.75 13.5129 4.75 13.25V12.5H13.75V13.25C13.75 13.6642 13.4142 14 13 14Z" fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"} />
        </svg>

    )
}

export default AICridet






