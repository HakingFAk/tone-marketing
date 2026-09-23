import React from "react";
import { useAmbientAudio } from "@/components/AmbientAudio";

const particles = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 9) % 100}%`,
  top: `${(index * 61 + 7) % 100}%`,
  size: index % 5 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
  delay: `${-(index * 0.83)}s`,
  duration: `${13 + (index % 6) * 2}s`,
}));

export function SiteAmbient() {
  const { playing, muted, toneContext } = useAmbientAudio();
  const resonating = playing && !muted;

  return <div className="tone-site-ambient" data-active={resonating} data-theme={toneContext} aria-hidden="true">
    <div className="tone-site-vignette" />
    <div className="tone-site-rhythm" />
    <div className="tone-site-glow tone-site-glow-one" />
    <div className="tone-site-glow tone-site-glow-two" />
    <div className="tone-site-particles">{particles.map(particle => <span key={particle.id} className="tone-site-particle" style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, animationDelay: particle.delay, animationDuration: particle.duration }} />)}</div>
  </div>;
}
