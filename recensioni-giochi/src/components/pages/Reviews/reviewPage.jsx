import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../organism/sideBar/sideBar';

const ReviewPage = () => {
  const [allReviews, setAllReviews] = useState([]); 
  const [user, setUser] = useState(null); 
  const [games, setGames] = useState({});
  const [apiGames, setApiGames] = useState({}); 
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const userFromStorage = localStorage.getItem('utenti');
    if (userFromStorage) {
      setUser(JSON.parse(userFromStorage));
    }

    const savedReviews = JSON.parse(localStorage.getItem('reviews')) || {};
    console.log('Saved Reviews:', savedReviews); 

    if (user) {
      const filteredReviews = Object.entries(savedReviews)
        .map(([gameId, reviews]) => ({
          gameId,
          reviews: Array.isArray(reviews) ? reviews.filter(r => r.userId === user) : [],
        }))
        .filter(item => item.reviews.length > 0); 

      console.log('Filtered Reviews:', filteredReviews); 
      setAllReviews(filteredReviews);
    }

    const savedGames = JSON.parse(localStorage.getItem('giochi')) || {}; 
    console.log('Saved Games:', savedGames); 
    setGames(savedGames);

    const loadApiGames = async () => {
      const gamesIds = Object.keys(savedReviews);
      const gamesData = {};

      for (let gameId of gamesIds) {
        console.log('Loading game with ID:', gameId);
        try {
          const response = await fetch(`https://api.rawg.io/api/games/${gameId}?key=6f6106458dab44b9ba5f8c8e723633f7`);
          const data = await response.json();

          console.log('API response for game ID', gameId, ':', data); 

          if (data && data.id) {
            gamesData[gameId] = data; 
          } else {
            console.log('No valid data found for game ID', gameId);
          }
        } catch (error) {
          console.error('Error fetching game data for ID', gameId, ':', error);
        }
      }

      console.log('Games data from API:', gamesData);
      setApiGames(gamesData);
      setLoading(false); 
    };

    loadApiGames(); 
  }, [user]);

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen flex">
        <Sidebar />
        
        <div className="flex-grow flex items-center justify-center text-white">
          <h2 className="text-3xl font-bold text-center ml-64">Devi essere loggato per vedere le tue recensioni.</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-white">Caricamento in corso...</div>;
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen flex">
      <Sidebar />
      <div className="flex-grow p-6 ml-56">
        <h1 className="text-4xl font-bold text-white text-center mb-6">Le tue Recensioni</h1>
        <div className="grid gap-6">
          {allReviews.length > 0 ? (
            allReviews.map(({ gameId, reviews }) =>
              reviews.map((r, index) => {
                console.log('Loading game data for review, Game ID:', gameId); 

                const gameFromDb = games[gameId]; 
                const gameFromApi = apiGames[gameId]; 
                const game = gameFromDb || gameFromApi || {}; 

                console.log('Game for Review:', game); 

                const gameImage = game.background_image || 'https://st4.depositphotos.com/1010673/22791/i/450/depositphotos_227919242-stock-photo-golden-star-isolated-white-background.jpg';
                const gameImageRetro = game.background_image || game.immagine_copertura || 'https://st4.depositphotos.com/1010673/22791/i/450/depositphotos_227919242-stock-photo-golden-star-isolated-white-background.jpg';

                return (
                  <div key={`${gameId}-${index}`} className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-start mb-4">
                      {/* Game image */}
                      <img
                        src={gameFromDb ? gameImageRetro : gameImage}
                        alt={game.name || 'Gioco'}
                        className="w-20 h-20 rounded-lg mr-4 object-cover"
                      />
                      <div>
                        <Link to={`/game/${gameId}`} className="text-2xl font-bold text-blue-400 hover:underline">
                          {game.name || 'Nome del gioco non disponibile'}
                        </Link>
                        <p className="text-white">{'⭐'.repeat(r.rating)}</p>
                      </div>
                    </div>
                    <p className="text-gray-300">{r.review}</p>
                    <div className="mt-4">
                      <p className="text-blue-400">Mi piace: {r.likes}</p>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="text-white">Non hai recensioni.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
