import fs from 'fs';

const STREAMER = 'mastu';
const API_URL = `https://pokerayou.info/api/streamer/${STREAMER}/pokedex`;
const FILE = 'data.json';

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

  const data = await res.json().catch(() => null);

  return {
    status: res.status,
    data
  };
}

function diff(oldArr = [], newArr = []) {
  return newArr.filter(x => !oldArr.includes(x));
}

async function main() {
  console.log('▶️ Appel API…');

  const { status, data } = await fetchPokedex();

  // 🔎 DEBUG IMPORTANT
  if (!data || !data.pokedex) {
    console.error('❌ Réponse API invalide');
    console.error('Status HTTP:', status);
    console.error('Payload reçu:', JSON.stringify(data, null, 2));
    console.log('ℹ️ Le script s’arrête sans erreur fatale.');
    return; // ⬅️ on sort proprement
  }

  let previous = null;
  if (fs.existsSync(FILE)) {
    previous = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  }

  if (previous) {
    const newCaught = diff(
      previous.pokedex.caught,
      data.pokedex.caught
    );

    const newShiny = diff(
      previous.pokedex.shiny_caught,
      data.pokedex.shiny_caught
    );

    if (newCaught.length > 0) {
      console.log('🟢 Nouveaux Pokémon capturés:', newCaught);
    }

    if (newShiny.length > 0) {
      console.log('✨ NOUVEAU SHINY !!!', newShiny);
    }

    if (!newCaught.length && !newShiny.length) {
      console.log('ℹ️ Aucun changement');
    }
  } else {
    console.log('📁 Initialisation du fichier de données');
  }

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  console.log('💾 Données sauvegardées');
}

main().catch(err => {
  console.error('❌ Erreur inattendue:', err);
});
