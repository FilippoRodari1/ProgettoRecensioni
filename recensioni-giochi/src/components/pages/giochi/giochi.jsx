import React, { useEffect, useState } from 'react';
import Sidebar from '../../organism/sideBar/sideBar';
import Navbar from '../../organism/Navbar/navbar';
import { Link } from 'react-router-dom';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import video1 from '../../videos/video1.mp4';
import video2 from '../../videos/video2.mp4';


const Games = () => {
    const [games, setGames] = useState([]);
    const [genres, setGenres] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [genre, setGenre] = useState('');
    const [platform, setPlatform] = useState('');
    const [tag, setTag] = useState('');
    const [wishlist, setWishlist] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [videoVisible, setVideoVisible] = useState(false);
    const [skipVideo, setSkipVideo] = useState(false);

    const gamesPerPage = 20;
    const apiKey = '6f6106458dab44b9ba5f8c8e723633f7';

    const videoUrls = [
        video1,
        video2,
    ];

    const [selectedVideo, setSelectedVideo] = useState(videoUrls[0]); // Track the current video

    const loadWishlist = async () => {
        const user = JSON.parse(localStorage.getItem('utenti'));
        if (!user) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/src/php/wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get', user_email: user })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setWishlist(data.wishlist);
            }
        } catch (error) {
            console.error('Errore nel caricamento della wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (gameId) => {
        const user = JSON.parse(localStorage.getItem('utenti'));
        
        if (!user) {
            alert("Devi essere loggato per aggiungere alla wishlist");
            return;
        }

        let updatedWishlist = [...wishlist];
        const gameInWishlist = updatedWishlist.find((game) => game.game_id === gameId);
        
        if (gameInWishlist) {
            updatedWishlist = updatedWishlist.filter((game) => game.game_id !== gameId);
            await removeFromWishlistBackend(user, gameId);
        } else {
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

    useEffect(() => {
        fetchGames();
    }, [searchQuery, genre, platform, tag, currentPage]);

    useEffect(() => {
        fetchFilters();
        loadWishlist();
    }, []);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const filters = [
                searchQuery ? `search=${searchQuery}` : '',
                genre ? `genres=${genre}` : '',
                platform ? `platforms=${platform}` : '',
                tag ? `tags=${tag}` : '',
            ].filter(Boolean).join('&');

            const response = await fetch(`https://api.rawg.io/api/games?page_size=${gamesPerPage}&page=${currentPage}&${filters}&key=${apiKey}`);
            if (!response.ok) {
                throw new Error('Errore nel recupero dei dati');
            }
            const data = await response.json();
            setGames(data.results);
            setTotalPages(Math.ceil(data.count / gamesPerPage));
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilters = async () => {
        try {
            const [genresRes, platformsRes, tagsRes] = await Promise.all([
                fetch(`https://api.rawg.io/api/genres?key=${apiKey}`),
                fetch(`https://api.rawg.io/api/platforms?key=${apiKey}`),
                fetch(`https://api.rawg.io/api/tags?key=${apiKey}`),
            ]);

            const [genresData, platformsData, tagsData] = await Promise.all([genresRes.json(), platformsRes.json(), tagsRes.json()]);
            setGenres(genresData.results);
            setPlatforms(platformsData.results);
            setTags(tagsData.results);
        } catch (error) {
            console.error('Errore nel recupero dei filtri:', error);
        }
    };

    const handleSkipVideo = () => {
        setSkipVideo(true);
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

    const user = JSON.parse(localStorage.getItem('utenti'));

    return (
        <div className="flex h-screen w-full">
            <Sidebar />
            <div className="flex-1 ml-56">
                <Navbar />
                <main className="bg-gray-900 p-12 flex-1">
                    {user && !skipVideo && videoVisible && (
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
                    <div className='text-white text-center'>
                    <h1 className="text-4xl font-bold text-white text-center">Tutti i Giochi</h1>
                    {!videoVisible && !skipVideo && user && (
                        <button 
                            onClick={handlePlayVideo} 
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg mb-6 mt-4"
                        >
                            Guarda video di introduzione
                        </button>
                    )}
                    </div>
                    <div className="flex flex-wrap justify-center mt-2 space-x-4">
                        <input
                            type="text"
                            placeholder="Cerca un gioco..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-2 w-full md:w-1/3 rounded-lg text-black"
                        />
                        <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="p-2 w-full md:w-1/6 rounded-lg text-black"
                        >
                            <option value="">Tutti i generi</option>
                            {genres.map((g) => (
                                <option key={g.id} value={g.slug}>
                                    {g.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="p-2 w-full md:w-1/6 rounded-lg text-black"
                        >
                            <option value="">Tutte le piattaforme</option>
                            {platforms.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            className="p-2 w-full md:w-1/6 rounded-lg text-black"
                        >
                            <option value="">Tutti i tag</option>
                            {tags.map((t) => (
                                <option key={t.id} value={t.slug}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <p className="text-white text-center mt-6">Caricamento giochi...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center mt-6">Errore: {error}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                            {games.map((game) => (
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
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                        >
                            Precedente
                        </button>
                        <span className="px-4 py-2 text-white">
                            Pagina {currentPage} di {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                        >
                            Successivo
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Games;
