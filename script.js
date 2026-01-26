document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('grid');
  const meta = document.getElementById('meta');
  const buttons = document.querySelectorAll('.filters button');

  let allPokemons = [];
  let currentFilter = 'all';

  function applyFilter() {
    grid.innerHTML = '';

    const filtered = allPokemons.filter(p => {
      if (currentFilter === 'caught') return p.caught;
      if (currentFilter === 'seen') return p.seen;
      if (currentFilter === 'shiny') return p.shiny;
      if (currentFilter === 'missing')
        return !p.caught && !p.seen && !p.shiny;
      return true;
    });

    for (const p of filtered) {
      const div = document.createElement('div');
      div.className = 'pokemon';

      if (p.shiny) div.classList.add('shiny');
      else if (p.caught) div.classList.add('caught');
      else if (p.seen) div.classList.add('seen');

      div.innerHTML = `
        <img src="${p.sprite}" alt="${p.nameFr}">
        <div class="name">${p.nameFr}</div>
        <div class="id">#${p.pokedexId}</div>
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

  try {
    const [pokemons, data] = await Promise.all([
      fetch('./pokemon_fr.json').then(r => r.json()),
      fetch('./data.json').then(r => r.json())
    ]);

    const caught = new Set(data.pokedex.caught);
    const seen = new Set(data.pokedex.seen);
    const shiny = new Set(data.pokedex.shiny_caught);

    meta.innerText =
      `Dernière mise à jour : ${new Date(data.last_updated).toLocaleString('fr-FR')}`;

    allPokemons = pokemons
      .sort((a, b) => a.pokedexId - b.pokedexId)
      .map(p => ({
        ...p,
        caught: caught.has(p.pokedexId),
        seen: seen.has(p.pokedexId),
        shiny: shiny.has(p.pokedexId)
      }));

    applyFilter();

  } catch (e) {
    meta.innerText = 'Erreur lors du chargement des données';
    console.error(e);
  }
});
