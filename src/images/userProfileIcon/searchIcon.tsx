import React from 'react'

const SearchIcon = ({ dashboardSarchIcon, activityIcon }: { dashboardSarchIcon?: boolean, activityIcon?: boolean }) => {
    return (
        <div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.25 0.5C10.976 0.5 14 3.524 14 7.25C14 10.976 10.976 14 7.25 14C3.524 14 0.5 10.976 0.5 7.25C0.5 3.524 3.524 0.5 7.25 0.5ZM7.25 12.5C10.1506 12.5 12.5 10.1506 12.5 7.25C12.5 4.34937 10.1506 2 7.25 2C4.34937 2 2 4.34937 2 7.25C2 10.1506 4.34937 12.5 7.25 12.5ZM13.614 12.5533L15.7353 14.6746L14.6746 15.7353L12.5533 13.614L13.614 12.5533Z" fill={`${dashboardSarchIcon ? '#ffffff' : activityIcon ? "#0E70FF" : '#666666'}`} />
            </svg>
        </div>
    )
}

export default SearchIcon
