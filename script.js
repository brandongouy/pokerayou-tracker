document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('grid');
  const meta = document.getElementById('meta');

  try {
    // Chargement des données
    const [pokemons, data] = await Promise.all([
      fetch('./pokemon_fr.json').then(r => r.json()),
      fetch('./data.json').then(r => r.json())
    ]);

    const caught = new Set(data.pokedex.caught);
    const seen = new Set(data.pokedex.seen);
    const shiny = new Set(data.pokedex.shiny_caught);

    meta.innerText =
      `Dernière mise à jour : ${new Date(data.last_updated).toLocaleString('fr-FR')}`;

    // Tri par ID Pokédex
    pokemons.sort((a, b) => a.pokedexId - b.pokedexId);

    for (const p of pokemons) {
      const div = document.createElement('div');
      div.classList.add('pokemon');

      // Priorité : shiny > caught > seen
      if (shiny.has(p.pokedexId)) {
        div.classList.add('shiny');
      } else if (caught.has(p.pokedexId)) {
        div.classList.add('caught');
      } else if (seen.has(p.pokedexId)) {
        div.classList.add('seen');
      }

      div.innerHTML = `
        <img src="${p.sprite}" alt="${p.nameFr}">
        <div class="name">${p.nameFr}</div>
        <div class="id">#${p.pokedexId}</div>
      `;

      grid.appendChild(div);
    }

  } catch (e) {
    meta.innerText = 'Erreur lors du chargement des données';
    console.error(e);
  }
});
