import { useEffect, useMemo, useState } from "react";
import type { SectionProps } from "../types";
import { SectionShell, SectionHeading } from "../components/SectionShell";
import { parseDate } from "../utils/resolve";

interface CountdownContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
  /** Date string or "@field" reference (resolved by the engine). */
  target?: string;
  label?: string;
  passedText?: string;
}

const UNITS = [
  { key: "days", label: "days" },
  { key: "hours", label: "hours" },
  { key: "minutes", label: "min" },
  { key: "seconds", label: "sec" }
] as const;

type Counts = Record<(typeof UNITS)[number]["key"], number>;

function diff(target: Date, now: Date): Counts {
  let ms = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  ms -= days * 86_400_000;
  const hours = Math.floor(ms / 3_600_000);
  ms -= hours * 3_600_000;
  const minutes = Math.floor(ms / 60_000);
  ms -= minutes * 60_000;
  const seconds = Math.floor(ms / 1000);
  return { days, hours, minutes, seconds };
}

/** Optional countdown to an event â€” one JSON date away. */
export function CountdownSection(props: SectionProps) {
  const c = (props.content ?? {}) as CountdownContent;
  const target = useMemo(() => parseDate(c.target ?? ""), [c.target]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target) return null;
  const counts = diff(target, now);
  const passed = target.getTime() - now.getTime() <= 0;

  return (
    <SectionShell section={props.section}>
      <SectionHeading kicker={c.kicker} title={c.title} subtitle={c.subtitle} />

      {passed ? (
        <p className="countdown__passed">{c.passedText ?? "The day has come."}</p>
      ) : (
        <div className="countdown" role="timer" aria-label={c.label ?? "Countdown to the event"}>
          {UNITS.map((u, i) => (
            <div className="countdown__unit" key={u.key}>
              <span className="countdown__value">{String(counts[u.key]).padStart(2, "0")}</span>
              <span className="countdown__label">{u.label}</span>
              {i < UNITS.length - 1 && <span className="countdown__sep" aria-hidden="true">:</span>}
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}