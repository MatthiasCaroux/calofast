import type { EtapeId } from "@/lib/types";

type Props = { style?: React.CSSProperties };

const Burger = ({ style }: Props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" style={style}>
    <path className="i-bun" d="M9 29c0-13 46-13 46 0z" />
    <ellipse className="i-seed" cx="24" cy="21" rx="2" ry="1.2" />
    <ellipse className="i-seed" cx="33" cy="18" rx="2" ry="1.2" />
    <ellipse className="i-seed" cx="41" cy="22" rx="2" ry="1.2" />
    <path className="i-salad" d="M7 30q4 5 8 0t8 0 8 0 8 0 8 0 9 0v4H7z" />
    <path className="i-cheese" d="M10 34h44l-6 6-6-4-10 5-8-5-8 4z" />
    <rect className="i-patty" x="8" y="36" width="48" height="8" rx="4" />
    <path className="i-bun" d="M9 46h46v2a7 7 0 0 1-7 7H16a7 7 0 0 1-7-7z" />
  </svg>
);

const Poisson = ({ style }: Props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" style={style}>
    <path className="i-bun" d="M9 29c0-13 46-13 46 0z" />
    <path className="i-salad" d="M7 30q4 5 8 0t8 0 8 0 8 0 8 0 9 0v4H7z" />
    <rect className="i-cheese" x="9" y="35" width="46" height="9" rx="4" />
    <path className="i-bun" d="M9 46h46v2a7 7 0 0 1-7 7H16a7 7 0 0 1-7-7z" />
  </svg>
);

const Nuggets = ({ style }: Props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" style={style}>
    <path className="i-nug" d="M8 40c0-8 8-12 15-10s9 10 4 15-19 4-19-5z" />
    <path className="i-nug" d="M30 28c2-8 13-10 19-5s5 15-3 17-18-4-16-12z" />
    <path className="i-nug" d="M28 48c1-6 9-8 14-5s6 11 0 13-15-2-14-8z" />
    <circle className="i-nugd" cx="17" cy="38" r="2" />
    <circle className="i-nugd" cx="40" cy="30" r="2" />
    <circle className="i-nugd" cx="37" cy="49" r="1.6" />
  </svg>
);

export const Frites = ({ style }: Props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" style={style}>
    <rect className="i-fry" x="19" y="9" width="5" height="26" rx="2" transform="rotate(-8 21 22)" />
    <rect className="i-fry" x="26" y="6" width="5" height="28" rx="2" />
    <rect className="i-fry" x="33" y="8" width="5" height="27" rx="2" transform="rotate(6 35 21)" />
    <rect className="i-fry" x="40" y="11" width="5" height="24" rx="2" transform="rotate(12 42 23)" />
    <path className="i-box" d="M13 27h38l-5 30H18z" />
    <path className="i-band" d="M24 37a8 8 0 0 0 16 0z" />
  </svg>
);

const Rings = ({ style }: Props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" style={style}>
    <ellipse className="i-ring" cx="24" cy="36" rx="13" ry="12" />
    <ellipse className="i-ring" cx="41" cy="27" rx="13" ry="12" />
  </svg>
);

export const Gobelet = ({ style }: Props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" style={style}>
    <line className="i-straw" x1="36" y1="3" x2="33" y2="16" />
    <rect className="i-lid" x="15" y="13" width="34" height="6" rx="3" />
    <path className="i-cup" d="M17 19h30l-4 39H21z" />
    <path className="i-band" d="M19.5 32h25l-1 10h-23z" />
  </svg>
);

const Sauce = ({ style }: Props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" style={style}>
    <path className="i-pot" d="M12 30h40v16a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8z" />
    <ellipse className="i-sauce" cx="32" cy="30" rx="20" ry="6" />
    <path className="i-sauce" d="M22 30c2-6 6-8 10-6s7 2 10 6z" />
  </svg>
);

const Glace = ({ style }: Props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" style={style}>
    <path className="i-cream" d="M17 36c-3-9 6-13 9-13 0-6 12-9 14-2 7 0 10 8 7 15z" />
    <path className="i-top" d="M20 30c4 3 8-2 12 1s8-1 12 2l2 3H18z" />
    <path className="i-glass" d="M14 36h36l-7 20H21z" />
  </svg>
);

/** Choisit une illustration d'après le type d'étape et l'identifiant du produit. */
export function Icone({ produitId, etape }: { produitId: string; etape: EtapeId | "plat" }) {
  if (etape === "accompagnement") {
    if (produitId.includes("onion")) return <Rings />;
    return <Frites />;
  }
  if (etape === "boisson") return <Gobelet />;
  if (etape === "sauce") return <Sauce />;
  if (etape === "dessert") return <Glace />;
  if (/nugget|tender|wings|dips/.test(produitId)) return <Nuggets />;
  if (/fish|poisson/.test(produitId)) return <Poisson />;
  return <Burger />;
}
