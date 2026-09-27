import { useState } from "react";
import { BADGE_THRESHOLDS } from "../constants";
import { computeLongestStreak, dailySeries, heatmapData, overallHeatmapData, periodStats } from "../utils/habitLogic";
import Heatmap from "./Heatmap";
import ChartCanvas from "./ChartCanvas";

export default function StatsView({ habits, logs, theme }) {
  const active = habits.filter((h) => !h.archived);
  const [selectedId, setSelectedId] = useState("__all");
  const week = periodStats(habits, logs, 7);
  const month = periodStats(habits, logs, 30);
  const bestStreak = active.reduce((m, h) => Math.max(m, computeLongestStreak(h, logs)), 0);
  const totalCheckins = Object.values(logs).reduce((sum, byDate) => sum + Object.values(byDate).filter((e) => e.done || e.value > 0).length, 0);

  const selectedHabit = active.find((h) => h.id === selectedId);
  const cells = selectedHabit ? heatmapData(selectedHabit, logs, 26) : overallHeatmapData(active, logs, 26);

  const weekSeries = dailySeries(habits, logs, 14);
  const monthSeries = dailySeries(habits, logs, 60);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#A6A594" : "#5B5F52";
  const lineColor = isDark ? "#8FB58C" : "#4B6B4F";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
      y: { min: 0, max: 100, ticks: { color: textColor, callback: (v) => v + "%" }, grid: { color: gridColor } },
    },
  };

  const badgeCount = BADGE_THRESHOLDS.filter((t) => bestStreak >= t).length;

  return (
    <div>
      <div className="section-title">Overview</div>
      <div className="stats-top">
        <div className="card stat-box">
          <div className="v">{week.pct}%</div>
          <div className="l">This week</div>
        </div>
        <div className="card stat-box">
          <div className="v">{month.pct}%</div>
          <div className="l">This month</div>
        </div>
        <div className="card stat-box">
          <div className="v">{bestStreak}</div>
          <div className="l">Longest streak (days)</div>
        </div>
        <div className="card stat-box">
          <div className="v">{totalCheckins}</div>
          <div className="l">Total check-ins</div>
        </div>
      </div>

      <div className="section-title">Completion history</div>
      <div className="card heatmap-wrap">
        <select className="habit-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="__all">All habits (overall)</option>
          {active.map((h) => (
            <option key={h.id} value={h.id}>
              {h.icon} {h.name}
            </option>
          ))}
        </select>
        {cells.length ? <Heatmap cells={cells} /> : <div className="empty">Add a habit to see history.</div>}
      </div>

      <div className="section-title">Progress over time</div>
      <div className="chart-row">
        <div className="card chart-card">
          <ChartCanvas
            type="line"
            options={chartOptions}
            data={{
              labels: weekSeries.labels,
              datasets: [{ label: "Completion %", data: weekSeries.values, borderColor: lineColor, backgroundColor: lineColor, tension: 0.35, pointRadius: 3, fill: false }],
            }}
          />
        </div>
        <div className="card chart-card">
          <ChartCanvas
            type="bar"
            options={chartOptions}
            data={{
              labels: monthSeries.labels,
              datasets: [{ label: "Completion %", data: monthSeries.values, backgroundColor: lineColor, borderRadius: 3 }],
            }}
          />
        </div>
      </div>

      <div className="section-title">
        Milestones ({badgeCount}/{BADGE_THRESHOLDS.length})
      </div>
      <div className="badge-grid">
        {BADGE_THRESHOLDS.map((t) => (
          <div key={t} className={"card badge" + (bestStreak >= t ? " unlocked" : "")}>
            <div className="bic">{t >= 100 ? "🏅" : t >= 30 ? "⭐" : "🔥"}</div>
            <div className="bn">{t}-day streak</div>
            <div className="bd">{bestStreak >= t ? "Unlocked" : "Locked"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
