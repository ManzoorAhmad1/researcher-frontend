import { Button } from '@/components/ui/button'
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function Signup({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    return (
        <Card className='bg-[#39393933] backdrop-blur-[12px]  h-full border border-transparent text-white flex justify-center items-center flex-col rounded-xl shadow-2xl'>
            <div className='w-full max-w-lg p-8 rounded-lg '>
                <CardHeader className='text-center'>
                    <CardTitle className='text-4xl font-semibold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#0F55BA] to-[#0E70FF]'>
                        Confirm
                    </CardTitle>
                    <CardDescription className='text-lg mt-6 text-white'>
                        {searchParams.message}
                    </CardDescription>
                </CardHeader>

                <CardFooter className='flex items-center justify-center mt-8'>
                    <Link href={'/login'} className='w-full'>
                        <Button className='bg-gradient-to-t from-[#0F55BA] to-[#0E70FF] text-white text-sm md:text-[16px] font-medium rounded-full px-12 py-3 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border-[#3686FC] border-2'>
                            Go Home
                        </Button>
                    </Link>
                </CardFooter>
            </div>
        </Card>
    )
}
