const { useState, useEffect, useRef } = React;

const MobileControls = ({ onJoystickMove, onToggleAudio, isAudioPlaying, hasAudio }) => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const [touching, setTouching] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  
  const handleTouchStart = (e) => {
    e.preventDefault();
    setTouching(true);
    updateJoystickPosition(e);
  };
  
  const handleTouchMove = (e) => {
    if (!touching) return;
    e.preventDefault();
    updateJoystickPosition(e);
  };
  
  const handleTouchEnd = (e) => {
    e.preventDefault();
    setTouching(false);
    setJoystickPos({ x: 0, y: 0 });
    if (onJoystickMove) {
      onJoystickMove(0, 0);
    }
  };
  
  const updateJoystickPosition = (e) => {
    if (!joystickRef.current || !knobRef.current) return;
    
    const touch = e.touches[0];
    const joystick = joystickRef.current;
    const rect = joystick.getBoundingClientRect();
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate position relative to center
    let x = touch.clientX - rect.left - centerX;
    let y = touch.clientY - rect.top - centerY;
    
    // Normalize position
    const radius = rect.width / 2;
    const distance = Math.sqrt(x * x + y * y);
    
    if (distance > radius) {
      x = (x / distance) * radius;
      y = (y / distance) * radius;
    }
    
    // Update knob position
    setJoystickPos({ x, y });
    
    // Normalize for movement (between -1 and 1)
    const normalizedX = x / radius;
    const normalizedY = -y / radius; // Invert Y for forward/backward
    
    if (onJoystickMove) {
      onJoystickMove(normalizedX, normalizedY);
    }
  };
  
  return (
    <div className="mobile-controls">
      <div 
        ref={joystickRef}
        className="joystick-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={knobRef}
          className="joystick-knob"
          style={{
            transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
          }}
        ></div>
      </div>
      
      <div className="action-buttons">
        {hasAudio && (
          <div 
            className="action-button"
            onClick={onToggleAudio}
          >
            {isAudioPlaying ? '🔊' : '🔇'}
          </div>
        )}
        <div 
          className="action-button look-button"
          onTouchStart={() => document.documentElement.requestFullscreen()}
        >
          🔍
        </div>
      </div>
    </div>
  );
};

