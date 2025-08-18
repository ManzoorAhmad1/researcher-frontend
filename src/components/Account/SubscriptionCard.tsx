import Check from '@/images/userProfileIcon/check';
import React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';

interface SubscriptionCardProps {
    title: any;
    price: number | string;
    features: string[];
    onClick: any;
    isDarkMode?: boolean;
    userData?: any;
    loadingPlan?: any;
    subscriptionPlan?: string;
    isSubscriptionValid?: boolean;
    discountSubscriptionPlan?: string;
    selectedPlan?: any;
    isDialogOpen?: any
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = (
    { title,
        price,
        onClick,
        userData,
        features,
        isDarkMode,
        loadingPlan,
        subscriptionPlan,
        isSubscriptionValid,
        discountSubscriptionPlan,
        selectedPlan,
        isDialogOpen,

    }
) => {
    return (
        <div className={`flex flex-col ${(userData && userData?.subscription_plan === subscriptionPlan||userData && userData?.subscription_plan === discountSubscriptionPlan) ? 'border border-primaryBlue rounded-lg ' : 'border border-borderColor rounded-lg '} p-4 w-full md:w-[280px] min-h-[300px] bg-bgGray`}>
                        <div className={` bg-lightBlue w-full flex flex-col items-center py-2 `}>
                <p className="font-size-medium font-medium text-lightGray">
                    {title}
                </p>
                <p className="flex gap-1 items-center">
                    {typeof price === 'number' && (
                        <>
                            <span className="font-size-medium font-normal text-lightGray">$</span>
                            <span className="font-size-extra-large font-medium text-lightGray">{price}</span>
                        </>
                    )}
                    <span className="font-size-medium font-normal text-lightGray">/month</span>
                </p>
            </div>
            <div className="flex-1 pt-4">
                <ul className="flex flex-col mb-4">
                    {features.map((feature, index) => (
                        <li key={index} className="flex justify-center gap-2 font-size-normal font-normal text-lightGray mb-2">
                            <Check /> {feature}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='flex justify-center'>
                <button
                    onClick={onClick}
                    disabled={subscriptionPlan === 'free' || userData && isSubscriptionValid && userData?.subscription_plan === subscriptionPlan}
                    className={`whitespace-nowrap py-1 px-3 font-size-normal font-medium flex items-center justify-center rounded-3xl transition 
                      ${subscriptionPlan === 'free' || userData && isSubscriptionValid && userData?.subscription_plan === subscriptionPlan ? 'opacity-50 cursor-not-allowed' : ''}
                ${userData && !isDarkMode && userData.subscription_plan === subscriptionPlan
                            ? 'text-primaryBlue border border-primaryBlue' :
                            userData && userData.subscription_plan === subscriptionPlan ? 'border border-primaryBlue text-white'
                                : 'btn text-white'
                        }`}
                >
                    {selectedPlan !== '' && loadingPlan === true && isDialogOpen === false && selectedPlan === subscriptionPlan ||
                        selectedPlan === discountSubscriptionPlan ?
                        <AiOutlineLoading className="animate-spin" size={20} /> :
                        userData ? (
                            !(subscriptionPlan === 'free') && userData.subscription_plan === subscriptionPlan ||
                                userData.subscription_plan === discountSubscriptionPlan
                                && !isSubscriptionValid ? 'Cancel Subscription'
                                : !(subscriptionPlan === 'free') &&
                                    userData.subscription_plan === subscriptionPlan &&
                                    isSubscriptionValid ? 'Selected' :
                                    subscriptionPlan === 'free' ? 'Already Used' :
                                        'Select Plan'
                        ) : (
                            'Select Plan'
                        )}
                </button>


            </div>
        </div >
    );
};

export default SubscriptionCard;
