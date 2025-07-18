import React from "react";
import "./CrazyLoader.css";

const CrazyLoader = ({ label = "Loading..." }) => {
  return (
    <div className="crazy-loader-container">
      <div className="crazy-loader">
        <span className="ring ring1"></span>
        <span className="ring ring2"></span>
        <span className="ring ring3"></span>
      </div>
      <p className="loader-text">{label}</p>
    </div>
  );
};

export default CrazyLoader;
