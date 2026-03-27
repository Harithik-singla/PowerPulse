export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden border border-gray-800/50">
        <div className="hidden md:flex flex-col flex-1 bg-gray-950 p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30"
            style={{backgroundImage:'linear-gradient(rgba(249,115,22,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,.08) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full"
            style={{background:'radial-gradient(circle,rgba(249,115,22,.15) 0%,transparent 70%)'}}/>
          <div className="relative z-10">
            <h1 className="font-black text-2xl text-white tracking-tight mb-12">
              Power<span className="text-orange-500">Pulse</span>
            </h1>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-xs text-gray-500">Live outage tracking active</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
              Community-powered<br/><span className="text-orange-500">grid intelligence</span>
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Report outages, track restorations, and see predicted blackout windows — all powered by your community.
            </p>
            <div className="flex gap-8 mt-10">
              {[['2.4k','Active reports'],['138','Localities'],['94%','Prediction accuracy']].map(([n,l]) => (
                <div key={l}><div className="text-xl font-bold text-orange-500">{n}</div>
                <div className="text-xs text-gray-600 mt-0.5">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full md:w-96 bg-[#0d1117] p-10 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to your PowerPulse account</p>
          {children}
        </div>
      </div>
    </div>
  );
}