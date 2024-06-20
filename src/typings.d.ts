  /* SystemJS module definition */
  declare var module: NodeModule;
  interface NodeModule {
    id: string;
  }
  
  declare class OffscreenCanvas {
    constructor(width: number, height: number);
    width: number;
    height: number;
    getContext(contextId: "2d"): CanvasRenderingContext2D | null;
    getContext(contextId: "bitmaprenderer"): ImageBitmapRenderingContext | null;
  }