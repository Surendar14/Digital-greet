import { useEffect, useState } from "react";
import { loadTemplate } from "./templates/registry";
import { TemplateHost } from "./engine";
import type { TemplatePackage } from "./engine";
import { Icon } from "./engine";

/** Engine-level loading screen (template-agnostic). */
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="boot" role="status" aria-label="Loading">
      <div className="boot__mark">
        <span className="boot__pulse" />
        <Icon name="heart" size={22} />
      </div>
      <p className="boot__label">{label}</p>
      <div className="boot__bar" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

function LoadError({ message }: { message: string }) {
  return (
    <div className="boot boot--error" role="alert">
      <p className="boot__label">Could not load template</p>
      <code>{message}</code>
    </div>
  );
}

export default function App() {
  const [pkg, setPkg] = useState<TemplatePackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadTemplate("love")
      .then((t) => alive && setPkg(t))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <LoadError message={error} />;
  if (!pkg) return <LoadingScreen label="Preparing your experience" />;

  return <TemplateHost pkg={pkg} />;
}