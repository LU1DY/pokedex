const pokeName = document.querySelector(".pokemon__name");
const pokeNumber = document.querySelector(".pokemon__number");
const pokeImg = document.querySelector(".pokemon__image");
const form = document.querySelector(".form");
const input = document.querySelector(".input__search");
const btnPrev = document.querySelector(".btn-prev");
const btnNext = document.querySelector(".btn-next");
const pokemonImages = document.getElementById("pokemonImages");

let index = 1;

// Função para buscar informações de um Pokémon
const fetchPokemon = async (pokemon) => {
  const apiResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemon}`
  );
  if (apiResponse.status === 200) {
    const data = await apiResponse.json();
    return data;
  } else {
    console.error(`Erro ao buscar dados do Pokémon: ${pokemon}`);
    return null;
  }
};

// Função para renderizar um Pokémon
const renderPokemon = async (pokemon) => {
  pokeName.innerHTML = "Loading...";
  pokeNumber.innerHTML = "";
  const data = await fetchPokemon(pokemon);

  if (data) {
    pokeName.innerHTML = data.name;
    pokeNumber.innerHTML = data.id;

    const pokeImgGif =
      data["sprites"]["versions"]["generation-v"]["black-white"]["animated"][
        "front_default"
      ];
    const pokeImgPng = data["sprites"]["front_default"];

    pokeImg.src = pokeImgGif ? pokeImgGif : pokeImgPng;
    pokeImg.style.display = "block";
    input.value = "";
    index = data.id;
  } else {
    pokeName.innerHTML = `Not found`;
    pokeNumber.innerHTML = "404";
    pokeImg.src = "pikachu.png";
    input.value = "";
  }
};

// Função para buscar informações de um grupo evolutivo
async function fetchEvolutionGroup(pokemon) {
  const apiResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemon}/`
  );
  if (apiResponse.status === 200) {
    const data = await apiResponse.json();
    const evoGroup = data.evolution_chain.url;
    return evoGroup;
  } else {
    throw new Error(`Erro ao buscar grupo evolutivo do Pokémon: ${pokemon}`);
  }
}

// Função para buscar informações de uma cadeia evolutiva
const fetchEvolutionChain = async (evoGroupUrl) => {
  const apiResponse = await fetch(evoGroupUrl);
  if (apiResponse.status === 200) {
    const data = await apiResponse.json();
    console.log(data);

    return data;
  } else {
    throw new Error(`Erro ao buscar cadeia evolutiva: ${evoGroupUrl}`);
  }
};

// Função para extrair nomes de espécies de Pokémon de uma cadeia evolutiva
const extractSpeciesNames = (chain) => {
  let speciesNames = [];
  const traverse = (node) => {
    speciesNames.push(node.species.name);
    node.evolves_to.forEach((child) => traverse(child));
  };
  traverse(chain);
  return speciesNames;
};

// Função para buscar informações de múltiplos Pokémon
const fetchMultiplePokemon = async (pokemonList) => {
  // Função para traduzir os tipos de inglês para português
  const traduzirTipo = (type) => {
    const tipos = {
      normal: "Normal",
      fighting: "Lutador",
      flying: "Voador",
      poison: "Venenoso",
      ground: "Terra",
      rock: "Pedra",
      bug: "Inseto",
      ghost: "Fantasma",
      steel: "Aço",
      fire: "Fogo",
      water: "Água",
      grass: "Planta",
      electric: "Elétrico",
      psychic: "Psíquico",
      ice: "Gelo",
      dragon: "Dragão",
      dark: "Noturno",
      fairy: "Fada",
      unknown: "Desconhecido",
      shadow: "Sombra",
    };

    return tipos[type] || type;
  };

  for (const pokemon of pokemonList) {
    const data = await fetchPokemon(pokemon);

    if (data) {
      const liElement = document.createElement("li");
      liElement.classList.add(data.types[0].type.name); // Adiciona a classe do tipo principal

      const imgElement = document.createElement("img");
      imgElement.src = data.sprites.other["official-artwork"].front_default;
      imgElement.alt = data.name;

      const infoElement = document.createElement("div");
      infoElement.innerHTML = `
        <p class="name">${data.id} - ${capitalizeFirstLetter(data.name)} </p>
        <p class="type">${traduzirTipo(data.types[0].type.name)}</p>
        ${
          data.types[1]
            ? `<p class="type">${traduzirTipo(data.types[1].type.name)}</p>`
            : ""
        }
      `;

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

// Função para renderizar a cadeia evolutiva de um Pokémon
async function getPokemonEvolution(pokemonId) {
  try {
    const evoGroupUrl = await fetchEvolutionGroup(pokemonId);
    const evolutionData = await fetchEvolutionChain(evoGroupUrl);
    const speciesNames = extractSpeciesNames(evolutionData.chain);
    pokemonImages.innerHTML = ""; // Limpar imagens antigas antes de adicionar novas
    await fetchMultiplePokemon(speciesNames);
  } catch (error) {
    console.error("Erro ao buscar informações de evolução:", error);
  }
}

// Evento de envio do formulário
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const pokemon = input.value.toLowerCase();
  renderPokemon(pokemon);
  getPokemonEvolution(pokemon);
});

// Botões de navegação
btnNext.addEventListener("click", () => {
  if (index < 1025) {
    index++;
    renderPokemon(index);
    getPokemonEvolution(index);
  } else {
    return;
  }
});

btnPrev.addEventListener("click", () => {
  if (index > 1) {
    index--;
    renderPokemon(index);
    getPokemonEvolution(index);
  } else {
    return;
  }
});

// Renderizar o Pokémon inicial
renderPokemon(index);
getPokemonEvolution(index);
