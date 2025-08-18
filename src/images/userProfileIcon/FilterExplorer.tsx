const FilterExplorer = ({ isFilterOpen }: any) => {
  
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 16C0.5 7.43959 7.43959 0.5 16 0.5C24.5604 0.5 31.5 7.43959 31.5 16C31.5 24.5604 24.5604 31.5 16 31.5C7.43959 31.5 0.5 24.5604 0.5 16Z"
        fill="url(#paint0_linear_508_6941)"
      />
      <path
        d="M0.5 16C0.5 7.43959 7.43959 0.5 16 0.5C24.5604 0.5 31.5 7.43959 31.5 16C31.5 24.5604 24.5604 31.5 16 31.5C7.43959 31.5 0.5 24.5604 0.5 16Z"
        stroke="#E5E5E5"
      />
      <path
        d="M23.5 9.25H8.5L14.5 16.345V21.25L17.5 22.75V16.345L23.5 9.25Z"
        stroke={isFilterOpen ? "#0E70FF" : "#808080"} // Conditional stroke color
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_508_6941"
          x1="26"
          y1="34"
          x2="17.5"
          y2="12.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F0F0" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default FilterExplorer;
