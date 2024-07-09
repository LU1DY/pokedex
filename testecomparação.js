const fetchPokemon = async (pokemon) => {
  const apiResponse = await fetch(
    `https://pokeapi.co/api/v2/evolution-chain/${pokemon}/`
  );
  if (apiResponse.status === 200) {
    const data = await apiResponse.json();
    console.log(data);
  }
};

const fetchEvolutionGroup = async (pokemon) => {
  const apiResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemon}/`
  );
  if (apiResponse.status === 200) {
    const data = await apiResponse.json();
    const evoGroup = data.evolution_chain.url;
    console.log(evoGroup);
    return evoGroup;
  }
};

const fetchEvolutionChain = async (evoGroupUrl) => {
  const apiResponse = await fetch(evoGroupUrl);
  if (apiResponse.status === 200) {
    const data = await apiResponse.json();
    return data;
  }
};

async function getPokemonEvolution(pokemonId) {
    try {
      const evoGroupUrl = await fetchEvolutionGroup(pokemonId);
      const evolutionData = await fetchEvolutionChain(evoGroupUrl);
      const speciesNames = extractSpeciesNames(evolutionData.chain);
      console.log(speciesNames);
    } catch (error) {
      console.error("Erro ao buscar informações de evolução:", error);
    }
  }

getPokemonEvolution(1);
