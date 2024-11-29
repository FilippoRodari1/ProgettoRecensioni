import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../organism/sideBar/sideBar';
import { FaUserCircle, FaTrashAlt, FaStar, FaThumbsUp } from 'react-icons/fa';

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!id) {
      setMessage('ID del gioco mancante.');
      setLoading(false);
      return;
    }
  
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`https://api.rawg.io/api/games/${id}?key=6f6106458dab44b9ba5f8c8e723633f7`);
        const data = await response.json();
        if (data.error) {
          setMessage('Gioco non trovato.');
        } else {
          setGame(data);
        }
        setLoading(false);
      } catch (error) {
        setMessage('Errore nel caricamento dei dettagli del gioco.');
        console.error("Errore nel caricamento dei dettagli del gioco:", error);
        setLoading(false);
      }
    };
  
    const fetchGameReviews = async () => {
      try {
        const response = await fetch(`https://api.rawg.io/api/games/${id}/reviews?key=6f6106458dab44b9ba5f8c8e723633f7`);
        const data = await response.json();
        if (data.results) {
          const apiReviews = data.results.map((review) => ({
            userName: review.user?.username || 'Anonimo',
            review: review.text || '',
            rating: review.rating || 0,
            likes: review.likes_count || 0,
            userId: null, // Distinguere dalle recensioni locali
            apiSource: true, // Per sapere che viene dall'API
          }));
  
          // Aggiungere solo recensioni uniche
          setReviews((prevReviews) => {
            const allReviews = [...prevReviews, ...apiReviews];
            const uniqueReviews = allReviews.filter((value, index, self) => 
              index === self.findIndex((t) => (
                t.userName === value.userName && t.review === value.review
              ))
            );
            return uniqueReviews;
          });
        }
      } catch (error) {
        console.error("Errore nel caricamento delle recensioni dall'API:", error);
      }
    };
  
    fetchGameDetails();
    fetchGameReviews();
  
    // Carica recensioni salvate in localStorage
    const savedReviews = JSON.parse(localStorage.getItem('reviews')) || {};
    const savedGameReviews = savedReviews[id] || [];
    
    // Unire le recensioni locali con quelle salvate senza duplicati
    setReviews((prevReviews) => {
      const allReviews = [...savedGameReviews, ...prevReviews];
      const uniqueReviews = allReviews.filter((value, index, self) => 
        index === self.findIndex((t) => (
          t.userName === value.userName && t.review === value.review
        ))
      );
      return uniqueReviews;
    });
  
    const userFromStorage = localStorage.getItem('utenti');
    if (userFromStorage) {
      setUser(JSON.parse(userFromStorage));
      console.log("Utente salvato:", userFromStorage);
    }
  }, [id]);
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage('Devi essere loggato per scrivere una recensione.');
      return;
    }
  
    const userName = user || 'Anonimo'; 
    const newReview = { 
      userName, 
      review, 
      rating, 
      gameId: id,
      userId: user,
      likes: 0
    };
  
    try {
      const response = await fetch('http://localhost:8000/src/php/reviews.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });
      const data = await response.json();
  
      if (data.message) {
        setMessage(data.message);
  
        // Aggiungi la recensione a localStorage senza duplicazioni
        const savedReviews = JSON.parse(localStorage.getItem('reviews')) || {};
        savedReviews[id] = [...(savedReviews[id] || []), newReview];
        localStorage.setItem('reviews', JSON.stringify(savedReviews));
  
        // Aggiungi la recensione anche allo stato locale
        setReviews(savedReviews[id]);
      } else if (data.error) {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Errore nell'invio della recensione.");
      console.error("Errore JSON:", error);
    }
  };

  const handleDeleteReview = async (index) => {
    if (!user) {
      setMessage('Devi essere loggato per eliminare una recensione.');
      return;
    }
  
    const reviewToDelete = reviews[index];
    if (!reviewToDelete || !reviewToDelete.gameId || !reviewToDelete.userId) {
      setMessage('Dati mancanti per eliminare la recensione.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8000/src/php/deleteReview.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: reviewToDelete.userId,
          game_id: reviewToDelete.gameId,
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        setMessage(data.message);
        // Aggiorna le recensioni localmente
        const updatedReviews = reviews.filter((_, i) => i !== index);
        setReviews(updatedReviews);
      } else {
        setMessage(data.error);
      }

      if (data.success) {
        // Aggiorna localStorage
        const savedReviews = JSON.parse(localStorage.getItem('reviews')) || {};
        const { gameId, userId } = reviewToDelete;
    
        if (savedReviews[gameId]) {
          const updatedReviews = savedReviews[gameId].filter(
            (review) => review.userId !== userId
          );
          if (updatedReviews.length > 0) {
            savedReviews[gameId] = updatedReviews;
          } else {
            delete savedReviews[gameId];
          }
          localStorage.setItem('reviews', JSON.stringify(savedReviews));
        }
    
        // Aggiorna lo stato
        const updatedReviews = reviews.filter((_, i) => i !== index);
        setReviews(updatedReviews);
      }
    } catch (error) {
      setMessage('Errore nella connessione al server.');
      console.error('Errore:', error);
    }
  };
  
  
  const handleLikeReview = (index) => {
    const savedReviews = JSON.parse(localStorage.getItem('reviews')) || {};
    const updatedReviews = [...savedReviews[id]];
    updatedReviews[index].likes += 1;

    savedReviews[id] = updatedReviews;
    setReviews(updatedReviews);
    localStorage.setItem('reviews', JSON.stringify(savedReviews));
  };

  if (loading) return <div className="text-center text-white">Caricamento...</div>;
  if (!game) return <div className="text-center text-white">{message || 'Gioco non trovato.'}</div>;

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen flex">
      <Sidebar />
      <div className="flex-grow p-6 ml-96">
        <div className="max-w-4xl w-full p-6 bg-gray-850 rounded-lg shadow-lg">
          <h2 className="text-5xl font-extrabold text-white text-center mb-4">{game.name}</h2>
          <img src={game.background_image} alt={game.name} className="w-full h-96 object-cover rounded-lg shadow-md" />
          <p className="text-gray-300 text-lg mt-4">{game.description_raw}</p>
          <br/><br/>
          <p className="text-gray-300 text-sm mt-3">Data di uscita: {game.released}</p>
          <p className="text-gray-300 text-sm mt-3">Piattaforme: {game.platforms?.map(p => p.platform.name).join(', ')}</p>
          <p className="text-gray-300 text-sm mt-3">Generi: {game.genres?.map(g => g.name).join(', ')}</p>
          <p className="text-gray-300 text-sm mt-3">Metacritic: {game.metacritic}</p>
          <p className="text-gray-300 text-sm mt-3">Sviluppatori: {game.developers?.map(d => d.name).join(', ')}</p>
          <p className="text-gray-300 text-sm mt-3">Publisher: {game.publishers?.map(p => p.name).join(', ')}</p>
          {game.clip?.clip && (
            <video controls className="w-full mt-4 rounded-lg shadow-md">
              <source src={game.clip.clip} type="video/mp4" />
              Il tuo browser non supporta il video.
            </video>
          )}
          {game.stores?.length > 0 && (
            <p className="text-gray-300 text-sm mt-2">
              Negozio: <a href={game.stores[0].url} className="text-blue-400 underline">{game.stores[0].store.name}</a>
            </p>
          )}
          <br/><br/><br/>

         

          <h3 className="text-3xl font-bold text-white mt-6">Recensioni</h3>
          {user && (
            <div className="text-white mt-2">
              <strong>Benvenuto, {user}</strong> 
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="mt-4">
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Scrivi la tua recensione..."
              className="w-full h-32 p-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
            />
            <div className="flex items-center my-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <FaStar
                  key={num}
                  onClick={() => setRating(num)}
                  className={`cursor-pointer ${rating >= num ? 'text-yellow-500' : 'text-gray-400'}`}
                />
              ))}
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Invia recensione
            </button>
          </form>
          {message && <p className="text-red-500">{message}</p>}

          {reviews.length > 0 ? (
            <ul className="mt-4">
              {reviews.map((r, index) => (
                <li key={index} className="bg-gray-800 p-4 rounded-lg mb-2">
                  <div className="flex justify-between items-center">
                    <p className="text-white">
                      <strong>{r.userName}</strong> - {Array(r.rating).fill('⭐').join('')}
                    </p>
                    {!r.apiSource && r.userId === user && (
                      <button onClick={() => handleDeleteReview(index)} className="text-red-500 hover:underline">
                        <FaTrashAlt />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300">{r.review}</p>
                  <div className="flex items-center mt-2">
                    <FaThumbsUp
                      onClick={() => !r.apiSource && handleLikeReview(index)}
                      className={`cursor-pointer ${r.apiSource ? 'text-gray-500' : 'text-blue-400'} mr-1`}
                    />
                    <span className="text-gray-300">{r.likes} </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-300">Nessuna recensione ancora.</p>
          )}

        </div>
      </div>
    </div>
  );
};

export default GameDetails;
