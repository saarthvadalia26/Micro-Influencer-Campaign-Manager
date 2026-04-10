import { Logo } from '@/components/Logo'

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Warm rose-to-slate base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-pink-950/80 to-slate-900" />

      {/* Warm mesh gradient orbs */}
      <div className="absolute top-[-15%] left-[-5%] w-[550px] h-[550px] rounded-full bg-rose-500/15 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-8%] w-[500px] h-[500px] rounded-full bg-orange-500/12 blur-[120px] animate-pulse [animation-delay:2s]" />
      <div className="absolute top-[40%] right-[5%] w-[400px] h-[400px] rounded-full bg-pink-400/10 blur-[100px] animate-pulse [animation-delay:4s]" />
      <div className="absolute bottom-[25%] left-[10%] w-[350px] h-[350px] rounded-full bg-amber-500/8 blur-[100px] animate-pulse [animation-delay:3s]" />

      {/* Subtle noise overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]">
            <Logo size={52} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Join the next generation of creators.</h1>
          <p className="text-rose-300/50 text-sm mt-2">Start managing your influencer campaigns today</p>
        </div>
        {children}
      </div>
    </div>
  )
}
