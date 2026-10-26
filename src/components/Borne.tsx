"use client";

import { useEffect, useMemo, useState } from "react";
import { AJR_KCAL, ENSEIGNES, MARQUES } from "@/lib/catalogue";
import { COMMANDE_VIDE, etape, fmt, lignes, produitOption, repartitionEnergie, totaux } from "@/lib/calcul";
import type { Commande, Enseigne, Ligne, Totaux } from "@/lib/types";
import { Frites, Gobelet, Icone } from "./Icones";
import Installation from "./Installation";

type Ecran = "accueil" | "menu" | "taille" | "accompagnement" | "boisson" | "extras" | "recap";
type EcranEtape = Exclude<Ecran, "accueil">;

const ETAPES: { id: EcranEtape; nom: string }[] = [
  { id: "menu", nom: "Menu" },
  { id: "taille", nom: "Taille" },
  { id: "accompagnement", nom: "Accompagnement" },
  { id: "boisson", nom: "Boisson" },
  { id: "extras", nom: "Extras" },
  { id: "recap", nom: "Récap" },
];

const SUIVANT: Partial<Record<Ecran, Ecran>> = {
  taille: "accompagnement",
  accompagnement: "boisson",
  boisson: "extras",
  extras: "recap",
};

export default function Borne() {
  const [ecran, setEcran] = useState<Ecran>("accueil");
  const [marque, setMarque] = useState<string | null>(null);
  const [categorie, setCategorie] = useState<string | null>(null);
  const [cmd, setCmd] = useState<Commande>(COMMANDE_VIDE);

  const enseigne = marque ? ENSEIGNES[marque] : null;
  const ls = useMemo(() => (enseigne ? lignes(enseigne, cmd) : []), [enseigne, cmd]);
  const t = useMemo(() => totaux(ls), [ls]);

  // Le thème suit l'enseigne choisie ; l'accueil garde le thème CaloFast.
  useEffect(() => {
    const root = document.documentElement;
    if (ecran === "accueil" || !marque) delete root.dataset.brand;
    else root.dataset.brand = marque;
  }, [ecran, marque]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [ecran]);

  const maj = (patch: Partial<Commande>) => setCmd((c) => ({ ...c, ...patch }));
  const nouveauMenu = () => {
    setCmd(COMMANDE_VIDE);
    setEcran("menu");
  };
  const choisirMarque = (id: string) => {
    setMarque(id);
    setCategorie(null);
    setCmd(COMMANDE_VIDE);
    setEcran("menu");
  };

  const accessible: Record<EcranEtape, boolean> = {
    menu: true,
    taille: !!cmd.menu,
    accompagnement: !!cmd.taille,
    boisson: !!cmd.acc,
    extras: !!cmd.boisson,
    recap: !!cmd.boisson,
  };

  const retour = () => {
    const i = ETAPES.findIndex((s) => s.id === ecran);
    setEcran(i <= 0 ? "accueil" : ETAPES[i - 1].id);
  };

  const plateauVisible = !!enseigne && !!cmd.menu && ecran !== "accueil" && ecran !== "menu";
  const cta: Partial<Record<Ecran, [string, boolean]>> = {
    taille: ["Suivant", !!cmd.taille],
    accompagnement: ["Suivant", !!cmd.acc],
    boisson: ["Suivant", !!cmd.boisson],
    extras: ["Voir mon repas", true],
  };

  return (
    <>
      <div className="wrap">
        <Installation />
        <header className="top">
          <div className="bar">
            <div className="logo">
              Calo<span>Fast</span>
            </div>
            <button className="back" onClick={retour} hidden={ecran === "accueil"}>
              ← Retour
            </button>
          </div>
          {ecran !== "accueil" && (
            <nav className="steps" aria-label="Étapes">
              {ETAPES.map((s, i) => {
                const idx = ETAPES.findIndex((x) => x.id === ecran);
                const cls = i === idx ? "now" : i < idx ? "done" : "";
                const actif = i !== idx && (i < idx || accessible[s.id]);
                return (
                  <button key={s.id} className={`step ${cls}`} disabled={!actif} onClick={() => setEcran(s.id)}>
                    {s.nom}
                  </button>
                );
              })}
            </nav>
          )}
        </header>

        <main key={ecran} className="screen">
          {ecran === "accueil" && <Accueil onChoisir={choisirMarque} />}
          {enseigne && ecran === "menu" && (
            <ChoixMenu
              e={enseigne}
              categorie={categorie ?? enseigne.categories[0].id}
              onCategorie={setCategorie}
              selection={cmd.menu}
              onChoisir={(id) => {
                maj({ menu: id });
                setEcran("taille");
              }}
            />
          )}
          {enseigne && ecran === "taille" && cmd.menu && (
            <ChoixTaille
              e={enseigne}
              menuNom={enseigne.menus.find((m) => m.id === cmd.menu)?.nom ?? ""}
              selection={cmd.taille}
              onChoisir={(id) => {
                maj({ taille: id });
                setEcran("accompagnement");
              }}
            />
          )}
          {enseigne && (ecran === "accompagnement" || ecran === "boisson") && cmd.taille && (
            <ChoixOption
              e={enseigne}
              etapeId={ecran}
              taille={cmd.taille}
              selection={ecran === "accompagnement" ? cmd.acc : cmd.boisson}
              onChoisir={(id) => {
                if (ecran === "accompagnement") {
                  maj({ acc: id });
                  setEcran("boisson");
                } else {
                  maj({ boisson: id });
                  setEcran("extras");
                }
              }}
            />
          )}
          {enseigne && ecran === "extras" && (
            <Extras
              e={enseigne}
              sauces={cmd.sauces}
              dessert={cmd.dessert}
              onSauce={(id) =>
                maj({ sauces: cmd.sauces.includes(id) ? cmd.sauces.filter((x) => x !== id) : [...cmd.sauces, id] })
              }
              onDessert={(id) => maj({ dessert: cmd.dessert === id ? null : id })}
            />
          )}
          {enseigne && ecran === "recap" && (
            <Recap
              e={enseigne}
              cmd={cmd}
              ls={ls}
              t={t}
              onModifier={() => setEcran("accompagnement")}
              onNouveau={nouveauMenu}
            />
          )}
        </main>
      </div>

      <footer className="tray" hidden={!plateauVisible}>
        <div className="tray-in">
          <div>
            <div className="lbl">Mon plateau</div>
            <div className="total">
              {fmt(t.kcal)} <small>kcal</small>
            </div>
          </div>
          <div className="macros">
            <span>
              {fmt(t.proteines)} g<i>Protéines</i>
            </span>
            <span>
              {fmt(t.glucides)} g<i>Glucides</i>
            </span>
            <span>
              {fmt(t.lipides)} g<i>Lipides</i>
            </span>
          </div>
          {cta[ecran] && (
            <button className="cta" disabled={!cta[ecran]![1]} onClick={() => SUIVANT[ecran] && setEcran(SUIVANT[ecran]!)}>
              {cta[ecran]![0]}
            </button>
          )}
        </div>
      </footer>
    </>
  );
}

/* ---------- Écrans ---------- */

function Accueil({ onChoisir }: { onChoisir: (id: string) => void }) {
  return (
    <>
      <div className="head">
        <p className="eyebrow">Sans compte · gratuit</p>
        <h1>Qu&apos;est-ce qu&apos;on mange ?</h1>
        <p className="lead">
          Compose ton menu comme à la borne. Les calories s&apos;affichent à chaque choix, et tu as le total avec les
          macros à la fin.
        </p>
      </div>
      <div className="grid brands">
        {MARQUES.map((b) => {
          const e = ENSEIGNES[b.id];
          return (
            <button key={b.id} className="tile brand" onClick={() => onChoisir(b.id)}>
              <span className="mono" style={{ "--m": b.m, "--mi": b.mi } as React.CSSProperties}>
                {b.court}
              </span>
              <span className="name">{b.nom}</span>
              <span className="sub">{e.menus.length} menus</span>
              {e.indicatif && <span className="pill">Valeurs indicatives</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}

function ChoixMenu(props: {
  e: Enseigne;
  categorie: string;
  onCategorie: (id: string) => void;
  selection: string | null;
  onChoisir: (id: string) => void;
}) {
  const { e, categorie, onCategorie, selection, onChoisir } = props;
  const menus = e.menus.filter((m) => m.categorie === categorie);
  return (
    <>
      <div className="head banner">
        <p className="eyebrow">{e.nom}</p>
        <h2>Choisis ton menu</h2>
        <p className="lead">Calories du plat seul. L&apos;accompagnement et la boisson s&apos;ajoutent ensuite.</p>
        {e.indicatif && (
          <p className="lead">
            <span className="pill pill-on">Valeurs indicatives</span> {e.nom} ne publie pas ses valeurs en ligne : elles
            viennent d&apos;une base collaborative et peuvent différer de la réalité.
          </p>
        )}
      </div>
      <div className="tabs">
        {e.categories.map((c) => (
          <button key={c.id} className={`tab ${c.id === categorie ? "on" : ""}`} onClick={() => onCategorie(c.id)}>
            {c.nom}
          </button>
        ))}
      </div>
      <div className="grid">
        {menus.map((m) => {
          const p = e.produits[m.plat];
          return (
            <button key={m.id} className={`tile ${selection === m.id ? "on" : ""}`} onClick={() => onChoisir(m.id)}>
              {m.edition_limitee && <span className="badge">Édition limitée</span>}
              <Icone produitId={m.plat} etape="plat" />
              <span className="name">{m.nom}</span>
              <Kcal v={p.kcal} />
              <span className="sub">
                P {fmt(p.proteines)} · G {fmt(p.glucides)} · L {fmt(p.lipides)}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function ChoixTaille(props: { e: Enseigne; menuNom: string; selection: string | null; onChoisir: (id: string) => void }) {
  const { e, menuNom, selection, onChoisir } = props;
  const acc = etape(e, "accompagnement").options[0];
  const boi = etape(e, "boisson").options[0];
  const extra = (taille: string) =>
    e.produits[produitOption(acc, taille)].kcal + e.produits[produitOption(boi, taille)].kcal;
  const [petite, grande] = e.tailles;
  const diff = extra(grande.id) - extra(petite.id);
  return (
    <>
      <div className="head">
        <p className="eyebrow">{menuNom}</p>
        <h2>Quelle taille de menu ?</h2>
        <p className="lead">
          La taille change l&apos;accompagnement et la boisson. Avec {acc.nom?.toLowerCase()} et {boi.nom}, le{" "}
          {grande.nom} ajoute environ {fmt(diff)} kcal.
        </p>
      </div>
      <div className="grid sizes">
        {e.tailles.map((t, i) => (
          <button key={t.id} className={`tile size ${selection === t.id ? "on" : ""}`} onClick={() => onChoisir(t.id)}>
            <span className="cups">
              <Frites style={{ height: i ? 92 : 72 }} />
              <Gobelet style={{ height: i ? 96 : 76 }} />
            </span>
            <span className="big">{t.nom}</span>
            <span className="sub">{t.description}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function ChoixOption(props: {
  e: Enseigne;
  etapeId: "accompagnement" | "boisson";
  taille: string;
  selection: string | null;
  onChoisir: (id: string) => void;
}) {
  const { e, etapeId, taille, selection, onChoisir } = props;
  const t = e.tailles.find((x) => x.id === taille)!;
  return (
    <>
      <div className="head">
        <p className="eyebrow">Menu {t.nom}</p>
        <h2>{etapeId === "accompagnement" ? "Avec quoi ?" : "Et à boire ?"}</h2>
        <p className="lead">Calories pour la taille {t.nom}.</p>
      </div>
      <div className="grid">
        {etape(e, etapeId).options.map((o) => {
          const pid = produitOption(o, taille);
          const p = e.produits[pid];
          return (
            <button key={o.id} className={`tile ${selection === o.id ? "on" : ""}`} onClick={() => onChoisir(o.id)}>
              <Icone produitId={pid} etape={etapeId} />
              <span className="name">{o.nom}</span>
              <Kcal v={p.kcal} plus />
              <span className="sub">{p.nom}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Extras(props: {
  e: Enseigne;
  sauces: string[];
  dessert: string | null;
  onSauce: (id: string) => void;
  onDessert: (id: string) => void;
}) {
  const { e, sauces, dessert, onSauce, onDessert } = props;
  const listeSauces = etape(e, "sauce").options;
  const listeDesserts = etape(e, "dessert").options;
  const tuile = (pid: string, on: boolean, etapeId: "sauce" | "dessert", onClick: () => void) => {
    const p = e.produits[pid];
    return (
      <button key={pid} className={`tile ${on ? "on" : ""}`} onClick={onClick} aria-pressed={on}>
        <Icone produitId={pid} etape={etapeId} />
        <span className="name">{p.nom}</span>
        <Kcal v={p.kcal} plus />
      </button>
    );
  };
  return (
    <>
      <div className="head">
        <p className="eyebrow">Facultatif</p>
        <h2>{listeDesserts.length ? "Une sauce, un dessert ?" : "Une sauce ?"}</h2>
        <p className="lead">Touche pour ajouter ou retirer. Tu peux aussi passer directement au récap.</p>
      </div>
      {listeSauces.length > 0 && (
        <>
          <div className="section-title">
            Sauces <span className="sub">plusieurs possibles</span>
          </div>
          <div className="grid">
            {listeSauces.map((o) => {
              const pid = produitOption(o, null);
              return tuile(pid, sauces.includes(pid), "sauce", () => onSauce(pid));
            })}
          </div>
        </>
      )}
      {listeDesserts.length > 0 && (
        <>
          <div className="section-title">
            Dessert <span className="sub">un seul</span>
          </div>
          <div className="grid">
            {listeDesserts.map((o) => {
              const pid = produitOption(o, null);
              return tuile(pid, dessert === pid, "dessert", () => onDessert(pid));
            })}
          </div>
        </>
      )}
    </>
  );
}

function Recap(props: { e: Enseigne; cmd: Commande; ls: Ligne[]; t: Totaux; onModifier: () => void; onNouveau: () => void }) {
  const { e, cmd, ls, t, onModifier, onNouveau } = props;
  const menu = e.menus.find((m) => m.id === cmd.menu)!;
  const taille = e.tailles.find((x) => x.id === cmd.taille)!;
  const r = repartitionEnergie(t);
  const maxG = Math.max(t.proteines, t.glucides, t.lipides, 1);
  const sucresConnus = ls.every((l) => l.produit.sucres != null);
  const date = new Date(e.source.releve_le).toLocaleDateString("fr-FR");
  const domaine = new URL(e.source.url).hostname.replace("www.", "");

  const barre = (label: string, g: number, couleur: string) => (
    <div className="mrow">
      <span>{label}</span>
      <div className="track">
        <div className="fill" style={{ width: `${(g / maxG) * 100}%`, background: `var(${couleur})` }} />
      </div>
      <span className="g">{fmt(g, 1)} g</span>
    </div>
  );

  return (
    <>
      <div className="head">
        <p className="eyebrow">
          {e.nom} · Menu {taille.nom}
        </p>
        <h2>Ton repas : {menu.nom}</h2>
      </div>
      <div className="recap">
        <section className="ticket">
          <div className="bigkcal">
            {fmt(t.kcal)}
            <small> kcal</small>
          </div>
          <p className="share">
            Soit {fmt((t.kcal / AJR_KCAL) * 100)} % d&apos;un apport de référence de 2&nbsp;000&nbsp;kcal par jour.
          </p>
          <div className="mbar">
            {barre("Protéines", t.proteines, "--prot")}
            {barre("Glucides", t.glucides, "--gluc")}
            {barre("Lipides", t.lipides, "--lip")}
          </div>
          <div className="split" aria-label="Répartition de l'énergie">
            <div style={{ width: `${r.proteines * 100}%`, background: "var(--prot)" }} />
            <div style={{ width: `${r.glucides * 100}%`, background: "var(--gluc)" }} />
            <div style={{ width: `${r.lipides * 100}%`, background: "var(--lip)" }} />
          </div>
          <div className="legend">
            <span>
              <b style={{ background: "var(--prot)" }} />
              Protéines {fmt(r.proteines * 100)} %
            </span>
            <span>
              <b style={{ background: "var(--gluc)" }} />
              Glucides {fmt(r.glucides * 100)} %
            </span>
            <span>
              <b style={{ background: "var(--lip)" }} />
              Lipides {fmt(r.lipides * 100)} %
            </span>
          </div>
          {sucresConnus && (
            <p className="sub" style={{ marginTop: 12 }}>
              Dont sucres {fmt(t.sucres, 1)} g · sel {fmt(t.sel, 1)} g
            </p>
          )}
        </section>
        <section className="ticket">
          <ul className="lines">
            {ls.map((l, i) => (
              <li key={`${l.produitId}-${i}`}>
                <Icone produitId={l.produitId} etape={roleEtape(l.role)} />
                <div className="what">
                  <b>{l.produit.nom}</b>
                  <span>
                    {l.role} · P {fmt(l.produit.proteines, 1)} · G {fmt(l.produit.glucides, 1)} · L{" "}
                    {fmt(l.produit.lipides, 1)}
                  </span>
                </div>
                <span className="k">{fmt(l.produit.kcal)}</span>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button className="ghost" onClick={onModifier}>
              Modifier
            </button>
            <button className="solid" onClick={onNouveau}>
              Nouveau menu
            </button>
          </div>
          <p className="source">
            {e.indicatif ? (
              <>
                <span className="pill">Valeurs indicatives</span> Valeurs par portion issues de la base collaborative{" "}
                <a href={e.source.url} target="_blank" rel="noopener noreferrer">
                  {domaine}
                </a>
                , relevées le {date}. {e.nom} ne publie pas ses valeurs en ligne, elles peuvent donc différer des
                valeurs réelles. Application non officielle.
              </>
            ) : (
              <>
                Valeurs par portion relevées sur les fiches produits officielles de{" "}
                <a href={e.source.url} target="_blank" rel="noopener noreferrer">
                  {domaine}
                </a>{" "}
                le {date}. Application non officielle.
              </>
            )}
          </p>
        </section>
      </div>
    </>
  );
}

function Kcal({ v, plus = false }: { v: number; plus?: boolean }) {
  return (
    <span className="kcal">
      {plus ? "+" : ""}
      {fmt(v)}
      <small>kcal</small>
    </span>
  );
}

function roleEtape(role: Ligne["role"]) {
  switch (role) {
    case "Accompagnement":
      return "accompagnement" as const;
    case "Boisson":
      return "boisson" as const;
    case "Sauce":
      return "sauce" as const;
    case "Dessert":
      return "dessert" as const;
    default:
      return "plat" as const;
  }
}
