import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import ZoomPlugin from 'chartjs-plugin-zoom'; 
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
  } from 'chart.js';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ZoomPlugin
  );

interface ChartDataset {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }
  
  interface ChartState {
    labels: number[];
    datasets: ChartDataset[];
  }

const LotkaVolterra = () => {
  const [alpha, setAlpha] = useState(1.1);
  const [beta, setBeta] = useState(0.1);
  const [gamma, setGamma] = useState(0.7);
  const [delta, setDelta] = useState(0.1);
  const [eta1, setEta1] = useState(15);
  const [eta2, setEta2] = useState(15);
  const [useModifiedEquations, setUseModifiedEquations] = useState(false);
  const [initialPrey, setInitialPrey] = useState(10);
  const [initialPredators, setInitialPredators] = useState(5);
  const [zoomLevel, setZoomLevel] = useState(1); // Start with a default zoom level of 1
  const chartRef = useRef(null);
  const [data, setData] = useState<ChartState>({
    labels: [],
    datasets: [
      {
        label: 'Prey Population (x1)',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Predator Population (x2)',
        data: [],
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    simulate(alpha, beta, gamma, delta, eta1, eta2, initialPrey, initialPredators, useModifiedEquations);
  }, [alpha, beta, gamma, delta, eta1, eta2, initialPrey, initialPredators, useModifiedEquations]);

  const simulate = (alpha, beta, gamma, delta, eta1, eta2, x1, x2, useModified) => {
      const dt = 0.1;
      const steps = 100;
      const x1Data: number[] = [];
      const x2Data: number[] = [];
      const timeData: number[] = [];

      for (let t = 0; t <= steps; t++) {
          let dx1, dx2;
          if (useModified) {
              // Modified equations
              dx1 = alpha * x1 * (1 - x1 / eta1) - beta * x1 * x2;
              dx2 = - gamma * x2  + delta * x1 * x2;
          } else {
              // Original Lotka-Volterra equations
              dx1 = (alpha * x1 - beta * x1 * x2) * dt;
              dx2 = (delta * x1 * x2 - gamma * x2) * dt;
          }

          x1 += dx1;
          x2 += dx2;
          // x1 = Math.max(5, Math.min(x1, 100)); 
          // x2 = Math.max(0, Math.min(x2, 100));
          x1Data.push(x1);
          x2Data.push(x2);
          timeData.push(Math.round(t * dt * 10) / 10); // Round to one decimal place
      }

      setData({
          labels: timeData,
          datasets: [
              {
                  ...data.datasets[0],
                  data: x1Data,
              },
              {
                  ...data.datasets[1],
                  data: x2Data,
              },
          ],
      });
  };

  const options = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
      },
      y: {
        min: 0, // Set the minimum suggested value to 0
        suggestedMax: 50, // Adjust the maximum suggested value according to your data range
        max: 100,
        ticks: {
          callback: function(val:number, index, ticks) {
            if (Math.abs(val) < 1e-3 ) return 0;
            return val;
          }
        }
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
    // Use the afterUpdate hook to adjust tick configuration
    onAfterUpdate: function(chart) {
      const xScale = chart.scales.x;
      const range = xScale.max - xScale.min; // Determine the current range of the x-axis
  
      // Adjust tick step size based on the range
      if (range > 20) { // Example condition, adjust based on your data and requirements
        xScale.options.ticks.stepSize = 10; // Increase step size for wider range
      } else {
        xScale.options.ticks.stepSize = 1; // Default step size for closer range
      }
      // chart.update();
      // You might need to call chart.update() if changing the tick options directly doesn't take effect,
      // but be cautious as it can cause an infinite loop if not handled correctly.
    },
  } as ChartOptions<"line">;

  return (
    <>
      <div style={{ margin: '20px' }}>
        <label>Alpha (Prey birth rate): {alpha}</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={alpha}
          onChange={(e) => setAlpha(Number(e.target.value))}
        />
      </div>

      <div style={{ margin: '20px' }}>
        <label>Beta (Prey death rate per predator): {beta}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={beta}
          onChange={(e) => setBeta(Number(e.target.value))}
        />
      </div>

      <div style={{ margin: '20px' }}>
        <label>Gamma (Predator death rate): {gamma}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={gamma}
          onChange={(e) => setGamma(Number(e.target.value))}
        />
      </div>

      <div style={{ margin: '20px' }}>
        <label>Delta (Predator birth rate per prey): {delta}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
        />
      </div>

      <div style={{ margin: '20px' }}>
        <label>Initial Prey Population: {initialPrey}</label>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={initialPrey}
          onChange={(e) => setInitialPrey(Number(e.target.value))}
        />
      </div>

      <div style={{ margin: '20px' }}>
        <label>Initial Predator Population: {initialPredators}</label>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={initialPredators}
          onChange={(e) => setInitialPredators(Number(e.target.value))}
        />
      </div>

      <div style={{ margin: '20px' }}>
        <label>Use Modified Equations:</label>
        <input
            type="checkbox"
            checked={useModifiedEquations}
            onChange={(e) => setUseModifiedEquations(e.target.checked)}
        />
      </div>

      { useModifiedEquations &&
        <>
        <div style={{ margin: '20px' }}>
          <label>Prey Carrying Capacity: {eta1}</label>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={eta1}
            onChange={(e) => setEta1(Number(e.target.value))} />
        </div>
        </>
      }

      <Line data={data} options={options} />
    </>
  );
};

export default LotkaVolterra;