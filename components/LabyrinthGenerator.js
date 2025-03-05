const { useState, useRef } = React;

const LabyrinthGenerator = ({ room, onGenerated }) => {
  const [theme, setTheme] = useState('');
  const [complexity, setComplexity] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      // Create a temporary URL for audio preview
      const tempUrl = URL.createObjectURL(file);
      setAudioUrl(tempUrl);
    }
  };

  const handleGenerate = async () => {
    if (!theme) {
      alert('Please enter a theme for your labyrinth');
      return;
    }

    setLoading(true);
    setProgress({ stage: 'Generating labyrinth concept...', percent: 10 });

    try {
      // Step 1: Generate labyrinth concept using LLM
      const labyrinthConcept = await generateLabyrinthConcept(theme, complexity);
      setProgress({ stage: 'Creating labyrinth description...', percent: 30 });

      // Step 2: Generate detailed description from concept
      const description = await generateDetailedDescription(labyrinthConcept);
      setProgress({ stage: 'Generating labyrinth image...', percent: 50 });

      // Step 3: Generate image based on description
      const imageUrl = await generateLabyrinthImage(description);
      setProgress({ stage: 'Generating texture patterns...', percent: 70 });

      // Step 4: Generate wall textures for different biomes
      const wallTextures = await generateWallTextures(labyrinthConcept);
      setProgress({ stage: 'Uploading audio file...', percent: 85 });

      // Step 5: Upload audio file if provided
      let audioFileUrl = '';
      if (audioFile) {
        audioFileUrl = await websim.upload(audioFile);
      }
      setProgress({ stage: 'Saving labyrinth data...', percent: 95 });

      // Step 6: Save labyrinth data to database
      await room.collection('labyrinth').create({
        title: labyrinthConcept.title,
        theme,
        complexity,
        description: description,
        imageUrl,
        audioUrl: audioFileUrl,
        wallTextures,
        mazeData: labyrinthConcept.mazeData,
        biomes: labyrinthConcept.biomes
      });

      setProgress({ stage: 'Complete!', percent: 100 });
      
      // Reset form
      setTheme('');
      setComplexity('medium');
      setAudioFile(null);
      setAudioUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onGenerated) {
        onGenerated();
      }
    } catch (error) {
      console.error('Error generating labyrinth:', error);
      alert('Failed to generate labyrinth. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="labyrinth-generator">
      <h2>Generate Your Infinite Labyrinth</h2>
      
      <div className="form-group">
        <label htmlFor="theme">Theme or Concept:</label>
        <textarea
          id="theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Describe your labyrinth theme, e.g., 'Ancient overgrown temple with mystical runes' or 'Abandoned space station with alien technology'"
          rows="4"
          disabled={loading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="complexity">Complexity:</label>
        <select
          id="complexity"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
          disabled={loading}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="nightmare">Nightmare</option>
        </select>
      </div>
      
      <div className="form-group file-upload-container">
        <label htmlFor="audio-file">Background Music (optional):</label>
        <input
          ref={fileInputRef}
          type="file"
          id="audio-file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={loading}
        />
        
        {audioUrl && (
          <div className="audio-controls">
            <audio
              className="audio-player"
              controls
              src={audioUrl}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
      
      <button
        className="generate-button"
        onClick={handleGenerate}
        disabled={loading || !theme}
      >
        {loading ? 'Generating...' : 'Generate Labyrinth'}
      </button>
      
      {loading && (
        <div className="loading-indicator">
          <p>{progress.stage}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.percent}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

