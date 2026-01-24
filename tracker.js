import fs from 'fs';

const STREAMER = 'mastu';
const API_URL = `https://pokerayou.info/api/streamer/${STREAMER}/pokedex`;
const FILE = 'data.json';

const diff = (oldArr = [], newArr = []) =>
  newArr.filter(x => !oldArr.includes(x));

async function main() {
  const res = await fetch(API_URL);
  const current = await res.json();

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
      console.log('✨ NOUVEAU SHINY:', newShiny);
    }
  } else {
    console.log('📁 Initialisation du fichier de données');
  }

  fs.writeFileSync(FILE, JSON.stringify(current, null, 2));
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});