import type { Commande, Enseigne, EtapeId, Ligne, Option, Totaux } from "./types";

export const COMMANDE_VIDE: Commande = {
  menu: null,
  taille: null,
  acc: null,
  boisson: null,
  sauces: [],
  dessert: null,
};

export function etape(e: Enseigne, id: EtapeId) {
  const found = e.etapes.find((x) => x.id === id);
  if (!found) throw new Error(`Étape ${id} absente pour ${e.id}`);
  return found;
}

/** Produit réellement servi pour une option, selon la taille du menu. */
export function produitOption(opt: Option, taille: string | null): string {
  if (opt.parTaille) return opt.parTaille[taille ?? "normal"];
  if (opt.produit) return opt.produit;
  throw new Error(`Option ${opt.id} sans produit`);
}

export function lignes(e: Enseigne, c: Commande): Ligne[] {
  if (!c.menu) return [];
  const menu = e.menus.find((m) => m.id === c.menu);
  if (!menu) return [];
  const out: Ligne[] = [{ produitId: menu.plat, produit: e.produits[menu.plat], role: "Plat" }];
  const ajoute = (id: string, role: Ligne["role"]) => out.push({ produitId: id, produit: e.produits[id], role });

  if (c.taille && c.acc) {
    const o = etape(e, "accompagnement").options.find((x) => x.id === c.acc);
    if (o) ajoute(produitOption(o, c.taille), "Accompagnement");
  }
  if (c.taille && c.boisson) {
    const o = etape(e, "boisson").options.find((x) => x.id === c.boisson);
    if (o) ajoute(produitOption(o, c.taille), "Boisson");
  }
  c.sauces.forEach((id) => ajoute(id, "Sauce"));
  if (c.dessert) ajoute(c.dessert, "Dessert");
  return out;
}

export function totaux(ls: Ligne[]): Totaux {
  const t: Totaux = { kcal: 0, proteines: 0, glucides: 0, lipides: 0, sucres: 0, sel: 0 };
  for (const { produit: p } of ls) {
    t.kcal += p.kcal;
    t.proteines += p.proteines;
    t.glucides += p.glucides;
    t.lipides += p.lipides;
    t.sucres += p.sucres ?? 0;
    t.sel += p.sel ?? 0;
  }
  return t;
}

/** Part de l'énergie apportée par chaque macro (4 / 4 / 9 kcal par gramme). */
export function repartitionEnergie(t: Totaux) {
  const p = t.proteines * 4;
  const g = t.glucides * 4;
  const l = t.lipides * 9;
  const total = p + g + l || 1;
  return { proteines: p / total, glucides: g / total, lipides: l / total };
}

export const fmt = (n: number, decimales = 0) =>
  Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: decimales });
