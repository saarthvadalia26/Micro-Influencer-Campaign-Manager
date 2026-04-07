export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Influencer Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Micro-influencer campaign platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
