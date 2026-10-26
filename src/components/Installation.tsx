"use client";

import { useEffect, useState } from "react";

const CLE_FERME = "calofast-installation-fermee";

// Événement propre à Chrome / Edge / Samsung Internet, absent des types DOM standard.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "cache" | "android" | "ios";

function dejaInstallee() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function estIos() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function lireFerme() {
  try {
    return localStorage.getItem(CLE_FERME) === "1";
  } catch {
    return false;
  }
}

function memoriserFerme() {
  try {
    localStorage.setItem(CLE_FERME, "1");
  } catch {
    // Stockage indisponible (navigation privée) : le bandeau reviendra à la prochaine visite.
  }
}

/** Bandeau qui propose d'ajouter CaloFast à l'écran d'accueil, et enregistre le service worker. */
export default function Installation() {
  const [mode, setMode] = useState<Mode>("cache");
  const [invite, setInvite] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Ouverte depuis l'icône installée, ou bandeau déjà fermé : rien à proposer.
    if (dejaInstallee() || lireFerme()) return;

    // Safari iOS n'a pas d'invite d'installation : on explique le geste à faire.
    if (estIos()) {
      setMode("ios");
      return;
    }

    // Chrome n'envoie cet événement que si l'appli n'est pas encore installée.
    const surInvite = (e: Event) => {
      e.preventDefault();
      setInvite(e as BeforeInstallPromptEvent);
      setMode("android");
    };
    const surInstallee = () => {
      memoriserFerme();
      setMode("cache");
    };
    window.addEventListener("beforeinstallprompt", surInvite);
    window.addEventListener("appinstalled", surInstallee);
    return () => {
      window.removeEventListener("beforeinstallprompt", surInvite);
      window.removeEventListener("appinstalled", surInstallee);
    };
  }, []);

  if (mode === "cache") return null;

  const fermer = () => {
    memoriserFerme();
    setMode("cache");
  };

  const installer = async () => {
    if (!invite) return;
    await invite.prompt();
    const { outcome } = await invite.userChoice;
    if (outcome === "accepted") fermer();
    setInvite(null);
  };

  return (
    <aside className="install" role="region" aria-label="Installer l'appli">
      <img className="install-icon" src="/icons/icon-192.png" alt="" width={44} height={44} />
      <div className="install-text">
        <b>Mets CaloFast sur ton téléphone</b>
        {mode === "android" ? (
          <span>Une vraie appli sur ton écran d&apos;accueil, sans passer par le store.</span>
        ) : (
          <span>
            Touche <PartageIos /> puis « Sur l&apos;écran d&apos;accueil ».
          </span>
        )}
      </div>
      {mode === "android" && (
        <button className="install-go" onClick={installer}>
          Installer
        </button>
      )}
      <button className="install-close" onClick={fermer} aria-label="Fermer et ne plus afficher">
        ×
      </button>
    </aside>
  );
}

function PartageIos() {
  return (
    <svg className="share-ios" viewBox="0 0 20 20" role="img" aria-label="Partager">
      <path d="M10 2v11M6 6l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9H4.5v9h11V9H14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
