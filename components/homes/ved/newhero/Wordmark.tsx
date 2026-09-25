"use client";

export interface WordmarkProps {
  className?: string;
  videoWidth?: number;
  videoHeight?: number;
  preserveAspectRatio?: string;
}

export default function Wordmark({
  className,
  videoWidth = 1920,
  videoHeight = 1080,
  preserveAspectRatio = "xMidYMid slice",
}: WordmarkProps) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${videoWidth} ${videoHeight}`}
      preserveAspectRatio={preserveAspectRatio}
      role="img"
      aria-label="VEDANK"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fitted to the letters in newhero.mp4 (1920x1080), measured from its
          frames: per-letter x spans (least squares) and the letters' top/bottom
          (y 354-727). The balloon letters are taller than this face, hence
          the larger y scale. */}
      <g transform="matrix(0.78475 0 0 1.02608 186.9 354)">
        <path
          d="M131.072 363.52L-2.67029e-05 0H80.384L177.152 275.968L273.92 0H354.304L222.72 363.52H131.072ZM357.44 363.52V0H610.368V65.536H435.264V148.992H604.224V213.504H435.264V297.984H614.464V363.52H357.44ZM643.72 363.52V0H769.16C828.211 0 873.608 15.872 905.352 47.616C937.096 79.0187 952.968 123.904 952.968 182.272C952.968 240.299 937.267 285.013 905.864 316.416C874.803 347.819 830.259 363.52 772.232 363.52H643.72ZM721.544 297.984H769.16C804.317 297.984 830.259 288.597 846.984 269.824C864.051 250.709 872.584 221.355 872.584 181.76C872.584 142.165 864.051 112.981 846.984 94.208C830.259 75.0933 804.317 65.536 769.16 65.536H721.544V297.984ZM931.84 363.52L1062.91 0H1155.07L1286.14 363.52H1205.25L1178.62 286.208H1038.85L1012.22 363.52H931.84ZM1060.86 222.208H1157.12L1108.99 81.92L1060.86 222.208ZM1290.28 363.52V0H1376.3L1520.68 250.88V0H1598.5V363.52H1511.46L1368.1 121.344V363.52H1290.28ZM1643.56 363.52V0H1721.38V158.72L1853.48 0H1944.1L1810.47 160.256L1952.3 363.52H1863.72L1759.27 212.48L1721.38 256.512V363.52H1643.56Z"
          fill="#ffffff"
        />
      </g>
    </svg>
  );
}
