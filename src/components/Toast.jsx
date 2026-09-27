export default function Toast({ messages }) {
  return (
    <div className="toast-wrap">
      {messages.map((m) => (
        <div className="toast" key={m.id}>
          {m.icon || "✓"} {m.text}
        </div>
      ))}
    </div>
  );
}
