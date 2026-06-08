declare module 'd3-zoom' {
  export interface ZoomTransform {
    k: number;
    x: number;
    y: number;
  }

  export const zoomIdentity: ZoomTransform;

  interface ZoomBehavior<GElement extends Element, Datum> {
    scaleExtent(extent: [number, number]): ZoomBehavior<GElement, Datum>;
    on(type: 'zoom', listener: (event: { transform: ZoomTransform }) => void): ZoomBehavior<GElement, Datum>;
    filter(filter: (event: MouseEvent) => boolean): ZoomBehavior<GElement, Datum>;
  }

  export function zoom<GElement extends Element, Datum>(): ZoomBehavior<GElement, Datum>;
}

declare module 'd3-selection' {
  interface Selection<GElement extends Element, Datum> {
    call(fn: unknown): void;
    on(type: string, listener: null): void;
  }

  export function select<GElement extends Element, Datum>(
    selector: string | GElement | null,
  ): Selection<GElement, Datum>;
}
