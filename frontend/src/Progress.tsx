import useSWR from "swr";

import { fetchTodos } from "./api";
import type { Priority, Todo } from "./types";

const PRIORITIES: Priority[] = ["high", "medium", "low"];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Count = { done: number; total: number };

function countTodos(todos: Todo[]): Count {
  return { done: todos.filter((todo) => todo.done).length, total: todos.length };
}

function percent({ done, total }: Count): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

// Monday 00:00 (local time) of the week that contains `date`.
function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (start.getDay() + 6) % 7; // getDay(): Sunday is 0
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

// One row: a label, a bar that is filled by the percentage of done todos, and "done / total".
function ProgressRow({ label, count, tone }: { label: string; count: Count; tone?: Priority }) {
  return (
    <li className="progress-row">
      <span className="progress-label">{label}</span>
      <span
        className="bar"
        role="progressbar"
        aria-label={`${label}: ${count.done} of ${count.total} done`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent(count)}
      >
        <span
          className={tone ? `bar-fill bar-${tone}` : "bar-fill"}
          style={{ width: `${percent(count)}%` }}
        />
      </span>
      <span className="progress-count">
        {count.done} / {count.total}
      </span>
    </li>
  );
}

export default function Progress() {
  // The progress always counts ALL todos, whatever filter the list has. This is the same SWR key
  // as the "All" filter of the list, so the data is shared and cached.
  const { data } = useSWR(["todos", "all"] as const, ([, current]) => fetchTodos(current));
  const todos = data ?? [];

  // Weekly result: the current week, Monday to Sunday, by the due time of each todo.
  // Todos without a due time are not part of a week.
  const weekStart = startOfWeek(new Date());
  const days = DAY_NAMES.map((name, index) => {
    const from = new Date(weekStart);
    from.setDate(weekStart.getDate() + index);
    const to = new Date(from);
    to.setDate(from.getDate() + 1);
    const dueThisDay = todos.filter((todo) => {
      if (todo.dueAt === null) {
        return false;
      }
      const due = new Date(todo.dueAt);
      return due >= from && due < to;
    });
    return { name, count: countTodos(dueThisDay) };
  });
  const week = {
    done: days.reduce((sum, day) => sum + day.count.done, 0),
    total: days.reduce((sum, day) => sum + day.count.total, 0),
  };

  return (
    <section className="progress">
      <h2>Progress by priority</h2>
      <ul className="progress-list">
        {PRIORITIES.map((priority) => (
          <ProgressRow
            key={priority}
            label={priority}
            tone={priority}
            count={countTodos(todos.filter((todo) => todo.priority === priority))}
          />
        ))}
      </ul>

      <h2>This week</h2>
      <p className="progress-summary">
        {week.total === 0
          ? "No todos with a time this week."
          : `${week.done} of ${week.total} todos done (${percent(week)}%)`}
      </p>
      <ul className="progress-list">
        {days.map((day) => (
          <ProgressRow key={day.name} label={day.name} count={day.count} />
        ))}
      </ul>
    </section>
  );
}
