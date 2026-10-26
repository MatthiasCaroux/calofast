export type Produit = {
  nom: string;
  kcal: number;
  proteines: number;
  glucides: number;
  lipides: number;
  sucres?: number | null;
  sel?: number;
  url?: string | null;
  note?: string;
  calcule?: string;
};

export type Option = {
  id: string;
  nom?: string;
  /** Produit selon la taille du menu (accompagnement, boisson). */
  parTaille?: Record<string, string>;
  /** Produit fixe (sauce, dessert). */
  produit?: string;
};

export type EtapeId = "accompagnement" | "boisson" | "sauce" | "dessert";

export type Etape = {
  id: EtapeId;
  nom: string;
  obligatoire: boolean;
  multiple?: boolean;
  options: Option[];
};

export type Menu = {
  id: string;
  nom: string;
  categorie: string;
  plat: string;
  edition_limitee?: boolean;
};

export type Enseigne = {
  id: string;
  nom: string;
  pays: string;
  /** Vrai quand les valeurs ne viennent pas de l'enseigne elle-même. */
  indicatif?: boolean;
  source: { description: string; url: string; releve_le: string };
  tailles: { id: string; nom: string; description: string }[];
  categories: { id: string; nom: string }[];
  produits: Record<string, Produit>;
  menus: Menu[];
  etapes: Etape[];
};

export type Commande = {
  menu: string | null;
  taille: string | null;
  acc: string | null;
  boisson: string | null;
  sauces: string[];
  dessert: string | null;
};

export type Ligne = {
  produitId: string;
  produit: Produit;
  role: "Plat" | "Accompagnement" | "Boisson" | "Sauce" | "Dessert";
};

export type Totaux = {
  kcal: number;
  proteines: number;
  glucides: number;
  lipides: number;
  sucres: number;
  sel: number;
};
