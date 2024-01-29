import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  } from 'chart.js';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
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

  useEffect(() => {
    simulate(alpha, beta, gamma, delta, initialPrey, initialPredators);
  }, [alpha, beta, gamma, delta, initialPrey, initialPredators]);

  const simulate = (alpha, beta, gamma, delta, x1, x2) => {
    const dt = 0.1;
    const steps = 100;
    const D1 = 0.01;
    const D2 = 0.01;
    const nabla2 = 0;

    const x1Data: number[] = [];
    const x2Data: number[] = [];
    const timeData: number[] = [];

    for (let t = 0; t <= steps; t++) {
      let dx1 = (alpha * x1 - beta * x1 * x2 + D1 * nabla2) * dt;
      let dx2 = (delta * x1 * x2 - gamma * x2 + D2 * nabla2) * dt;
      x1 += dx1;
      x2 += dx2;

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


      <Line data={data} />
    </>
  );
};

export default LotkaVolterra;