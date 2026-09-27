export default function Heatmap({ cells }) {
  return (
    <div>
      <div className="heatmap">
        {cells.map((c) => (
          <div key={c.key} className="cell" data-l={c.level} title={c.date.toDateString()}></div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="cell" style={{ background: "var(--line)" }}></div>
        <div className="cell" data-l="1"></div>
        <div className="cell" data-l="2"></div>
        <div className="cell" data-l="3"></div>
        <div className="cell" data-l="4"></div>
        <span>More</span>
      </div>
    </div>
  );
}
