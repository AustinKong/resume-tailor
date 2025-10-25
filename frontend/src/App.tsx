import { useState } from 'react';
import './App.css';

function App() {
  const [health, setHealth] = useState<string | null>(null);

  return (
    <>
      <div>
        <button onClick={() => {
          fetch('/api/health')
            .then(response => response.json())
            .then(data => setHealth(data.message))
        }}>
          Healthcheck
        </button>
        <p>{health}</p>
      </div>
    </>
  );
}

export default App;
