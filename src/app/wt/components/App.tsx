import { useState } from "react";
import { useTracker } from "../lib/useTracker";
import { Dashboard } from "./Dashboard";
import { Journey } from "./Journey";
import { LogSheet } from "./LogSheet";
import { Celebration } from "./Celebration";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function App() {
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
          <MenuIcon />
        </button>
        <span className="text-[17px] font-semibold text-fg">Weight</span>
        <span className="ml-auto rounded-full border border-purple/35 bg-purple/15 px-2.5 py-1 text-[11px] font-semibold text-[#C4B5FD]">
          {t.currentMilestone?.name ?? "—"}
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
                  if (confirm("Reset all data and plan to defaults?")) t.resetAll();
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
            settings={t.settings}
            onEdit={t.updateMilestone}
            onUpdateSettings={t.updateSettings}
          />
        )}
      </main>

      {/* Center + button */}
      <button
        onClick={() => t.setSheetOpen(true)}
        className="absolute bottom-6 left-1/2 z-20 flex h-[62px] w-[62px] -translate-x-1/2 items-center justify-center rounded-full bg-blue shadow-[0_8px_24px_rgba(59,130,246,0.5)] ring-[6px] ring-blue/15 md:bottom-6"
        aria-label="Log weight"
      >
        <PlusIcon />
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

      {t.sheetOpen && (
        <LogSheet
          onClose={() => t.setSheetOpen(false)}
          onCommit={t.logWeight}
          defaultWeight={t.currentWeight}
          entries={t.entries}
        />
      )}

      {t.celebration && <Celebration milestone={t.celebration} onClose={() => t.setCelebration(null)} />}
    </div>
  );
}
