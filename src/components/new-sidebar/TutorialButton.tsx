"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import onboardingTour from '../onboardingTour';
import { useSelector } from 'react-redux';
import { RootState } from '@/reducer/store';
import { LiaGraduationCapSolid } from "react-icons/lia";

interface TutorialButtonProps {
  className?: string;
}

const TutorialButton: React.FC<TutorialButtonProps> = ({ className }) => {  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false); // Don't animate by default
  const pathname = usePathname();
  const { lightMode } = useSelector((state: RootState) => state.userUtils ?? {});// Get the current route name for the tooltip
  const getRouteDisplayName = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/web-search')|| pathname.includes('/creative-thinking')|| pathname.includes('/topic-analysis')|| pathname.includes('/outline-generator')) return 'Topic Explorer';
    if (pathname.includes('/papers')) return 'Search Papers';
    if (pathname === '/myprojects') return 'My Projects';
    if (pathname.includes('/collaboration')) return 'Collaboration';
    if (pathname.includes('/project-overview')) return 'Project Overview';
    if (pathname.includes('/project-overview')) return 'Project Details';
    if (pathname.includes('/referral-state')) return 'Share & Referral';
    if( pathname.includes('/collective-mind')) return 'Collective Mind';
    if( pathname.includes('/knowledge-bank')) return 'Knowledge Bank';
    if (pathname.includes('/account')) return 'Account Modules';
    return 'Current Page';
  };
  
  // Function to determine which tutorial video to show based on current route
  const getTutorialForRoute = () => {
    // Map routes to their corresponding tour element IDs
    let elementId = ''; // Default to dashboard
    
    if (pathname.includes('/dashboard')) {
      elementId = '#dashboard-link';
    } else if (pathname.includes('/web-search')|| pathname.includes('/creative-thinking')|| pathname.includes('/topic-analysis')|| pathname.includes('/outline-generator')) {
      elementId = '#explorer-link';
    } else if (pathname.includes('/papers')) {
      elementId = '#search-papers';
    } else if (pathname === '/myprojects') {
      elementId = '#my-projects';
    } else if (pathname.includes('/explorer')) {
      elementId = '#my-projects';
    }else if (pathname.includes('/collaboration')) {
      elementId = '#collaboration';
    } else if (pathname.includes('/project-overview')) {
      elementId = '#my-projects';
    }

    // Find the tutorial item with the matching element ID
    const tutorial:any = onboardingTour.find(item => item.element === elementId);    // Default tutorial if no match is found
    if (!tutorial) {
      return {
        title: "📚 " + getRouteDisplayName() + " Tutorial",        description: `
          <style>
            .tutorial-description {
              text-align: center; 
              font-family: Arial, sans-serif; 
              padding: 40px 20px;
            }
            .tutorial-emoji {
              font-size: 72px; 
              margin-bottom: 20px;
            }
            .tutorial-title {
              font-size: 24px; 
              font-weight: bold; 
              color: #0E70FF; 
              margin-bottom: 16px;
            }
            .tutorial-text {
              font-size: 16px;
              line-height: 1.6;
              color: #555;
            }
            .dark .tutorial-text, html[class~="dark"] .tutorial-text {
              color: #ffffff;
            }
          </style>
          <div class="tutorial-description">
            <div class="tutorial-emoji">🎬</div>
            <h2 class="tutorial-title">Coming Soon!</h2>
            <p class="tutorial-text">
              We're currently working on a tutorial video for this section.
              <br/>
              Check back soon for helpful guidance on how to use all features in this area.
            </p>
          </div>
        `
      };
    }

    return tutorial.popover;
  };
  const tutorial = getTutorialForRoute();
  
  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">          
             <LiaGraduationCapSolid    
                onClick={() => {
                  setIsOpen(true);
                  setIsPulsing(true); // Start pulsing when clicked
                }}
                onMouseEnter={() => {
                  setIsHovering(true);
                  setIsPulsing(true); // Start pulsing on hover
                }}
                onMouseLeave={() => {
                  setIsHovering(false);
                  setIsPulsing(false); // Stop pulsing when not hovering
                }}
                className={`cursor-pointer text-3xl mt-2 dark:text-[#999999] ${
                  isHovering ? 'text-[#0E70FF]' : 
                  isPulsing ? 'tutorial-icon-animate' : 
                'text-gray-400'
                  
                } tutorial-icon ${className || ''}`}
                data-testid="tutorial-button"
                style={{ 
                  transform: isHovering ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="dark:bg-[#1A2A2E] dark:text-white bg-white">
            <p>Watch Tutorial ?</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            setIsPulsing(false); // Stop pulsing when dialog opens
          }
        }}>
        <DialogContent className="lg:max-w-[900px] w-full max-h-[95vh] overflow-hidden dark:bg-[#1A2A2E] dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{tutorial.title}</DialogTitle>
          </DialogHeader>          <div 
            className="dark:text-white"
            dangerouslySetInnerHTML={{ __html: tutorial.description }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TutorialButton;
