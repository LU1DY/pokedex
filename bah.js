const bah = document.getElementById("bah");
const form = document.getElementById("form");

// Retorna a URL com as informações evolutivas de um Pokémon através de seu id
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

// Pega a URL da fetchEvolutionGroup e retorna o JSON das informações evolutivas do Pokémon
const fetchEvolutionChain = async (evoGroupUrl) => {
  const apiResponse = await fetch(evoGroupUrl);
  if (apiResponse.status === 200) {
    const data = await apiResponse.json();
    return data;
  } else {
    throw new Error(`Erro ao buscar cadeia evolutiva: ${evoGroupUrl}`);
  }
};

// Extrai os nomes das espécies de Pokémon que estão dentro de uma cadeia
const extractSpeciesNames = (chain) => {
  let speciesNames = [];
  const traverse = (node) => {
    speciesNames.push(node.species.name);
    node.evolves_to.forEach((child) => traverse(child));
  };
  traverse(chain);
  return speciesNames;
};

// Função para buscar informações de um Pokémon
const fetchPokemon = async (pokemon) => {
  const apiResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemon}`
  );
  if (apiResponse.status === 200) {
    const data = await apiResponse.json();
    // console.log(data)
    const imgSrc = data.sprites.other["official-artwork"].front_default;

    // Criar elemento de lista e adicionar os dados do Pokémon
    const liElement = document.createElement("li");
    const imgElement = document.createElement("img");
    imgElement.src = imgSrc;
    imgElement.alt = data.name;

    // Adicionar informações adicionais como texto
    const infoElement = document.createElement("div");
    infoElement.innerHTML = `
      <p>ID: ${data.id}</p>
      <p>Name: ${data.name}</p>
      <p>Type 1: ${data.types[0].type.name}</p>
      ${data.types[1] ? `<p>Type 2: ${data.types[1].type.name}</p>` : ""}
    `;

    liElement.appendChild(imgElement);
    liElement.appendChild(infoElement);
    pokemonImages.appendChild(liElement);
  } else {
    console.error(`Erro ao buscar dados do Pokémon: ${pokemon}`);
  }
};

// Função para buscar informações de múltiplos Pokémon
const fetchMultiplePokemon = async (pokemonList) => {
  for (const pokemon of pokemonList) {
    await fetchPokemon(pokemon);
    console.log("--------");
  }
};

// Retorna a cadeia evolutiva do Pokémon
async function getPokemonEvolution(pokemonId) {
  try {
    const evoGroupUrl = await fetchEvolutionGroup(pokemonId);
    const evolutionData = await fetchEvolutionChain(evoGroupUrl);
    const speciesNames = extractSpeciesNames(evolutionData.chain);
    pokemonImages.innerHTML = "";
    await fetchMultiplePokemon(speciesNames);
  } catch (error) {
    console.error("Erro ao buscar informações de evolução:", error);
  }
}

// Evento de envio do formulário
form.addEventListener("submit", (event) => {
  event.preventDefault();
  getPokemonEvolution(bah.value);
});
