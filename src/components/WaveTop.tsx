/** Wavy gold-lined top edge for a section. Place inside a `relative` section; fill = that section's colour. */
export default function WaveTop({ fill }: { fill: string }) {
  const curve = "M0,56 C240,8 480,6 720,38 C960,70 1200,72 1440,26";
  return (
    <svg className="pointer-events-none absolute inset-x-0 bottom-[calc(100%-1px)] z-[1] h-[clamp(28px,4.4vw,64px)] w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${curve} L1440,80 L0,80Z`} fill={fill} />
      <path d={curve} fill="none" stroke="#c9a24d" strokeOpacity=".6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}