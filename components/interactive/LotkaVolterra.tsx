import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import ZoomPlugin from 'chartjs-plugin-zoom'; 
import styles from '/styles/post.module.scss';
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

  function LVModified(t:number, [x1, x2]: number[], alpha: number, beta: number, gamma: number, delta: number, eta1: number): [number, number] {
    const dx1 = alpha * x1 * (1 - x1 / eta1) - beta * x1 * x2;
    const dx2 = -gamma * x2 + delta * x1 * x2;
    return [dx1, dx2];
  }

  function LV(t:number, [x1, x2]: number[], alpha: number, beta: number, gamma: number, delta: number): [number, number] {
    const dx1 = (alpha * x1 - beta * x1 * x2);
    const dx2 = (delta * x1 * x2 - gamma * x2);
    return [dx1, dx2];
  }

  function rk4Step(t: number, y: number[], h: number, derivatives: Function, ...params: number[]): number[] {
    const k1 = derivatives(t, y, ...params);
    const k2 = derivatives(t + h / 2, y.map((y_i, i) => y_i + h / 2 * k1[i]), ...params);
    const k3 = derivatives(t + h / 2, y.map((y_i, i) => y_i + h / 2 * k2[i]), ...params);
    const k4 = derivatives(t + h, y.map((y_i, i) => y_i + h * k3[i]), ...params);
    return y.map((y_i, i) => y_i + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  }

  useEffect(() => {
    simulate(alpha, beta, gamma, delta, eta1, initialPrey, initialPredators, useModifiedEquations);
  }, [alpha, beta, gamma, delta, eta1, initialPrey, initialPredators, useModifiedEquations]);

  const simulate = (alpha, beta, gamma, delta, eta1, x1, x2, useModified) => {
    const dt = 0.1;
    const steps = 1000;
    const x1Data: number[] = [];
    const x2Data: number[] = [];
    const timeData: number[] = [];
  
    for (let t = 0; t <= steps; t++) {
      const derivatives = useModified ? LVModified : LV;
      const nextState = rk4Step(t, [x1, x2], dt, derivatives, alpha, beta, gamma, delta, eta1);
  
      // Ensure populations do not go negative (this check is redundant with max in rk4Step but kept for safety)
      x1 = Math.max(0, nextState[0]);
      x2 = Math.max(0, nextState[1]);
  
      x1Data.push(x1);
      x2Data.push(x2);
      timeData.push(t * dt); // No need to round for display as the chart can handle floating point
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
    },
  } as ChartOptions<"line">;

  return (
    <>
    <div className={styles.summarySection}>
      <div style={{ margin: '20px' }}>
        <label> Alpha (Prey birth rate): {alpha}</label>
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
    </div>
      <Line data={data} options={options} />
    </>
  );
};

export default LotkaVolterra;