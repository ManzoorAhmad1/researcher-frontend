import { ChevronRight, CircleHelp, HardDrive } from 'lucide-react'
import Link from 'next/link'

export function SettingsList() {
	return (
		<div className='flex flex-col'>
			<Link href={'/settings/memory'} className='border-b'>
				<div className='flex justify-between items-center cursor-pointer p-4 hover:bg-muted-foreground/5 transition-all'>
					<div className='flex items-center gap-2 font-medium'>
						<HardDrive className='h-6 w-6' />
						Memory
					</div>
					<ChevronRight className='h-6 w-6' />
				</div>
			</Link>
			<Link href={'/settings/support'}>
				<div className='flex justify-between items-center cursor-pointer p-4 hover:bg-muted-foreground/5 transition-all'>
					<div className='flex items-center gap-2 font-medium'>
						<CircleHelp className='h-6 w-6' />
						Support
					</div>
					<ChevronRight className='h-6 w-6' />
				</div>
			</Link>
		</div>
	)
}
