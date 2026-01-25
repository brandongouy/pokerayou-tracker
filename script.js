fetch('./data.json')
  .then(res => res.json())
  .then(data => {
    // Meta
    document.getElementById('meta').innerText =
      `Dernière mise à jour : ${new Date(data.last_updated).toLocaleString('fr-FR')}`;

    fill('caught', data.pokedex.caught);
    fill('seen', data.pokedex.seen);
    fill('shiny', data.pokedex.shiny_caught);
  })
  .catch(err => {
    document.getElementById('meta').innerText =
      'Erreur lors du chargement des données';
    console.error(err);
  });

function fill(id, list) {
  const ul = document.getElementById(id);
  ul.innerHTML = '';
  list.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `#${p}`;
    ul.appendChild(li);
  });
}
