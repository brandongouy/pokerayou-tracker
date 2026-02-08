import fs from 'fs';

const STREAMERS_FILE = 'streamers.json';
const DATA_DIR = 'data';

// Création du dossier data si absent
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

/**
 * Appel API avec headers navigateur
 */
async function fetchPokedex(streamer) {
  const url = `https://pokerayou.info/api/streamer/${streamer}/pokedex`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': `https://pokerayou.info/channel/${streamer}`,
      'Origin': 'https://pokerayou.info'
    }
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

/**
 * Diff sécurisé
 */
function diff(oldArr, newArr) {
  if (!Array.isArray(oldArr) || !Array.isArray(newArr)) return [];
  return newArr.filter(x => !oldArr.includes(x));
}

/**
 * Vérifie que la structure Pokédex est valide
 */
function isValidPokedex(data) {
  return (
    data &&
    data.pokedex &&
    Array.isArray(data.pokedex.caught) &&
    Array.isArray(data.pokedex.shiny_caught)
  );
}

async function processStreamer(streamer) {
  console.log(`\n▶️ ${streamer} — Appel API…`);

  const { status, json: current } = await fetchPokedex(streamer);

  if (!isValidPokedex(current)) {
    console.error(`❌ ${streamer} — Réponse API invalide (${status})`);
    return;
  }

  // 👉 Ajout du nom du streamer dans les données
  current.streamer = streamer;

  const filePath = `${DATA_DIR}/${streamer}.json`;

  let previous = null;
  if (fs.existsSync(filePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (isValidPokedex(parsed)) {
        previous = parsed;
      }
    } catch { }
  }

  if (previous) {
    const newCaught = diff(
      previous.pokedex.caught,
      current.pokedex.caught
    );

    const newShiny = diff(
      previous.pokedex.shiny_caught,
      current.pokedex.shiny_caught
    );

    if (newCaught.length) {
      console.log(`🟢 ${streamer} — Nouveaux Pokémon:`, newCaught);
    }

    if (newShiny.length) {
      console.log(`✨ ${streamer} — NOUVEAU SHINY !!!`, newShiny);
    }

    if (!newCaught.length && !newShiny.length) {
      console.log(`ℹ️ ${streamer} — Aucun changement`);
    }
  } else {
    console.log(`📁 ${streamer} — Initialisation du fichier`);
  }

  fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
  console.log(`💾 ${streamer} — Données sauvegardées`);
}

async function main() {
  const streamers = JSON.parse(
    fs.readFileSync(STREAMERS_FILE, 'utf8')
  );

  for (const s of streamers) {
    await processStreamer(s.twitch_username);
  }
}

main().catch(err => {
  console.error('❌ Erreur inattendue:', err);
});
