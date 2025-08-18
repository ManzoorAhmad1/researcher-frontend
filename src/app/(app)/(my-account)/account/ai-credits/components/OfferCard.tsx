import React, { useState } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import CreditsModal from "./CreditsModal";

interface OfferCardProps {
  onClick?: () => void;
}
const OfferCard: React.FC<OfferCardProps> = ({ onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        style={{
          background:
            "linear-gradient(130.06deg, #0E70FF 35.77%, #39FFC4 106.31%)",
        }}
        className="h-[120px] rounded-md flex p-6 gap-5 justify-start items-center"
      >
        <OptimizedImage
          width={55}
          height={55}
          src={
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//offer.png`
          }
          alt="balance-icon"
        />
        <div className="flex justify-between flex-col items-baseline">
          <div className="text-[19px] font-medium text-[#FFFFFF]">
          Run Out? Reload Instantly!
          </div>
          <button
            type="button"
            className="border border-white rounded-lg text-white p-1 text-[13px] mt-3"
            onClick={handleOpenModal}
          >
            Buy Your Credits Now
          </button>
        </div>
      </div>

      <CreditsModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default OfferCard;
