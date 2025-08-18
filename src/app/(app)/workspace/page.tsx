import React from 'react'
import WorkspaceTableSection from './WorkspaceTableSection'

const page = () => {
  return (
    <main className=" flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6  ">
    
      <h1 className='text-base font-medium'>Workspace Management</h1>

      <div>
        <WorkspaceTableSection/>
      </div>
       

  </main>
  )
}

export default page
