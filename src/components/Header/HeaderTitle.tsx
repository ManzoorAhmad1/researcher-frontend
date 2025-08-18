import React from 'react'

interface HeaderTitleProp {
	name: string
}

export const HeaderTitle: React.FC<HeaderTitleProp> = ({ name }) => {
	return (
		<div className='flex items-center'>
			<h1 className='text-lg font-semibold md:text-2xl'>{name}</h1>
		</div>
	)
}
