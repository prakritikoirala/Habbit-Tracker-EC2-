import { useState } from "react";
import { freqLabel } from "../utils/habitLogic";

export default function HabitsView({ habits, onEdit, onAdd, onArchive, onReorder, onDelete }) {
  const [filter, setFilter] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const cats = ["All", ...Array.from(new Set(habits.map((h) => h.category)))];
  const list = habits
    .filter((h) => (showArchived ? true : !h.archived))
    .filter((h) => filter === "All" || h.category === filter)
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="topbar" style={{ marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Manage habits</h2>
        </div>
        <button className="btn primary" onClick={onAdd}>
          + New habit
        </button>
      </div>
      <div className="filter-row">
        {cats.map((c) => (
          <button key={c} className={"chip" + (filter === c ? " active" : "")} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
        <button className={"chip" + (showArchived ? " active" : "")} onClick={() => setShowArchived((s) => !s)}>
          {showArchived ? "Hide archived" : "Show archived"}
        </button>
      </div>
      {list.length === 0 ? (
        <div className="card empty">
          <span className="big">📋</span>Nothing here yet.
        </div>
      ) : (
        <div className="manage-list">
          {list.map((h, i) => (
            <div key={h.id} className={"card manage-row" + (h.archived ? " archived" : "")}>
              <div className="swatch" style={{ background: h.color }}></div>
              <div style={{ fontSize: 20 }}>{h.icon}</div>
              <div className="info">
                <div className="n">{h.name}</div>
                <div className="m">
                  {h.category} · {freqLabel(h)}
                  {h.type === "quantity" ? ` · target ${h.targetValue} ${h.unit}` : ""}
                </div>
              </div>
              <div className="actions">
                <button className="icon-btn" title="Move up" onClick={() => onReorder(h.id, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button className="icon-btn" title="Move down" onClick={() => onReorder(h.id, 1)} disabled={i === list.length - 1}>
                  ↓
                </button>
                <button className="icon-btn" title="Edit" onClick={() => onEdit(h)}>
                  ✎
                </button>
                <button className="icon-btn" title={h.archived ? "Unarchive" : "Archive"} onClick={() => onArchive(h.id)}>
                  {h.archived ? "⤴" : "🗄"}
                </button>
                <button className="icon-btn" title="Delete" onClick={() => onDelete(h.id)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
