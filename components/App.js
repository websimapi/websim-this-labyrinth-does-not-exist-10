const React = window.React;
const { useState, useEffect } = React;

const App = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedLabyrinth, setSelectedLabyrinth] = useState(null);
  const [room] = useState(() => new WebsimSocket());

  const handleLabyrinthSelect = (labyrinth) => {
    setSelectedLabyrinth(labyrinth);
    setActiveTab('play');
  };

  const handleBackToGallery = () => {
    setSelectedLabyrinth(null);
    setActiveTab('gallery');
  };

  if (selectedLabyrinth) {
    return (
      <LabyrinthViewer 
        labyrinth={selectedLabyrinth} 
        onBack={handleBackToGallery}
        room={room}
      />
    );
  }

  return (
    <div className="container">
      <div className="tab-container">
        <div 
          className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate Labyrinth
        </div>
        <div 
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </div>
      </div>
      
      <div className="tab-content">
        <div className={`tab-panel ${activeTab === 'generate' ? 'active' : ''}`}>
          <LabyrinthGenerator room={room} onGenerated={() => setActiveTab('gallery')} />
        </div>
        <div className={`tab-panel ${activeTab === 'gallery' ? 'active' : ''}`}>
          <Gallery room={room} onLabyrinthSelect={handleLabyrinthSelect} />
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<App />);

