import React, { useEffect, useState } from 'react';
import Sidebar from '../../organism/sideBar/sideBar';
import Navbar from '../../organism/Navbar/navbar';
import { Link } from 'react-router-dom';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import video4 from '../../videos/video4.mp4';
import video5 from '../../videos/video5.mp4';
import video6 from '../../videos/video6.mp4';
import video7 from '../../videos/video7.mp4';
import video8 from '../../videos/video8.mp4';
import video9 from '../../videos/video9.mp4';


const RetroGames = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [wishlist, setWishlist] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [videoVisible, setVideoVisible] = useState(false); // Controls video visibility

    const gamesPerPage = 20;
    const apiKey = '6f6106458dab44b9ba5f8c8e723633f7';

    const videoUrls = [
        video4,
        video5,
        video6,
        video7,
        video8,
        video9
    ];

    const [selectedVideo, setSelectedVideo] = useState(videoUrls[0]); // Track the current video

    // Load the wishlist from the backend
    const loadWishlist = async () => {
        const user = JSON.parse(localStorage.getItem('utenti')); // Get the logged-in user
        if (!user) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/src/php/wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get', user_email: user }) // Pass the user's email
            });

            const data = await response.json();
            if (data.status === 'success') {
                setWishlist(data.wishlist); // Set the wishlist if success
            }
        } catch (error) {
            console.error('Errore nel caricamento della wishlist:', error);
        }
    };

    // Fetch retro games from the API with the search query
    const fetchRetroGames = async () => {
        try {
            setLoading(true);
            const filters = [
                searchQuery ? `search=${searchQuery}` : '',
                `tags=retro`, // Ensure only retro games are fetched
            ].filter(Boolean).join('&');

            const response = await fetch(
                `https://api.rawg.io/api/games?page_size=${gamesPerPage}&page=${currentPage}&${filters}&key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error('Errore nel recupero dei dati');
            }

            const data = await response.json();
            setGames(data.results);
            setTotalPages(Math.ceil(data.count / gamesPerPage)); // Set total pages based on total count
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle adding/removing games from the wishlist
    const toggleWishlist = async (gameId) => {
        const user = JSON.parse(localStorage.getItem('utenti'));
        
        if (!user) {
            alert("Devi essere loggato per aggiungere alla wishlist");
            return;
        }

        let updatedWishlist = [...wishlist];
        const gameInWishlist = updatedWishlist.find((game) => game.game_id === gameId);

        if (gameInWishlist) {
            // Remove from wishlist
            updatedWishlist = updatedWishlist.filter((game) => game.game_id !== gameId);
            await removeFromWishlistBackend(user, gameId);
        } else {
            // Add to wishlist
            updatedWishlist.push({ game_id: gameId });
            await addToWishlistBackend(user, gameId);
        }

        setWishlist(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    };

    const addToWishlistBackend = async (user, gameId) => {
        try {
            const response = await fetch('http://localhost:8000/src/php/wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add', user_email: user, game_id: gameId })
            });

            const data = await response.json();
            if (data.status !== 'success') {
                console.error('Errore nel backend:', data.message);
            }
        } catch (error) {
            console.error("Errore nel backend", error);
        }
    };

    const removeFromWishlistBackend = async (user, gameId) => {
        try {
            const response = await fetch('http://localhost:8000/src/php/wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'remove', user_email: user, game_id: gameId })
            });

            const data = await response.json();
            if (data.status !== 'success') {
                console.error('Errore nel backend:', data.message);
            }
        } catch (error) {
            console.error("Errore nel backend", error);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to the first page when searching
    };

    useEffect(() => {
        fetchRetroGames();
        loadWishlist();
    }, [searchQuery, currentPage]);

    const handleSkipVideo = () => {
        setVideoVisible(false);
    };

    const handlePlayVideo = () => {
        setVideoVisible(true);
        setSelectedVideo(videoUrls[Math.floor(Math.random() * videoUrls.length)]); // Select a random video
    };

    const handleVideoEnd = () => {
        // Quando il video finisce, nascondi il video
        setVideoVisible(false);
    };

    return (
        <div className="flex h-screen w-full">
            <Sidebar />
            <div className="flex-1 ml-56">
                <Navbar />
                <main className="bg-gray-900 p-12 flex-1">
                    {videoVisible && (
                        <div className="absolute top-0 left-0 w-full h-full bg-black flex justify-center items-center z-50">
                            <video autoPlay controls className="w-full h-full" onEnded={handleVideoEnd}>
                                <source src={selectedVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <button 
                                onClick={handleSkipVideo} 
                                className="absolute top-4 right-4 text-white text-xl bg-black p-2 rounded-full"
                            >
                                Skip
                            </button>
                        </div>
                    )}
                    <h1 className="text-4xl font-bold text-white text-center">Giochi Retrò</h1>
                    <p className="text-white mt-4 text-center">
                        Esplora i classici giochi retrò che hanno fatto la storia del gaming. Puoi cercare i tuoi preferiti utilizzando la barra di ricerca.
                    </p>

                    {/* Search bar */}
                    <div className="flex justify-center mt-6 space-x-4 items-center">
                        <input
                            type="text"
                            placeholder="Cerca un gioco retrò..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="p-2 w-1/2 h-12 rounded-lg text-black"  // Adjusted width and height
                        />
                        {!videoVisible && (
                            <button 
                                onClick={handlePlayVideo} 
                                className="px-4 py-2 w-1/2 h-12 bg-gray-700 text-white rounded-lg"  // Adjusted width and height
                            >
                                Fai un salto nel passato!
                            </button>
                        )}
                    </div>


                    {loading ? (
                        <p className="text-white text-center mt-6">Caricamento giochi retrò...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center mt-6">Errore: {error}</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                                {games.length > 0 ? (
                                    games.map((game) => (
                                        <div key={game.id} className="relative">
                                            <Link to={`/game/${game.id}`}>
                                                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all h-80">
                                                    <img
                                                        src={game.background_image}
                                                        alt={game.name}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <div className="p-4 h-32 flex flex-col justify-between">
                                                        <h3 className="text-white text-lg font-semibold">{game.name}</h3>
                                                        <p className="text-gray-400 text-sm mt-2 truncate">Scopri di più</p>
                                                    </div>
                                                </div>
                                            </Link>

                                            {/* Heart button to add/remove from wishlist */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleWishlist(game.id);
                                                }}
                                                className={`absolute top-64 right-1 text-xl ${wishlist.some(item => item.game_id === game.id) ? 'text-red-500' : 'text-gray-400'}`}
                                            >
                                                <FontAwesomeIcon icon={faHeart} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-white text-center col-span-3">
                                        Nessun gioco trovato per la tua ricerca.
                                    </p>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className="p-2 text-white bg-gray-700 rounded-md mr-2"
                                    disabled={currentPage === 1}
                                >
                                    Precedente
                                </button>
                                <span className="text-white">{currentPage} / {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="p-2 text-white bg-gray-700 rounded-md ml-2"
                                    disabled={currentPage === totalPages}
                                >
                                    Successivo
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default RetroGames;
