import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type PortalEntry = { key: string; isHome: boolean };
type PortalEntries = Record<number, PortalEntry>;

const storageKey = "aqui:portal-history";
const PortalBackContext = createContext(false);

function restoreEntries(index: number, key: string): PortalEntries {
  try {
    const saved: PortalEntries = JSON.parse(sessionStorage.getItem(storageKey) ?? "{}");
    // A reload keeps the router key. A new document with no key starts a new chain.
    if (key !== "default" && saved[index]?.key === key) return saved;
  } catch {
    // The in-memory history also works when session storage is unavailable.
  }
  return {};
}

export function PortalNavigationHistory({ children }: { children: ReactNode }) {
  const { key, pathname } = useLocation();
  const action = useNavigationType();
  const entriesRef = useRef<PortalEntries | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useLayoutEffect(() => {
    // BrowserRouter writes the entry index and key to history.state.
    const { idx: index, key: browserKey = "default" } = window.history.state ?? {};
    if (!Number.isInteger(index) || index < 0 || browserKey !== key) {
      setCanGoBack(false);
      return;
    }

    const entries = entriesRef.current ?? restoreEntries(index, key);
    entriesRef.current = entries;
    if (action === "PUSH") {
      for (const entryIndex of Object.keys(entries)) {
        if (Number(entryIndex) >= index) delete entries[Number(entryIndex)];
      }
    }

    entries[index] = { key, isHome: pathname === "/" };
    setCanGoBack(entries[index - 1]?.isHome === false);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      // Only entry keys and home flags are stored. Navigation works without storage.
    }
  }, [action, key, pathname]);

  return <PortalBackContext.Provider value={canGoBack}>{children}</PortalBackContext.Provider>;
}

export function PortalBackButton({ className }: { className: string }) {
  const canGoBack = useContext(PortalBackContext);
  const navigate = useNavigate();

  if (!canGoBack) return null;
  return (
    <Button type="button" onClick={() => navigate(-1)} className={className}>
      <ArrowLeft className="w-4 h-4" />
      Voltar
    </Button>
  );
}
