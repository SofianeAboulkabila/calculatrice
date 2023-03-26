// UTILE POUR MAPER DES TOUCHES CLAVIER

// document.addEventListener('keydown', (event) => {
//   console.log(`Touche pressée: ${event.key}`)
// })
// document.addEventListener('click', function (event) {
//   console.log(event.target.textContent)
// })

// On définit les variables qui vont nous servir pour récupérer les éléments du DOM

// On récupère tous les boutons de la calculatrice
const buttons = document.querySelectorAll('.btn')
// On récupère l'affichage des saisies
const display = document.getElementById('display')
// On récupère le la modale à ouvrir
const historyModal = document.getElementById('historyModal')
// On récupère le body de la modale
const historyModalBody = document.getElementById('historyModalBody')
// On récupère nos ID d'alertes
const alerteHistorique = document.getElementById('alerte-historique')
// On récupère l'ID historique pour pouvoir lancer des alertes juste après avec insertAdjacentHTML
const alerteSymbols = document.getElementById('alerte-symbols')
// On récupère le bouton "Entrer" et on le stocke dans une variable
const btnEnter = document.getElementById('btn-enter')
// On récupère le bouton On/Off
const btnOnOff = document.getElementById('btnOnOff')

// On bloque le mapping du raccourcis clavier ENTRER avec le #btnOnOff
// Sinon chaque ENTRER va activer/réactiver le btn

btnOnOff.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    // Si event keydown enter sur btnOnOff, on retire l'évènement par défaut de ENTRER
    event.preventDefault()
  }
})

// Écouteur d'événement pour les keydown
document.addEventListener('keydown', function (event) {
  // Trouve le bouton correspondant à la touche appuyée
  // Et vérifie que la touche appuyée est bien un bouton de la calculatrice
  const button = Array.from(buttons).find((btn) => btn.textContent === event.key)

  // Si le bouton correspondant est trouve (if true), ajoute sa valeur à l'affichage
  if (button) {
    addToDisplay(button.textContent)
  }
  // Sinon on vérifie si c'est la touche entrée qui a été appuyée
  // Et on vérifie que le bouton "Entrer" est bien activé
  // Si c'est le cas, on exécute le calcul
  else if (event.key === 'Enter') {
    if (!btnEnter.disabled) {
      // Vérification de la présence d'un opérateur et d'un chiffre
      checkOperator()
      // Check if the "Enter" button is enabled
      calculate()
    }
  } else if (event.key === 'Backspace') {
    deleteLastInput()
  }
})

// Fonction permettant de bloquer les alertes et d'alterner selon le mode du bouton
function toggleContenu() {
  if (
    alerteHistorique.style.display === 'none' ||
    alerteSymbols.style.display === 'none'
  ) {
    afficherContenu()
  } else {
    masquerContenu()
  }
}

// Fonction changeant le mode du bouton (infos DOM) pour demander à ajouter (infos DOM)
function masquerContenu() {
  alerteHistorique.style.display = 'none'
  alerteSymbols.style.display = 'none'
  btnOnOff.classList.remove('btn-primary')
  btnOnOff.classList.add('btn-secondary')
  btnOnOff.innerHTML = 'Réactiver les alertes'
}
// Fonction changeant le mode du bouton (infos DOM) pour demander à masquer
function afficherContenu() {
  alerteHistorique.style.display = 'block'
  alerteSymbols.style.display = 'block'
  btnOnOff.classList.remove('btn-secondary')
  btnOnOff.classList.add('btn-primary')
  btnOnOff.innerHTML = 'Masquer les alertes'
}

// Fonction pour ouvrir la modale et afficher l'historique des calculs
// Gère aussi le flux de l'historique
// On créée un tableau vide pour y stocker l'historique des calculs
let calculationsHistory = []

function openHistoryModal() {
  // Parcourt le tableau et ajoute chaque p à la modale
  calculationsHistory.forEach((calculation) => {
    const p = document.createElement('p')
    p.innerText = calculation
    historyModalBody.appendChild(p)
  })
  // Ouvre la modale
  new bootstrap.Modal(historyModal).show()
}

function openInfoModale() {
  const modal = document.querySelector('#info-modale')
  const infoModal = new bootstrap.Modal(modal)
  infoModal.show()
}

// On vérifie l'intégrité de l'opération
function checkOperator() {
  // On stocke la valeur de l'affichage dans une variable
  const displayValue = display.value

  // On vérifie si l'affichage contient l'un des opérateurs "+", "-", "*", "/"
  if (
    displayValue.includes('+') ||
    displayValue.includes('-') ||
    displayValue.includes('*') ||
    displayValue.includes('/')
  ) {
    // Si l'opérateur est présent, on vérifie s'il y a au moins un chiffre après l'opérateur
    const operatorIndex = displayValue.search(/[\+\-\*\/]/) // On récupère l'index de l'opérateur
    const valueAfterOperator = displayValue.slice(operatorIndex + 1) // On récupère la partie de l'affichage après l'opérateur

    // Si au moins un chiffre est présent après l'opérateur, on ajoute la classe "btn-primary" au bouton "Entrer"
    if (/\d/.test(valueAfterOperator)) {
      // Si au moins un chiffre est présent après l'opérateur, on ajoute la classe "btn-primary" au bouton "Entrer"
      btnEnter.classList.add('btn-success')
      // Et on enlève la classe "btn-warning"
      btnEnter.classList.remove('disabled', 'btn-warning')
      btnEnter.disabled = false
      return true
    }
  }

  // Si l'opérateur n'est pas présent ou s'il n'y a pas de chiffre après l'opérateur, on ajoute la classe "btn-warning" au bouton "Entrer"
  btnEnter.classList.add('disabled', 'btn-warning')
  // Et on enlève la classe "btn-primary"
  btnEnter.classList.remove('btn-success')
  btnEnter.disabled = true // Disable the "Enter" button
}

// Permet de compter lors de la saisie de nouvelles values
// On +1 de base
// On -1 quand condition pas remplie
// Comme ça on reste toujours à inputCount 0 ou 1 ça facilite la verification de inputCount par rapport à la saisie
let inputCount = 0

// Fonction permettant de rajouter
function addToDisplay(value) {
  // On vérifie que l'opérateur n'est pas présent juste avant, si c'est le cas, il est automatiquement supprimé
  checkDoubleOperator(value)
  inputCount++
  // On vérifie aussi que la première valeur entrée est un chiffre
  if (
    inputCount === 1 &&
    (value === '.' || value === '+' || value === '-' || value === '*' || value === '/')
  ) {
    alert('Merci de commencer par un chiffre.')
    inputCount--
  } else {
    display.value += value
    checkOperator()
  }
}

// Fonction pour calculer l'expression
function calculate() {
  const expression = display.value
  const result = Function(`return ${expression}`)()

  display.value = result
  // Vérification de la présence d'un opérateur et d'un chiffre après le résultat
  checkOperator()

  // Ajout de l'historique des calculs
  const now = new Date()
  calculationsHistory.push(
    `${now.getHours()}h${now.getMinutes()}mins${now.getSeconds()}s ---> ${expression} = ${result}`
  )

  // Pop-up mise à jour de l'historique
  alerteHistorique.innerHTML =
    '<div class="alert alert-success alert-dismissible fade show animate__animated animate__rubberBand" role ="alert"><strong>L\'historique a été mis à jour !</strong><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
}

// Fonction pour effacer l'affichage
function reset() {
  display.value = ''
}
// On vérifie qu'il n'y a pas de répétitions de +, -, *, /, .
function checkDoubleOperator(value) {
  // on vérifie si la valeur est un double opérateur
  if (value === '+' || value === '-' || value === '*' || value === '/' || value === '.') {
    // On vérifie si la valeur précédente est un opérateur
    if (
      display.value[display.value.length - 1] === '+' ||
      display.value[display.value.length - 1] === '-' ||
      display.value[display.value.length - 1] === '*' ||
      display.value[display.value.length - 1] === '/' ||
      display.value[display.value.length - 1] === '.'
    ) {
      // Supprimer le dernier caractère
      display.value = display.value.slice(0, -1)
      // Afficher l'alerte
      alerteSymbols.innerHTML =
        '<div class="alert alert-danger alert-dismissible fade show animate__animated animate__rubberBand" role="alert"><strong>Un seul symbole à la fois !!!</strong><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    }
  }
}
// On définit la fonction qui sera appelée lorsque le bouton "Supprimer" est cliqué
function deleteLastInput() {
  // On supprime le dernier caractère en utilisant la méthode slice()
  display.value = display.value.slice(0, -1)
  // On met à jour le compteur d'entrées
  inputCount--
  // On vérifie à nouveau la présence d'un opérateur
  checkOperator()
}

// On appelle la fonction pour la première fois pour initialiser les classes du bouton "Entrer"
checkOperator()
