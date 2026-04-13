/**
 * DitherEngine
 * ============
 * Hero-only Three.js dither engine converted from the original IIFE v4.
 *
 * Differences from the original:
 * - THREE and gsap imported as ES modules — never globals
 * - Hero-only: scroll offset is always 0 (pinned canvas, no lenis needed)
 * - Colors read from CSS custom properties via readThemeColors()
 * - heroMode / root / excludeRoot options removed — hero scope is hardwired
 * - Window.lenis polling removed
 * - Global bootstrap IIFE removed
 * - dispose() added for clean React unmount
 * - Full TypeScript throughout
 *
 * All GLSL shader code is reproduced exactly from the original.
 */

import * as THREE from "three";
import { gsap } from "gsap";

/* --------------------------------------------------------------------------
   Internal types
   -------------------------------------------------------------------------- */

interface TextureCacheEntry {
  texture: THREE.Texture;
  ready: Promise<void>;
}

interface UploadQueueItem {
  texture: THREE.Texture;
  resolve: () => void;
}

interface MediaBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Typed uniforms for the dither ShaderMaterial. */
interface DitherUniforms {
  tMap:                       THREE.IUniform<THREE.Texture | null>;
  uTextureSize:               THREE.IUniform<THREE.Vector2>;
  uPlaneSize:                 THREE.IUniform<THREE.Vector2>;
  uResolution:                THREE.IUniform<THREE.Vector2>;
  uColorInk:                  THREE.IUniform<THREE.Color>;
  uColorBg:                   THREE.IUniform<THREE.Color>;
  uOpacity:                   THREE.IUniform<number>;
  uWipe:                      THREE.IUniform<number>;
  uSubtle:                    THREE.IUniform<number>;
  uZoom:                      THREE.IUniform<number>;
  uBias:                      THREE.IUniform<number>;
  uPixelSize:                 THREE.IUniform<number>;
  uPixelSizeMultiplier:       THREE.IUniform<number>;
  uTime:                      THREE.IUniform<number>;
  uTrail:                     THREE.IUniform<THREE.Texture | null>;
  uTrailIntensityMultiplier:  THREE.IUniform<number>;
  uBiasNoiseScale:            THREE.IUniform<number>;
  uBiasNoiseSpeed:            THREE.IUniform<number>;
  uBiasPulseSpeed:            THREE.IUniform<number>;
  uBiasNoiseWeight:           THREE.IUniform<number>;
  uBiasPulseWeight:           THREE.IUniform<number>;
  uBiasAnimationStrength:     THREE.IUniform<number>;
}

/** Typed uniforms for the ping-pong trail RawShaderMaterial. */
interface TrailUniforms {
  u_texture:                THREE.IUniform<THREE.Texture | null>;
  uPointer:                 THREE.IUniform<THREE.Vector2>;
  uLastPointer:             THREE.IUniform<THREE.Vector2>;
  uAspect:                  THREE.IUniform<number>;
  uVelocity:                THREE.IUniform<number>;
  uInitialRadius:           THREE.IUniform<number>;
  uInitialRadiusMultiplier: THREE.IUniform<number>;
  uBorderSize:              THREE.IUniform<number>;
  uBorderSizeMultiplier:    THREE.IUniform<number>;
  uDecayRate:               THREE.IUniform<number>;
}

/* --------------------------------------------------------------------------
   TextureManager
   -------------------------------------------------------------------------- */

class TextureManager {
  private readonly cache          = new Map<string, TextureCacheEntry>();
  private readonly uploadQueue: UploadQueueItem[] = [];
  private readonly uploadsPerFrame = 2;

  get(url: string): TextureCacheEntry {
    if (this.cache.has(url)) return this.cache.get(url)!;

    const tex           = new THREE.Texture();
    tex.minFilter       = THREE.LinearFilter;
    tex.magFilter       = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.flipY           = false;

    const ready: Promise<void> = this._fetchAndQueue(url, tex);
    const entry: TextureCacheEntry = { texture: tex, ready };
    this.cache.set(url, entry);
    return entry;
  }

  private async _fetchAndQueue(url: string, tex: THREE.Texture): Promise<void> {
    try {
      const res  = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const blob = await res.blob();
      const bmp  = await createImageBitmap(blob, {
        imageOrientation: "flipY",
        premultiplyAlpha: "none",
      });
      tex.image       = bmp;
      tex.needsUpdate = true;
      this._enqueue(tex);
    } catch (e) {
      console.warn("[DitherEngine] fetch() failed, trying Image fallback:", url);
      /* Fallback: use an HTMLImageElement with crossOrigin, which bypasses
         fetch-specific issues (CSP, service-worker interception, etc.). */
      try {
        const img = await this._loadImageFallback(url);
        tex.image       = img;
        tex.needsUpdate = true;
        this._enqueue(tex);
      } catch (fallbackErr) {
        console.warn("[DitherEngine] texture load failed completely:", url, fallbackErr);
        /* Do NOT set tex.needsUpdate — there is no image data.
           Leaving the texture inert prevents THREE.js from warning
           "Texture marked for update but no image data found" every frame. */
      }
    }
  }

  /** Fallback loader using HTMLImageElement (handles CORS differently to fetch). */
  private _loadImageFallback(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error(`Image fallback failed: ${url}`));
      img.src     = url;
    });
  }

  private _enqueue(tex: THREE.Texture): void {
    // Floating promise is intentional — resolve is captured for processQueue / flushAll.
    void new Promise<void>(resolve => this.uploadQueue.push({ texture: tex, resolve }));
  }

  processQueue(renderer: THREE.WebGLRenderer): void {
    let n = 0;
    while (this.uploadQueue.length > 0 && n < this.uploadsPerFrame) {
      const item = this.uploadQueue.shift()!;
      if (item.texture.image) renderer.initTexture(item.texture);
      item.resolve();
      n++;
    }
  }

  flushAll(renderer: THREE.WebGLRenderer): void {
    while (this.uploadQueue.length > 0) {
      const item = this.uploadQueue.shift()!;
      if (item.texture.image) renderer.initTexture(item.texture);
      item.resolve();
    }
  }
}

/* --------------------------------------------------------------------------
   DitherMedia
   -------------------------------------------------------------------------- */

class DitherMedia {
  readonly id:           string;
  readonly containerEl:  HTMLElement;
  readonly isFull:       boolean;

  private readonly imgEl:     HTMLElement;
  private readonly engine:    DitherEngine;
  private readonly src:       string;
  private readonly hasHover:  boolean;

  readonly uniforms: DitherUniforms;
  readonly material: THREE.ShaderMaterial;
  readonly mesh:     THREE.Mesh;

  bounds:  MediaBounds | null = null;
  xOffset = 0;
  yOffset = 0;

  private _wipe:        number;
  private _targetWipe:  number;
  private _linkActive = false;

  constructor(engine: DitherEngine, containerEl: HTMLElement, imgEl: HTMLElement) {
    this.engine      = engine;
    this.containerEl = containerEl;
    this.imgEl       = imgEl;
    this.id          = containerEl.getAttribute("data-dither-id") ?? crypto.randomUUID();
    this.src         = imgEl.getAttribute("data-src") ?? imgEl.getAttribute("src") ?? "";
    this.isFull      = containerEl.hasAttribute("data-dither-full");
    this.hasHover    = containerEl.hasAttribute("data-dither-hover");

    this._wipe       = this.isFull ? 0.0 : 1.0;
    this._targetWipe = this.isFull ? 0.0 : 1.0;

    const { ink, bg } = engine.themeColors;

    this.uniforms = {
      tMap:                       { value: null },
      uTextureSize:               { value: new THREE.Vector2(0, 0) },
      uPlaneSize:                 { value: new THREE.Vector2(0, 0) },
      uResolution:                engine.resolution,
      uColorInk:                  { value: new THREE.Color().setStyle(ink) },
      uColorBg:                   { value: new THREE.Color().setStyle(bg) },
      uOpacity:                   { value: 0.0 },
      uWipe:                      { value: this.isFull ? 0.0 : 1.0 },
      uSubtle:                    { value: this.isFull ? 0.0 : 1.0 },
      uZoom:                      { value: 1 },
      uBias:                      { value: 0.1 },
      uPixelSize:                 { value: 1.0 },
      uPixelSizeMultiplier:       { value: 5.0 },
      uTime:                      { value: 0.0 },
      uTrail:                     { value: null },
      uTrailIntensityMultiplier:  { value: 0.75 },
      uBiasNoiseScale:            { value: 1.4 },
      uBiasNoiseSpeed:            { value: 94.0 },
      uBiasPulseSpeed:            { value: 3.1 },
      uBiasNoiseWeight:           { value: 0.77 },
      uBiasPulseWeight:           { value: 0.87 },
      uBiasAnimationStrength:     { value: 0.29 },
    };

    this.material   = engine.makeDitherMaterial(this.uniforms);
    this.mesh       = new THREE.Mesh(engine.planeGeo, this.material);
    this.mesh.visible = false;
    engine.scene.add(this.mesh);

    imgEl.style.visibility   = "hidden";
    imgEl.style.opacity      = "0";
    imgEl.style.pointerEvents = "none";

    if (this.hasHover) {
      containerEl.addEventListener("mouseenter", () => this._onHoverEnter(), { passive: true });
      containerEl.addEventListener("mouseleave", () => this._onHoverLeave(), { passive: true });
      containerEl.addEventListener("touchstart", () => this._onHoverEnter(), { passive: true });
      containerEl.addEventListener("touchend",   () => this._onHoverLeave(), { passive: true });
    }
  }

  private _onHoverEnter(): void {
    if (this._linkActive) return;
    this._targetWipe = 0.0;
  }

  private _onHoverLeave(): void {
    if (this._linkActive) return;
    this._targetWipe = 1.0;
  }

  linkEnter(): void {
    if (this.isFull) return;
    this._linkActive = true;
    this._targetWipe = 0.0;
  }

  linkLeave(): void {
    if (this.isFull) return;
    this._linkActive = false;
    this._targetWipe = 1.0;
  }

  prepareOnEnter(): void {
    gsap.set(this.uniforms.uOpacity, { value: 0 });
  }

  onEnter(): void {
    this.mesh.visible = true;
    gsap.fromTo(
      this.uniforms.uOpacity,
      { value: 0 },
      { value: 1, duration: 1.0, ease: "power4.out" }
    );
  }

  onLeaveViewport(): void {
    gsap.killTweensOf(this.uniforms.uOpacity);
    this.uniforms.uOpacity.value = 0;
    this.mesh.visible             = false;
    this._linkActive              = false;
    this._wipe                    = this.isFull ? 0.0 : 1.0;
    this._targetWipe              = this.isFull ? 0.0 : 1.0;
    this.uniforms.uWipe.value     = this._wipe;
  }

  createBounds(): void {
    const r = this.containerEl.getBoundingClientRect();
    // Hero canvas lives inside a pinned/fixed section — coords are already
    // viewport-relative. Scroll offset is always 0.
    this.bounds = {
      top:    r.top,
      left:   r.left,
      width:  this.containerEl.offsetWidth,
      height: r.height,
    };
  }

  updateScale(): void {
    if (!this.bounds) return;
    // Inset by 2px each side — prevents GPU anti-aliasing at mesh edges
    // from bleeding outside container bounds and showing through the reveal overlay.
    const inset = 2;
    this.mesh.scale.set(
      this.bounds.width  - inset * 2,
      this.bounds.height - inset * 2,
      1
    );
    this.uniforms.uPlaneSize.value.set(
      this.bounds.width  - inset * 2,
      this.bounds.height - inset * 2
    );
    this._syncTextureUniforms();
  }

  setPosition(): void {
    if (!this.bounds) return;
    const { vp } = this.engine;
    const inset  = 2;
    // scroll is always 0 — hero canvas is pinned/fixed
    const x = this.bounds.left - vp.w / 2 + this.bounds.width  / 2 + this.xOffset;
    const y =                    vp.h / 2 - (this.bounds.top + this.bounds.height / 2) - this.yOffset;
    this.mesh.position.x = x + inset;
    this.mesh.position.y = y;
  }

  private _syncTextureUniforms(): void {
    const img = this.uniforms.tMap.value?.image as
      | { width?: number; height?: number; naturalWidth?: number; naturalHeight?: number }
      | null
      | undefined;
    if (!img) return;
    this.uniforms.uTextureSize.value.set(
      img.width        ?? img.naturalWidth  ?? 1,
      img.height       ?? img.naturalHeight ?? 1
    );
  }

  async load(): Promise<void> {
    const entry = this.engine.textureManager.get(this.src);
    this.uniforms.tMap.value   = entry.texture;
    this.uniforms.uTrail.value = this.engine.trailTexture;
    this.createBounds();
    this.updateScale();
    this.setPosition();
    await entry.ready;
    this._syncTextureUniforms();
    this.createBounds();
    this.updateScale();
    this.setPosition();
  }

  onResize(): void {
    this.createBounds();
    this.updateScale();
    this.setPosition();
  }

  tick(gsapTime: number): void {
    this.setPosition();
    this.uniforms.uTime.value = gsapTime * 0.001;

    if (this.engine.trailTexture && !this.uniforms.uTrail.value) {
      this.uniforms.uTrail.value = this.engine.trailTexture;
    }
    if (this.uniforms.uTextureSize.value.x < 1) {
      this._syncTextureUniforms();
    }

    const dt         = 1 / 60;
    this._wipe      += (this._targetWipe - this._wipe) * (1 - Math.exp(-4.0 * dt));
    const t          = Math.max(0, Math.min(1, this._wipe));
    this.uniforms.uWipe.value = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  dispose(): void {
    gsap.killTweensOf(this.uniforms.uOpacity);
    this.material.dispose();
    this.engine.scene.remove(this.mesh);
  }
}

/* --------------------------------------------------------------------------
   DitherEngine (public class)
   -------------------------------------------------------------------------- */

export class DitherEngine {
  readonly canvas:         HTMLCanvasElement;
  readonly vp:             { w: number; h: number };
  readonly resolution:     THREE.IUniform<THREE.Vector2>;
  readonly themeColors:    { ink: string; bg: string };
  readonly renderer:       THREE.WebGLRenderer;
  readonly scene:          THREE.Scene;
  readonly planeGeo:       THREE.PlaneGeometry;
  readonly textureManager: TextureManager;
  readonly mediaInstances: Map<string, DitherMedia>;

  trailTexture: THREE.Texture | null = null;

  private readonly sectionEl:     HTMLElement;
  private readonly camera:        THREE.PerspectiveCamera;
  private readonly trailScene:    THREE.Scene;
  private readonly trailCam:      THREE.OrthographicCamera;
  private readonly trailUniforms: TrailUniforms;

  private rtA: THREE.WebGLRenderTarget | null = null;
  private rtB: THREE.WebGLRenderTarget | null = null;

  private readonly pointerTarget:    THREE.Vector2;
  private readonly lastPointer:      THREE.Vector2;
  private          trailVelocity   = 0;
  private readonly velocitySmoothing = 0.63;
  private readonly velocityAmplifier = 32;
  private          _skipNextDraw   = true;
  private          _started        = false;

  // Bound handler references stored for clean removal in dispose()
  private readonly _resizeBound:   () => void;
  private readonly _onMoveBound:   (e: PointerEvent) => void;
  private readonly _onLeaveBound:  () => void;
  private readonly _tickBound:     (time: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    sectionEl: HTMLElement,
    options: { inkColor?: string; bgColor?: string } = {},
  ) {
    this.canvas    = canvas;
    this.sectionEl = sectionEl;
    this.themeColors = {
      ink: options.inkColor ?? "#b48d8b",
      bg:  options.bgColor  ?? "#fdcdcd",
    };

    this.vp = {
      w: Math.max(1, canvas.clientWidth),
      h: Math.max(1, canvas.clientHeight),
    };

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias:       false,
      alpha:           true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const pr = this.renderer.getPixelRatio();
    this.resolution = { value: new THREE.Vector2(this.vp.w * pr, this.vp.h * pr) };

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, this.vp.w / this.vp.h, 100, 2000);
    this.camera.position.z = 600;
    this._updateCameraFov();

    this.planeGeo       = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.mediaInstances = new Map();
    this.textureManager = new TextureManager();

    this.pointerTarget = new THREE.Vector2(-999, -999);
    this.lastPointer   = new THREE.Vector2(-999, -999);

    // Build trail pass before resize (resize needs trailUniforms)
    const tp           = this._buildTrailPass();
    this.trailScene    = tp.trailScene;
    this.trailCam      = tp.trailCam;
    this.trailUniforms = tp.trailUniforms;

    this._resize();

    // Bind handlers for later cleanup
    this._resizeBound  = () => {
      this._resize();
      for (const m of this.mediaInstances.values()) m.onResize();
    };
    this._onMoveBound  = (e: PointerEvent) => this._onPointerMove(e);
    this._onLeaveBound = () => { this._skipNextDraw = true; this.trailVelocity = 0; };
    this._tickBound    = (time: number) => this._tick(time);

    window.addEventListener("resize",         this._resizeBound,  { passive: true });
    document.addEventListener("pointermove",  this._onMoveBound,  { passive: true });
    window.addEventListener("pointermove",    this._onMoveBound,  { passive: true });
    document.addEventListener("pointerleave", this._onLeaveBound, { passive: true });
    window.addEventListener("blur",           this._onLeaveBound, { passive: true });
  }

  // ── Camera ─────────────────────────────────────────────────────────────────

  private _updateCameraFov(): void {
    this.camera.fov    = 2 * Math.atan(this.vp.h / 2 / 600) * (180 / Math.PI);
    this.camera.aspect = this.vp.w / this.vp.h;
    this.camera.updateProjectionMatrix();
  }

  warmup(): void {
    if (!this.rtB) return;
    this.renderer.setRenderTarget(this.rtB);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.trailScene, this.trailCam);
    this.renderer.render(this.scene, this.camera);
  }

  // ── Trail pass ─────────────────────────────────────────────────────────────

  private _buildTrailPass(): {
    trailScene:    THREE.Scene;
    trailCam:      THREE.OrthographicCamera;
    trailUniforms: TrailUniforms;
  } {
    const fsTri = new THREE.BufferGeometry();
    fsTri.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
    );

    const trailScene = new THREE.Scene();
    const trailCam   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const trailUniforms: TrailUniforms = {
      u_texture:                { value: null },
      uPointer:                 { value: new THREE.Vector2(-999, -999) },
      uLastPointer:             { value: new THREE.Vector2(-999, -999) },
      uAspect:                  { value: 1.0 },
      uVelocity:                { value: 0.0 },
      uInitialRadius:           { value: 0.066 },
      uInitialRadiusMultiplier: { value: 0.015 },
      uBorderSize:              { value: 0.129 },
      uBorderSizeMultiplier:    { value: 0.054 },
      uDecayRate:               { value: 0.065 },
    };

    const trailMat = new THREE.RawShaderMaterial({
      uniforms: trailUniforms as unknown as { [uniform: string]: THREE.IUniform },
      vertexShader: /* glsl */`
        precision highp float;
        attribute vec3 position;
        varying vec2 vUv;
        void main() {
          vUv = position.xy * 0.5 + 0.5;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform sampler2D u_texture;
        uniform vec2  uPointer;
        uniform vec2  uLastPointer;
        uniform float uAspect;
        uniform float uVelocity;
        uniform float uInitialRadius;
        uniform float uInitialRadiusMultiplier;
        uniform float uBorderSize;
        uniform float uBorderSizeMultiplier;
        uniform float uDecayRate;
        varying vec2 vUv;

        float lineSegment(vec2 p, vec2 a, vec2 b, float r, float border) {
          p.x *= uAspect; a.x *= uAspect; b.x *= uAspect;
          vec2 pa = p - a, ba = b - a;
          float h    = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
          float dist = length(pa - ba * h);
          return smoothstep(r + border, r - border, dist);
        }

        void main() {
          float prev   = texture2D(u_texture, vUv).r;
          float vel    = clamp(uVelocity, 0.0, 1.0);
          float radius = uInitialRadius + vel * uInitialRadiusMultiplier;
          float border = uBorderSize   + vel * uBorderSizeMultiplier;
          float stroke = lineSegment(vUv, uLastPointer, uPointer, radius, border);
          float value  = prev + max(stroke, 0.0) * vel;
          value = mix(value, 0.0, uDecayRate);
          gl_FragColor = vec4(clamp(value, 0.0, 1.0));
        }
      `,
    });

    trailScene.add(new THREE.Mesh(fsTri, trailMat));
    return { trailScene, trailCam, trailUniforms };
  }

  // ── Dither material factory ────────────────────────────────────────────────

  makeDitherMaterial(uniforms: DitherUniforms): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms:    uniforms as unknown as { [uniform: string]: THREE.IUniform },
      transparent: true,
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        precision highp float;

        uniform sampler2D tMap;
        uniform vec2  uTextureSize;
        uniform vec2  uPlaneSize;
        uniform vec2  uResolution;
        uniform vec3  uColorInk;
        uniform vec3  uColorBg;
        uniform float uBias;
        uniform float uOpacity;
        uniform float uWipe;
        uniform float uSubtle;
        uniform float uZoom;
        uniform float uPixelSize;
        uniform float uPixelSizeMultiplier;
        uniform float uTime;
        uniform sampler2D uTrail;
        uniform float uTrailIntensityMultiplier;
        uniform float uBiasNoiseScale;
        uniform float uBiasNoiseSpeed;
        uniform float uBiasPulseSpeed;
        uniform float uBiasNoiseWeight;
        uniform float uBiasPulseWeight;
        uniform float uBiasAnimationStrength;

        varying vec2 vUv;

        vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

        float cnoise(vec3 P) {
          vec3 Pi0 = floor(P), Pi1 = Pi0 + 1.0;
          Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
          vec3 Pf0 = fract(P), Pf1 = Pf0 - 1.0;
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz, iz1 = Pi1.zzzz;
          vec4 ixy  = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);
          vec4 gx0 = ixy0 / 7.0, gy0 = fract(floor(gx0) / 7.0) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = 0.5 - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
          vec4 gx1 = ixy1 / 7.0, gy1 = fract(floor(gx1) / 7.0) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = 0.5 - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
          vec3 g000=vec3(gx0.x,gy0.x,gz0.x), g100=vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010=vec3(gx0.z,gy0.z,gz0.z), g110=vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001=vec3(gx1.x,gy1.x,gz1.x), g101=vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011=vec3(gx1.z,gy1.z,gz1.z), g111=vec3(gx1.w,gy1.w,gz1.w);
          vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
          g000*=norm0.x; g010*=norm0.y; g100*=norm0.z; g110*=norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
          g001*=norm1.x; g011*=norm1.y; g101*=norm1.z; g111*=norm1.w;
          float n000=dot(g000,Pf0),                      n100=dot(g100,vec3(Pf1.x,Pf0.yz));
          float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)), n110=dot(g110,vec3(Pf1.xy,Pf0.z));
          float n001=dot(g001,vec3(Pf0.xy,Pf1.z)),       n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
          float n011=dot(g011,vec3(Pf0.x,Pf1.yz)),       n111=dot(g111,Pf1);
          vec3 fxyz = fade(Pf0);
          vec4 nz  = mix(vec4(n000,n100,n010,n110), vec4(n001,n101,n011,n111), fxyz.z);
          vec2 nyz = mix(nz.xy, nz.zw, fxyz.y);
          return 2.2 * mix(nyz.x, nyz.y, fxyz.x);
        }

        const float bayer4[16] = float[16](
           0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
          12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
           3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
          15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
        );
        const float bayer8[64] = float[64](
           0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
          32.0/64.0, 16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0, 19.0/64.0, 47.0/64.0, 31.0/64.0,
           8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0, 59.0/64.0,  7.0/64.0, 55.0/64.0,
          40.0/64.0, 24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0, 27.0/64.0, 39.0/64.0, 23.0/64.0,
           2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0, 49.0/64.0, 13.0/64.0, 61.0/64.0,
          34.0/64.0, 18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0, 17.0/64.0, 45.0/64.0, 29.0/64.0,
          10.0/64.0, 58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0, 57.0/64.0,  5.0/64.0, 53.0/64.0,
          42.0/64.0, 26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0, 25.0/64.0, 37.0/64.0, 21.0/64.0
        );

        vec2 coverUv(vec2 uv, vec2 texSize, vec2 planeSize, float zoom) {
          float ta = texSize.x / texSize.y, pa = planeSize.x / planeSize.y;
          vec2 scale, offset;
          if (ta > pa) {
            float s = pa / ta; scale = vec2(s, 1.0); offset = vec2((1.0 - s) * 0.5, 0.0);
          } else {
            float s = ta / pa; scale = vec2(1.0, s); offset = vec2(0.0, (1.0 - s) * 0.5);
          }
          vec2 z = uv / zoom;
          z.y = 1.0 - (1.0 - uv.y) / zoom;
          return clamp(z * scale + offset, 0.0, 1.0);
        }

        vec3 orderedDither(float lum, float trail, float animBias) {
          float threshold;
          if (trail < 0.5) {
            int x = int(mod(gl_FragCoord.x, 4.0));
            int y = int(mod(gl_FragCoord.y, 4.0));
            threshold = bayer4[y * 4 + x];
          } else {
            int x = int(mod(gl_FragCoord.x, 8.0));
            int y = int(mod(gl_FragCoord.y, 8.0));
            threshold = bayer8[y * 8 + x];
          }
          float value = threshold + animBias * (1.0 + 2.0 * trail);
          return mix(uColorInk, uColorBg, step(value, lum));
        }

        void main() {
          if (uTextureSize.x < 1.0 || uTextureSize.y < 1.0) {
            gl_FragColor = vec4(0.0);
            return;
          }

          vec2  screenUv = gl_FragCoord.xy / uResolution.xy;
          float trail    = clamp(texture2D(uTrail, screenUv).r * uTrailIntensityMultiplier, 0.0, 1.0);

          vec2 uv = coverUv(vUv, uTextureSize, uPlaneSize, uZoom);

          vec2 normalPx = uPixelSize / uResolution;
          vec2 uvPx     = normalPx * floor(uv / normalPx);
          float dynPx   = mix(uPixelSize, uPixelSize * uPixelSizeMultiplier, trail);
          vec2  dynPxV  = dynPx / uResolution;
          vec2  uvPxDyn = dynPxV * floor(uv / dynPxV);

          vec4 colorSample = texture2D(tMap, uvPx);
          vec4 lumSample   = texture2D(tMap, uvPxDyn);
          float lum = dot(vec3(0.2126, 0.7152, 0.0722), lumSample.rgb);

          float noiseVal  = cnoise(vec3(uv * uBiasNoiseScale, uTime * uBiasNoiseSpeed));
          float timePulse = sin(uTime * uBiasPulseSpeed) * 0.5 + 0.5;
          float animBias  = uBias + (noiseVal * uBiasNoiseWeight + timePulse * uBiasPulseWeight) * uBiasAnimationStrength;

          vec3 dithered = orderedDither(lum, trail, animBias);

          vec2 uvOrig   = coverUv(vUv, uTextureSize, uPlaneSize, 1.0);
          vec3 original = texture2D(tMap, uvOrig).rgb;

          float wipeAxis = vUv.x * 0.9 + vUv.y * 0.2;
          float wipeTh   = (1.0 - uWipe) * 1.4 - 0.15;
          float wipeMask = smoothstep(wipeTh - 0.12, wipeTh + 0.12, wipeAxis);
          vec3 baseCol = mix(dithered, original, wipeMask);

          float subtleTrail = trail * uSubtle;

          vec2 subtleDrift = (vec2(
            cnoise(vec3(vUv * 3.5,             uTime * uBiasNoiseSpeed * 0.001)),
            cnoise(vec3(vUv * 3.5 + vec2(7.3), uTime * uBiasNoiseSpeed * 0.001))
          ) - 0.5) * subtleTrail * 0.018;

          vec2 uvSubtle = coverUv(vUv + subtleDrift, uTextureSize, uPlaneSize, 1.0);
          float blurAmt = subtleTrail * 0.012;
          vec3 blurred  =
            texture2D(tMap, coverUv(uvSubtle + vec2(-blurAmt, 0.0),     uTextureSize, uPlaneSize, 1.0)).rgb +
            texture2D(tMap, coverUv(uvSubtle + vec2( blurAmt, 0.0),     uTextureSize, uPlaneSize, 1.0)).rgb +
            texture2D(tMap, coverUv(uvSubtle + vec2(0.0, -blurAmt),     uTextureSize, uPlaneSize, 1.0)).rgb +
            texture2D(tMap, coverUv(uvSubtle + vec2(0.0,  blurAmt),     uTextureSize, uPlaneSize, 1.0)).rgb;
          blurred *= 0.25;

          vec3 subtleCol = mix(original, mix(blurred, blurred * 0.82 + uColorInk * 0.18, subtleTrail * 0.5), subtleTrail);

          baseCol = mix(baseCol, subtleCol, uSubtle * wipeMask * subtleTrail);

          colorSample.rgb = baseCol;
          colorSample.a   = uOpacity;
          gl_FragColor    = colorSample;
        }
      `,
    });
  }

  // ── Registration ───────────────────────────────────────────────────────────

  async registerAll(): Promise<void> {
    const els   = Array.from(this.sectionEl.querySelectorAll("[data-dither]")) as HTMLElement[];
    const loads: Promise<void>[] = [];

    // WeakMap avoids mutating DOM elements with custom properties
    const mediaMap = new WeakMap<Element, DitherMedia>();

    for (const el of els) {
      const img = (
        el.querySelector("img[data-src], img[src]") ??
        el.querySelector("[data-src]")
      ) as HTMLElement | null;
      if (!img) continue;

      const id = el.getAttribute("data-dither-id") ?? crypto.randomUUID();
      const m  = new DitherMedia(this, el, img);
      this.mediaInstances.set(id, m);
      loads.push(m.load());
      mediaMap.set(el, m);
    }

    // IntersectionObserver — entrance animation on scroll into view
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const media = mediaMap.get(entry.target);
          if (!media) continue;
          if (entry.isIntersecting) {
            media.prepareOnEnter();
            media.onEnter();
          } else {
            media.onLeaveViewport();
          }
        }
      },
      { rootMargin: "200% 0px 200% 0px" }
    );

    for (const m of this.mediaInstances.values()) io.observe(m.containerEl);

    // ResizeObserver — keeps bounds tight on layout shifts
    const ro = new ResizeObserver(() => {
      for (const m of this.mediaInstances.values()) m.onResize();
    });
    for (const m of this.mediaInstances.values()) ro.observe(m.containerEl);

    await Promise.all(loads);
    this.textureManager.flushAll(this.renderer);

    // data-dither-link buttons — document-scoped so any button can target any media
    document.querySelectorAll("[data-dither-link]").forEach(btn => {
      const targetId = btn.getAttribute("data-dither-link");
      const getTargets = (): DitherMedia[] =>
        targetId
          ? [this.mediaInstances.get(targetId)].filter((m): m is DitherMedia => m != null)
          : Array.from(this.mediaInstances.values()).filter(m => !m.isFull);

      btn.addEventListener("mouseenter", () => getTargets().forEach(m => m.linkEnter()));
      btn.addEventListener("mouseleave", () => getTargets().forEach(m => m.linkLeave()));
      btn.addEventListener("touchstart", () => getTargets().forEach(m => m.linkEnter()), { passive: true });
      btn.addEventListener("touchend",   () => getTargets().forEach(m => m.linkLeave()), { passive: true });
    });

    this._start();
  }

  // ── Resize ─────────────────────────────────────────────────────────────────

  private _resize(): void {
    const w  = Math.max(1, Math.floor(this.canvas.clientWidth));
    const h  = Math.max(1, Math.floor(this.canvas.clientHeight));
    const pr = this.renderer.getPixelRatio();

    this.vp.w = w;
    this.vp.h = h;
    this.resolution.value.set(w * pr, h * pr);
    this.renderer.setSize(w, h, false);
    this._updateCameraFov();

    if (this.rtA) this.rtA.dispose();
    if (this.rtB) this.rtB.dispose();
    this.rtA           = this._makeRT(w, h);
    this.rtB           = this._makeRT(w, h);
    this.trailTexture  = this.rtA.texture;
    this.trailUniforms.uAspect.value = w / h;

    for (const m of this.mediaInstances.values()) {
      m.uniforms.uTrail.value = this.trailTexture;
    }
  }

  private _makeRT(w: number, h: number): THREE.WebGLRenderTarget {
    const rt = new THREE.WebGLRenderTarget(w, h, {
      minFilter:     THREE.LinearFilter,
      magFilter:     THREE.LinearFilter,
      format:        THREE.RGBAFormat,
      depthBuffer:   false,
      stencilBuffer: false,
      type:          THREE.HalfFloatType,
    });
    this.renderer.setRenderTarget(rt);
    this.renderer.clear(true, false, false);
    this.renderer.setRenderTarget(null);
    return rt;
  }

  // ── Pointer ────────────────────────────────────────────────────────────────

  private _onPointerMove(e: PointerEvent): void {
    const nx = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
    const ny = Math.max(0, Math.min(1, 1.0 - e.clientY / window.innerHeight));
    if (this._skipNextDraw) {
      this.lastPointer.set(nx, ny);
      this._skipNextDraw = false;
    }
    this.pointerTarget.set(nx, ny);
  }

  private _tickTrail(): void {
    const dx   = this.pointerTarget.x - this.lastPointer.x;
    const dy   = this.pointerTarget.y - this.lastPointer.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.trailVelocity += (dist - this.trailVelocity) * this.velocitySmoothing;
    const vel = Math.min(this.trailVelocity * this.velocityAmplifier, 1.0);

    this.trailUniforms.uPointer.value.copy(this.pointerTarget);
    this.trailUniforms.uLastPointer.value.copy(this.lastPointer);
    this.trailUniforms.uVelocity.value = vel;
    this.lastPointer.copy(this.pointerTarget);

    this.trailUniforms.u_texture.value = this.rtA!.texture;
    this.renderer.setRenderTarget(this.rtB);
    this.renderer.render(this.trailScene, this.trailCam);
    this.renderer.setRenderTarget(null);

    // Ping-pong swap
    const tmp = this.rtA;
    this.rtA  = this.rtB;
    this.rtB  = tmp;
    this.trailTexture = this.rtA!.texture;
  }

  private _tick(gsapTime: number): void {
    this.textureManager.processQueue(this.renderer);

    /* Skip rendering when there is nothing useful to draw.
       – No media instances registered at all, OR
       – Media instances exist but none have a loaded texture yet.
       This prevents the THREE.js "Texture marked for update but no image
       data found" warning from flooding the console. */
    if (this.mediaInstances.size === 0) return;

    let anyLoaded = false;
    for (const m of this.mediaInstances.values()) {
      if (m.uniforms.tMap.value?.image) { anyLoaded = true; break; }
    }
    if (!anyLoaded) return;

    this._tickTrail();
    for (const m of this.mediaInstances.values()) {
      m.uniforms.uTrail.value = this.trailTexture;
      m.tick(gsapTime);
    }
    this.renderer.render(this.scene, this.camera);
  }

  private _start(): void {
    if (this._started) return;
    this._started = true;
    gsap.ticker.add(this._tickBound);
  }

  // ── Dispose ────────────────────────────────────────────────────────────────

  dispose(): void {
    gsap.ticker.remove(this._tickBound);

    for (const m of this.mediaInstances.values()) m.dispose();
    this.mediaInstances.clear();

    this.rtA?.dispose();
    this.rtB?.dispose();
    this.planeGeo.dispose();
    this.renderer.dispose();

    window.removeEventListener("resize",         this._resizeBound);
    document.removeEventListener("pointermove",  this._onMoveBound);
    window.removeEventListener("pointermove",    this._onMoveBound);
    document.removeEventListener("pointerleave", this._onLeaveBound);
    window.removeEventListener("blur",           this._onLeaveBound);
  }
}
