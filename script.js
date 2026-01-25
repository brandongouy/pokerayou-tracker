document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const meta = document.getElementById('meta');
  const buttons = document.querySelectorAll('.filters button');

  const cache = new Map();
  let pokemons = [];
  let currentFilter = 'all';

  async function getPokemon(id) {
    if (cache.has(id)) return cache.get(id);

    // 1️⃣ Infos générales (sprite)
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();

    // 2️⃣ Infos espèces (noms traduits)
    const speciesRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`
    );
    const species = await speciesRes.json();

    const frName =
      species.names.find(n => n.language.name === 'fr')?.name ||
      data.name;

    const pokemon = {
      id,
      name: frName,
      sprite: data.sprites.front_default
    };

    cache.set(id, pokemon);
    return pokemon;
  }


  function applyFilter() {
    grid.innerHTML = '';

    const filtered = pokemons.filter(p => {
      if (currentFilter === 'caught') return p.caught;
      if (currentFilter === 'seen') return p.seen;
      if (currentFilter === 'shiny') return p.shiny;
      return true;
    });

    for (const p of filtered) {
      const div = document.createElement('div');
      div.className = 'pokemon' + (p.shiny ? ' shiny' : '');

      div.innerHTML = `
        <img src="${p.sprite}" alt="${p.name}">
        <div class="name">${p.name}</div>
        <div class="id">#${p.id}</div>
      `;

      grid.appendChild(div);
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  fetch('./data.json')
    .then(res => res.json())
    .then(async data => {
      meta.innerText =
        `Dernière mise à jour : ${new Date(data.last_updated).toLocaleString('fr-FR')}`;

      const allIds = new Set([
        ...data.pokedex.caught,
        ...data.pokedex.seen,
        ...data.pokedex.shiny_caught
      ]);

      const sortedIds = [...allIds].sort((a, b) => a - b);

      for (const id of sortedIds) {
        const info = await getPokemon(id);
        pokemons.push({
          ...info,
          caught: data.pokedex.caught.includes(id),
          seen: data.pokedex.seen.includes(id),
          shiny: data.pokedex.shiny_caught.includes(id)
        });
      }

      applyFilter();
    })
    .catch(err => {
      meta.innerText = 'Erreur lors du chargement des données';
      console.error(err);
    });
});
