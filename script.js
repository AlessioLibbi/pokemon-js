const apiBaseUrl = "https://pokeapi.co/api/v2/"; // API Base url
const limit = 18;
var page;
document.addEventListener('DOMContentLoaded', () => {
  page = localStorage.getItem('page')
  if(!page || page == undefined) {
    localStorage.setItem('page', 1)
    page = 1;
  } 
  offset = getOffSet(page, limit)


  listGeneration(limit, offset)
});



function listGeneration(limit, offset) {
  const container = document.getElementById('pokemon-list')
  const loader = document.getElementById('loader')
  container.innerHTML = "";
  loader.style.display = "flex"
  var pageGroup = document.querySelector('.page')
  pageGroup.classList.add('hidden');
  // Chiamata alla funzione che effettua la chiamara API | restituisce una Promise
  getPokemonList(limit, offset).then((pokemonList) => {
    return pokemonList.json() // Codifico il JSON restituito | restituisce una Promise
  }).then((data) => {
    
    let list = data.results  // Data è l'oggetto restituito precedentemente. Valorizzo list con i dati ricevuto

    // Creo una promise a cui passo una funzione asincrona
    let prom = new Promise(async (resolve) => {

      //Invoco await Promise.all e passo il risultato di array.map
      await Promise.all(list.map(async (pokemonOrig) => {
        // Chiamata API
        return await getPokemonDetails(pokemonOrig.url).then((pokemon) => {
          // Decodifica JSON di ritorno
          return pokemon.json()
        }).then((pokemon) => {
          // Aggiungo i dettagli restituiti all'oggetto Pokemon originale
          pokemonOrig.details = pokemon
        }).catch((e) => alert(e.message))
      }))
      // Risolvo la promise restituiendo l'array aggiornato
      return resolve(list)
    })

    // Ritorno la promise (comportamento previsto all'interno di .then)
    return prom
  }).then((listOk) => {
    let prom = new Promise(async (resolve) => {

      //Invoco await Promise.all e passo il risultato di array.map
      await Promise.all(listOk.map(async (pokemonWithDetail) => {
        // Chiamata API
        return await getPokemonCharacteristics(pokemonWithDetail.details.id).then((pokemon) => {
          // Decodifica JSON di ritorno

          console.log('pokemon')
          console.log(pokemon)

          if (pokemon.ok) {
            return pokemon.json()
          }
          return Promise.resolve({})

        }).then((pokemon) => {
          // Aggiungo i dettagli restituiti all'oggetto Pokemon originale
          pokemonWithDetail.characteristics = pokemon
        }).catch((e) => alert(e.message))
      }))
      // Risolvo la promise restituiendo l'array aggiornato
      return resolve(listOk)
    })

    // Ritorno la promise (comportamento previsto all'interno di .then)
    return prom
  }).then((listOK) => {
    console.log(listOK)
    // Eseguo la funzione che stampa i pokemon
    showPokemonList(listOK)
  }).catch((e) => {
    alert(e.message)
  })
}

function showPokemonList(pokemonArray) {
  const container = document.getElementById('pokemon-list')
  const loader = document.getElementById('loader')
  container.innerHTML = "";
  
  setTimeout(() => {
    loader.style.display = 'none'; //rimuovo il loader
    var pageGroup = document.querySelector('.page')
    pageGroup.classList.remove('hidden');
    
    pokemonArray.forEach((pokemon) => {
      // Card
      let card = document.createElement("div")
      card.classList.add('card')
      card.classList.add(pokemon.details.types[0].type.name)

      card.innerHTML = `<h4>${pokemon.name}</h4>` // titolo
      container.appendChild(card)

      // Immagine
      let img = document.createElement("img")
      img.classList.add('pokemon-img')
      //img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.details.id}.svg`
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.details.id}.png`
      card.appendChild(img)

      let height = (pokemon.details.height * 10).toFixed(2);
      let weight = (pokemon.details.weight * 0.1).toFixed(2);

      let info = document.createElement("div")
      info.classList.add('info')
      info.innerHTML = ''

      if (pokemon.characteristics && pokemon.characteristics.descriptions && pokemon.characteristics.descriptions[6]) {
        info.innerHTML += `<h5><strong>${pokemon.characteristics.descriptions[6].description}</strong></h5>` // peso
      }

      info.innerHTML += `<p>Punti esperienza <strong>${pokemon.details.base_experience}</strong></p>` // titolo
      info.innerHTML += `<p>Altezza: <strong>${height}cm</strong></p>` // altezza
      info.innerHTML += `<p>Peso: <strong>${weight}kg</strong></p>` // peso

      card.appendChild(info)
      
      let btn = document.createElement("a")
      btn.classList.add('btn')
      btn.innerHTML = 'Scopri di pi&ugrave;'
      btn.addEventListener('click', () => showPokemon(pokemon))
      card.appendChild(btn)

    }, 2000)  // Timeout di 2 sec per loader
  })

}

function getSinglePokemon(id) {
  const listRouteSingle = apiBaseUrl + `pokemon/${id}`
  return fetch(listRouteSingle,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });

}
function getOffSet(page,limit) {
  if(page == 0) {
    return 0
  } else {
    return  (page - 1) * limit;
  }
  
}
function nextPage() {
  page = localStorage.getItem('page')
  console.log(page);
  page = parseInt(page) + 1 
  console.log(page);
  localStorage.setItem('page', page)
  console.log(page);
  let offset = getOffSet(page, limit)
  listGeneration(limit, offset)
  
}
function prevPage() {
  page = localStorage.getItem('page')
  console.log(page);
  page = parseInt(page) - 1
  console.log(page);
  localStorage.setItem('page', page)
  console.log(page);
  let offset = getOffSet(page, limit)
  listGeneration(limit, offset)
  
}

function getPokemonList(limit, offset) {
  const listRoute = apiBaseUrl + "pokemon?limit=" + limit+ "&offset=" + offset
  const pokeContainer = document.getElementById('pokemon-list')
  return fetch(listRoute,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
}

function showPokemon(pokemon) {
  const container = document.getElementById('pokemon-list')
   const loader = document.getElementById('loader')
  getSinglePokemon(pokemon.details.id).then((pokemonSingle) => {
    return pokemonSingle.json() // Codifico il JSON restituito | restituisce una Promise
  }).then((data) => {
   console.log(data);
   let height = (pokemon.details.height * 10).toFixed(2);
   let weight = (pokemon.details.weight * 0.1).toFixed(2);
   //overlay
   let overlay = document.createElement('div')
   overlay.classList.add('overlay');
   document.body.appendChild(overlay)
   
   /////////////////
    let singleContainer = document.createElement('div')
    singleContainer.classList.add('modal');
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    let img = document.createElement("img")
      img.classList.add('modal-img')
      //img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.details.id}.svg`
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.details.id}.png`
      singleContainer.appendChild(img)
      
    singleContainer.innerHTML += `<p>Punti esperienza <strong>${pokemon.details.base_experience}</strong></p>` // titolo
    singleContainer.innerHTML += `<p>Altezza: <strong>${height}cm</strong></p>` // altezza
    singleContainer.innerHTML += `<p>Peso: <strong>${weight}kg</strong></p>` // peso


    let btn = document.createElement("a")
    btn.classList.add('btn')
    btn.innerHTML = 'Delete with &hearts;'
    btn.addEventListener('click', (e) => {
      overlay.classList.add('hidden')
      document.getElementsByTagName('body')[0].style.overflow = 'visible'
      deletePoke(singleContainer)

    })
    singleContainer.appendChild(btn)
    container.appendChild(singleContainer)
    
    
  }).catch((e) => {
    alert(e.message)
  })

}
function getPokemonDetails(url) {
  return fetch(url,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
}
function deletePoke(singleContainer) {
  singleContainer.remove()
}


function getPokemonCharacteristics(id) {
  let url = apiBaseUrl + `characteristic/${id}/`

  return fetch(url,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
}


/*
async function getPokemonListArray(limit){
  const listRoute = apiBaseUrl + "pokemon?limit=" + limit
  const pokeContainer = document.getElementById('pokemon-list')
  let pokemonListCall = await fetch(listRoute,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });

  if(pokemonListCall.ok){
    let pokemonListData = await pokemonListCall.json();
    let pokemonList = pokemonListData.results;

    await pokemonList.map( async pokemon => {
      let pokemonListCall =  await getPokemonDetails(pokemon.url)

      let detail = await pokemonListCall.json()
      pokemon['details'] = detail
      return pokemon
    });

    return pokemonList;

  }
  else{
    alert('ko')
  }
}
*/
