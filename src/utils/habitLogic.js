import { WEEKDAY_NAMES } from "../constants";
import { addDays, dateKey, monthLabel, startOfDay, startOfWeekMon, today } from "./dateUtils";

export function isScheduled(habit, date) {
  if (habit.frequency.type === "daily") return true;
  if (habit.frequency.type === "weekdays") return habit.frequency.days.includes(date.getDay());
  if (habit.frequency.type === "timesPerWeek") return true; // any day is a valid candidate
  return true;
}

export function getEntry(logs, habitId, key) {
  return (logs[habitId] && logs[habitId][key]) || null;
}

export function isDone(habit, entry) {
  if (!entry) return false;
  if (habit.type === "quantity") return (entry.value || 0) >= habit.targetValue;
  return !!entry.done;
}

export function weekCompletionCount(habit, logs, weekStart) {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    if (d > today()) continue;
    const entry = getEntry(logs, habit.id, dateKey(d));
    if (isDone(habit, entry)) count++;
  }
  return count;
}

export function computeCurrentStreak(habit, logs) {
  const createdAt = startOfDay(new Date(habit.createdAt));
  if (habit.frequency.type === "timesPerWeek") {
    const target = habit.frequency.count;
    let streak = 0;
    let wk = startOfWeekMon(today());
    let first = true;
    while (wk >= startOfWeekMon(createdAt)) {
      const count = weekCompletionCount(habit, logs, wk);
      if (first) {
        first = false;
        if (count >= target) streak++;
        // if current week incomplete, don't break — just move on without counting
      } else if (count >= target) {
        streak++;
      } else {
        break;
      }
      wk = addDays(wk, -7);
    }
    return streak;
  }
  let streak = 0;
  let cursor = today();
  const todayKey = dateKey(cursor);
  while (cursor >= createdAt) {
    const key = dateKey(cursor);
    const scheduled = isScheduled(habit, cursor);
    if (scheduled) {
      const entry = getEntry(logs, habit.id, key);
      const done = isDone(habit, entry);
      if (key === todayKey && !done) {
        // skip judging today if not done yet
      } else if (done) {
        streak++;
      } else {
        break;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeLongestStreak(habit, logs) {
  const createdAt = startOfDay(new Date(habit.createdAt));
  const end = today();
  if (habit.frequency.type === "timesPerWeek") {
    const target = habit.frequency.count;
    let longest = 0,
      run = 0;
    let wk = startOfWeekMon(createdAt);
    const lastWeek = startOfWeekMon(end);
    while (wk <= lastWeek) {
      const count = weekCompletionCount(habit, logs, wk);
      const isCurrent = wk.getTime() === startOfWeekMon(end).getTime();
      if (count >= target) {
        run++;
        longest = Math.max(longest, run);
      } else if (!isCurrent) {
        run = 0;
      }
      wk = addDays(wk, 7);
    }
    return longest;
  }
  let longest = 0,
    run = 0;
  let cursor = createdAt;
  while (cursor <= end) {
    if (isScheduled(habit, cursor)) {
      const entry = getEntry(logs, habit.id, dateKey(cursor));
      if (isDone(habit, entry)) {
        run++;
        longest = Math.max(longest, run);
      } else if (cursor.getTime() !== end.getTime()) {
        run = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }
  return longest;
}

export function periodStats(habits, logs, days) {
  const end = today();
  const start = addDays(end, -(days - 1));
  let scheduled = 0,
    done = 0;
  habits
    .filter((h) => !h.archived)
    .forEach((h) => {
      let cursor = new Date(Math.max(start, startOfDay(new Date(h.createdAt))));
      while (cursor <= end) {
        if (isScheduled(h, cursor)) {
          scheduled++;
          const entry = getEntry(logs, h.id, dateKey(cursor));
          if (isDone(h, entry)) done++;
        }
        cursor = addDays(cursor, 1);
      }
    });
  return { scheduled, done, pct: scheduled ? Math.round((done / scheduled) * 100) : 0 };
}

export function dailySeries(habits, logs, days) {
  const end = today();
  const labels = [];
  const values = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(end, -i);
    let scheduled = 0,
      done = 0;
    habits
      .filter((h) => !h.archived && startOfDay(new Date(h.createdAt)) <= d)
      .forEach((h) => {
        if (isScheduled(h, d)) {
          scheduled++;
          const entry = getEntry(logs, h.id, dateKey(d));
          if (isDone(h, entry)) done++;
        }
      });
    labels.push(days > 40 ? monthLabel(d) + " " + d.getDate() : d.toLocaleDateString(undefined, { weekday: "short" }));
    values.push(scheduled ? Math.round((done / scheduled) * 100) : 0);
  }
  return { labels, values };
}

export function heatmapData(habit, logs, weeks) {
  const end = today();
  const start = addDays(startOfWeekMon(end), -7 * (weeks - 1));
  const cells = [];
  let cursor = start;
  while (cursor <= end) {
    const key = dateKey(cursor);
    let level = 0;
    if (cursor >= startOfDay(new Date(habit.createdAt))) {
      const entry = getEntry(logs, habit.id, key);
      if (habit.type === "quantity" && entry) {
        const ratio = habit.targetValue ? (entry.value || 0) / habit.targetValue : 0;
        level = ratio >= 1 ? 4 : ratio >= 0.66 ? 3 : ratio >= 0.33 ? 2 : ratio > 0 ? 1 : 0;
      } else if (entry && entry.done) {
        level = 4;
      }
    }
    cells.push({ date: new Date(cursor), key, level });
    cursor = addDays(cursor, 1);
  }
  return cells;
}

export function overallHeatmapData(habits, logs, weeks) {
  const end = today();
  const start = addDays(startOfWeekMon(end), -7 * (weeks - 1));
  const cells = [];
  let cursor = start;
  const active = habits.filter((h) => !h.archived);
  while (cursor <= end) {
    const key = dateKey(cursor);
    let scheduled = 0,
      done = 0;
    active.forEach((h) => {
      if (startOfDay(new Date(h.createdAt)) <= cursor && isScheduled(h, cursor)) {
        scheduled++;
        const entry = getEntry(logs, h.id, key);
        if (isDone(h, entry)) done++;
      }
    });
    const ratio = scheduled ? done / scheduled : 0;
    const level = ratio >= 0.99 ? 4 : ratio >= 0.66 ? 3 : ratio >= 0.33 ? 2 : ratio > 0 ? 1 : 0;
    cells.push({ date: new Date(cursor), key, level });
    cursor = addDays(cursor, 1);
  }
  return cells;
}

export function freqLabel(h) {
  if (h.frequency.type === "daily") return "Every day";
  if (h.frequency.type === "weekdays")
    return h.frequency.days.length === 7
      ? "Every day"
      : h.frequency.days
          .slice()
          .sort()
          .map((d) => WEEKDAY_NAMES[d].slice(0, 3))
          .join(" · ");
  if (h.frequency.type === "timesPerWeek") return `${h.frequency.count}x / week`;
  return "";
}
