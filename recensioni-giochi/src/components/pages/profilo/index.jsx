import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import Navbar from '../../organism/Navbar/navbar';
import Sidebar from '../../organism/sideBar/sideBar';
import principianteImg from '../../img/principiante.png';
import intermedioImg from '../../img/intermedio.png';
import avanzatoImg from '../../img/avanzato.png';
import espertoImg from '../../img/esperto.png';
import proImg from '../../img/pro.png';
import espertoSupremoImg from '../../img/espertoSupremo.png';
import leggendaImg from '../../img/leggenda.png';
import espertoRecensioniImg from '../../img/espertoRecensioni.png';
import recensoreSupremoImg from '../../img/recensoreSupremo.png';
import finaleImg from '../../img/finale.png';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState('../../img/userDefault.jpg');
  const [reviewsCount, setReviewsCount] = useState(0);
  const navigate = useNavigate();

  const trophies = [
    { name: 'Principiante', reviews: 10, image: principianteImg },
    { name: 'Intermedio', reviews: 25, image: intermedioImg },
    { name: 'Avanzato', reviews: 50, image: avanzatoImg },
    { name: 'Esperto', reviews: 75, image: espertoImg },
    { name: 'Pro', reviews: 100, image: proImg },
    { name: 'Esperto Supremo', reviews: 200, image: espertoSupremoImg },
    { name: 'Leggenda', reviews: 300, image: leggendaImg },
    { name: 'Esperto di Recensioni', reviews: 400, image: espertoRecensioniImg },
    { name: 'Recensore Supremo', reviews: 500, image: recensoreSupremoImg },
    { name: 'Master Recensore', reviews: 1000, image: finaleImg },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const userFromStorage = localStorage.getItem('utenti');
  
      if (!userFromStorage) {
        navigate('/login');
        return; // Termina l'esecuzione se non è loggato
      }
  
      const userData = JSON.parse(userFromStorage);
      setUser(userData);
  
      try {
        const response = await fetch('http://localhost:8000/src/php/getUser.php', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error('Errore nel recupero dei dati utente');
        }
  
        const data = await response.json();
  
        if (data.error) {
          navigate('/login');
        } else {
          setUser((prev) => ({ ...prev, ...data }));
  
          // Recupera l'avatar dal database
          const avatarFromDB = data.avatar || '../../img/userDefault.jpg';
          setAvatar(avatarFromDB);
        }
      } catch (error) {
        navigate('/login');
      }
  
      setLoading(false);
  
      
      // Recupero il numero di recensioni dal database
      if (userData && userData) {
        try {
          const reviewsResponse = await fetch(`http://localhost:8000/src/php/getUserReviewsCount.php?userEmail=${userData}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
    
          if (!reviewsResponse.ok) {
            throw new Error('Errore nel recupero del conteggio delle recensioni');
          }
    
          const reviewsData = await reviewsResponse.json();
    
          if (reviewsData && reviewsData.count !== undefined) {
            setReviewsCount(reviewsData.count);
          } else {
            console.error('Errore nel recupero delle recensioni');
          }
        } catch (error) {
          console.error('Errore nella chiamata API per le recensioni:', error);
        }
      } else {
        console.error('Email utente mancante');
      }
    };
    
    fetchUserData();
  }, [navigate]);
  

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/src/php/logout.php', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Errore nel logout');
      }

      localStorage.removeItem('utenti');
      localStorage.removeItem('avatar');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
  
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const avatarData = reader.result;
  
        try {
          setLoading(true);
  
          const response = await fetch('http://localhost:8000/src/php/updateAvatar.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ avatar: avatarData }),
          });
  
          const data = await response.json();
  
          if (response.ok && data.success) {
            console.log('Avatar aggiornato con successo');
            setAvatar(avatarData); // Aggiorna l'avatar nel frontend
          } else {
            console.error('Errore nel salvataggio dell\'avatar:', data.error || 'Errore sconosciuto');
          }
        } catch (error) {
          console.error('Errore nella connessione al server:', error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Il file selezionato non è un\'immagine valida.');
    }
  };
  
  
  

  const completedTrophies = trophies.filter(trophy => reviewsCount >= trophy.reviews);

  if (loading) {
    return <p className="text-white text-center">Caricamento dati utente...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 ml-56">
        <Navbar />
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
          <div className="bg-gray-800 p-10 rounded-lg shadow-lg max-w-xl w-full">
            <div className="flex flex-col items-center mb-6">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white mb-4">
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </label>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <h2 className="text-4xl font-bold text-center">Profilo Utente</h2>
            </div>
            
            <h3 className="text-2xl font-semibold mb-4">Informazioni personali</h3>
            <p className="text-lg"><strong>Nome:</strong> {user.nome}</p>
            <p className="text-lg"><strong>Cognome:</strong> {user.cognome}</p>
            <p className="text-lg"><strong>Email:</strong> {user.email}</p>
            <p className="text-lg"><strong>Data di nascita:</strong> {user.data_nascita}</p>
            <br/>
            <br/> 
            <h3 className="text-2xl font-semibold mb-4">Trofei Sbloccati</h3>
            <div className="flex flex-wrap justify-center">
              {trophies.map((trophy, index) => {
                const isUnlocked = completedTrophies.includes(trophy);
                return (
                  <div
                    key={index}
                    className={`w-32 h-38 m-4 flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg shadow-lg ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}
                  >
                    <img
                      src={trophy.image}
                      alt={trophy.name}
                      className="w-16 h-16 object-cover mb-2"
                    />
                    {isUnlocked ? (
                      <div className="text-center">
                        <p className="font-bold">{trophy.name}</p>
                        <p>{trophy.reviews} recensioni scritte</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Sbloccalo a {trophy.reviews} recensioni</p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 bg-red-500 text-white py-2 px-4 rounded-full flex items-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
