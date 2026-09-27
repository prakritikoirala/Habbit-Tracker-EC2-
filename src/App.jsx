import { useEffect, useState } from "react";
import { QUOTES, THEME_KEY } from "./constants";
import { dateKey, today, uid } from "./utils/dateUtils";
import { freqLabel, getEntry, isDone, isScheduled } from "./utils/habitLogic";
import { loadState, saveState } from "./utils/storage";
import RingProgress from "./components/RingProgress";
import HabitForm from "./components/HabitForm";
import TodayView from "./components/TodayView";
import HabitsView from "./components/HabitsView";
import StatsView from "./components/StatsView";
import SettingsView from "./components/SettingsView";
import Toast from "./components/Toast";

const NAV = [
  { id: "today", label: "Today", icon: "🏠" },
  { id: "habits", label: "Habits", icon: "📋" },
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState("today");
  const [modalHabit, setModalHabit] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [toasts, setToasts] = useState([]);
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || "system");
  const [notifOn, setNotifOn] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (theme === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") setNotifOn(true);
  }, []);

  // reminder polling — fires only while this tab is open
  useEffect(() => {
    if (!notifOn) return;
    const interval = setInterval(() => {
      const now = new Date();
      const hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      state.habits.forEach((h) => {
        if (!h.archived && h.reminderTime === hm && isScheduled(h, now)) {
          const entry = getEntry(state.logs, h.id, dateKey(now));
          if (!isDone(h, entry) && Notification.permission === "granted") {
            new Notification("Time for: " + h.name, { body: freqLabel(h), tag: h.id + hm });
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [notifOn, state]);

  function pushToast(text, icon) {
    const id = uid();
    setToasts((t) => [...t, { id, text, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }

  function updateLog(habitId, updater) {
    setState((s) => {
      const key = dateKey(today());
      const byDate = s.logs[habitId] || {};
      const prevEntry = byDate[key] || { done: false, value: 0 };
      const nextEntry = updater(prevEntry);
      return { ...s, logs: { ...s.logs, [habitId]: { ...byDate, [key]: nextEntry } } };
    });
  }

  function onToggle(habit) {
    const key = dateKey(today());
    const entry = getEntry(state.logs, habit.id, key);
    const nowDone = !isDone(habit, entry);
    updateLog(habit.id, (prev) => ({ ...prev, done: nowDone }));
    if (nowDone) pushToast(QUOTES[Math.floor(Math.random() * QUOTES.length)], habit.icon);
  }

  function onQuantity(habit, value) {
    const wasReached = isDone(habit, getEntry(state.logs, habit.id, dateKey(today())));
    updateLog(habit.id, (prev) => ({ ...prev, value, done: value >= habit.targetValue }));
    if (!wasReached && value >= habit.targetValue) pushToast(QUOTES[Math.floor(Math.random() * QUOTES.length)], habit.icon);
  }

  function saveHabit(habit) {
    setState((s) => {
      const exists = s.habits.some((h) => h.id === habit.id);
      return { ...s, habits: exists ? s.habits.map((h) => (h.id === habit.id ? habit : h)) : [...s.habits, habit] };
    });
    setModalHabit(undefined);
  }

  function deleteHabit(id) {
    if (!confirm("Delete this habit and all of its history?")) return;
    setState((s) => {
      const logs = { ...s.logs };
      delete logs[id];
      return { habits: s.habits.filter((h) => h.id !== id), logs };
    });
    setModalHabit(undefined);
  }

  function archiveHabit(id) {
    setState((s) => ({ ...s, habits: s.habits.map((h) => (h.id === id ? { ...h, archived: !h.archived } : h)) }));
  }

  function reorderHabit(id, dir) {
    setState((s) => {
      const sorted = [...s.habits].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((h) => h.id === id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= sorted.length) return s;
      const aId = sorted[idx].id,
        bId = sorted[swapIdx].id;
      const aOrder = sorted[idx].order,
        bOrder = sorted[swapIdx].order;
      return { ...s, habits: s.habits.map((h) => (h.id === aId ? { ...h, order: bOrder } : h.id === bId ? { ...h, order: aOrder } : h)) };
    });
  }

  function resetAll() {
    setState({ habits: [], logs: {} });
  }

  const scheduledToday = state.habits.filter((h) => !h.archived && isScheduled(h, today()));
  const doneToday = scheduledToday.filter((h) => isDone(h, getEntry(state.logs, h.id, dateKey(today())))).length;
  const todayPct = scheduledToday.length ? Math.round((doneToday / scheduledToday.length) * 100) : 0;

  return (
    <div className="app">
      <div className="sidebar">
        <div className="brand">
          <span className="mark">🌿</span>
          <div>
            <h1>Ritual</h1>
            <span className="tag">daily habit tracker</span>
          </div>
        </div>
        <div className="nav">
          {NAV.map((n) => (
            <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}>
              <span className="ic">{n.icon}</span>
              <span className="lbl">{n.label}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-foot">
          <div className="today-ring-wrap">
            <RingProgress pct={todayPct} color="var(--moss)" />
            <div className="txt">
              Today
              <b>
                {doneToday}/{scheduledToday.length}
              </b>
            </div>
          </div>
          <button className="btn primary" onClick={() => setModalHabit(null)}>
            + Add habit
          </button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div>
            <h2 className="greet">{tab === "today" ? "Today" : tab === "habits" ? "Habits" : tab === "stats" ? "Stats" : "Settings"}</h2>
            <div className="date">
              {today().toLocaleDateString(undefined, { weekday: "short" })}, {today().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {tab === "today" && <TodayView habits={state.habits} logs={state.logs} onToggle={onToggle} onQuantity={onQuantity} onEdit={setModalHabit} onAdd={() => setModalHabit(null)} />}
        {tab === "habits" && <HabitsView habits={state.habits} onEdit={setModalHabit} onAdd={() => setModalHabit(null)} onArchive={archiveHabit} onReorder={reorderHabit} onDelete={deleteHabit} />}
        {tab === "stats" && <StatsView habits={state.habits} logs={state.logs} theme={theme} />}
        {tab === "settings" && <SettingsView habits={state.habits} logs={state.logs} theme={theme} setTheme={setThemeState} notifOn={notifOn} setNotifOn={setNotifOn} onReset={resetAll} />}
      </div>

      {modalHabit !== undefined && <HabitForm initial={modalHabit} onSave={saveHabit} onClose={() => setModalHabit(undefined)} onDelete={deleteHabit} />}

      <Toast messages={toasts} />
    </div>
  );
}
