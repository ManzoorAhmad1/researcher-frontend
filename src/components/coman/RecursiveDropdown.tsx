/* eslint-disable react-hooks/exhaustive-deps */

import { Accordion, AccordionTab } from "primereact/accordion";
import React, { useEffect, useState } from "react";
import { FaProjectDiagram, FaRegFolderOpen } from "react-icons/fa";
import { MdArrowForwardIos } from "react-icons/md";
import { useSelector } from "react-redux";

interface MenuItem {
  id: string;
  folder_name: string;
  folder_id: Number;
  submenu?: MenuItem[];
  name: string;
  project_id: string;
}

interface DropdownMenuProps {
  menu: MenuItem;
  activeFolder: { name: string; id: string };
  setActiveFolder: (data: {
    name: string;
    id: string;
    project_id: string;
    project_name: string;
  }) => void;
}

interface RecursiveDropdownProps {
  activeFolder: { name: string; id: string };
  setActiveFolder: (data: {
    name: string;
    id: string;
    project_id: string;
    project_name: string;
  }) => void;
  menuData: MenuItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  menu,
  activeFolder,
  setActiveFolder,
}) => {
  const isActive = menu.id == activeFolder?.id;
  const isProject = !!menu?.name; // Check if this is a project (has name property)
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleMenuClick = () => {
    setActiveFolder({
      name: menu?.name || menu?.folder_name,
      id: menu.id,
      project_id: menu.project_id,
      project_name: typeof menu.id === "string" ? menu?.name : "",
    });
  };

  const handleAccordionToggle = (e: any) => {
    // Toggle the expanded state when accordion is clicked
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="!mt-0">
      {menu.submenu && menu.submenu.length > 0 ? (
        <Accordion 
          multiple 
          activeIndex={isExpanded ? [0] : []}
          onTabOpen={handleAccordionToggle}
          onTabClose={handleAccordionToggle}
          className="[&_.p-accordion-header-link]:p-0 [&_.p-accordion-header-link]:bg-transparent dark:[&_.p-accordion-header-link]:text-white [&_.p-accordion-content]:p-0 [&_.p-accordion-content]:bg-transparent dark:[&_.p-accordion-content]:text-white"
        >
          <AccordionTab
            header={
              <div
                onClick={handleMenuClick}
                className={`px-4 py-2 rounded-md cursor-pointer flex justify-between ${
                  isActive ? "text-blue-600" : ""
                }`}
              >
                <span className="flex gap-2 items-center">
                  {isProject ? (
                    <FaProjectDiagram className={`w-[16px] h-[16px] mt-1`} />
                  ) : (
                    <FaRegFolderOpen className="text-xl" />
                  )}
                  <span className={isProject ? "font-semibold" : "font-normal"}>
                    {menu?.name || menu.folder_name}
                  </span>
                </span>
                <MdArrowForwardIos
                  className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                />
              </div>
            }
          >
            <ul className="ms-6 border-l-2 border-black dark:border-white">
              {menu.submenu.map((item) => (
                <li key={item.id}>
                  <DropdownMenu
                    menu={item}
                    activeFolder={activeFolder}
                    setActiveFolder={setActiveFolder}
                  />
                </li>
              ))}
            </ul>
          </AccordionTab>
        </Accordion>
      ) : (
        <div
          className={`px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 ${
            isActive ? "text-blue-600" : ""
          }`}
          onClick={handleMenuClick}
        >
          {isProject ? (
            <FaProjectDiagram className={`w-[16px] h-[16px] mt-1`} />
          ) : (
            <FaRegFolderOpen className="text-xl" />
          )}
          <span className={isProject ? "font-semibold" : "font-normal"}>
            {menu.name || menu.folder_name}
          </span>
        </div>
      )}
    </div>
  );
};

const RecursiveDropdown: React.FC<RecursiveDropdownProps> = ({
  activeFolder,
  setActiveFolder,
  menuData,
}) => {
  // Remove the automatic setting of first project as active
  // This will prevent the first item from being bold by default
  const { project } = useSelector((state: any) => state?.project);

  useEffect(() => {
    if (menuData && menuData.length > 0) {
      setActiveFolder({
        name: project?.name,
        id: project.id,
        project_id: project.id,
        project_name: project?.name,
      });
    }
  }, [project?.id, menuData]);

  return (
    <div className="space-y-4">
      {menuData.map((item) => (
        <DropdownMenu
          key={item.id}
          menu={item}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
        />
      ))}
    </div>
  );
};

export default RecursiveDropdown;
