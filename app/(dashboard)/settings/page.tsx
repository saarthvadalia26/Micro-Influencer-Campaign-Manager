import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from '@/components/ProfileForm'
import { DeleteAccountButton } from '@/components/DeleteAccountButton'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} email={user.email ?? ''} />
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data including campaigns, influencers, content drafts, and uploaded files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountButton email={user.email ?? ''} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
