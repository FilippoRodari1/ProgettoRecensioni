import React from 'react';
import { Link } from 'react-router-dom';

const NavItem = ({ text, to }) => {
  return (
    <li className="mx-4">
      <Link to={to} className="text-white hover:text-blue-400 transition">
        {text}
      </Link>
    </li>
  );
};

export default NavItem;
