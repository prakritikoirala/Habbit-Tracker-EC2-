import { isDone } from "../utils/habitLogic";
import { downloadFile } from "../utils/storage";

export default function SettingsView({ habits, logs, theme, setTheme, notifOn, setNotifOn, onReset }) {
  function doExport(kind) {
    if (kind === "json") {
      downloadFile("habit-tracker-export.json", "application/json", JSON.stringify({ habits, logs }, null, 2));
      return;
    }
    const rows = [["Habit", "Category", "Date", "Done", "Value", "Unit"]];
    habits.forEach((h) => {
      const byDate = logs[h.id] || {};
      Object.keys(byDate)
        .sort()
        .forEach((date) => {
          const e = byDate[date];
          rows.push([h.name, h.category, date, isDone(h, e) ? "yes" : "no", e.value ?? "", h.unit || ""]);
        });
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadFile("habit-tracker-export.csv", "text/csv", csv);
  }

  async function toggleNotif(v) {
    if (v && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotifOn(perm === "granted");
    } else {
      setNotifOn(false);
    }
  }

  const remindersSet = habits.filter((h) => h.reminderTime && !h.archived);

  return (
    <div>
      <div className="section-title">Appearance</div>
      <div className="settings-list">
        <div className="settings-row">
          <div>
            <div className="t">Theme</div>
            <div className="d">Choose how Ritual looks</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["light", "dark", "system"].map((t) => (
              <button key={t} className={"chip" + (theme === t ? " active" : "")} onClick={() => setTheme(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section-title">Reminders</div>
      <div className="settings-list">
        <div className="settings-row">
          <div>
            <div className="t">Browser notifications</div>
            <div className="d">Get notified at each habit's reminder time, while this page is open</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={notifOn} onChange={(e) => toggleNotif(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="settings-row">
          <div>
            <div className="t">Active reminders</div>
            <div className="d">{remindersSet.length === 0 ? "No reminders set yet" : remindersSet.map((h) => `${h.icon} ${h.name} @ ${h.reminderTime}`).join("  ·  ")}</div>
          </div>
        </div>
      </div>

      <div className="section-title">Your data</div>
      <div className="settings-list">
        <div className="settings-row">
          <div>
            <div className="t">Export as CSV</div>
            <div className="d">Every check-in, spreadsheet-ready</div>
          </div>
          <button className="btn small" onClick={() => doExport("csv")}>
            Download
          </button>
        </div>
        <div className="settings-row">
          <div>
            <div className="t">Export as JSON</div>
            <div className="d">Full backup of habits and history</div>
          </div>
          <button className="btn small" onClick={() => doExport("json")}>
            Download
          </button>
        </div>
        <div className="settings-row">
          <div>
            <div className="t">Reset all data</div>
            <div className="d">Permanently delete every habit and check-in on this device</div>
          </div>
          <button
            className="btn small danger"
            onClick={() => {
              if (confirm("This deletes everything stored in this browser. Continue?")) onReset();
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="hint" style={{ marginTop: 14, color: "var(--ink-soft)", fontSize: 12 }}>
        Everything is stored locally in this browser — there's no account and no server. Export a backup if you plan to switch devices or clear your browser data.
      </div>
    </div>
  );
}
