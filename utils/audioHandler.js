// Audio handler utilities
const setupAudioContext = () => {
  // Create audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  
  return {
    audioContext,
    
    // Load and decode audio file
    loadAudio: async (url) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
      } catch (error) {
        console.error('Error loading audio:', error);
        throw error;
      }
    },
    
    // Create audio source
    createSource: (audioBuffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      return source;
    },
    
    // Play audio with options
    playAudio: (audioBuffer, options = {}) => {
      const { loop = false, volume = 1.0, playbackRate = 1.0 } = options;
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Add gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set options
      source.loop = loop;
      source.playbackRate.value = playbackRate;
      
      // Start playback
      source.start();
      
      return {
        source,
        gainNode,
        
        // Stop playback
        stop: () => {
          source.stop();
        },
        
        // Set volume
        setVolume: (newVolume) => {
          gainNode.gain.value = newVolume;
        },
        
        // Set playback rate
        setPlaybackRate: (newRate) => {
          source.playbackRate.value = newRate;
        }
      };
    }
  };
};

