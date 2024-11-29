import React from 'react';

const SidebarItem = ({ text, icon, onClick }) => {
  return (
    <div onClick={onClick} className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer">
      <span className="text-white"><i className={icon}></i></span>
      <span className="text-white">{text}</span>
    </div>
  );
};

export default SidebarItem;
