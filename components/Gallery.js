const { useState, useEffect } = React;

const Gallery = ({ room, onLabyrinthSelect }) => {
  const [labyrinths, setLabyrinths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = room.collection('labyrinth').subscribe((data) => {
      setLabyrinths(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [room]);

  if (loading) {
    return (
      <div className="loading-indicator">
        <p>Loading labyrinths...</p>
      </div>
    );
  }

  if (labyrinths.length === 0) {
    return (
      <div className="empty-gallery">
        <p>No labyrinths have been generated yet. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      {labyrinths.map((labyrinth) => (
        <div 
          key={labyrinth.id} 
          className="gallery-item"
          onClick={() => onLabyrinthSelect(labyrinth)}
        >
          <img 
            src={labyrinth.imageUrl || 'https://placehold.co/600x400/333/888?text=Labyrinth'} 
            alt={labyrinth.title} 
            className="gallery-image"
          />
          <div className="gallery-content">
            <h3 className="gallery-title">{labyrinth.title}</h3>
            <p className="gallery-description">{labyrinth.description.substring(0, 120)}...</p>
            <div className="gallery-meta">
              <span>Created by: {labyrinth.username}</span>
              <span>Complexity: {labyrinth.complexity}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

