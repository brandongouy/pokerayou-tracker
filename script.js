const cache = new Map();

async function getPokemon(id) {
  if (cache.has(id)) return cache.get(id);

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  const pokemon = {
    name: data.name,
    sprite: data.sprites.front_default
  };

  cache.set(id, pokemon);
  return pokemon;
}

async function fillList(containerId, ids, shinyIds = []) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  for (const id of ids) {
    try {
      const p = await getPokemon(id);
      const div = document.createElement('div');
      div.className = 'pokemon';

      const isShiny = shinyIds.includes(id);

      div.innerHTML = `
        <img src="${p.sprite}" alt="${p.name}">
        <span class="${isShiny ? 'shiny' : ''}">
          #${id} ${p.name}
        </span>
      `;

      container.appendChild(div);
    } catch (e) {
      console.error('Erreur Pokémon', id, e);
    }
  }
}

fetch('./data.json')
  .then(res => res.json())
  .then(async data => {
    document.getElementById('meta').innerText =
      `Dernière mise à jour : ${new Date(data.last_updated).toLocaleString('fr-FR')}`;

    await fillList(
      'caught',
      data.pokedex.caught,
      data.pokedex.shiny_caught
    );

    await fillList('seen', data.pokedex.seen);

    await fillList(
      'shiny',
      data.pokedex.shiny_caught,
      data.pokedex.shiny_caught
    );
  })
  .catch(err => {
    document.getElementById('meta').innerText =
      'Erreur lors du chargement des données';
    console.error(err);
  });
