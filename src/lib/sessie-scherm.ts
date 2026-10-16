import { heeftSessiekoekje } from '@/lib/supabase/sessie-koekje'

/** Welke kop verborgen blijft. De andere kop is de gewone balk. */
export function sessieKopStijl(ingelogd: boolean): string {
  return ingelogd
    ? '.kop-zonder-sessie{display:none!important}'
    : '.kop-met-sessie{display:none!important}'
}

/**
 * Draait vóór de eerste paint. Zelfde koekjesregel als `heeftSessiekoekje`:
 * een sessie toont de ingelogde kop, anders de openbare.
 */
export const SESSIE_KOP_SCRIPT = `(function(){var ingelogd=false;var delen=document.cookie.split(";");for(var i=0;i<delen.length;i++){var naam=delen[i].split("=")[0].trim();if(/^sb-.+-auth-token(?:\\.\\d+)?$/.test(naam)){ingelogd=true;break}}var stijl=document.createElement("style");stijl.setAttribute("data-sessie-kop","");stijl.textContent=ingelogd?".kop-zonder-sessie{display:none!important}":".kop-met-sessie{display:none!important}";document.head.appendChild(stijl)})();`

export function leesSessieInBrowser(): boolean {
  const koekjes = document.cookie.split(';').map((deel) => ({
    name: (deel.trim().split('=')[0] ?? '').trim(),
  }))
  return heeftSessiekoekje(koekjes)
}
