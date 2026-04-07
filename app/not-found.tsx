import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Go to Dashboard</Link>
      </Button>
    </div>
  )
}
