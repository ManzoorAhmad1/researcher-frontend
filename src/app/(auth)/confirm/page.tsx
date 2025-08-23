import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Signup({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <div className="max-w-md space-y-6 flex gap-4">
                {/* Logo */}
                <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900">AIScholarix</h1>
            </div>
            {/* Subtitle */}
            <p className="mt-2 text-gray-600 text-lg">Confirmation</p>

            {/* Description */}
            <p className="mt-6 max-w-lg text-gray-700">
                {searchParams.message ||
                    "Your request has been processed successfully. You can now continue to your account."}
            </p>

            {/* CTA Button */}
            <div className="mt-8">
                <Link href="/login">
                    <Button className="bg-black text-white text-sm md:text-[16px] font-medium rounded-lg px-12 py-3">
                        Go Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
