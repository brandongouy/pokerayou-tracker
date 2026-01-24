import fs from 'fs';

const STREAMER = 'mastu';
const API_URL = `https://pokerayou.info/api/streamer/${STREAMER}/pokedex`;
const FILE = 'data.json';

/**
 * Simule un appel navigateur pour éviter le Forbidden
 */
async function fetchPokedex() {
  const res = await fetch(API_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': `https://pokerayou.info/channel/${STREAMER}`,
      'Origin': 'https://pokerayou.info'
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Retourne les nouveaux éléments
 */
function diff(oldArr = [], newArr = []) {
  return newArr.filter(x => !oldArr.includes(x));
}

async function main() {
  console.log('▶️ Récupération du Pokédex…');

  const current = await fetchPokedex();

  let previous = null;
  if (fs.existsSync(FILE)) {
    previous = JSON.parse(fs.readFileSync(FILE, 'utf8'));
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

    if (newCaught.length > 0) {
      console.log('🟢 Nouveaux Pokémon capturés:', newCaught);
    }

    if (newShiny.length > 0) {
      console.log('✨ NOUVEAU SHINY !!!', newShiny);
    }

    if (newCaught.length === 0 && newShiny.length === 0) {
      console.log('ℹ️ Aucun changement détecté');
    }
  } else {
    console.log('📁 Initialisation du fichier de données');
  }

  fs.writeFileSync(FILE, JSON.stringify(current, null, 2));
  console.log('💾 Données sauvegardées dans data.json');
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err.message);
  process.exit(1);
});
