/**
 * Mesure d'audience — Matomo Cloud (compte CCI Centre Val de Loire).
 *
 * Même instance et même identifiant de site que le site vitrine
 * mivl-orleans.fr : le cookie est posé sur le domaine parent
 * `.mivl-orleans.fr`, si bien qu'un visiteur qui passe de la vitrine à
 * l'inscription reste une seule et même visite. C'est ce qui permet
 * d'attribuer une inscription à la campagne qui l'a amenée.
 *
 * Le paramétrage vise l'exemption de consentement CNIL : périmètre limité au
 * seul domaine du salon, cookie plafonné à 13 mois, IP anonymisée et durée de
 * conservation réglées côté Matomo.
 */

const INSTANCE = "https://mivlorleans.matomo.cloud/";
const SITE_ID = "1";
const HOTE_PRODUCTION = "connect.mivl-orleans.fr";
const DOMAINE_COOKIE = "*.mivl-orleans.fr";
const DUREE_COOKIE_SECONDES = 34_128_000; // 395 jours ~ 13 mois

/**
 * Seul le parcours public est mesuré. Les espaces authentifiés en sont exclus :
 * l'équipe d'organisation qui rafraîchit son back-office toute la journée
 * noierait le signal visiteurs, et ces pages portent des données nominatives
 * qui n'ont rien à faire dans un outil de mesure d'audience.
 *
 * Sous-ensemble volontairement plus restreint que les routes publiques de
 * `auth.config.ts` : `/connexion`, `/mot-de-passe-oublie` et
 * `/definir-mot-de-passe` relèvent de la gestion de compte, pas de
 * l'acquisition.
 */
export const CHEMINS_SUIVIS = [
  "/exposants",
  "/inscription",
  "/mentions-legales",
  "/confidentialite",
] as const;

export function estPageSuivie(pathname: string): boolean {
  if (pathname === "/") return true;
  return CHEMINS_SUIVIS.some(
    (racine) => pathname === racine || pathname.startsWith(`${racine}/`)
  );
}

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

/**
 * Script injecté en clair dans le HTML rendu par le serveur : c'est là que le
 * vérificateur d'installation de Matomo et les audits RGPD vont le chercher.
 * Il émet la vue de la page d'entrée ; les navigations suivantes sont prises
 * en charge par `MatomoPageViews`.
 */
export const SNIPPET_MATOMO = `
if (location.hostname === ${JSON.stringify(HOTE_PRODUCTION)}) {
  var chemin = location.pathname
  var suivie = chemin === '/' || ${JSON.stringify(CHEMINS_SUIVIS)}.some(function (racine) {
    return chemin === racine || chemin.indexOf(racine + '/') === 0
  })
  if (suivie) {
    var _paq = (window._paq = window._paq || [])
    _paq.push(['setCookieDomain', ${JSON.stringify(DOMAINE_COOKIE)}])
    _paq.push(['setDomains', [${JSON.stringify(DOMAINE_COOKIE)}]])
    _paq.push(['setSecureCookie', true])
    _paq.push(['setVisitorCookieTimeout', ${DUREE_COOKIE_SECONDES}])
    _paq.push(['setTrackerUrl', ${JSON.stringify(`${INSTANCE}matomo.php`)}])
    _paq.push(['setSiteId', ${JSON.stringify(SITE_ID)}])
    _paq.push(['trackPageView'])
    _paq.push(['enableLinkTracking'])
    var g = document.createElement('script')
    g.async = true
    g.src = ${JSON.stringify(`${INSTANCE}matomo.js`)}
    document.head.appendChild(g)
  }
}
`.trim();

/**
 * Émet une vue. `_paq` n'est défini que si le snippet ci-dessus s'est exécuté,
 * donc hors production et sur les espaces authentifiés l'appel ne fait rien.
 */
export function envoyerVuePage(pathname: string): void {
  const paq = window._paq;
  if (!paq) return;

  paq.push(["setCustomUrl", window.location.origin + pathname]);
  paq.push(["setDocumentTitle", document.title]);
  paq.push(["trackPageView"]);
  // Rebranche le suivi des liens sortants et des téléchargements sur le DOM
  // fraîchement rendu — notamment le lien de retour vers la vitrine.
  paq.push(["enableLinkTracking"]);
}
