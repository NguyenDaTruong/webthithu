import { memo, useRef, useState, useEffect, useCallback, useMemo } from "react";
import "../styles/LogoLoop.css";

const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };

const toCssLength = (value) => typeof value === "number" ? `${value}px` : (value ?? undefined);

function useAnimationLoop(trackRef, targetVelocity, seqWidth) {
  const rafRef = useRef(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || seqWidth === 0) return;

    const animate = () => {
      offsetRef.current = (offsetRef.current + targetVelocity * 0.016) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetVelocity, seqWidth, trackRef]);
}

const LogoLoop = memo(({ logos, speed = 120, logoHeight = 48, gap = 40 }) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const seqRef = useRef(null);
  const [seqWidth, setSeqWidth] = useState(0);

  useEffect(() => {
    setSeqWidth(seqRef.current?.getBoundingClientRect().width || 0);
  }, [logos, gap, logoHeight]);

  useAnimationLoop(trackRef, speed, seqWidth);

  return (
    <div ref={containerRef} className="logoloop" style={{ "--logoloop-gap": `${gap}px`, "--logoloop-logoHeight": `${logoHeight}px` }}>
      <div className="logoloop__track" ref={trackRef}>
        <ul className="logoloop__list" ref={seqRef}>
          {logos.map((item, idx) => (
            <li className="logoloop__item" key={idx}>
              <a href={item.href} target="_blank" rel="noopener noreferrer" title={item.title}>
                {item.node}
              </a>
            </li>
          ))}
        </ul>
        {/* Copy for seamless loop */}
        <ul className="logoloop__list">
          {logos.map((item, idx) => (
            <li className="logoloop__item" key={`copy-${idx}`}>
              <a href={item.href} target="_blank" rel="noopener noreferrer" title={item.title}>
                {item.node}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default LogoLoop;

