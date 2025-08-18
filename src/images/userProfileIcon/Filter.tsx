const FilterIcon = ({ activeIcon, isDarkMode }: { activeIcon?: boolean, isDarkMode?: any }) => {
    return (
      
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="url(#paint0_linear_508_6930)"/>
        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#E5E5E5"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.15901 9.15901C9.58097 8.73705 10.1533 8.5 10.75 8.5H21.25C21.8467 8.5 22.419 8.73705 22.841 9.15901C23.2629 9.58097 23.5 10.1533 23.5 10.75V21.25C23.5 21.8467 23.2629 22.419 22.841 22.841C22.419 23.2629 21.8467 23.5 21.25 23.5H10.75C10.1533 23.5 9.58097 23.2629 9.15901 22.841C8.73705 22.419 8.5 21.8467 8.5 21.25V10.75C8.5 10.1533 8.73705 9.58097 9.15901 9.15901ZM10.75 10C10.5511 10 10.3603 10.079 10.2197 10.2197C10.079 10.3603 10 10.5511 10 10.75V21.25C10 21.4489 10.079 21.6397 10.2197 21.7803C10.3603 21.921 10.5511 22 10.75 22H15.25V10H10.75ZM16.75 10V22H21.25C21.4489 22 21.6397 21.921 21.7803 21.7803C21.921 21.6397 22 21.4489 22 21.25V10.75C22 10.5511 21.921 10.3603 21.7803 10.2197C21.6397 10.079 21.4489 10 21.25 10H16.75Z" fill="#0E70FF"/>
        <defs>
        <linearGradient id="paint0_linear_508_6930" x1="26" y1="34" x2="17.5" y2="12.5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F0F0F0"/>
        <stop offset="1" stop-color="white"/>
        </linearGradient>
        </defs>
        </svg>

    )
}

export default FilterIcon
// #808080