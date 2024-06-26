import React, { useState, useEffect, useRef } from 'react';
import styles from "/styles/post.module.scss";
import { useSettingsContext } from '../utils/Theme';

const GRID_SIZE = 120;
const DELTA_T = 0.2;

type GridCell = {
  x1: number;
  x2: number;
};


const RK4ReactionDiffusion = () => {
    const [grid, setGrid] = useState<GridCell[][]>([]);
    const [gridHistory, setGridHistory] = useState<GridCell[][][]>([]); // To store history of grids
    const [historyIndex, setHistoryIndex] = useState<number>(0); // To track the current position in history
    const [displayType, setDisplayType] = useState(0);
    const [parameters, setParameters] = useState({
      alpha: 1.1,
      beta: 0.1,
      gamma: 0.7,
      delta: 0.1,
      D1: 0.1,
      D2: 0.1,
    });
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRef2 = useRef<HTMLCanvasElement | null>(null); 
  
    useEffect(() => {
      resetGrid();
    }, []);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before re-rendering
          if (displayType === 0) {
            renderGrid(grid, ctx, GRID_SIZE, GRID_SIZE);
          } else {
            renderGridSeeThrough(grid, ctx, GRID_SIZE, GRID_SIZE);
          }
        }
      }
    }, [displayType, grid]);
  
    const handleParameterChange = (parameter: keyof typeof parameters, value: string) => {
      setParameters((prevParameters) => ({ ...prevParameters, [parameter]: parseFloat(value) }));
    };
  
    const resetGrid = () => {
      const initialGrid = createInitialGrid(GRID_SIZE, GRID_SIZE);
      setGrid(initialGrid);
      setGridHistory([initialGrid]); // Reset history with only the initial grid
      setHistoryIndex(0); // Reset history index
    };

    const advanceFrame = () => {
      const nextGrid = rk4UpdateGrid(grid, parameters, GRID_SIZE, GRID_SIZE);
      applyRandomFluctuations(nextGrid, 0.01); // Apply small fluctuations with each frame
      setGrid(nextGrid);
      const newHistory = gridHistory.slice(0, historyIndex + 1); // Remove "future" states if we went back before
      setGridHistory([...newHistory, nextGrid]);
      setHistoryIndex(newHistory.length); // Update index to the latest
    };

    const changeRender = () => {
      setDisplayType((displayType===0 ? 1 : 0));
    }

    const revertFrame = () => {
      if (historyIndex > 0) {
        setGrid(gridHistory[historyIndex - 1]);
        setHistoryIndex(historyIndex - 1);
      }
    };

    const { darkTheme } = useSettingsContext();

    const imgSrc = displayType === 1
      ? `/posts/spatial-ecology/colourmapping-${darkTheme ? 'dark' : 'light'}mode-render2.png`
      : `/posts/spatial-ecology/colourmapping-${darkTheme ? 'dark' : 'light'}mode.png`;
    

  return (
    
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center' }}> {/* Adjust layout for mobile first */}
        <canvas
          key={displayType}
          className={styles.postImageContainer}
          ref={canvasRef}
          style={{ padding: '1rem', width: '100%', maxWidth: '50%', height: 'auto', aspectRatio: '1 / 1' }} // Use percentage for width and auto for height to maintain aspect ratio, with a max-width for larger screens
        />
        <img
          src={imgSrc}
          className={styles.postImageContainer}
          style={{ padding: '1rem', width: '100%', maxWidth: '50%', height: 'auto' }} // Use percentage for width and auto for height to maintain aspect ratio, with a max-width for larger screens
        />
      </div>
      <div className={styles.summarySection}>
        <label>
          Alpha:
          <input type="range" min="0" max="2" step="0.01" value={parameters.alpha} onChange={(e) => handleParameterChange('alpha', e.target.value)} />
        </label>
        <br></br>
        <label>
          Beta:
          <input type="range" min="0" max="2" step="0.01" value={parameters.beta} onChange={(e) => handleParameterChange('beta', e.target.value)} />
        </label>
        <br></br>
        <label>
          Gamma:
          <input type="range" min="0" max="2" step="0.01" value={parameters.gamma} onChange={(e) => handleParameterChange('gamma', e.target.value)} />
        </label>
        <br></br>
        <label>
          Delta:
          <input type="range" min="0" max="2" step="0.01" value={parameters.delta} onChange={(e) => handleParameterChange('delta', e.target.value)} />
        </label>
        <br></br>
        <label>
          D1 (Diffusion x1):
          <input type="range" min="0" max="1" step="0.01" value={parameters.D1} onChange={(e) => handleParameterChange('D1', e.target.value)} />
        </label>
        <br></br>
        <label>
          D2 (Diffusion x2):
          <input type="range" min="0" max="1" step="0.01" value={parameters.D2} onChange={(e) => handleParameterChange('D2', e.target.value)} />
        </label>
      </div>
      <button onClick={advanceFrame}>Forward Frame</button>
      <button onClick={revertFrame} disabled={historyIndex === 0}>Backward Frame</button>
      <button onClick={resetGrid}>Reset Grid</button>
      <button onClick={changeRender}>Change Render Style</button>
    </div>
  );
};

const applyRandomFluctuations = (grid: GridCell[][], intensity: number) => {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        grid[i][j].x1 += (Math.random() - 0.5) * intensity;
        grid[i][j].x2 += (Math.random() - 0.5) * intensity;
      }
    }
  };

function createInitialGrid(width: number, height: number): GridCell[][] {
  let grid: GridCell[][] = new Array(height);
  for (let i = 0; i < height; i++) {
    grid[i] = new Array(width);
    for (let j = 0; j < width; j++) {
      grid[i][j] = { x1: Math.random(), x2: Math.random() };
    }
  }
  return grid;
}

function rk4UpdateGrid(grid, parameters, width, height) {
  // Clone the grid to not mutate the original state directly
  let newGrid = grid.map(row => row.map(cell => ({ ...cell })));

  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      // Apply the RK4 method to each cell, considering its neighbors for the Laplacian
      // This is a simplified example and needs to be expanded to properly calculate the Laplacian and apply RK4
      const laplacianX1 = calculateLaplacian(grid, i, j, 'x1');
      const laplacianX2 = calculateLaplacian(grid, i, j, 'x2');

      newGrid[i][j].x1 = rk4Step(grid[i][j].x1, DELTA_T, (x) => parameters.alpha * x - parameters.beta * x * grid[i][j].x2 + parameters.D1 * laplacianX1);
      newGrid[i][j].x2 = rk4Step(grid[i][j].x2, DELTA_T, (x) => parameters.delta * x * grid[i][j].x1 - parameters.gamma * x + parameters.D2 * laplacianX2);
    }
  }

  return newGrid;
}

function rk4Step(currentValue, dt, derivativeFunction) {
  let k1 = dt * derivativeFunction(currentValue);
  let k2 = dt * derivativeFunction(currentValue + 0.5 * k1);
  let k3 = dt * derivativeFunction(currentValue + 0.5 * k2);
  let k4 = dt * derivativeFunction(currentValue + k3);

  return currentValue + (k1 + 2*k2 + 2*k3 + k4) / 6;
}

function calculateLaplacian(grid, i, j, variable) {
    const w1 = 0.5; // Weight for direct neighbors
    const w2 = 0.25; // Weight for diagonal neighbors
  
    const directNeighbors = grid[i+1][j][variable] + grid[i-1][j][variable] + grid[i][j+1][variable] + grid[i][j-1][variable];
    const diagonalNeighbors = grid[i+1][j+1][variable] + grid[i-1][j-1][variable] + grid[i+1][j-1][variable] + grid[i-1][j+1][variable];
  
    return w1 * directNeighbors + w2 * diagonalNeighbors - (w1 * 4 + w2 * 4) * grid[i][j][variable];
  }

  
  
  function renderGrid(grid: GridCell[][], ctx: CanvasRenderingContext2D, width: number, height: number) {
    const cellWidth = ctx.canvas.width / width;
    const cellHeight = ctx.canvas.height / height;
  
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (!grid[i] || !grid[i][j]) {
          continue; // Skip this iteration if the grid cell is not defined
        }
        // Adjust the intensity based on x1 and x2 values
        const greenIntensity = Math.floor(grid[i][j].x1 * 255);
        const redIntensity = Math.floor(grid[i][j].x2 * 255);
  
        ctx.fillStyle = `rgb(${redIntensity}, ${greenIntensity}, 0)`; // Red for x2, Green for x1
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
      }
    }
  }

  function renderGridSeeThrough(grid: GridCell[][], ctx: CanvasRenderingContext2D, width: number, height: number) {
    const cellWidth = ctx.canvas.width / width;
    const cellHeight = ctx.canvas.height / height;
    const threshold = 0.5; // Define your threshold value here
  
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (!grid[i] || !grid[i][j]) {
          continue; // Skip if the grid cell is not defined
        }
  
        let color = 'rgb(0, 0, 0)'; // Default color, in case needed
        const { x1, x2 } = grid[i][j];
  
        if (x1 > x2) {
          // If x1 is dominant and greater than the threshold, use dark green, otherwise light green
          color = x1 > threshold ? 'rgb(0, 100, 0)' : 'rgb(0, 255, 0)';
        } else {
          // If x2 is dominant and greater than the threshold, use dark red, otherwise light red
          color = x2 > threshold ? 'rgb(100, 0, 0)' : 'rgb(255, 0, 0)';
        }
  
        ctx.fillStyle = color;
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
      }
    }
  }
  
  
  export default RK4ReactionDiffusion;