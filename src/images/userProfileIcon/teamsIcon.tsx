import React from 'react'

const teamsIcon = ({ activeTab, isDarkMode }: { activeTab: boolean, isDarkMode?: any }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-users">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"}/>
        <circle cx="9" cy="7" r="4" fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"}/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87 " fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"}/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" fill={activeTab ? "#0E70FF" : isDarkMode ? "#ffffff" : "#999999"}/>
    </svg>
  )
}

export default teamsIcon