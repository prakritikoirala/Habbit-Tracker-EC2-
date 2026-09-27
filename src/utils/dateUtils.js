import { WEEKDAY_NAMES } from "../constants";

export function pad(n) {
  return String(n).padStart(2, "0");
}
export function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
export function startOfDay(d) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
export function today() {
  return startOfDay(new Date());
}
export function startOfWeekMon(d) {
  const r = startOfDay(d);
  const day = (r.getDay() + 6) % 7;
  return addDays(r, -day);
}
export function isSameDay(a, b) {
  return dateKey(a) === dateKey(b);
}
export function shortWeekday(d) {
  return WEEKDAY_NAMES[d.getDay()].slice(0, 3);
}
export function shortDate(d) {
  return `${WEEKDAY_NAMES[d.getDay()].slice(0, 3)}, ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}
export function monthLabel(d) {
  return d.toLocaleDateString(undefined, { month: "short" });
}
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
