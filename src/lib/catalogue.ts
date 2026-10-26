import burgerKing from "@/data/burger-king.json";
import mcdonalds from "@/data/mcdonalds.json";
import kfc from "@/data/kfc.json";
import quick from "@/data/quick.json";
import type { Enseigne } from "./types";

export const ENSEIGNES: Record<string, Enseigne> = {
  "burger-king": burgerKing as unknown as Enseigne,
  mcdonalds: mcdonalds as unknown as Enseigne,
  kfc: kfc as unknown as Enseigne,
  quick: quick as unknown as Enseigne,
};

/** Tuiles de l'accueil : monogramme et couleurs d'inspiration (pas de logo officiel). */
export const MARQUES = [
  { id: "burger-king", nom: "Burger King", court: "BK", m: "#D62300", mi: "#F5EBDC" },
  { id: "mcdonalds", nom: "McDonald's", court: "M", m: "#DA291C", mi: "#FFC72C" },
  { id: "kfc", nom: "KFC", court: "KFC", m: "#E4002B", mi: "#FFFFFF" },
  { id: "quick", nom: "Quick", court: "Q", m: "#E2001A", mi: "#FFFFFF" },
] as const;

/** Apport de référence d'un adulte (règlement INCO). */
export const AJR_KCAL = 2000;
