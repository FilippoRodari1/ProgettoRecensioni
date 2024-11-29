import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import Sidebar from '../../organism/sideBar/sideBar';

const ArtPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const bookRef = useRef(null);

  // Load games and screenshots
  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await fetch('https://api.rawg.io/api/games?key=6f6106458dab44b9ba5f8c8e723633f7');
        const data = await response.json();

        const gamesWithScreenshots = await Promise.all(data.results.map(async (game) => {
          const screenshotsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/screenshots?key=6f6106458dab44b9ba5f8c8e723633f7`);
          const screenshotsData = await screenshotsResponse.json();
          return { ...game, screenshots: screenshotsData.results };
        }));

        // Filter out games without screenshots
        const filteredGames = gamesWithScreenshots.filter(game => game.screenshots.length > 0);
        
        setGames(filteredGames);
        setLoading(false);
      } catch (error) {
        console.error('Error loading games:', error);
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  // Animation for book opening
  const bookAnimation = useSpring({
    transform: selectedGame ? 'rotateY(0deg)' : 'rotateY(90deg)',
    config: { tension: 170, friction: 26 },
  });

  const handleOpenBook = (game) => {
    setSelectedGame(game);
    setPageIndex(0);
  };

  const handleMouseDown = (e) => {
    if (e.button === 2) {  // Right click
      setIsMouseDown(true);
      setStartX(e.clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;

    const delta = e.clientX - startX;
    setDeltaX(delta);

    if (delta > 100 && pageIndex < selectedGame.screenshots.length - 1) {
      setPageIndex(pageIndex + 1);
      setStartX(e.clientX);
    } else if (delta < -100 && pageIndex > 0) {
      setPageIndex(pageIndex - 1);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setDeltaX(0);
  };

  const closeBook = () => {
    setSelectedGame(null);
  };

  const openImageModal = (image) => {
    setCurrentImage(image);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
  };

  const pageTurnStyle = useSpring({
    transform: `rotateY(${deltaX / 10}deg)`,
    config: { tension: 170, friction: 26 },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center text-white h-screen bg-gradient-to-r from-gray-900 to-gray-800">
        <h2 className="text-3xl">Caricamento in corso...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-gray-900 to-gray-800">
      <Sidebar />
      <div className="flex-grow p-6 ml-56">
        <h1 className="text-4xl font-bold text-white text-center mb-6">Art dei Giochi</h1>

        {/* Elenco dei giochi con screenshot */}
        <div className="grid grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
              onClick={() => handleOpenBook(game)}
            >
              <h2 className="text-white text-center mt-4 text-2xl font-bold">{game.name}</h2>
              <p className="text-gray-400 mt-2 text-center">Clicca per visualizzare il libro</p>
            </div>
          ))}
        </div>

        {/* Visualizzazione del libro */}
        {selectedGame && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div
              className="relative bg-white p-6 rounded-lg max-w-4xl w-full"
              ref={bookRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ cursor: 'grab' }}
            >
              <button
                className="absolute top-0 right-0 p-4 text-black"
                onClick={closeBook}
              >
                ✖
              </button>

              {/* Animazione libro */}
              <div className="relative w-full h-[80vh] flex justify-center items-center perspective-[1000px]">
                <animated.div
                  className="flex flex-row transform-style-preserve-3d transition-all duration-500"
                  style={bookAnimation}
                >

                  {/* Pagine del libro (screenshots) */}
                  <animated.div
                    className="w-full h-full bg-white flex justify-center items-center rounded-lg shadow-xl"
                    style={pageTurnStyle}
                  >
                    <img
                      src={selectedGame.screenshots[pageIndex]?.image || 'https://st4.depositphotos.com/1010673/22791/i/450/depositphotos_227919242-stock-photo-golden-star-isolated-white-background.jpg'}
                      alt={`Screenshot ${pageIndex + 1}`}
                      className="w-[80%] h-[400px] object-contain rounded-lg mx-auto cursor-pointer"
                      onClick={() => openImageModal(selectedGame.screenshots[pageIndex]?.image)}
                    />
                  </animated.div>
                </animated.div>
              </div>

              {/* Pulsanti di navigazione */}
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 p-4">
                <button
                  onClick={() => setPageIndex(pageIndex > 0 ? pageIndex - 1 : 0)}
                  className="text-black text-2xl"
                >
                  {"<"}
                </button>
              </div>
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 p-4">
                <button
                  onClick={() => setPageIndex(pageIndex < selectedGame.screenshots.length - 1 ? pageIndex + 1 : pageIndex)}
                  className="text-black text-2xl"
                >
                  {">"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal per visualizzare l'immagine ingrandita */}
        {imageModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="relative">
              <img
                src={currentImage}
                alt="Enlarged screenshot"
                className="w-[80vw] h-[80vh] object-contain rounded-lg"
              />
              <button
                className="absolute top-0 right-0 p-4 text-white"
                onClick={closeImageModal}
              >
                ✖
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtPage;
