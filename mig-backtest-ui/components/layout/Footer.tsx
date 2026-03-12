import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-emerald-400">MIG</span>
              <span className="font-semibold text-slate-200">Quant Competition</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              The University of Michigan Investment Group&apos;s annual algorithmic trading challenge.
              Open to all university students.
            </p>
            <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} Michigan Investment Group. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/submit", label: "Submit Strategy" },
                { href: "/rules", label: "Competition Rules" },
                { href: "/team", label: "My Dashboard" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-150"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Competition Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider">Competition</h3>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <div>
                <span className="text-slate-400 font-medium">Submission Window</span>
                <p>Feb 15 – Mar 20, 2026</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Awards Ceremony</span>
                <p>April 5, 2026</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Contact</span>
                <p>quant@miginvestmentgroup.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            Built by MIG Tech Division · Powered by Next.js & FastAPI
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>Multi-Asset Daily Trading Challenge</span>
            <span>·</span>
            <span>Public Leaderboard + Hidden Finals</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
