import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../organism/sideBar/sideBar';
import { FaTrashAlt, FaStar, FaThumbsUp } from 'react-icons/fa';

const RetroGameDetails = () => {
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
        const response = await fetch(`http://localhost:8000/src/php/retro_games/getGamesRetro.php?id=${id}`);
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

    fetchGameDetails();

    // Carica recensioni salvate in localStorage
    const savedReviews = JSON.parse(localStorage.getItem('retro_reviews')) || {};
    setReviews(savedReviews[id] || []);

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
        const response = await fetch('http://localhost:8000/src/php/retro_games/saveReview.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newReview),
        });

        const data = await response.json();
    
        if (data.message) {
            setMessage(data.message);
            
            // Aggiungi l'ID alla recensione, se fornito dal backend
            newReview.id = data.reviewId; // Aggiungi l'ID della recensione restituito dal backend

            // Aggiorna recensioni locali
            const savedReviews = JSON.parse(localStorage.getItem('retro_reviews')) || {};
            savedReviews[id] = [...(savedReviews[id] || []), newReview];
            localStorage.setItem('retro_reviews', JSON.stringify(savedReviews));
            setReviews(savedReviews[id]);
        } else if (data.error) {
            setMessage(data.error);
        }
    } catch (error) {
        setMessage("Errore nell'invio della recensione.");
        console.error("Errore JSON:", error);
    }
};


const handleDeleteReview = (index) => {
  if (!user) {
      setMessage('Devi essere loggato per eliminare una recensione.');
      return;
  }

  const savedReviews = JSON.parse(localStorage.getItem('retro_reviews')) || {};
  const reviewToDelete = savedReviews[id][index];

  // Controlla che l'ID dell'utente loggato corrisponda a quello della recensione
  if (reviewToDelete.userId !== user) {
      setMessage('Non puoi eliminare questa recensione.');
      return;
  }

  const updatedReviews = savedReviews[id].filter((_, i) => i !== index);
  savedReviews[id] = updatedReviews;
  setReviews(updatedReviews);
  localStorage.setItem('retro_reviews', JSON.stringify(savedReviews));
  setMessage('Recensione eliminata con successo!');

  // Assicurati di passare l'ID della recensione al backend
  const reviewId = reviewToDelete.id;  // Ora l'ID dovrebbe esistere

  fetch('http://localhost:8000/src/php/retro_games/deleteRetroReview.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          id: reviewId,          // ID della recensione
          user_id: user,         // ID dell'utente che elimina
          game_id: id,           // ID del gioco
          review: reviewToDelete.review, // Testo della recensione
          rating: reviewToDelete.rating, // Rating della recensione
          user_name: reviewToDelete.userName // Nome dell'utente
      }),
  })
  .then((response) => response.json())
  .then((data) => {
      if (data.success) {
          setMessage('Recensione eliminata con successo dal database!');
      } else {
          setMessage(data.error || 'Errore nell\'eliminazione della recensione dal database.');
      }
  })
  .catch((error) => {
      setMessage("Errore nell'invio della richiesta di eliminazione.");
      console.error("Errore nell'invio della richiesta:", error);
  });
};

  
  

  const handleLikeReview = (index) => {
    const savedReviews = JSON.parse(localStorage.getItem('retro_reviews')) || {};
    const updatedReviews = [...savedReviews[id]];
    updatedReviews[index].likes += 1;

    savedReviews[id] = updatedReviews;
    setReviews(updatedReviews);
    localStorage.setItem('retro_reviews', JSON.stringify(savedReviews));
  };

  if (loading) return <div className="text-center text-white">Caricamento...</div>;
  if (!game) return <div className="text-center text-white">{message || 'Gioco non trovato.'}</div>;

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen flex">
      <Sidebar />
      <div className="flex-grow p-6 ml-96">
        <div className="max-w-4xl w-full p-6 bg-gray-850 rounded-lg shadow-lg">
        <div className="text-center items-center justify-center">
          <h2 className="text-5xl font-extrabold text-white text-center mb-4 flex items-center justify-center">
            <span role="img" aria-label="game icon" className="mr-2">🎮</span>
            {game.nome}
          </h2>
          <div className="flex justify-center mb-4"> {/* Aggiungi questa div per centrare l'immagine */}
            <img src={game.immagine_copertura} alt={game.nome} className="w-96 h-96 rounded-lg shadow-md" />
          </div>
          <p className="text-gray-300 text-lg mt-4">{game.descrizione}</p>
        </div>

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
                    {r.userId === user && (
                      <button onClick={() => handleDeleteReview(index)} className="text-red-500 hover:underline">
                        <FaTrashAlt />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300">{r.review}</p>
                  <div className="flex items-center mt-2">
                    <FaThumbsUp onClick={() => handleLikeReview(index)} className="cursor-pointer text-blue-400 mr-1" />
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

export default RetroGameDetails;
