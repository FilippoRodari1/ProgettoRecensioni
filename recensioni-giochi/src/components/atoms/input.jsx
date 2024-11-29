
import React from 'react';

const Input = ({ label, type, value, onChange, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-2 text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-400 rounded-md bg-gray-800 text-white focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};

export default Input;
