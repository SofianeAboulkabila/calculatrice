//  Permet de supprimer la loading page et d'afficher la page principale
//  Doit être placé en dehors de window 'load' pour être exécuté avant
function supprimer() {
  document
    .getElementById('loading-page')
    .classList.add('animate__animated', 'animate__fadeOutDownBig')
  const heroSearch = document.getElementById('hero-search')
  heroSearch.style.display = 'flex'
}

window.addEventListener('load', function () {
  // Définition des éléments à aller chercher sur le DOM
  const pokemonsSelect = document.getElementById('pokemons-select')
  const pokemonPage = document.getElementById('pokemon-page')
  const pokemonImage = document.getElementById('pokemon-image')
  const pokemonImage2 = document.getElementById('pokemon-image2')
  const pokemonTypes = document.getElementById('pokemon-types')
  const pokemonWeight = document.getElementById('pokemon-weight')
  const pokemonHeight = document.getElementById('pokemon-height')
  const pokemonShiny = document.getElementById('pokemon-shiny')
  const pokemonDefault = document.getElementById('pokemon-default')
  const pokemonDetails2 = document.getElementById('pokemon-details2')
  const pokemonDetails3 = document.getElementById('pokemon-details3')
  const pokemonFemale = document.getElementById('pokemon-female')
  const pokemonInfo = document.getElementById('pokemon-info')

  // Ecouteur d'évènements pour fermer pokemonPage si on appuie sur échap
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      pokemonPage.style.display = 'none'
    }
  })

  // Fonction permettant de rechercher un pokémon en comparant son existance dans la liste option
  // Si existant, effecue un nouvel événement "change" à pokemonsSelect
  document.querySelector('#search-pokemon').addEventListener('click', searchPokemon)

  function searchPokemon() {
    const userInput = prompt("Entrez le nom ou le numéro d'un Pokémon :")
    if (userInput) {
      let option
      if (!isNaN(userInput)) {
        // Si l'entrée est un nombre, sélectionne le Pokémon par son index dans la liste
        const index = parseInt(userInput)
        option = document.querySelectorAll('#pokemons-select option')[index]
      } else {
        // Sinon, sélectionne le Pokémon par son nom
        option = document.querySelector(
          `#pokemons-select option[value="${userInput.toLowerCase()}"]`
        )
      }

      if (option) {
        // Sélectionne l'option correspondante dans la liste déroulante
        pokemonsSelect.selectedIndex = option.index
        // Déclenche l'événement "change" pour afficher les informations du Pokémon
        pokemonsSelect.dispatchEvent(new Event('change'))
      } else {
        alert(`Désolé, "${userInput}" n'est pas un nom ou un numéro de Pokémon valide.`)
      }
    }
  }

  // Envoie une requête GET pour récupérer la liste des noms de tous les Pokémon
  // -> Les variables mutables sont inutiles dans mon code puisqu'elles resteront inchangées pour toute la page voir les effets de bords pour + d'infos
  fetch('https://pokeapi.co/api/v2/pokemon/?limit=898')
    .then((response) => response.json())
    .then((data) => {
      const pokemonNames = data.results.map((pokemon) => pokemon.name)
      pokemonNames.unshift('Sélectionnez un pokémon:')
      pokemonsSelect.innerHTML = pokemonNames
        .map((name) => `<option value="${name}">${name.toUpperCase()}</option>`)
        .join('')
    })

  // Ajoute un gestionnaire d'événement pour le changement de la sélection dans la liste déroulante des Pokémon
  pokemonsSelect.addEventListener('change', () => {
    const pokemonName = pokemonsSelect.value

    if (pokemonName !== '') {
      // Envoie une requête GET pour récupérer les informations détaillées du Pokémon sélectionné
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`)
        .then((response) => response.json())
        .then((data) => {
          // Récupère la première entrée de texte du Pokémon Type
          const flavorText = data.flavor_text_entries.find(
            (entry) => entry.language.name === 'en'
          ).flavor_text
          // Affiche le texte de description dans la constante pokemonInfo
          pokemonInfo.textContent = flavorText
        })

      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        .then((response) => response.json())
        .then((data) => {
          const affichePokemon = () => {
            // Affiche les informations du Pokémon sur la page
            pokemonName.textContent = data.name
            pokemonDetails2.textContent = data.name
            pokemonDetails3.textContent = `#${data.id}`

            const preloadedImage = new Image()
            const preloadedImage2 = new Image()

            //Définir la source de l'image
            preloadedImage.src = data.sprites.front_default
            preloadedImage2.src = data.sprites.back_default

            //Lorsque l'image est chargée, vous pouvez l'afficher sur la page
            preloadedImage.onload = () => {
              if (preloadedImage2.src === 'http://127.0.0.1:5555/null') {
                preloadedImage.src = data.sprites.front_default
                preloadedImage2.src = './assets/img/pokeball.webp'
              } else {
                preloadedImage.src = data.sprites.front_default
                preloadedImage2.src = data.sprites.back_default
              }
            }

            pokemonWeight.textContent = data.weight / 10
            pokemonHeight.textContent = data.height / 10

            // Utilisation du timestamp unique pour forcer le cache du navigateur
            // à ne pas utiliser l'ancienne image stockée en cache lors
            // du chargement du nouveau sprite
            // sinon il ya une brève utilisation de l'ancienne image stockée en cache
            pokemonShiny.addEventListener('click', function () {
              pokemonImage.src = data.sprites.front_shiny + '?t=' + Date.now()
              pokemonImage2.src = data.sprites.back_shiny + '?t=' + Date.now()
            })
            pokemonDefault.addEventListener('click', function () {
              pokemonImage.src = data.sprites.front_default + '?t=' + Date.now()
              pokemonImage2.src = data.sprites.back_default + '?t=' + Date.now()
            })

            pokemonFemale.addEventListener('click', function () {
              pokemonImage.src = data.sprites.front_female + '?t=' + Date.now()
              pokemonImage2.src = data.sprites.back_female + '?t=' + Date.now()
            })

            // Permet l'affichage optionnel du bouton Female selon si l'api contient des mots clés
            if (!data.sprites.front_female || !data.sprites.back_female) {
              pokemonFemale.style.display = 'none'
            } else {
              pokemonFemale.style.display = 'inline'
            }

            // Permet de coloriser le type du pokémon en lui attribuant une classe CSS et de le placer
            data.types.forEach((type) => {
              let typeClass = ''
              {
                typeClass = `type-${type.type.name}`
              }
              pokemonTypes.innerHTML += `<span class="${typeClass}">${type.type.name}</span>`
            })

            // Affiche la page d'affichage des informations du Pokémon
            pokemonPage.style.display = 'block'
          }

          // Vide la liste des types du Pokémon avant de l'afficher
          pokemonTypes.innerHTML = ''
          affichePokemon()
        })
    } else {
      // Masque la page d'affichage des informations du Pokémon si aucun Pokémon n'est sélectionné
      pokemonPage.style.display = 'none'
    }
  })
})
