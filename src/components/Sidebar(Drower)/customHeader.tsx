export const customIcons = (
  <button className="p-sidebar-icon p-link mr-2">
    <span className="pi pi-search" />
  </button>
);

export const customHeader = (headerName: string) => (
  <div className="flex align-items-center gap-2">
    <span className="font-bold dark:text-[#BEBFBF]">{headerName}</span>
  </div>
);
