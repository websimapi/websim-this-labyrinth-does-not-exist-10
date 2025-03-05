// Generate wall textures for different biomes
const generateWallTextures = async (labyrinthConcept) => {
  try {
    const textures = {};
    const biomes = labyrinthConcept.biomes || [];
    
    // Default texture if no biomes
    if (biomes.length === 0) {
      const defaultTexture = await generateTextureForBiome('default', 'Stone wall texture with moss and cracks');
      textures['default'] = defaultTexture;
      return textures;
    }
    
    // Generate texture for each biome
    for (const biome of biomes) {
      const texturePrompt = `Seamless texture for ${biome.type} walls in a labyrinth: ${biome.description}. High detail, tileable pattern.`;
      const textureUrl = await generateTextureForBiome(biome.type, texturePrompt);
      textures[biome.type] = textureUrl;
    }
    
    return textures;
  } catch (error) {
    console.error('Error generating wall textures:', error);
    throw error;
  }
};

const generateTextureForBiome = async (biomeType, description) => {
  try {
    const result = await websim.imageGen({
      prompt: description,
      aspect_ratio: "1:1",
    });
    
    return result.url;
  } catch (error) {
    console.error(`Error generating texture for biome ${biomeType}:`, error);
    // Fallback to placeholders if generation fails
    return `https://placehold.co/512x512/333/888?text=${biomeType}`;
  }
};

