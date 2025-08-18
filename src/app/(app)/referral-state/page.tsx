import React from 'react'
import dynamic from "next/dynamic";
const ReferralStats = dynamic(() => import('@/components/ReferralStats/ReferralStats'), {
  ssr: false,
});
const ReferralStatsPage = () => {
    return (
        <div>
            <ReferralStats />
        </div>
    )
}

export default ReferralStatsPage
