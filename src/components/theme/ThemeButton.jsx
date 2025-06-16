import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeButton.css';

const ThemeButton = () => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      className="theme-button"
      onClick={() => setDarkMode(!darkMode)}
      style={{
        backgroundColor: darkMode ? '#ffffff' : '#333333',
        color: darkMode ? '#333333' : '#ffffff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeButton;
