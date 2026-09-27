import { dateKey, today } from "../utils/dateUtils";
import { getEntry, isDone, isScheduled, freqLabel } from "../utils/habitLogic";
import RingProgress from "./RingProgress";

export default function HabitCard({ habit, logs, onToggle, onQuantity, onEdit, streak }) {
  const key = dateKey(today());
  const entry = getEntry(logs, habit.id, key);
  const done = isDone(habit, entry);
  const scheduledToday = isScheduled(habit, today());

  return (
    <div className="card habit-card" style={{ "--c": habit.color }}>
      <div className="row1">
        <div className="name-wrap">
          <div className="icon">{habit.icon}</div>
          <div>
            <div className="name">{habit.name}</div>
            <div className="meta">
              {habit.category} · {freqLabel(habit)}
            </div>
          </div>
        </div>
        <button className="icon-btn" onClick={() => onEdit(habit)} aria-label="Edit habit">
          ✎
        </button>
      </div>

      {!scheduledToday ? (
        <div className="meta" style={{ padding: "4px 0" }}>
          Not scheduled today
        </div>
      ) : habit.type === "quantity" ? (
        <div className="qty-row">
          <button className="qty-btn" onClick={() => onQuantity(habit, Math.max(0, (entry?.value || 0) - 1))}>
            –
          </button>
          <div className="qty-val">
            {entry?.value || 0} / {habit.targetValue} <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{habit.unit}</span>
          </div>
          <button className="qty-btn" onClick={() => onQuantity(habit, (entry?.value || 0) + 1)}>
            +
          </button>
          <div style={{ marginLeft: "auto" }}>
            <RingProgress pct={Math.min(100, Math.round(((entry?.value || 0) / habit.targetValue) * 100))} size={34} stroke={4} color={habit.color} />
          </div>
        </div>
      ) : (
        <div className="check-row">
          <button
            className={"check-circle" + (done ? " done" : "")}
            style={{ "--c": habit.color }}
            onClick={() => onToggle(habit)}
            aria-label={done ? "Mark not done" : "Mark done"}
          >
            {done ? "✓" : ""}
          </button>
          <div className="meta">{done ? "Done for today" : "Tap to check in"}</div>
        </div>
      )}

      <div className="streaks">
        <div>
          🔥 <b>{streak.current}</b> current
        </div>
        <div>
          🏆 <b>{streak.longest}</b> best
        </div>
      </div>
    </div>
  );
}
