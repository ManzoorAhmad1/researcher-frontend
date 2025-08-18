import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url)
	const code = searchParams.get('code')
	const next = searchParams.get('next') ?? '/dashboard'

	if (code) {
		const supabase = createClient()
		const { error, data: sessionData } =
			await supabase.auth.exchangeCodeForSession(code)
		if (!error && sessionData?.session) {
			const { user } = sessionData.session
			if (user) {
				const { id, email, created_at } = user
				await supabase.from('users').insert({
					id,
					email,
					created_at,
					is_active: true,
					user_id: id,
				})
			}

			return NextResponse.redirect(`${origin}${next}`)
		}
	}

	return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
