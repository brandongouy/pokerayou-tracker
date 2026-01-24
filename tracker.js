import fs from 'fs';

const STREAMER = 'mastu';
const API_URL = `https://pokerayou.info/api/streamer/${STREAMER}/pokedex`;
const FILE = 'data.json';

/**
 * Appel API avec headers navigateur
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

async function main() {
  console.log('▶️ Appel API…');

  const { status, json: current } = await fetchPokedex();

  // 🔒 Vérification API
  if (!isValidPokedex(current)) {
    console.error('❌ Réponse API invalide');
    console.error('Status HTTP:', status);
    console.error('Payload reçu:', JSON.stringify(current, null, 2));
    console.log('ℹ️ Arrêt propre (aucune donnée écrite)');
    return;
  }

  // 📁 Chargement de l’état précédent (si valide)
  let previous = null;
  if (fs.existsSync(FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
      if (isValidPokedex(parsed)) {
        previous = parsed;
      } else {
        console.warn('⚠️ data.json invalide → ignoré');
      }
    } catch {
      console.warn('⚠️ data.json illisible → ignoré');
    }
  }

  // 🔍 Comparaison
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
      console.log('🟢 Nouveaux Pokémon capturés:', newCaught);
    }

    if (newShiny.length) {
      console.log('✨ NOUVEAU SHINY !!!', newShiny);
    }

    if (!newCaught.length && !newShiny.length) {
      console.log('ℹ️ Aucun changement détecté');
    }
  } else {
    console.log('📁 Initialisation propre du fichier de données');
  }

  // 💾 Écriture finale
  fs.writeFileSync(FILE, JSON.stringify(current, null, 2));
  console.log('💾 data.json mis à jour');
}

main().catch(err => {
  console.error('❌ Erreur inattendue (attrapée):', err);
});
