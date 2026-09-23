import React from "react";

const LOGO_SRC = "/media/tone-market-logo-high-contrast-restored_86abe8f9.png";

type ToneLogoProps = {
  language?: "pt" | "en";
  size?: "header" | "footer";
};

export function ToneLogo({ language = "pt", size = "header" }: ToneLogoProps) {
  const english = language === "en";
  const label = english ? "Tone Market home" : "Início da Tone Market";

  return (
    <a href="#top" className={`tone-brand-lockup tone-brand-lockup--${size}`} aria-label={label}>
      <span className="tone-brand-symbol" aria-hidden="true"><img src={LOGO_SRC} alt="" /></span>
      <span className="tone-brand-name" aria-hidden="true"><strong>TONE</strong><em>MARKET</em></span>
    </a>
  );
}
