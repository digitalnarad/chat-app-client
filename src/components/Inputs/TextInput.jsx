import React from "react";

function TextInput({ label, placeholder, value, onChange }) {
  return (
    <div className="text-input-component">
      <label htmlFor="TextInput" className="input-lable">
        {label}
      </label>
      <input
        type="text"
        id="TextInput"
        placeholder={placeholder}
        name="TextInput"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default TextInput;
