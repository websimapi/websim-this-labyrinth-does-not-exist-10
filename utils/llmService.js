// Generate the initial labyrinth concept
const generateLabyrinthConcept = async (theme, complexity) => {
  try {
    const prompt = `
Generate a unique, infinite labyrinth concept based on this theme: "${theme}" with ${complexity} complexity.

Create a JSON response with the following structure:
{
  "title": "A creative and captivating title for the labyrinth",
  "concept": "A brief description of the labyrinth concept",
  "biomes": [
    {
      "type": "biome1Name",
      "description": "Description of this biome area",
      "x1": 0,
      "y1": 0,
      "x2": 20,
      "y2": 20
    },
    ... more biomes ...
  ],
  "mazeData": [
    [1,1,1,1,1,...],
    [1,0,0,0,1,...],
    ... more rows ...
  ]
}

The mazeData should represent a maze where:
- 1 represents a wall
- 0 represents a path
- Size should be appropriate for ${complexity} complexity (easy: 15x15, medium: 25x25, hard: 40x40, nightmare: 60x60)
- Ensure there are multiple valid paths through the maze
- For infinite effect, ensure edges connect logically
`;

    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert labyrinth designer who creates unique, immersive maze experiences. Your responses must be valid JSON that the system can parse."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      json: true
    });

    // Parse the JSON response
    const labyrinthConcept = JSON.parse(completion.content);
    
    // Ensure we have required properties
    if (!labyrinthConcept.title || !labyrinthConcept.concept || !labyrinthConcept.biomes || !labyrinthConcept.mazeData) {
      throw new Error('Invalid labyrinth concept generated. Missing required properties.');
    }
    
    return labyrinthConcept;
  } catch (error) {
    console.error('Error generating labyrinth concept:', error);
    throw error;
  }
};

// Generate detailed description from the concept
const generateDetailedDescription = async (labyrinthConcept) => {
  try {
    const prompt = `
Based on this labyrinth concept:
Title: "${labyrinthConcept.title}"
Concept: "${labyrinthConcept.concept}"
Biomes: ${JSON.stringify(labyrinthConcept.biomes)}

Write an immersive, detailed description of this labyrinth that captures its atmosphere, challenges, and unique features. 
The description should be 2-3 paragraphs and should make players excited to explore this mysterious place.
Do not use bullet points. Just write flowing paragraphs describing the labyrinth from a player's perspective.
`;

    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert writer specializing in immersive fantasy and adventure descriptions."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return completion.content;
  } catch (error) {
    console.error('Error generating detailed description:', error);
    throw error;
  }
};

// Generate image based on the description
const generateLabyrinthImage = async (description) => {
  try {
    const prompt = `A bird's eye view of a labyrinth: ${description}. Intricate, detailed maze structure visible from above with various biomes and regions clearly distinguished by different colors and textures.`;
    
    const result = await websim.imageGen({
      prompt: prompt,
      aspect_ratio: "1:1",
    });
    
    return result.url;
  } catch (error) {
    console.error('Error generating labyrinth image:', error);
    throw error;
  }
};

