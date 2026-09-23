import React from "react";

export function HomeMenuButton({ label, open, onClick, children }: { label: string; open: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className="xl:hidden" onClick={onClick} aria-label={label}>{children}</button>;
}

export function HomeAccessibleImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={className} />;
}
