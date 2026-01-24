fetch('./data.json')
  .then(res => res.json())
  .then(data => {
    const caught = data.pokedex.caught.length;
    const seen = data.pokedex.seen.length;
    const shiny = data.pokedex.shiny_caught.length;
    const updated = new Date(data.last_updated).toLocaleString('fr-FR');

    document.getElementById('content').innerHTML = `
      <div class="stat">🟢 Capturés : <strong>${caught}</strong></div>
      <div class="stat">👀 Vus : <strong>${seen}</strong></div>
      <div class="stat shiny">✨ Shiny : ${shiny}</div>
      <hr>
      <small>Dernière mise à jour : ${updated}</small>
    `;
  })
  .catch(err => {
    document.getElementById('content').innerText =
      'Erreur lors du chargement des données';
    console.error(err);
  });