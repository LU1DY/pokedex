const pokeName = document.querySelector(".pokemon__name");
const pokeNumber = document.querySelector(".pokemon__number");
const pokeImg = document.querySelector(".pokemon__image");
const form = document.querySelector(".form");
const input = document.querySelector(".input__search");
const btnPrev = document.querySelector(".btn-prev");
const btnNext = document.querySelector(".btn-next");
const pokemonImages = document.getElementById("pokemonImages");
const statsBox = document.querySelector(".atributo");
const typesBox = document.querySelector(".type");
const description = document.querySelector(".desc");

let index = 1;

const clearElements = () => {
  typesBox.innerHTML = "";
  pokemonImages.innerHTML = "";
};

const fetchPokemon = async (pokemon) => {
  try {
    const apiResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    );
    if (apiResponse.ok) {
      return await apiResponse.json();
    } else {
      throw new Error(`Erro ao buscar dados do Pokémon: ${pokemon}`);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const renderPokemon = async (pokemon) => {
  pokeName.innerHTML = "Carregando...";
  pokeNumber.innerHTML = "";
  pokeImg.style.display = "none";
  const data = await fetchPokemon(pokemon);

  if (data) {
    const stats = {};
    data.stats.forEach((stat) => {
      stats[stat.stat.name] = stat.base_stat;
    });
    statsBox.innerHTML = `
    <p><span>HP</span>${stats.hp}</p>
    <p><span>Ataque</span>${stats.attack}</p>
    <p><span>Defesa</span>${stats.defense}</p>
    <p><span>Ataque Especial</span>${stats["special-attack"]}</p>
    <p><span>Defesa Especial</span>${stats["special-defense"]}</p>
    <p><span>Velocidade</span>${stats.speed}</p>`;
    const types = data.types.map((typeInfo) => typeInfo.type.name);
    typesBox.innerHTML = ""; // Limpar antes de adicionar novos tipos
    types.forEach((type) => {
      typesBox.innerHTML += `<p>${type}</p>`;
    });
    pokeName.innerHTML = data.name;
    pokeNumber.innerHTML = data.id;

    const pokeImgGif =
      data.sprites.versions["generation-v"]["black-white"].animated
        .front_default;
    const pokeImgPng = data.sprites.front_default;

    pokeImg.src = pokeImgGif ? pokeImgGif : pokeImgPng;
    pokeImg.style.display = "block";
    input.value = "";
    index = data.id;
  } else {
    pokeName.innerHTML = `Não encontrado`;
    pokeNumber.innerHTML = "404";
    pokeImg.src = "assets/pikachu.png";
    input.value = "";
  }
};

async function fetchEvolutionGroup(pokemon) {
  try {
    const apiResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${pokemon}/`
    );
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      const evoGroup = data.evolution_chain.url;
      for (const entry of data.flavor_text_entries) {
        if (entry.language.name === "en") {
          description.innerHTML = `${entry.flavor_text}`;
          break;
        }
      }
      return evoGroup;
    } else {
      throw new Error(`Erro ao buscar grupo evolutivo do Pokémon: ${pokemon}`);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

const fetchEvolutionChain = async (evoGroupUrl) => {
  try {
    const apiResponse = await fetch(evoGroupUrl);
    if (apiResponse.ok) {
      return await apiResponse.json();
    } else {
      throw new Error(`Erro ao buscar cadeia evolutiva: ${evoGroupUrl}`);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const extractSpeciesNames = (chain) => {
  let speciesNames = [];
  const traverse = (node) => {
    speciesNames.push(node.species.name);
    node.evolves_to.forEach((child) => traverse(child));
  };
  traverse(chain);
  return speciesNames;
};

const fetchMultiplePokemon = async (pokemonList) => {
  for (const pokemon of pokemonList) {
    const data = await fetchPokemon(pokemon);
    if (data) {
      const liElement = document.createElement("li");
      liElement.classList.add(data.types[0].type.name);
      const imgElement = document.createElement("img");
      imgElement.src = data.sprites.front_default;
      imgElement.alt = data.name;
      const infoElement = document.createElement("div");
      infoElement.innerHTML = `<p class="name"> ${capitalizeFirstLetter(
        data.name
      )} </p>`;
      liElement.appendChild(imgElement);
      liElement.appendChild(infoElement);
      pokemonImages.appendChild(liElement);
    } else {
      console.error(`Erro ao buscar dados do Pokémon: ${pokemon}`);
    }
  }
};

const capitalizeFirstLetter = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

async function getPokemonEvolution(pokemonId) {
  try {
    const evoGroupUrl = await fetchEvolutionGroup(pokemonId);
    const evolutionData = await fetchEvolutionChain(evoGroupUrl);
    const speciesNames = extractSpeciesNames(evolutionData.chain);
    await fetchMultiplePokemon(speciesNames);
  } catch (error) {
    console.error("Erro ao buscar informações de evolução:", error);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const pokemon = input.value.toLowerCase();
  clearElements();
  renderPokemon(pokemon);
  getPokemonEvolution(pokemon);
});

btnNext.addEventListener("click", () => {
  if (index < 1025) {
    index++;
    clearElements();
    renderPokemon(index);
    getPokemonEvolution(index);
  }
});

btnPrev.addEventListener("click", () => {
  if (index > 1) {
    index--;
    clearElements();
    renderPokemon(index);
    getPokemonEvolution(index);
  }
});

renderPokemon(index);
getPokemonEvolution(index);

async function searchPokemonCards() {
  const pokemonName = document
    .getElementById("pokemon-name")
    .value.trim()
    .toLowerCase();
  const apiUrl = `https://api.pokemontcg.io/v1/cards?name=${pokemonName}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Limpar o conteúdo atual
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = "";

    // Adicionar imagens das cartas encontradas
    data.cards.forEach((card) => {
      const cardImage = document.createElement("img");
      cardImage.src = card.imageUrl;
      cardImage.alt = card.name;

      cardsContainer.appendChild(cardImage);
    });
  } catch (error) {
    console.error("Erro ao buscar cartas Pokémon:", error);
  }
}
