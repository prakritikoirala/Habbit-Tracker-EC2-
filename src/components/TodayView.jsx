import { dateKey, today } from "../utils/dateUtils";
import { computeCurrentStreak, computeLongestStreak, getEntry, isDone, isScheduled } from "../utils/habitLogic";
import HabitCard from "./HabitCard";

export default function TodayView({ habits, logs, onToggle, onQuantity, onEdit, onAdd }) {
  const active = habits.filter((h) => !h.archived).sort((a, b) => a.order - b.order);
  const scheduledToday = active.filter((h) => isScheduled(h, today()));
  const doneCount = scheduledToday.filter((h) => isDone(h, getEntry(logs, h.id, dateKey(today())))).length;

  return (
    <div>
      <div className="section-title">
        Today's habits ({doneCount}/{scheduledToday.length} done)
      </div>
      {active.length === 0 ? (
        <div className="card empty">
          <span className="big">🌱</span>
          No habits yet. Start with something small — you can always add more.
          <div style={{ marginTop: 16 }}>
            <button className="btn primary" onClick={onAdd}>
              + Add your first habit
            </button>
          </div>
        </div>
      ) : (
        <div className="habit-grid">
          {active.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              logs={logs}
              onToggle={onToggle}
              onQuantity={onQuantity}
              onEdit={onEdit}
              streak={{ current: computeCurrentStreak(h, logs), longest: computeLongestStreak(h, logs) }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
