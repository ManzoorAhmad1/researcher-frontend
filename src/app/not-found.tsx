import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFoundPage() {
	return (
		<div
			className='h-screen w-screen flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'
			x-chunk='dashboard-02-chunk-1'
		>
			<div className='flex flex-col items-center gap-1 text-center'>
				<h3 className='text-2xl font-bold tracking-tight'>Page not found</h3>
				<p className='text-sm text-muted-foreground'>
					You can return to the dashboard of the page.
				</p>
				<Link href={'/dashboard'}>
					<Button className='mt-4'>Back to dashboard</Button>
				</Link>
			</div>
		</div>
	)
}
