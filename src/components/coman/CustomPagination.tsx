import { ChevronLeft, ChevronRight } from "lucide-react";

const CustomPagination = ({ currentPage, totalPages, onPageChange }:any) => {
  const maxVisiblePages = 5;

  const generatePagination = () => {
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
     
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1); 

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 4; 
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages); 
    }

    return pages;
  };

  return (
    <div className="flex justify-center p-4 dark:bg-[#223036] dark:text-[#999999]">
      <span
        className={`border border-[#ccc] rounded-[7px] p-[5px] ${
          currentPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={18} color={currentPage === 1 ? "#999999" : "#0E70FF"} />
      </span>

      {generatePagination().map((page, index) => (
        <span
          key={index}
          className={`border border-[#ccc] rounded-[7px] py-[5px] px-[10px] mx-1 ${
            currentPage === page ? "bg-[#0e70ff] text-white" : "cursor-pointer"
          }`}
          onClick={() => typeof page === "number" && onPageChange(page)}
        >
          {page}
        </span>
      ))}

      <span
        className={`border border-[#ccc] rounded-[7px] p-[5px] ${
          currentPage === totalPages ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
      >
        <ChevronRight size={18} color={currentPage === totalPages ? "#999999" : "#0E70FF"} />
      </span>
    </div>
  );
};

export default CustomPagination;
