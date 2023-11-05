import React, { useState, useEffect } from 'react';

function StackedBarChart() {
  // State variables
  const [tooltip, setTooltip] = useState({
    active: false,
    emotion: '',
    percentage: 0,
    value: 0,
    x: 0,
    y: 0,
  });

  const [selectedEmotion, setSelectedEmotion] = useState('All');

  const emotions = [
    'All', 'Emotion1', 'Emotion2', 'Emotion3', 'Emotion4', 'Emotion5', 'Emotion6', 'Emotion7',
  ];

  const [stackedBarCharts, setStackedBarCharts] = useState([
    {
      emotions: generateRandomEmotions(),
    },
  ]);

  // Event handlers
  const showTooltip = (emotionName, emotionValue, x, y) => {
    setTooltip({
      active: true,
      emotion: emotionName,
      value: emotionValue,
      percentage: (emotionValue * 100).toFixed(2),
      x,
      y,
    });
  };

  const hideTooltip = () => {
    setTooltip({ ...tooltip, active: false });
  };

  const addNewChart = () => {
    const newChart = {
      emotions: generateRandomEmotions(),
    };
    setStackedBarCharts([...stackedBarCharts, newChart]);
  };

  // Utility functions
  function sumEmotionValues(emotions) {
    return emotions.reduce((total, emotion) => total + emotion.value, 0);
  }

  function interpolateColor(startColor, endColor, percentage) {
    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * percentage);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * percentage);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * percentage);
    return [r, g, b];
  }

  function generateRandomEmotions() {
    const numEmotions = 8;
    const emotions = [];
    const startColor = [0, 0, 255]; // Blue
    const endColor = [255, 0, 0]; // Red

    let randomValues = Array.from({ length: numEmotions - 1 }, () => Math.random());

    const totalValue = randomValues.reduce((total, value) => total + value, 0);
    randomValues = randomValues.map((value) => value / totalValue);

    let currentTotalValue = 0;

    for (let i = 1; i <= numEmotions; i++) {
      const value = i === numEmotions ? 1 - currentTotalValue : randomValues[i - 1];
      const percentage = i / numEmotions;
      const gradientColor = interpolateColor(startColor, endColor, percentage);
      emotions.push({
        name: `Emotion${i}`,
        value: value,
        color: `rgb(${gradientColor[0]}, ${gradientColor[1]}, ${gradientColor[2]})`,
      });
      currentTotalValue += value;
    }

    return emotions;
  }

  // Compute graph data
  const graphData = selectedEmotion === 'All' ? stackedBarCharts : 
    stackedBarCharts.map((chart) => {
      const selectedEmotionData = chart.emotions.find((e) => e.name === selectedEmotion);
      const totalValue = chart.emotions.reduce((total, emotion) => total + emotion.value, 0);
      const scaleFactor = totalValue > 0 ? 1 / totalValue : 0;

      return {
        emotions: chart.emotions.map((emotion) => ({
          ...emotion,
          value: emotion.name === selectedEmotion ? emotion.value : 0,
          width: totalValue > 0 ? `${(emotion.value * scaleFactor) * 100}%` : '0%',
        }),
      )};
    });

  // Set up tooltip position
  useEffect(() => {
    const container = document.querySelector('.container');
    if (container) {
      container.addEventListener('mousemove', (e) => {
        setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
      });
    }
  }, []);

  // Return JSX for the component
  return (
    <div className="container">
      {graphData.map((chart, chartIndex) => (
        <div key={chartIndex} className="stacked-bar-chart">
          <div className="line-number">{chartIndex + 1}</div>
          {chart.emotions.map((emotion, emotionIndex) => (
            <div
              key={emotionIndex}
              className="bar"
              style={{ width: `${emotion.value * 100}%`, backgroundColor: emotion.color }}
              onMouseOver={(e) => showTooltip(emotion.name, emotion.value, e.clientX, e.clientY)}
              onMouseOut={hideTooltip}
            >
              <div className="emotion-text">{emotion.name}</div>
            </div>
          ))}
        </div>
      ))}
      <div className="window-bar">
        EmotionWindow
        <label htmlFor="emotionSelect">Select Emotion: </label>
        <select
          id="emotionSelect"
          value={selectedEmotion}
          onChange={(e) => setSelectedEmotion(e.target.value)}
        >
          {emotions.map((emotion) => (
            <option key={emotion} value={emotion}>
              {emotion}
            </option>
          ))}
        </select>
      </div>
      {/* Tooltip Element */}
      {tooltip.active && (
        <div className="tooltip" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
          {tooltip.emotion}: {tooltip.percentage}% ({tooltip.value})
        </div>
      )}
      {/* add button */}
      <button onClick={addNewChart}>Add Chart</button>
    </div>
  );
}

export default StackedBarChart;
