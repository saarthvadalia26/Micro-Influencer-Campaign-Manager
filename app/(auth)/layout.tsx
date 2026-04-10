import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep indigo-to-violet base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950" />

      {/* Mesh gradient orbs for social-media glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse [animation-delay:2s]" />
      <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-fuchsia-500/15 blur-[100px] animate-pulse [animation-delay:4s]" />
      <div className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] rounded-full bg-violet-400/10 blur-[100px] animate-pulse [animation-delay:3s]" />

      {/* Subtle noise/grain overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Logo size={52} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Influencer Manager</h1>
          <p className="text-violet-300/60 text-sm mt-1">Micro-influencer campaign platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
