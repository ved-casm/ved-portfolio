"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./RevealHero.module.css";
import Wordmark from "./Wordmark";
import { videoPoster, videoSources } from "@/lib/lazyVideo";

export interface RevealHeroProps {
  videoSrc?: string;
  word?: string;
  taglineLine1?: string;
  taglineLine2?: string;
  roleText?: string;
  locationText?: string;
  monogramSrc?: string;
  linkedinHref?: string;
  githubHref?: string;

  // Fluid simulation parameters
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
}

export default function RevealHero({
  videoSrc = "/newhero.mp4",
  word = "VEDANK",
  taglineLine1 = "Contrast isn't a filter I apply.",
  taglineLine2 = "It's how I think.",
  roleText = "Frontend & UI/UX Designer",
  locationText = "Based in Jaipur, IN",
  monogramSrc = "/monogram-white.avif",
  linkedinHref = "https://www.linkedin.com/in/vedank-gaur/",
  githubHref = "https://github.com/ved-casm",

  // Fluid dynamics defaults
  SIM_RESOLUTION = 64,
  DYE_RESOLUTION = 312,
  DENSITY_DISSIPATION = 2.5,
  VELOCITY_DISSIPATION = 2.0,
  PRESSURE = 0.8,
  PRESSURE_ITERATIONS = 12,
  CURL = 25,
  SPLAT_RADIUS = 0.06,
  SPLAT_FORCE = 3000,
}: RevealHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [videoDims, setVideoDims] = useState({ w: 1920, h: 1080 });
  const [fitMode, setFitMode] = useState<"slice" | "meet">("slice");

  useEffect(() => {
    const checkFit = () => {
      // Under 880px screen width, switch to 'meet' (contain mode) so SVG & video fit 100% horizontally without side cutoff
      if (window.innerWidth < 880) {
        setFitMode("meet");
      } else {
        setFitMode("slice");
      }
    };
    checkFit();
    window.addEventListener("resize", checkFit);
    return () => window.removeEventListener("resize", checkFit);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!container || !canvas || !video) return;

    let animationFrameId = 0;

    const config = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING: true,
    };

    function pointerPrototype() {
      return {
        id: -1,
        texcoordX: 0,
        texcoordY: 0,
        prevTexcoordX: 0,
        prevTexcoordY: 0,
        deltaX: 0,
        deltaY: 0,
        down: false,
        moved: false,
        color: { r: 1.0, g: 1.0, b: 1.0 },
      };
    }

    const pointers = [pointerPrototype()];

    // Initialize WebGL
    const params: WebGLContextAttributes = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };

    let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
    const isWebGL2 = !!gl;
    if (!gl) {
      gl =
        (canvas.getContext("webgl", params) as WebGLRenderingContext | null) ||
        (canvas.getContext(
          "experimental-webgl",
          params,
        ) as WebGLRenderingContext | null);
    }
    if (!gl) return;

    let halfFloat: OES_texture_half_float | null = null;
    let supportLinearFiltering: OES_texture_float_linear | OES_texture_half_float_linear | null =
      null;

    if (isWebGL2) {
      gl.getExtension("EXT_color_buffer_float");
      supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
    } else {
      halfFloat = gl.getExtension("OES_texture_half_float");
      supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    const halfFloatTexType = isWebGL2
      ? (gl as WebGL2RenderingContext).HALF_FLOAT
      : halfFloat
        ? halfFloat.HALF_FLOAT_OES
        : gl.UNSIGNED_BYTE;

    function supportRenderTextureFormat(
      internalFormat: number,
      format: number,
      type: number,
    ) {
      if (!gl) return false;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        4,
        4,
        0,
        format,
        type,
        null,
      );
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    function getSupportedFormat(
      internalFormat: number,
      format: number,
      type: number,
    ): { internalFormat: number; format: number } | null {
      if (!supportRenderTextureFormat(internalFormat, format, type)) {
        if (isWebGL2) {
          const gl2 = gl as WebGL2RenderingContext;
          switch (internalFormat) {
            case gl2.R16F:
              return getSupportedFormat(gl2.RG16F, gl2.RG, type);
            case gl2.RG16F:
              return getSupportedFormat(gl2.RGBA16F, gl2.RGBA, type);
            default:
              return null;
          }
        }
        return null;
      }
      return { internalFormat, format };
    }

    let formatRGBA: { internalFormat: number; format: number } | null;
    let formatRG: { internalFormat: number; format: number } | null;
    let formatR: { internalFormat: number; format: number } | null;

    if (isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      formatRGBA = getSupportedFormat(gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl2.RG16F, gl2.RG, halfFloatTexType);
      formatR = getSupportedFormat(gl2.R16F, gl2.RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(
        gl.RGBA,
        gl.RGBA,
        halfFloatTexType,
      );
      formatRG = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    if (!formatRGBA || !formatRG || !formatR) return;

    if (!supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    // Shader Compiler Helpers
    function compileShader(type: number, source: string, keywords?: string[]) {
      if (!gl) return null;
      if (keywords) {
        let keywordsString = "";
        keywords.forEach((keyword) => {
          keywordsString += "#define " + keyword + "\n";
        });
        source = keywordsString + source;
      }
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    function createProgram(
      vertexShader: WebGLShader | null,
      fragmentShader: WebGLShader | null,
    ) {
      if (!gl || !vertexShader || !fragmentShader) return null;
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
      }
      return program;
    }

    function getUniforms(program: WebGLProgram | null) {
      const uniforms: { [name: string]: WebGLUniformLocation | null } = {};
      if (!gl || !program) return uniforms;
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) {
          uniforms[info.name] = gl.getUniformLocation(program, info.name);
        }
      }
      return uniforms;
    }

    class Program {
      program: WebGLProgram | null;
      uniforms: { [name: string]: WebGLUniformLocation | null };
      constructor(
        vertexShader: WebGLShader | null,
        fragmentShader: WebGLShader | null,
      ) {
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
      }
      bind() {
        if (gl && this.program) gl.useProgram(this.program);
      }
    }

    class Material {
      vertexShader: WebGLShader | null;
      fragmentShaderSource: string;
      programs: { [hash: number]: WebGLProgram | null };
      activeProgram: WebGLProgram | null;
      uniforms: { [name: string]: WebGLUniformLocation | null };

      constructor(
        vertexShader: WebGLShader | null,
        fragmentShaderSource: string,
      ) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = {};
        this.activeProgram = null;
        this.uniforms = {};
      }

      setKeywords(keywords: string[]) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++) {
          hash += hashCode(keywords[i]);
        }
        let program = this.programs[hash];
        if (program == null) {
          const fragmentShader = compileShader(
            gl!.FRAGMENT_SHADER,
            this.fragmentShaderSource,
            keywords,
          );
          program = createProgram(this.vertexShader, fragmentShader);
          this.programs[hash] = program;
        }
        if (program === this.activeProgram) return;
        this.uniforms = getUniforms(program);
        this.activeProgram = program;
      }

      bind() {
        if (gl && this.activeProgram) gl.useProgram(this.activeProgram);
      }
    }

    function hashCode(s: string) {
      if (s.length === 0) return 0;
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0;
      }
      return hash;
    }

    // Vertex & Fragment Shaders
    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `,
    );

    const copyShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `,
    );

    const clearShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `,
    );

    // Video Reveal Display Shader
    const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;

      uniform sampler2D uTexture;       // fluid dye
      uniform sampler2D uVideo;         // video texture
      uniform vec2 uResolution;
      uniform vec2 uVideoResolution;
      uniform vec2 texelSize;
      uniform float uFitMode;           // 0.0 = slice (cover), 1.0 = meet (contain)

      vec2 fitUv(vec2 uv, vec2 screen, vec2 tex, float mode) {
          float screenAspect = screen.x / screen.y;
          float texAspect    = tex.x / tex.y;
          vec2 scale = vec2(1.0);
          if (mode > 0.5) {
              // Meet / Contain mode (preserveAspectRatio="xMidYMid meet")
              if (screenAspect < texAspect) {
                  scale.y = texAspect / screenAspect;
              } else {
                  scale.x = screenAspect / texAspect;
              }
          } else {
              // Slice / Cover mode (preserveAspectRatio="xMidYMid slice")
              if (screenAspect > texAspect) {
                  scale.y = texAspect / screenAspect;
              } else {
                  scale.x = screenAspect / texAspect;
              }
          }
          return (uv - 0.5) * scale + 0.5;
      }

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          float density = max(c.r, max(c.g, c.b));
          float alpha = smoothstep(0.01, 0.12, density);

          vec2 flippedUv = vec2(vUv.x, 1.0 - vUv.y);
          vec2 vidUv = fitUv(flippedUv, uResolution, uVideoResolution, uFitMode);
          vec3 videoColor = texture2D(uVideo, vidUv).rgb;

          gl_FragColor = vec4(videoColor, alpha);
      }
    `;

    const splatShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `,
    );

    const advectionShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
            #ifdef MANUAL_FILTERING
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `,
      supportLinearFiltering ? undefined : ["MANUAL_FILTERING"],
    );

    const divergenceShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `,
    );

    const curlShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `,
    );

    const vorticityShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `,
    );

    const pressureShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `,
    );

    const gradientSubtractShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `,
    );

    const blit = (() => {
      const quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW,
      );
      const elemBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 0, 2, 3]),
        gl.STATIC_DRAW,
      );
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      return (targetFBO: any | null, clear = false) => {
        if (!gl) return;
        if (targetFBO == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, targetFBO.width, targetFBO.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.fbo);
        }
        if (clear) {
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    // Video Texture setup
    const videoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let videoWidth = 1920;
    let videoHeight = 1080;

    const onVideoMeta = () => {
      if (video.videoWidth && video.videoHeight) {
        videoWidth = video.videoWidth;
        videoHeight = video.videoHeight;
        setVideoDims({ w: video.videoWidth, h: video.videoHeight });
      }
    };
    video.addEventListener("loadedmetadata", onVideoMeta);
    onVideoMeta();

    // Framebuffer objects
    interface FBO {
      texture: WebGLTexture;
      fbo: WebGLFramebuffer;
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      attach: (id: number) => number;
    }

    interface DoubleFBO {
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      read: FBO;
      write: FBO;
      swap: () => void;
    }

    let dye: DoubleFBO | null = null;
    let velocity: DoubleFBO | null = null;
    let divergence: FBO | null = null;
    let curl: FBO | null = null;
    let pressure: DoubleFBO | null = null;

    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(
      baseVertexShader,
      gradientSubtractShader,
    );
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);

    function createFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): FBO {
      gl!.activeTexture(gl!.TEXTURE0);
      const texture = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        internalFormat,
        w,
        h,
        0,
        format,
        type,
        null,
      );

      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(
        gl!.FRAMEBUFFER,
        gl!.COLOR_ATTACHMENT0,
        gl!.TEXTURE_2D,
        texture,
        0,
      );
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1.0 / w,
        texelSizeY: 1.0 / h,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): DoubleFBO {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() {
          return fbo1;
        },
        set read(val) {
          fbo1 = val;
        },
        get write() {
          return fbo2;
        },
        set write(val) {
          fbo2 = val;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    }

    function resizeFBO(
      target: FBO,
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): FBO {
      const newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      gl!.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO);
      return newFBO;
    }

    function resizeDoubleFBO(
      target: DoubleFBO,
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): DoubleFBO {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(
        target.read,
        w,
        h,
        internalFormat,
        format,
        type,
        param,
      );
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1.0 / w;
      target.texelSizeY = 1.0 / h;
      return target;
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = halfFloatTexType;
      const rgba = formatRGBA!;
      const rg = formatRG!;
      const r = formatR!;
      const filtering = supportLinearFiltering ? gl!.LINEAR : gl!.NEAREST;
      gl!.disable(gl!.BLEND);

      if (!dye) {
        dye = createDoubleFBO(
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering,
        );
      } else {
        dye = resizeDoubleFBO(
          dye,
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering,
        );
      }

      if (!velocity) {
        velocity = createDoubleFBO(
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering,
        );
      } else {
        velocity = resizeDoubleFBO(
          velocity,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering,
        );
      }

      divergence = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl!.NEAREST,
      );
      curl = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl!.NEAREST,
      );
      pressure = createDoubleFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl!.NEAREST,
      );
    }

    function getResolution(resolution: number) {
      let aspectRatio = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      if (gl!.drawingBufferWidth > gl!.drawingBufferHeight) {
        return { width: max, height: min };
      } else {
        return { width: min, height: max };
      }
    }

    function updateKeywords() {
      const displayKeywords: string[] = [];
      if (config.SHADING) displayKeywords.push("SHADING");
      displayMaterial.setKeywords(displayKeywords);
    }

    updateKeywords();
    initFramebuffers();

    let lastUpdateTime = Date.now();
    let lastVideoTime = -1;

    function calcDeltaTime() {
      const now = Date.now();
      let dt = (now - lastUpdateTime) / 1000;
      dt = Math.min(dt, 0.016666);
      lastUpdateTime = now;
      return dt;
    }

    // canvas size is cached (reading clientWidth every frame forced a layout
    // per frame); a ResizeObserver marks it stale
    let cssW = canvas ? canvas.clientWidth : 0;
    let cssH = canvas ? canvas.clientHeight : 0;
    const sizeObserver = new ResizeObserver(() => {
      if (!canvas) return;
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
    });
    if (canvas) sizeObserver.observe(canvas);

    function resizeCanvas() {
      if (!canvas) return false;
      const width = scaleByPixelRatio(cssW);
      const height = scaleByPixelRatio(cssH);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    function scaleByPixelRatio(input: number) {
      // a soft fluid over video doesn't need retina resolution
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      return Math.floor(input * pixelRatio);
    }

    function applyInputs() {
      pointers.forEach((p) => {
        if (p.moved) {
          p.moved = false;
          splatPointer(p);
        }
      });
    }

    function splatPointer(pointer: typeof pointers[0]) {
      const dx = pointer.deltaX * config.SPLAT_FORCE;
      const dy = pointer.deltaY * config.SPLAT_FORCE;
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }

    function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
      if (!velocity || !dye || !canvas) return;
      splatProgram.bind();
      gl!.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl!.uniform1f(
        splatProgram.uniforms.aspectRatio,
        canvas.width / canvas.height,
      );
      gl!.uniform2f(splatProgram.uniforms.point, x, y);
      gl!.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
      gl!.uniform1f(
        splatProgram.uniforms.radius,
        correctRadius(config.SPLAT_RADIUS / 100.0),
      );
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl!.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }

    function correctRadius(radius: number) {
      if (!canvas) return radius;
      let aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) radius *= aspectRatio;
      return radius;
    }

    function step(dt: number) {
      if (!velocity || !divergence || !curl || !pressure || !dye) return;
      gl!.disable(gl!.BLEND);

      curlProgram.bind();
      gl!.uniform2f(
        curlProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      vorticityProgram.bind();
      gl!.uniform2f(
        vorticityProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(
        vorticityProgram.uniforms.uVelocity,
        velocity.read.attach(0),
      );
      gl!.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      gl!.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      gl!.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      divergenceProgram.bind();
      gl!.uniform2f(
        divergenceProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(
        divergenceProgram.uniforms.uVelocity,
        velocity.read.attach(0),
      );
      blit(divergence);

      clearProgram.bind();
      gl!.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl!.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write);
      pressure.swap();

      pressureProgram.bind();
      gl!.uniform2f(
        pressureProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(
          pressureProgram.uniforms.uPressure,
          pressure.read.attach(1),
        );
        blit(pressure.write);
        pressure.swap();
      }

      gradienSubtractProgram.bind();
      gl!.uniform2f(
        gradienSubtractProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      gl!.uniform1i(
        gradienSubtractProgram.uniforms.uPressure,
        pressure.read.attach(0),
      );
      gl!.uniform1i(
        gradienSubtractProgram.uniforms.uVelocity,
        velocity.read.attach(1),
      );
      blit(velocity.write);
      velocity.swap();

      advectionProgram.bind();
      gl!.uniform2f(
        advectionProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      if (!supportLinearFiltering) {
        gl!.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          velocity.texelSizeX,
          velocity.texelSizeY,
        );
      }
      const velocityId = velocity.read.attach(0);
      gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      gl!.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      gl!.uniform1f(advectionProgram.uniforms.dt, dt);
      gl!.uniform1f(
        advectionProgram.uniforms.dissipation,
        config.VELOCITY_DISSIPATION,
      );
      blit(velocity.write);
      velocity.swap();

      if (!supportLinearFiltering) {
        gl!.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          dye.texelSizeX,
          dye.texelSizeY,
        );
      }
      gl!.uniform1i(
        advectionProgram.uniforms.uVelocity,
        velocity.read.attach(0),
      );
      gl!.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      gl!.uniform1f(
        advectionProgram.uniforms.dissipation,
        config.DENSITY_DISSIPATION,
      );
      blit(dye.write);
      dye.swap();
    }

    function render() {
      if (!gl || !dye || !canvas) return;

      // Update Video Texture from HTML Video Element only when new frame is available
      if (video && video.readyState >= 2 && !video.paused) {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, videoTexture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video,
          );
        }
      }

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);

      displayMaterial.bind();
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      if (config.SHADING) {
        gl.uniform2f(
          displayMaterial.uniforms.texelSize,
          1.0 / width,
          1.0 / height,
        );
      }
      gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      gl.uniform1i(displayMaterial.uniforms.uVideo, 2);
      gl.uniform2f(displayMaterial.uniforms.uResolution, width, height);
      gl.uniform2f(
        displayMaterial.uniforms.uVideoResolution,
        videoWidth,
        videoHeight,
      );
      gl.uniform1f(
        displayMaterial.uniforms.uFitMode,
        window.innerWidth < 880 ? 1.0 : 0.0,
      );

      blit(null);
    }

    function updateFrame() {
      // Off-screen: stop the whole sim (not just the video). The observer
      // below restarts it; otherwise it keeps burning a frame's worth of GL
      // work on every scroll frame further down the page.
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }
      const dt = calcDeltaTime();
      if (resizeCanvas()) initFramebuffers();
      applyInputs();
      step(dt);
      render();
      animationFrameId = requestAnimationFrame(updateFrame);
    }

    // Pointer events
    function updatePointerDownData(
      pointer: typeof pointers[0],
      id: number,
      posX: number,
      posY: number,
    ) {
      if (!canvas) return;
      pointer.id = id;
      pointer.down = true;
      pointer.moved = false;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0;
      pointer.deltaY = 0;
    }

    function updatePointerMoveData(
      pointer: typeof pointers[0],
      posX: number,
      posY: number,
    ) {
      if (!canvas) return;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.deltaX = correctDeltaX(
        pointer.texcoordX - pointer.prevTexcoordX,
      );
      pointer.deltaY = correctDeltaY(
        pointer.texcoordY - pointer.prevTexcoordY,
      );
      pointer.moved =
        Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }

    function correctDeltaX(delta: number) {
      if (!canvas) return delta;
      let aspectRatio = canvas.width / canvas.height;
      if (aspectRatio < 1) delta *= aspectRatio;
      return delta;
    }

    function correctDeltaY(delta: number) {
      if (!canvas) return delta;
      let aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) delta /= aspectRatio;
      return delta;
    } const onPointerMove = (e: MouseEvent) => {
      if (!hasInteracted) setHasInteracted(true);
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pointer = pointers[0];
      const posX = scaleByPixelRatio(e.clientX - rect.left);
      const posY = scaleByPixelRatio(e.clientY - rect.top);
      updatePointerMoveData(pointer, posX, posY);
    };

    const onPointerDown = (e: MouseEvent) => {
      if (!hasInteracted) setHasInteracted(true);
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pointer = pointers[0];
      const posX = scaleByPixelRatio(e.clientX - rect.left);
      const posY = scaleByPixelRatio(e.clientY - rect.top);
      updatePointerDownData(pointer, -1, posX, posY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!hasInteracted) setHasInteracted(true);
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pointer = pointers[0];
      const touch = e.targetTouches[0];
      if (touch) {
        const posX = scaleByPixelRatio(touch.clientX - rect.left);
        const posY = scaleByPixelRatio(touch.clientY - rect.top);
        updatePointerMoveData(pointer, posX, posY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!hasInteracted) setHasInteracted(true);
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pointer = pointers[0];
      const touch = e.targetTouches[0];
      if (touch) {
        const posX = scaleByPixelRatio(touch.clientX - rect.left);
        const posY = scaleByPixelRatio(touch.clientY - rect.top);
        updatePointerDownData(pointer, touch.identifier, posX, posY);
      }
    };

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    // Video Autoplay setup
    const tryPlay = () => {
      if (video) {
        video.play().catch(() => { });
      }
    };
    tryPlay();
    window.addEventListener("pointerdown", tryPlay, { once: true });

    let isVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          tryPlay();
          if (!animationFrameId) {
            lastUpdateTime = Date.now();
            animationFrameId = requestAnimationFrame(updateFrame);
          }
        } else if (video) video.pause();
      },
      { threshold: 0 },
    );
    io.observe(container);

    // Start animation loop
    updateFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      io.disconnect();
      sizeObserver.disconnect();
      video.removeEventListener("loadedmetadata", onVideoMeta);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("pointerdown", tryPlay);
    };
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    hasInteracted,
  ]);

  return (
    <section ref={containerRef} className={styles.hero}>
      {/* Source Video: texture feed for WebGL */}
      <video
        ref={videoRef}
        className={styles.source}
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        aria-hidden="true"
      >
        {videoSources(videoSrc).map((v) => (
          <source key={v.type} src={v.src} type={v.type} />
        ))}
      </video>

      {/* Layer 1: SVG Wordmark scaling 1-to-1 with video cover math */}
      <span className={styles.srOnly}>{word}</span>
      <Wordmark
        className={styles.word}
        videoWidth={videoDims.w}
        videoHeight={videoDims.h}
        preserveAspectRatio={
          fitMode === "meet" ? "xMidYMid meet" : "xMidYMid slice"
        }
      />

      {/* Role line, pinned under the wordmark with the same cover/contain
          math the video and SVG use, so the wordmark itself never moves */}
      <p className={styles.role}>{roleText}</p>

      {/* Layer 2: WebGL Fluid Canvas */}
      <div className={styles.canvas}>
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Layer 3: Top-Left brand row - monogram + stance line, on the same
          line as the menu button (top-right) */}
      <div className={styles.copy}>
        <Image
          src={monogramSrc}
          alt="Vedank monogram"
          width={408}
          height={483}
          className={styles.monogram}
          priority
        />
        <p className={styles.tagline}>
          {taglineLine1}
          <br />
          {taglineLine2}
        </p>
      </div>

      {/* Layer 3: Bottom Bar Chrome */}
      <footer className={styles.foot}>
        {/* Bottom-Left: Location line */}
        <div className={styles.bottomLeft}>
          <span className={styles.locationText}>{locationText}</span>
        </div>

        {/* Bottom-Center: Scroll cue + Fading cursor hint */}
        <div className={styles.bottomCenter}>
          <a href="#about" className={styles.scrollCue}>
            Selected work ↓
          </a>
          <span
            className={`${styles.hint} ${hasInteracted ? styles.hintFaded : ""}`}
          >
            Move your cursor
          </span>
        </div>

        {/* Bottom-Right: Social Links */}
        <div className={styles.bottomRight}>
          <a
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            LINKEDIN
          </a>
          <span style={{ opacity: 0.4 }}>/</span>
          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            GITHUB
          </a>
        </div>
      </footer>
    </section>
  );
}
