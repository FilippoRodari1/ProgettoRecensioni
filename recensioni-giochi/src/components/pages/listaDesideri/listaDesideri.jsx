import React, { useEffect, useState } from 'react';
import Sidebar from '../../organism/sideBar/sideBar';
import Navbar from '../../organism/Navbar/navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const ListaDesideriPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);
    const [suggestedGames, setSuggestedGames] = useState([]);

    // Funzione per caricare la wishlist
    const loadWishlist = async () => {
        const user = JSON.parse(localStorage.getItem('utenti'));
        if (!user) {
            return (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen flex">
                    <Sidebar />
                    <div className="flex-grow flex items-center justify-center text-white">
                        <h2 className="text-3xl font-bold text-center ml-64">Devi essere loggato per vedere la tua lista Desideri</h2>
                    </div>
                </div>
            );
        }

        try {
            const response = await fetch('http://localhost:8000/src/php/wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get',
                    user_email: user,
                }),
            });

            const text = await response.text();
            if (text.trim() === '') {
                throw new Error('La risposta del server è vuota');
            }

            const data = JSON.parse(text);
            if (data.status === 'success') {
                const wishlistWithDetails = await Promise.all(data.wishlist.map(async (game) => {
                    const gameResponse = await fetch(`https://api.rawg.io/api/games/${game.game_id}?key=6f6106458dab44b9ba5f8c8e723633f7`);
                    const gameData = await gameResponse.json();

                    return {
                        ...game,
                        name: gameData.name,
                        background_image: gameData.background_image,
                        genres: gameData.genres || [], // Aggiungi i generi del gioco
                    };
                }));
                setWishlist(wishlistWithDetails);
                setLoading(false);
                loadSuggestedGames(wishlistWithDetails); // Carica i giochi suggeriti
            } else {
                alert(data.message || 'Errore nel recupero della wishlist');
                setLoading(false);
            }
        } catch (error) {
            console.error('Errore nel caricamento della wishlist:', error);
            setLoading(false);
        }
    };

    // Funzione per caricare i giochi suggeriti basati sull'ultimo gioco aggiunto
    const loadSuggestedGames = async (wishlist) => {
        if (wishlist.length === 0) return;
    
        const lastGame = wishlist[wishlist.length - 1];
        let lastGameName = lastGame.name;
    
        console.log('Nome dell\'ultimo gioco:', lastGameName); 
    
        if (!lastGameName) return; 
    
        // Funzione per estrarre il nome base della serie (senza numeri)
        const getBaseName = (name) => {
            return name.replace(/\d+$/, '').trim();
        };
    
        // Estrai il nome base della serie
        const baseGameName = getBaseName(lastGameName);
        console.log('Nome base della serie:', baseGameName);
    
        if (!baseGameName) return;
    
        try {
            // Cerca giochi che hanno il nome base della serie
            const suggestedGamesResponse = await fetch(`https://api.rawg.io/api/games?key=6f6106458dab44b9ba5f8c8e723633f7&search=${baseGameName}&ordering=-rating&page_size=30`);
            
            const suggestedGamesData = await suggestedGamesResponse.json();
            console.log('Risposta API:', suggestedGamesData); 
    
            // Filtra i giochi che hanno il nome base ma non sono esattamente lo stesso gioco
            const filteredGames = suggestedGamesData.results.filter(game => {
                // Verifica che il gioco abbia il nome base e sia una sequela
                return game.name.toLowerCase().includes(baseGameName.toLowerCase()) && game.name !== lastGameName;
            });
    
            // Se ci sono giochi suggeriti validi, prendi solo i primi 3
            const firstThreeGames = filteredGames.slice(0, 3);
    
            if (firstThreeGames.length > 0) {
                setSuggestedGames(firstThreeGames);
            } else {
                console.log("Nessun gioco trovato per la serie:", baseGameName);
                // Se non ci sono giochi suggeriti, cerca 3 giochi casuali in base al nome del gioco
                const randomGamesResponse = await fetch(`https://api.rawg.io/api/games?key=6f6106458dab44b9ba5f8c8e723633f7&search=${lastGameName}&ordering=-rating&page_size=30`);
                
                const randomGamesData = await randomGamesResponse.json();
                console.log('Risposta API per giochi casuali:', randomGamesData);
    
                // Prendi 3 giochi casuali dal risultato
                const randomGames = randomGamesData.results.slice(0, 3);
                if (randomGames.length > 0) {
                    setSuggestedGames(randomGames);
                } else {
                    console.log("Nessun gioco trovato per il nome:", lastGameName);
                    setSuggestedGames([]); 
                }
            }
        } catch (error) {
            console.error("Errore nel caricamento dei giochi suggeriti:", error);
            setSuggestedGames([]);
        }
    };
    
    // Funzione per rimuovere un gioco dalla wishlist
    const removeFromWishlist = async (gameId) => {
        const user = JSON.parse(localStorage.getItem('utenti'));
        if (!user) {
            alert("Devi essere loggato per rimuovere un gioco dalla wishlist");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/src/php/wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'remove', user_email: user, game_id: gameId })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setRemoving(gameId);
                setTimeout(() => {
                    setWishlist(prevWishlist =>
                        prevWishlist.filter(game => game.game_id !== gameId)
                    );
                }, 800);
            } else {
                console.error('Errore nel backend:', data.message);
            }
        } catch (error) {
            console.error("Errore nel backend", error);
        }
    };

    // Funzione per aggiungere un gioco suggerito alla wishlist
    const addToWishlist = async (gameId) => {
        const user = JSON.parse(localStorage.getItem('utenti'));
        if (!user) {
            alert("Devi essere loggato per aggiungere un gioco alla wishlist");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/src/php/wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add', user_email: user, game_id: gameId })
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert("Gioco aggiunto alla wishlist");
                loadWishlist(); // Ricarica la wishlist dopo l'aggiunta
            } else {
                console.error('Errore nel backend:', data.message);
            }
        } catch (error) {
            console.error("Errore nel backend", error);
        }
    };

    useEffect(() => {
        loadWishlist();
    }, []); // Solo al primo caricamento della pagina

    useEffect(() => {
        if (wishlist.length > 0) {
            loadSuggestedGames(wishlist); // Carica i giochi suggeriti ogni volta che la wishlist cambia
        }
    }, [wishlist]); // Aggiorna quando la wishlist cambia

    return (
        <div className="flex h-screen w-full bg-gray-800">
            <Sidebar />
            <div className="flex-1 ml-56">
                <Navbar />
                <main className="bg-gray-900 p-12 flex-1">
                    <h1 className="text-4xl font-bold text-white text-center">La tua Lista Desideri</h1>
                    {loading ? (
                        <p className="text-white text-center mt-6">Caricamento...</p>
                    ) : wishlist.length === 0 ? (
                        <p className="text-white text-center mt-6">Nessun gioco in lista desideri.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                            {wishlist.map((game) => (
                                <div
                                    key={game.game_id}
                                    className={`relative transition-all duration-800 transform ${removing === game.game_id ? 'opacity-0 rotate-180 scale-75' : 'opacity-100'}`}
                                >
                                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all h-80">
                                        <Link to={`/game/${game.game_id}`}>
                                            <img
                                                src={game.background_image || 'https://via.placeholder.com/400x300.png?text=Immagine+non+disponibile'}
                                                alt={game.name || 'Gioco senza titolo'}
                                                className="w-full h-48 object-cover"
                                            />
                                        </Link>
                                        <div className="p-4 flex flex-col items-center">
                                            <h3 className="text-xl font-bold text-white text-center">{game.name || 'Titolo non disponibile'}</h3>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    removeFromWishlist(game.game_id);
                                                }}
                                                className="text-red-500 px-2 py-1 rounded-md mt-2"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-2xl" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Giochi suggeriti */}
                    <div className="mt-12">
                        <h2 className="text-3xl text-white text-center mb-6">Giochi Suggeriti</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {suggestedGames.map((game) => (
                                <div key={game.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                    <Link to={`/game/${game.id}`}>
                                        <img
                                            src={game.background_image || 'https://via.placeholder.com/400x300.png?text=Immagine+non+disponibile'}
                                            alt={game.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    </Link>
                                    <div className="p-4 text-center">
                                        <h3 className="text-xl font-bold text-white">{game.name}</h3>
                                        <button
                                            onClick={() => addToWishlist(game.id)}
                                            className="text-blue-500 px-2 py-1 rounded-md mt-2"
                                        >
                                            Aggiungi alla wishlist
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ListaDesideriPage;
