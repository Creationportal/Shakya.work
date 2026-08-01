import { useState } from "react";
import { Menu, Plus } from "lucide-react";
import { useTracker } from "./lib/useTracker";
import { Dashboard } from "./components/Dashboard";
import { Journey } from "./components/Journey";
import { LogSheet } from "./components/LogSheet";
import { Celebration } from "./components/Celebration";

export default function App() {
  const t = useTracker();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mx-auto flex h-dvh max-w-[1120px] flex-col bg-bg text-fg">
      {/* App bar */}
      <header className="relative flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="text-fg"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <Menu size={20} />
        </button>
        <span className="text-[17px] font-semibold text-fg">Weight</span>
        <span className="ml-auto rounded-full border border-purple/35 bg-purple/15 px-2.5 py-1 text-[11px] font-semibold text-[#C4B5FD]">
          {t.currentMilestone.name}
        </span>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="animate-pop-in absolute left-4 top-12 z-40 w-44 overflow-hidden rounded-xl border border-line bg-card shadow-xl">
              {(["dashboard", "journey"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    t.setView(v);
                    setMenuOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm capitalize ${
                    t.view === v ? "bg-card2 text-fg" : "text-muted hover:bg-card2"
                  }`}
                >
                  {v}
                </button>
              ))}
              <button
                onClick={() => {
                  if (confirm("Reset all data to the default sample set?")) t.resetAll();
                  setMenuOpen(false);
                }}
                className="block w-full border-t border-line px-4 py-2.5 text-left text-sm text-red hover:bg-card2"
              >
                Reset data
              </button>
            </div>
          </>
        )}
      </header>

      {/* Main */}
      <main className="relative min-h-0 flex-1">
        {t.view === "dashboard" ? (
          <Dashboard t={t} />
        ) : (
          <Journey
            milestones={t.milestones}
            currentIndex={t.currentIndex}
            reachedCount={t.reachedCount}
            progressPct={t.progressPct}
            currentMilestone={t.currentMilestone}
            currentWeight={t.currentWeight}
            projections={t.projections}
            onEdit={t.updateMilestone}
          />
        )}
      </main>

      {/* Center + button */}
      <button
        onClick={() => t.setSheetOpen(true)}
        className="absolute bottom-6 left-1/2 z-20 flex h-[62px] w-[62px] -translate-x-1/2 items-center justify-center rounded-full bg-blue shadow-[0_8px_24px_rgba(59,130,246,0.5)] ring-[6px] ring-blue/15 md:bottom-6"
        aria-label="Log weight"
      >
        <Plus size={26} strokeWidth={2.6} className="text-white" />
      </button>

      {/* Bottom tab bar (mobile) */}
      <nav className="flex border-t border-line bg-card md:hidden">
        {(["dashboard", "journey"] as const).map((v) => (
          <button
            key={v}
            onClick={() => t.setView(v)}
            className={`flex-1 py-3 text-[12px] font-semibold capitalize ${
              t.view === v ? "text-blue" : "text-muted"
            }`}
          >
            {v}
          </button>
        ))}
      </nav>

      <LogSheet
        open={t.sheetOpen}
        onClose={() => t.setSheetOpen(false)}
        onCommit={t.logWeight}
        defaultWeight={t.currentWeight}
        entries={t.entries}
      />

      {t.celebration && <Celebration milestone={t.celebration} onClose={() => t.setCelebration(null)} />}
    </div>
  );
}
