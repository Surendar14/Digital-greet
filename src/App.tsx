import { useEffect, useState } from "react";
import { loadTemplate } from "./templates/registry";
import { TemplateHost } from "./engine";
import type { TemplatePackage } from "./engine";
import { Icon } from "./engine";
import Portal from "./portal/Portal";

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

/** Simple hash-based router. */
function useHashRoute(): string {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash;
}

export default function App() {
  const hash = useHashRoute();
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

  // Portal route
  if (hash === "#/portal") {
    return <Portal />;
  }

  // Default: greeting
  if (error) return <LoadError message={error} />;
  if (!pkg) return <LoadingScreen label="Preparing your experience" />;

  return <TemplateHost pkg={pkg} />;
}
