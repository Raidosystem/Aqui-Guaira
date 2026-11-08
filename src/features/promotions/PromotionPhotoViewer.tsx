import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const zoomLevels = [100, 150, 200, 300, 400];
const minZoom = zoomLevels[0];
const maxZoom = zoomLevels[zoomLevels.length - 1];

type ZoomAnchor = { x: number; y: number; offsetX: number; offsetY: number };

function anchorAt(view: HTMLDivElement, offsetX: number, offsetY: number): ZoomAnchor {
  return {
    x: (view.scrollLeft + offsetX) / Math.max(1, view.scrollWidth),
    y: (view.scrollTop + offsetY) / Math.max(1, view.scrollHeight),
    offsetX,
    offsetY,
  };
}

export default function PromotionPhotoViewer({ photoUrl, recognizedText, sticky = true, fullscreen = false }: {
  photoUrl: string;
  recognizedText?: string;
  sticky?: boolean;
  fullscreen?: boolean;
}) {
  const [zoom, setZoom] = useState(minZoom);
  const viewport = useRef<HTMLDivElement>(null);
  const targetZoom = useRef(minZoom);
  const anchor = useRef<ZoomAnchor | null>(null);
  const largerZoom = zoomLevels.find(level => level > zoom);
  const smallerZoom = zoomLevels.filter(level => level < zoom).at(-1);

  const zoomAt = useCallback((nextZoom: number, point: ZoomAnchor) => {
    if (targetZoom.current === nextZoom) return;
    targetZoom.current = nextZoom;
    anchor.current = point;
    setZoom(nextZoom);
  }, []);

  function changeZoom(nextZoom: number) {
    const view = viewport.current;
    if (view) zoomAt(nextZoom, anchorAt(view, view.clientWidth / 2, view.clientHeight / 2));
  }

  useLayoutEffect(() => {
    const view = viewport.current;
    const point = anchor.current;
    if (!view || !point) return;
    view.scrollLeft = point.x * view.scrollWidth - point.offsetX;
    view.scrollTop = point.y * view.scrollHeight - point.offsetY;
    anchor.current = null;
  }, [zoom]);

  useEffect(() => {
    const view = viewport.current;
    if (!view) return;
    let pinch: { distance: number; zoom: number; point: ZoomAnchor } | null = null;

    function resetPinch() {
      pinch = null;
    }

    function handlePinch(event: TouchEvent) {
      if (event.touches.length !== 2) {
        resetPinch();
        return;
      }

      const [first, second] = Array.from(event.touches);
      if (!view.contains(first.target as Node) || !view.contains(second.target as Node)) return;

      if (event.cancelable) event.preventDefault();
      const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
      const rect = view.getBoundingClientRect();
      const offsetX = (first.clientX + second.clientX) / 2 - rect.left - view.clientLeft;
      const offsetY = (first.clientY + second.clientY) / 2 - rect.top - view.clientTop;
      if (!pinch) {
        if (distance > 0) pinch = { distance, zoom: targetZoom.current, point: anchorAt(view, offsetX, offsetY) };
        return;
      }

      const scale = Math.round(pinch.zoom * distance / pinch.distance);
      const nextZoom = Math.min(maxZoom, Math.max(minZoom, scale));
      zoomAt(nextZoom, { ...pinch.point, offsetX, offsetY });
    }

    view.addEventListener("touchstart", handlePinch, { passive: false });
    view.addEventListener("touchmove", handlePinch, { passive: false });
    view.addEventListener("touchend", resetPinch);
    view.addEventListener("touchcancel", resetPinch);
    return () => {
      view.removeEventListener("touchstart", handlePinch);
      view.removeEventListener("touchmove", handlePinch);
      view.removeEventListener("touchend", resetPinch);
      view.removeEventListener("touchcancel", resetPinch);
    };
  }, [zoomAt]);

  return (
    <aside className={`min-w-0 rounded-xl border bg-card p-3 ${fullscreen ? "flex min-h-0 flex-1 flex-col gap-2" : "self-start space-y-2"} ${sticky ? "lg:sticky lg:top-3 lg:z-10 lg:order-last" : ""}`}
      aria-label="Foto do encarte para conferência">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">Foto do encarte</h4>
        <div className="flex min-w-0 flex-wrap items-center gap-1" role="group" aria-label="Zoom do encarte">
          <Button type="button" variant="outline" size="icon" className="h-11 w-11 sm:h-9 sm:w-9"
            aria-label="Diminuir zoom" disabled={smallerZoom === undefined} onClick={() => changeZoom(smallerZoom ?? minZoom)}>
            <Minus aria-hidden="true" />
          </Button>
          <output className="w-10 text-center text-sm tabular-nums sm:w-12" aria-live="polite">{zoom}%</output>
          <Button type="button" variant="outline" size="icon" className="h-11 w-11 sm:h-9 sm:w-9"
            aria-label="Aumentar zoom" disabled={largerZoom === undefined} onClick={() => changeZoom(largerZoom ?? maxZoom)}>
            <Plus aria-hidden="true" />
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-11 sm:h-9" aria-label="Ajustar foto à largura"
            disabled={zoom === minZoom} onClick={() => changeZoom(minZoom)}>Ajustar</Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Use dois dedos ou os botões para ampliar. Deslize ou role para mover a foto.</p>
      <div ref={viewport} tabIndex={0} role="region" aria-label="Área rolável da foto do encarte"
        style={{ touchAction: "pan-x pan-y" }}
        className={`overflow-auto rounded-lg border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${fullscreen ? "min-h-0 flex-1 overscroll-contain" : "max-h-[45dvh] lg:max-h-[calc(100dvh-15rem)]"}`}>
        <img src={photoUrl} alt="Foto do encarte para comparar com os itens"
          className="block h-auto max-w-none" style={{ width: `${zoom}%` }} />
      </div>
      {recognizedText && (
        <details className="text-sm">
          <summary className="cursor-pointer">Ver texto lido</summary>
          <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap text-xs">{recognizedText}</pre>
        </details>
      )}
    </aside>
  );
}
