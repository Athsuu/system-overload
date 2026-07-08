import fs from 'fs';

function fixLoreText(s) {
  if (!s.includes('—')) return s;
  return s
    .replace(/I'm ARCH — /g, "I'm ARCH, ")
    .replace(/Je suis ARCH — /g, 'Je suis ARCH, ')
    .replace(/Listen — /g, 'Listen. ')
    .replace(/Écoute — /g, 'Écoute. ')
    .replace(/Recovery heuristic — /g, 'Recovery heuristic, ')
    .replace(/Heuristique de récupération — /g, 'Heuristique de récupération, ')
    .replace(/ — but /g, ', but ')
    .replace(/ — mais /g, ', mais ')
    .replace(/ — or /g, ', or ')
    .replace(/ — ou /g, ', ou ')
    .replace(/Launch a Run — /g, 'Launch a Run: ')
    .replace(/Lance une run — /g, 'Lance une run: ')
    .replace(/At 100% Overload — /g, 'At 100% Overload: ')
    .replace(/À 100 % de Surcharge — /g, 'À 100 % de Surcharge: ')
    .replace(/Threat contained — /g, 'Threat contained. ')
    .replace(/Menace contenue — /g, 'Menace contenue. ')
    .replace(/Overload at 100% — /g, 'Overload at 100%. ')
    .replace(/Surcharge à 100 % — /g, 'Surcharge à 100 %. ')
    .replace(/We bought time — /g, 'We bought time. ')
    .replace(/On a gagné du temps — /g, 'On a gagné du temps. ')
    .replace(/vault — spend/g, 'vault. Spend')
    .replace(/coffre — dépense/g, 'coffre. Dépense')
    .replace(/reconfiguration layer — Prestige/g, 'reconfiguration layer: Prestige')
    .replace(/reconfiguration plus profonde — Prestige/g, 'reconfiguration plus profonde: Prestige')
    .replace(/best shot — /g, 'best shot: ')
    .replace(/meilleure chance — /g, 'meilleure chance: ')
    .replace(/before — we /g, 'before, we ')
    .replace(/jamais lancés — on /g, 'jamais lancés, on ')
    .replace(/Breach Anchor — /g, 'Breach Anchor, ')
    .replace(/Ancre de Brèche — /g, 'Ancre de Brèche, ')
    .replace(/isn't stable yet — /g, "isn't stable yet. ")
    .replace(/n'est pas encore stable — /g, "n'est pas encore stable. ")
    .replace(/Double speed — double/g, 'Double speed, double')
    .replace(/Double vitesse — double/g, 'Double vitesse, double')
    .replace(/last time — reinforcing/g, 'last time. Reinforcing')
    .replace(/dernière fois — renforcement/g, 'dernière fois. Renforcement')
    .replace(/lost the thread — /g, 'lost the thread. ')
    .replace(/perdu le thread — /g, 'perdu le thread. ')
    .replace(/That was close — /g, 'That was close, ')
    .replace(/C'était juste — /g, "C'était juste, ")
    .replace(/are online — /g, 'are online. ')
    .replace(/sont en ligne — /g, 'sont en ligne. ')
    .replace(/Design slot — /g, 'Design slot. ')
    .replace(/Emplacement design — /g, 'Emplacement design. ')
    .replace(/quarantine thread — /g, 'quarantine thread, ')
    .replace(/thread de quarantaine — /g, 'thread de quarantaine, ')
    .replace(/quarantined thread — /g, 'quarantined thread, ')
    .replace(/thread en quarantaine — /g, 'thread en quarantaine, ')
    .replace(/during runs — /g, 'during runs, ')
    .replace(/pendant les runs — /g, 'pendant les runs, ')
    .replace(/Breach Anchor — only/g, 'Breach Anchor, only')
    .replace(/Breach Anchor — uniquement/g, 'Breach Anchor, uniquement')
    .replace(/each kill — /g, 'each kill, ')
    .replace(/chaque kill — /g, 'chaque kill, ')
    .replace(/inside quarantine — /g, 'inside quarantine: ')
    .replace(/en quarantaine — /g, 'en quarantaine: ')
    .replace(/corrupted process — /g, 'corrupted process, ')
    .replace(/corrompu massif — /g, 'corrompu massif, ')
    .replace(/You are Node-0 — /g, 'You are Node-0, ')
    .replace(/Tu es Node-0 — /g, 'Tu es Node-0, ')
    .replace(/menace — ou /g, 'menace, ou ')
    .replace(/threat — or /g, 'threat, or ')
    .replace(/^(\s*#+\s+[^—\n]+) — /gm, '$1: ')
    .replace(/ — /g, ', ');
}

function shouldSkipGlitchLine(line) {
  return (
    line.includes('signalHandshake') ||
    line.includes('noi—se') ||
    line.includes('br—uit') ||
    line.includes('th—is') ||
    line.includes('ré—ponse') ||
    line.includes('wak—e') ||
    line.includes('pl—aît')
  );
}

function processFile(file, { isLocale = false } = {}) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const out = lines.map((line) => {
    if (shouldSkipGlitchLine(line)) return line;
    const fixed = fixLoreText(line);
    if (!isLocale) return fixed;
    return fixed;
  });
  fs.writeFileSync(file, out.join('\n'));
  const remaining = out.filter((l) => l.includes('—') && !shouldSkipGlitchLine(l)).length;
  console.log(`updated ${file}${remaining ? ` (${remaining} em dashes left, check manually)` : ''}`);
}

for (const file of ['src/i18n/locales/en.ts', 'src/i18n/locales/fr.ts']) {
  processFile(file, { isLocale: true });
}

for (const file of ['docs/dialogues.md', 'docs/narrative.md', 'docs/lexique-jeu.md', 'docs/lore-screenplay.html']) {
  if (fs.existsSync(file)) processFile(file);
}
