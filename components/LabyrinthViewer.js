const { useState, useEffect, useRef } = React;
import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

const LabyrinthViewer = ({ labyrinth, onBack, room }) => {
  const canvasRef = useRef(null);
  const [showInfo, setShowInfo] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const playerPositionRef = useRef({ x: 0, y: 0 });
  const mazeRef = useRef(null);
  const texturesRef = useRef({});
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize Three.js scene
    const init = async () => {
      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.set(0, 1.6, 0); // Height of average person
      cameraRef.current = camera;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      canvasRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      // Load textures
      await loadTextures(labyrinth.wallTextures);
      
      // Generate maze geometry
      generateMaze(labyrinth.mazeData, labyrinth.biomes);
      
      // Set up controls
      if (!isMobile) {
        const controls = new FirstPersonControls(camera, renderer.domElement);
        controls.movementSpeed = 10;
        controls.lookSpeed = 0.1;
        controlsRef.current = controls;
      }
      
      // Set initial player position
      const startPosition = findStartPosition(labyrinth.mazeData);
      playerPositionRef.current = startPosition;
      camera.position.x = startPosition.x;
      camera.position.z = startPosition.y;
      
      // Handle window resize
      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        if (controlsRef.current) {
          controlsRef.current.handleResize();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Animation loop
      const animate = (time) => {
        animationFrameRef.current = requestAnimationFrame(animate);
        
        if (controlsRef.current) {
          controlsRef.current.update(0.1);
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Clean up function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (controlsRef.current) {
          controlsRef.current.dispose();
        }
        scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        renderer.dispose();
        canvasRef.current.removeChild(renderer.domElement);
      };
    };
    
    init();
  }, [labyrinth, isMobile]);
  
  useEffect(() => {
    // Handle audio
    if (labyrinth.audioUrl && audioRef.current) {
      audioRef.current.src = labyrinth.audioUrl;
      audioRef.current.loop = true;
      
      if (audioPlaying) {
        audioRef.current.play().catch(e => console.error('Audio playback failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [labyrinth.audioUrl, audioPlaying]);
  
  // Load textures function
  const loadTextures = async (wallTextures) => {
    const textureLoader = new THREE.TextureLoader();
    const textures = {};
    
    for (const biome in wallTextures) {
      textures[biome] = await new Promise((resolve) => {
        textureLoader.load(wallTextures[biome], (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1);
          resolve(texture);
        });
      });
    }
    
    texturesRef.current = textures;
    return textures;
  };
  
  // Generate maze geometry
  const generateMaze = (mazeData, biomes) => {
    if (!sceneRef.current) return;
    
    // Remove previous maze if exists
    if (mazeRef.current) {
      sceneRef.current.remove(mazeRef.current);
    }
    
    const mazeGroup = new THREE.Group();
    const wallHeight = 3;
    const cellSize = 4;
    
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(
      mazeData[0].length * cellSize, 
      mazeData.length * cellSize
    );
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x555555,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(
      (mazeData[0].length * cellSize) / 2 - cellSize / 2,
      0,
      (mazeData.length * cellSize) / 2 - cellSize / 2
    );
    floor.receiveShadow = true;
    mazeGroup.add(floor);
    
    // Create ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(
      mazeData[0].length * cellSize, 
      mazeData.length * cellSize
    );
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.7
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(
      (mazeData[0].length * cellSize) / 2 - cellSize / 2,
      wallHeight,
      (mazeData.length * cellSize) / 2 - cellSize / 2
    );
    mazeGroup.add(ceiling);
    
    // Create walls
    for (let row = 0; row < mazeData.length; row++) {
      for (let col = 0; col < mazeData[row].length; col++) {
        const cell = mazeData[row][col];
        
        if (cell === 1) { // Wall
          // Determine biome for this position
          const biome = getBiomeForPosition(col, row, biomes);
          const wallMaterial = new THREE.MeshStandardMaterial({
            map: texturesRef.current[biome] || null,
            roughness: 0.7
          });
          
          const wallGeometry = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(
            col * cellSize,
            wallHeight / 2,
            row * cellSize
          );
          wall.castShadow = true;
          wall.receiveShadow = true;
          mazeGroup.add(wall);
        }
      }
    }
    
    sceneRef.current.add(mazeGroup);
    mazeRef.current = mazeGroup;
  };
  
  // Find start position in maze
  const findStartPosition = (mazeData) => {
    // Default to first empty space
    for (let row = 0; row < mazeData.length; row++) {
      for (let col = 0; col < mazeData[row].length; col++) {
        if (mazeData[row][col] === 0) {
          return { x: col * 4, y: row * 4 };
        }
      }
    }
    
    // Fallback
    return { x: 0, y: 0 };
  };
  
  // Get biome for a specific position
  const getBiomeForPosition = (x, y, biomes) => {
    if (!biomes || biomes.length === 0) {
      return 'default';
    }
    
    for (const biome of biomes) {
      if (x >= biome.x1 && x <= biome.x2 && y >= biome.y1 && y <= biome.y2) {
        return biome.type;
      }
    }
    
    return biomes[0].type;
  };
  
  // Mobile movement handling
  const handleJoystickMove = (x, y) => {
    if (!cameraRef.current || !mazeRef.current) return;
    
    const camera = cameraRef.current;
    const moveSpeed = 0.1;
    
    // Calculate forward direction
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    
    // Calculate right direction
    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();
    
    // Calculate movement
    const moveX = right.multiplyScalar(x * moveSpeed);
    const moveZ = direction.multiplyScalar(y * moveSpeed);
    
    // Update camera position
    camera.position.add(moveX);
    camera.position.add(moveZ);
    
    // Update player position reference
    playerPositionRef.current = {
      x: camera.position.x,
      y: camera.position.z
    };
  };
  
  const toggleAudio = () => {
    setAudioPlaying(!audioPlaying);
  };
  
  return (
    <div className="labyrinth-viewer">
      <div ref={canvasRef} className="canvas-container"></div>
      
      {showInfo && (
        <div className="labyrinth-info">
          <h2 className="labyrinth-title">{labyrinth.title}</h2>
          <p className="labyrinth-description">{labyrinth.description}</p>
          <button onClick={() => setShowInfo(false)}>Hide Info</button>
        </div>
      )}
      
      {!showInfo && (
        <button 
          className="info-button"
          onClick={() => setShowInfo(true)}
        >
          Show Info
        </button>
      )}
      
      <button 
        className="back-button"
        onClick={onBack}
      >
        Exit Labyrinth
      </button>
      
      {isMobile && (
        <MobileControls 
          onJoystickMove={handleJoystickMove}
          onToggleAudio={toggleAudio}
          isAudioPlaying={audioPlaying}
          hasAudio={!!labyrinth.audioUrl}
        />
      )}
      
      {labyrinth.audioUrl && (
        <audio 
          ref={audioRef} 
          preload="auto"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

