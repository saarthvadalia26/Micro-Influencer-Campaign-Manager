import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verify the caller is authenticated (brand manager)
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, password, full_name } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Create auth user with service role (bypasses email confirmation)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Create profile with influencer role
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: full_name || null,
      role: 'influencer',
    })
  }

  return NextResponse.json({ success: true })
}
