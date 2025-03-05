// Utility functions for procedural maze generation

// Generate a maze using a modified recursive backtracking algorithm
const generateMaze = (width, height) => {
  // Initialize the grid with all walls
  const grid = Array(height).fill().map(() => Array(width).fill(1));
  
  // Set starting position
  const startX = 1;
  const startY = 1;
  grid[startY][startX] = 0;
  
  // Direction vectors
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  
  // Stack for backtracking
  const stack = [{x: startX, y: startY}];
  
  // Algorithm
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    
    // Find unvisited neighbors
    const neighbors = [];
    for (let i = 0; i < 4; i++) {
      const nx = current.x + dx[i] * 2;
      const ny = current.y + dy[i] * 2;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === 1) {
        neighbors.push({x: nx, y: ny, dir: i});
      }
    }
    
    if (neighbors.length > 0) {
      // Choose random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Carve path
      grid[current.y + dy[next.dir]][current.x + dx[next.dir]] = 0;
      grid[next.y][next.x] = 0;
      
      // Add to stack
      stack.push({x: next.x, y: next.y});
    } else {
      // Backtrack
      stack.pop();
    }
  }
  
  // Add circular connections for infinite effect
  for (let y = 1; y < height - 1; y += 2) {
    // Connect left and right edges
    if (grid[y][1] === 0 && grid[y][width - 2] === 0) {
      const connect = Math.random() < 0.3;
      if (connect) grid[y][width - 1] = 0;
    }
  }
  
  for (let x = 1; x < width - 1; x += 2) {
    // Connect top and bottom edges
    if (grid[1][x] === 0 && grid[height - 2][x] === 0) {
      const connect = Math.random() < 0.3;
      if (connect) grid[height - 1][x] = 0;
    }
  }
  
  return grid;
};

// Define biome regions for a maze
const defineBiomes = (width, height, numBiomes) => {
  const biomes = [];
  const biomeTypes = [
    'ancient', 'crystal', 'volcanic', 'icy', 'jungle', 
    'ethereal', 'technological', 'underwater', 'desert',
    'fungal', 'celestial', 'abandoned'
  ];
  
  // Ensure we don't request more biomes than we have types
  const biomesToCreate = Math.min(numBiomes, biomeTypes.length);
  
  // Simple algorithm to divide the maze into regions
  if (biomesToCreate === 1) {
    // One biome covers the entire maze
    biomes.push({
      type: biomeTypes[0],
      description: `A ${biomeTypes[0]} biome with distinctive architecture and atmosphere`,
      x1: 0,
      y1: 0,
      x2: width - 1,
      y2: height - 1
    });
  } else if (biomesToCreate === 2) {
    // Two biomes, split horizontally
    const splitY = Math.floor(height / 2);
    
    biomes.push({
      type: biomeTypes[0],
      description: `A ${biomeTypes[0]} biome with distinctive architecture and atmosphere`,
      x1: 0,
      y1: 0,
      x2: width - 1,
      y2: splitY - 1
    });
    
    biomes.push({
      type: biomeTypes[1],
      description: `A ${biomeTypes[1]} biome with completely different feel from the first region`,
      x1: 0,
      y1: splitY,
      x2: width - 1,
      y2: height - 1
    });
  } else {
    // Multiple biomes, create a grid
    const columns = Math.ceil(Math.sqrt(biomesToCreate));
    const rows = Math.ceil(biomesToCreate / columns);
    
    const cellWidth = Math.floor(width / columns);
    const cellHeight = Math.floor(height / rows);
    
    let biomeIndex = 0;
    
    for (let row = 0; row < rows && biomeIndex < biomesToCreate; row++) {
      for (let col = 0; col < columns && biomeIndex < biomesToCreate; col++) {
        const x1 = col * cellWidth;
        const y1 = row * cellHeight;
        const x2 = (col + 1) * cellWidth - 1;
        const y2 = (row + 1) * cellHeight - 1;
        
        biomes.push({
          type: biomeTypes[biomeIndex],
          description: `A ${biomeTypes[biomeIndex]} biome with distinctive architecture and atmosphere`,
          x1,
          y1,
          x2: Math.min(x2, width - 1),
          y2: Math.min(y2, height - 1)
        });
        
        biomeIndex++;
      }
    }
  }
  
  return biomes;
};

