import React, { useState } from 'react';
import styles from "/styles/post.module.scss";

function CharacteristicLengthCalculator() {
  const [parameters, setParameters] = useState({
    alpha: 1.1,
    gamma: 0.7,
    D1: 0.1,
    D2: 0.1,
  });

  const handleParameterChange = (parameter, value) => {
    setParameters((prevParameters) => ({ ...prevParameters, [parameter]: parseFloat(value) }));
  };

  const calculateResult = () => {
    const { alpha, gamma, D1, D2 } = parameters;
    return Math.sqrt(D1 * gamma * (D1 * gamma + 4 * D2 * alpha)) / (D1 * D2);
  };

  return (
    <div>
      <div className={styles.summarySection}>
        <br></br>
        <label>
          Alpha: {parameters.alpha}
          <input type="range" min="0" max="2" step="0.01" value={parameters.alpha} onChange={(e) => handleParameterChange('alpha', e.target.value)} />
        </label>
        <br></br>
        <label>
          Gamma: {parameters.gamma}
          <input type="range" min="0" max="2" step="0.01" value={parameters.gamma} onChange={(e) => handleParameterChange('gamma', e.target.value)} />
        </label>
        <br></br>
        <label>
          D1 : {parameters.D1}
          <input type="range" min="0" max="1" step="0.01" value={parameters.D1} onChange={(e) => handleParameterChange('D1', e.target.value)} />
        </label>
        <br></br>
        <label>
          D2 : {parameters.D2}
          <input type="range" min="0" max="1" step="0.01" value={parameters.D2} onChange={(e) => handleParameterChange('D2', e.target.value)} />
        </label>
        <div>
        <br></br>
        Characteristic length of the Turing pattern: {Math.round(calculateResult())} px.
      </div>
      </div>
      <br></br>
    </div>
  );
}

export default CharacteristicLengthCalculator;
