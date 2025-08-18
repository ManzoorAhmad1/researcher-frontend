'use client'
import React from 'react'
import { featureFlags } from "@/utils/featureFlags";
import { HeaderTitle } from '@/components/Header/HeaderTitle'
import TemplatePromptEditor from "@/components/TemplateEditor/indexTemplate"
import PromptEditor from "@/components/TemplateEditor"


const TemplateEditor: React.FC = () => {

	return (
      <main className='flex flex-1 flex-col gap-4 lg:gap-6 '>
         <section className='flex-1 items-start gap-4 sm:py-0 md:gap-8 xl:grid-cols-3'>
            <div className='grid auto-rows-max items-start lg:col-span-2'>
               {featureFlags.enableTemplateList ? <TemplatePromptEditor/>:<PromptEditor/>}
            </div>
         </section>
      </main>
  
	)
}

export default TemplateEditor
