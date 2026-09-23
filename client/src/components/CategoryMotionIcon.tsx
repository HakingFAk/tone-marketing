import React from "react";

type CategoryMotionIconProps = { category: string };

const editorialStudies: Record<string, { src: string; className: string; alt: string }> = {
  guitarras: {
    src: "/media/tone-editorial-electric-guitar_b2b034b0.png",
    className: "tone-study-guitar",
    alt: "Guitarra elétrica em estudo de produto",
  },
  violoes: {
    src: "/media/tone-editorial-acoustic-guitar_3aaedb31.png",
    className: "tone-study-acoustic",
    alt: "Violão acústico em estudo de produto",
  },
  pedais: {
    src: "/media/tone-editorial-pedal_116843f3.png",
    className: "tone-study-pedal",
    alt: "Pedal de efeitos em estudo de produto",
  },
  amplificadores: {
    src: "/media/tone-editorial-amplifier_fa8cad33.png",
    className: "tone-study-amp",
    alt: "Amplificador em estudo de produto",
  },
  acessorios: {
    src: "/media/tone-editorial-accessory_cbeb3a05.png",
    className: "tone-study-accessory",
    alt: "Acessórios musicais em estudo de produto",
  },
};

function keyForCategory(category: string) {
  return category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function CategoryMotionIcon({ category }: CategoryMotionIconProps) {
  const study = editorialStudies[keyForCategory(category)] ?? editorialStudies.acessorios;
  return <div className={`tone-category-study ${study.className}`} aria-hidden="true">
    <img src={study.src} alt="" loading="eager" />
    <span className="tone-category-study-glint" />
  </div>;
}
