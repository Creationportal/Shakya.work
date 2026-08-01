import { useState } from "react";
import type { Aggregation } from "../lib/types";
import type { Tracker } from "../lib/useTracker";
import { StatsGrid } from "./StatsGrid";
import { MetricChips } from "./MetricChips";
import { WeightChart } from "./WeightChart";
import { TrajectoryChart } from "./TrajectoryChart";

export function Dashboard({ t }: { t: Tracker }) {
  const [mode, setMode] = useState<Aggregation>("W");

  return (
    <div className="no-scrollbar flex h-full flex-col gap-3 overflow-y-auto px-4 pb-24 pt-3 md:overflow-hidden">
      <StatsGrid stats={t.stats} />
      <MetricChips bmi={t.bmiVal} bf={t.bodyMetrics.bf} waist={t.bodyMetrics.waist} />

      <div className="flex flex-col gap-3 md:flex-1 md:min-h-0 md:flex-row">
        <div className="md:flex-[7] md:min-h-0">
          <WeightChart points={t.series[mode]} mode={mode} onMode={setMode} />
        </div>
        <div className="md:flex-[5] md:min-h-0">
          <TrajectoryChart
            actual={t.trajectory.actual}
            ideal={t.trajectory.ideal}
            idealToday={t.idealToday}
            deviation={t.deviationVal}
            requiredRate={t.requiredRate}
          />
        </div>
      </div>
    </div>
  );
}
