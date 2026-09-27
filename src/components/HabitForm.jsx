import { useState } from "react";
import { CATEGORIES, ICONS, COLORS, WEEKDAYS } from "../constants";
import { uid } from "../utils/dateUtils";

export default function HabitForm({ initial, onSave, onClose, onDelete }) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0]);
  const [customCat, setCustomCat] = useState("");
  const [icon, setIcon] = useState(initial?.icon || ICONS[0]);
  const [color, setColor] = useState(initial?.color || COLORS[0]);
  const [type, setType] = useState(initial?.type || "boolean");
  const [targetValue, setTargetValue] = useState(initial?.targetValue || 8);
  const [unit, setUnit] = useState(initial?.unit || "glasses");
  const [freqType, setFreqType] = useState(initial?.frequency?.type || "daily");
  const [days, setDays] = useState(initial?.frequency?.days || [1, 2, 3, 4, 5]);
  const [timesPerWeek, setTimesPerWeek] = useState(initial?.frequency?.count || 3);
  const [reminder, setReminder] = useState(initial?.reminderTime || "");
  const [reminderOn, setReminderOn] = useState(!!initial?.reminderTime);

  function toggleDay(d) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const finalCategory = category === "__custom" ? customCat.trim() || "Other" : category;
    if (!name.trim()) return;
    const frequency =
      freqType === "daily"
        ? { type: "daily" }
        : freqType === "weekdays"
        ? { type: "weekdays", days: days.length ? days : [1, 2, 3, 4, 5] }
        : { type: "timesPerWeek", count: Math.min(7, Math.max(1, Number(timesPerWeek) || 1)) };
    onSave({
      id: initial?.id || uid(),
      name: name.trim(),
      category: finalCategory,
      icon,
      color,
      type,
      targetValue: type === "quantity" ? Math.max(1, Number(targetValue) || 1) : null,
      unit: type === "quantity" ? unit.trim() || "units" : null,
      frequency,
      reminderTime: reminderOn ? reminder : null,
      archived: initial?.archived || false,
      order: initial?.order ?? Date.now(),
      createdAt: initial?.createdAt || new Date().toISOString(),
    });
  }

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="modal" onSubmit={handleSubmit}>
        <h2>{initial ? "Edit habit" : "New habit"}</h2>

        <div className="field">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Drink water" required maxLength={60} autoFocus />
        </div>

        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__custom">Custom…</option>
          </select>
          {category === "__custom" && (
            <input style={{ marginTop: 8 }} type="text" value={customCat} onChange={(e) => setCustomCat(e.target.value)} placeholder="Type a category" maxLength={24} />
          )}
        </div>

        <div className="field">
          <label>Icon</label>
          <div className="icons-grid">
            {ICONS.map((ic) => (
              <button type="button" key={ic} className={ic === icon ? "sel" : ""} onClick={() => setIcon(ic)}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Color</label>
          <div className="swatches">
            {COLORS.map((c) => (
              <button type="button" key={c} className={"sw" + (c === color ? " sel" : "")} style={{ background: c }} onClick={() => setColor(c)} aria-label={c}></button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>How do you track it?</label>
          <div className="freq-opts">
            <label className="freq-opt">
              <input type="radio" checked={type === "boolean"} onChange={() => setType("boolean")} /> Done / not done
            </label>
            <label className="freq-opt">
              <input type="radio" checked={type === "quantity"} onChange={() => setType("quantity")} /> A quantity (e.g. 8 glasses)
            </label>
          </div>
          {type === "quantity" && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input type="number" min="1" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} style={{ width: 90 }} />
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unit (glasses, pages…)" />
            </div>
          )}
        </div>

        <div className="field">
          <label>Frequency</label>
          <div className="freq-opts">
            <label className="freq-opt">
              <input type="radio" checked={freqType === "daily"} onChange={() => setFreqType("daily")} /> Every day
            </label>
            <label className="freq-opt">
              <input type="radio" checked={freqType === "weekdays"} onChange={() => setFreqType("weekdays")} /> Specific days
            </label>
            <label className="freq-opt">
              <input type="radio" checked={freqType === "timesPerWeek"} onChange={() => setFreqType("timesPerWeek")} /> X times per week
            </label>
          </div>
          {freqType === "weekdays" && (
            <div className="weekday-picker">
              {WEEKDAYS.map((w, i) => (
                <button type="button" key={i} className={days.includes(i) ? "sel" : ""} onClick={() => toggleDay(i)}>
                  {w}
                </button>
              ))}
            </div>
          )}
          {freqType === "timesPerWeek" && (
            <div style={{ marginTop: 10 }}>
              <input type="number" min="1" max="7" value={timesPerWeek} onChange={(e) => setTimesPerWeek(e.target.value)} style={{ width: 80 }} /> <span className="hint">times per week</span>
            </div>
          )}
        </div>

        <div className="field">
          <div className="toggle-row">
            <label style={{ margin: 0 }}>Daily reminder</label>
            <label className="switch">
              <input type="checkbox" checked={reminderOn} onChange={(e) => setReminderOn(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>
          {reminderOn && <input style={{ marginTop: 8 }} type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} required={reminderOn} />}
          <div className="hint">Reminders fire only while this page is open in your browser.</div>
        </div>

        <div className="modal-actions">
          {initial && (
            <button type="button" className="btn danger ghost" style={{ marginRight: "auto" }} onClick={() => onDelete(initial.id)}>
              Delete
            </button>
          )}
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            {initial ? "Save changes" : "Add habit"}
          </button>
        </div>
      </form>
    </div>
  );
}
