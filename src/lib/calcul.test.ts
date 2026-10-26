import { describe, expect, it } from "vitest";
import { ENSEIGNES } from "./catalogue";
import { COMMANDE_VIDE, lignes, produitOption, repartitionEnergie, totaux } from "./calcul";

describe("calcul d'un menu", () => {
  it("retrouve le total officiel du menu Big King Normal (792 kcal sur burgerking.fr)", () => {
    const bk = ENSEIGNES["burger-king"];
    const ls = lignes(bk, { ...COMMANDE_VIDE, menu: "big-king", taille: "normal", acc: "frites", boisson: "coca-zero" });
    const t = totaux(ls);
    expect(ls.map((l) => l.produitId)).toEqual(["big-king", "frites-moyennes", "coca-zero-40"]);
    expect(t.kcal).toBe(792);
    expect(t.lipides).toBeCloseTo(41, 0);
    expect(t.proteines).toBeCloseTo(30.8, 1);
  });

  it("prend les grands formats en taille Maxi", () => {
    const bk = ENSEIGNES["burger-king"];
    const ls = lignes(bk, { ...COMMANDE_VIDE, menu: "whopper", taille: "maxi", acc: "frites", boisson: "coca-cola" });
    expect(ls.map((l) => l.produitId)).toEqual(["whopper", "frites-grandes", "coca-cola-50"]);
    expect(totaux(ls).kcal).toBe(629 + 423 + 210);
  });

  it("ajoute sauces et dessert", () => {
    const mc = ENSEIGNES.mcdonalds;
    const ls = lignes(mc, {
      ...COMMANDE_VIDE, menu: "big-mac", taille: "normal", acc: "frites", boisson: "eau", sauces: ["sauce-ketchup", "sauce-barbecue"],
    });
    expect(totaux(ls).kcal).toBe(530 + 328 + 0 + 13 + 48);
  });

  it("ne compte rien sans menu choisi", () => {
    expect(lignes(ENSEIGNES.kfc, COMMANDE_VIDE)).toEqual([]);
  });

  it("répartit l'énergie sur 100 %", () => {
    const r = repartitionEnergie({ kcal: 0, proteines: 30, glucides: 76, lipides: 41, sucres: 0, sel: 0 });
    expect(r.proteines + r.glucides + r.lipides).toBeCloseTo(1, 5);
  });
});

describe.each(Object.values(ENSEIGNES))("données $nom", (e) => {
  it("référence uniquement des produits existants", () => {
    for (const m of e.menus) expect(e.produits[m.plat], m.plat).toBeDefined();
    for (const et of e.etapes)
      for (const o of et.options)
        for (const t of e.tailles) expect(e.produits[produitOption(o, t.id)], `${et.id}/${o.id}/${t.id}`).toBeDefined();
  });

  it("a des valeurs nutritionnelles plausibles", () => {
    for (const [id, p] of Object.entries(e.produits)) {
      for (const k of ["kcal", "proteines", "glucides", "lipides"] as const) {
        expect(p[k], `${id}.${k}`).toBeGreaterThanOrEqual(0);
      }
      expect(p.kcal, id).toBeLessThan(2000);
    }
  });

  it("a des catégories pour chaque menu", () => {
    const cats = new Set(e.categories.map((c) => c.id));
    for (const m of e.menus) expect(cats.has(m.categorie), m.id).toBe(true);
  });
});
