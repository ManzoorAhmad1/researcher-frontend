import React from 'react';

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps }) => {
  const steps = ['Choose Your Role', 'Define Your  Goals', ' Select Research Interests', 'Choose Your Keywords'];

  const svgs = [
    <svg className="fill-current" width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 21C0 16.5817 3.58172 13 8 13C12.4183 13 16 16.5817 16 21H0ZM9 15.083V19H13.6586C12.9423 16.9735 11.1684 15.4467 9 15.083ZM7 19V15.083C4.83165 15.4467 3.05766 16.9735 2.34141 19H7ZM8 12C4.685 12 2 9.315 2 6C2 2.685 4.685 0 8 0C11.315 0 14 2.685 14 6C14 9.315 11.315 12 8 12ZM8 10C10.2104 10 12 8.21043 12 6C12 3.78957 10.2104 2 8 2C5.78957 2 4 3.78957 4 6C4 8.21043 5.78957 10 8 10Z" />
    </svg>,
    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM10 14C12.2091 14 14 12.2091 14 10C14 7.79086 12.2091 6 10 6C7.79086 6 6 7.79086 6 10C6 12.2091 7.79086 14 10 14ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16ZM10 12C8.8954 12 8 11.1046 8 10C8 8.8954 8.8954 8 10 8C11.1046 8 12 8.8954 12 10C12 11.1046 11.1046 12 10 12Z" />
    </svg>,
    <svg className="fill-current" width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.1962 1.26791L13.4462 6.89708C13.7223 7.37537 13.5584 7.98696 13.0801 8.2631L11.7806 9.01224L12.7811 10.7451L11.049 11.7451L10.0485 10.0122L8.75 10.7631C8.2717 11.0392 7.6601 10.8753 7.384 10.397L5.5462 7.2146C3.49383 7.8373 2 9.74414 2 11.9999C2 12.6253 2.1148 13.2238 2.32447 13.7756C3.0992 13.2839 4.01643 12.9999 5 12.9999C6.68408 12.9999 8.1737 13.8325 9.0797 15.1085L16.7681 10.6703L17.7681 12.4024L9.8898 16.9509C9.962 17.2892 10 17.6401 10 17.9999C10 18.3426 9.9655 18.6773 9.8999 19.0006L18 18.9999V20.9999L1.00054 21.0011C0.3723 20.1653 0 19.1261 0 17.9999C0 16.9927 0.29782 16.055 0.81021 15.2702C0.29276 14.2947 0 13.1815 0 11.9999C0 9.00464 1.88131 6.44875 4.52677 5.44942L4.13397 4.76791C3.58169 3.81133 3.90944 2.58815 4.86603 2.03586L7.4641 0.535859C8.4207 -0.0164229 9.6439 0.311329 10.1962 1.26791ZM5 14.9999C3.34315 14.9999 2 16.3431 2 17.9999C2 18.3505 2.06014 18.6871 2.17067 18.9998H7.8293C7.9399 18.6871 8 18.3505 8 17.9999C8 16.3431 6.65685 14.9999 5 14.9999ZM8.4641 2.26791L5.86602 3.76791L8.616 8.53105L11.2141 7.03105L8.4641 2.26791Z" />
    </svg>,
    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 15H11V17H9V15ZM10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 18C5.6 18 2 14.4 2 10C2 5.6 5.6 2 10 2C14.4 2 18 5.6 18 10C18 14.4 14.4 18 10 18ZM10 4C7.8 4 6 5.8 6 8H8C8 6.9 8.9 6 10 6C11.1 6 12 6.9 12 8C12 10 9 9.75 9 13H11C11 10.75 14 10.5 14 8C14 5.8 12.2 4 10 4Z" />
    </svg>
  ];

  return (
    <div className="progress-container bg-headerBackground w-full flex py-4 md:py-8 flex-col items-center px-4">
      <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 dark:text-[#CCCCCC] text-center">
        Let's personalize your experience
      </h2>
      <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-5 dark:text-[#CCCCCC] text-center max-w-2xl">
        Providing your research interests allows the platform to deliver tailored and relevant recommendations.
      </p>
      <div className="progress-bar flex items-center justify-between w-full max-w-5xl mb-5 ">
        {steps.map((label, index) => (
          <div className="step flex flex-col items-center flex-1 text-center relative" key={index}>
            <div
              className={`circle ${index < step ? 'bg-[#0E70FF38] text-[#0E70FF]' : 'bg-gray-300 text-gray-500'} flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full`}
            >
              {svgs[index]}
            </div>
            <p className={`mt-1 md:mt-2 text-xs md:text-sm ${index <= step ? 'text-blue-500' : 'text-gray-500'} dark:text-[#CCCCCC]`}>
              {label}
            </p>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-1/4 right-0 left-[calc(50%+20px)] md:left-[calc(50%+24px)] w-[calc(100%-40px)] md:w-[calc(100%-48px)] h-1 ${index < step ? 'bg-[#0E70FF38]' : 'bg-gray-300'} rounded-full`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;