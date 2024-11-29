
import React from 'react';

const BoxGame = ({ game }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4">
      <img 
        src={game.background_image || 'default-image-url.jpg'} 
        alt={game.name} 
        className="w-full h-48 object-cover" 
      />
      <h2 className="text-xl font-bold text-white mt-2">{game.name}</h2>
      <p className="text-gray-300">Release Date: {game.released}</p>
      <p className="text-gray-300">Rating: {game.rating}</p>
      <p className="text-gray-300">Platforms: {game.platforms.map(platform => platform.platform.name).join(', ')}</p>
      <p className="text-gray-400 mt-2">{game.short_screenshots[0] ? 'Screenshot available' : 'No screenshots available'}</p>
    </div>
  );
};

export default BoxGame;
