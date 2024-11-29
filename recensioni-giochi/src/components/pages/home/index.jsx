import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { Bar, Doughnut, Pie, Scatter } from 'react-chartjs-2'; 
import Navbar from '../../organism/Navbar/navbar';
import Sidebar from '../../organism/sideBar/sideBar';

// Funzione per recuperare gli utenti dal backend
const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:8000/src/php/recuperoUtenti.php', {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Errore nel recupero degli utenti');
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

// Funzione per recuperare i giochi dall'API RAWG
const fetchGames = async () => {
  const response = await fetch('https://api.rawg.io/api/games?page=1&key=6f6106458dab44b9ba5f8c8e723633f7');
  const data = await response.json();
  return data.results;
};

const Homepage = () => {
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetchUsers();
        const gamesData = await fetchGames();
        setUsers(usersData.slice(0, 5)); 
        setGames(gamesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

// Grafico: Giochi più recensiti e valutazione media
const gamesChartData = {
  labels: games.slice(0, 5).map(game => game.name), // Nomi dei primi 5 giochi
  datasets: [
    {
      label: 'Numero di Recensioni',
      data: games.slice(0, 5).map(game => game.ratings_count || 0), // Uso del valore delle recensioni
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      type: 'bar', // Barra per il numero di recensioni
    },
    {
      label: 'Valutazione Media',
      data: games.slice(0, 5).map(game => game.rating || 0), // Media delle valutazioni
      backgroundColor: 'rgba(255, 159, 64, 0.6)', // Cambia il colore della linea
      borderColor: 'rgba(255, 159, 64, 1)', // Linea
      borderWidth: 1,
      type: 'line', // Linea per la valutazione
      tension: 0.4, // Effetto curvato sulla linea
      fill: false, // Non riempi sotto la linea
    },
  ],
};

const gamesChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: 'top', labels: { color: 'white' } },
    tooltip: {
      callbacks: {
        label: (context) => {
          if (context.dataset.label === 'Valutazione Media') {
            return `${context.label}: ${context.raw.toFixed(1)} / 5`; // Mostra la valutazione media con una cifra decimale
          }
          return `${context.label}: ${context.raw} recensioni`; // Numero di recensioni
        },
      },
    },
  },
};

 const genresCount = {};

  // Conta i giochi per genere su tutto il dataset
  games.forEach(game => {
    game.genres.forEach(genre => {
      genresCount[genre.name] = (genresCount[genre.name] || 0) + 1;
    });
  });
  
  const genresChartData = {
    labels: Object.keys(genresCount), // Nomi dei generi
    datasets: [
      {
        label: 'Numero di Giochi per Genere',
        data: Object.values(genresCount), // Conteggio dei giochi per genere
        backgroundColor: Object.keys(genresCount).map(
          (_, index) => `hsl(${(index * 360) / Object.keys(genresCount).length}, 70%, 60%)`
        ), // Colori dinamici
      },
    ],
  };
  
  const genresChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top', // Posizione della legenda
        labels: {
          color: 'white', // Colore del testo nella legenda
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label; // Nome del genere
            const value = context.raw; // Numero di giochi per quel genere
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0); // Totale dei giochi
            const percentage = ((value / total) * 100).toFixed(2); // Calcolo della percentuale
            return `${label}: ${percentage}%`; // Mostra nome e percentuale
          },
        },
      },
    },
  };
  
// Calcolare il totale dei giochi
const totalGames = games.length;

// Conta i giochi per anno di rilascio
const releaseYearCount = games.reduce((acc, game) => {
  const year = new Date(game.released).getFullYear();
  acc[year] = (acc[year] || 0) + 1;
  return acc;
}, {});

// Assicurarsi che ogni anno tra il 1995 e il 2024 sia incluso, anche se non ci sono giochi
const allYears = Array.from({ length: 2018 - 2003 + 1 }, (_, i) => 2003 + i);
const completeReleaseYearCount = allYears.reduce((acc, year) => {
  acc[year] = releaseYearCount[year] || 0;
  return acc;
}, {});

// Calcolare la percentuale per ogni anno
const releaseYearPercentages = allYears.map(year => {
  const gamesInYear = completeReleaseYearCount[year];
  return ((gamesInYear / totalGames) * 100).toFixed(2); // Percentuale di giochi per anno
});

// Impostare i dati del grafico
const releaseYearChartData = {
  labels: allYears, // Anni dal 1995 al 2024
  datasets: [
    {
      label: 'Percentuale di Giochi per Anno di Rilascio',
      data: releaseYearPercentages, // Percentuali per ogni anno
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};



  // Grafico: Giochi per Piattaforma
  const platformChartData = {
    labels: [...new Set(games.flatMap(game => game.platforms.map(platform => platform.platform.name)))],
    datasets: [
      {
        label: 'Giochi per Piattaforma',
        data: [...new Set(games.flatMap(game => game.platforms.map(platform => platform.platform.name)))].map(platform => 
          games.filter(game => game.platforms.some(p => p.platform.name === platform)).length
        ),
        backgroundColor: ['#FF6347', '#FFD700', '#32CD32', '#4B0082', '#FF1493'],
      },
    ],
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 ml-56">
        <Navbar />
        <main className="bg-gray-900 p-12 flex-1">
          <h1 className="text-4xl font-bold text-white text-center">Benvenuto in GameReview</h1>
          <p className="text-white mt-4 text-center">Scopri giochi e guarda cosa ne pensano gli altri!</p>
          
          {loading ? (
            <p className="text-white">Caricamento...</p>
          ) : error ? (
            <p className="text-red-500">Errore: {error}</p>
          ) : (
            <>
              {/* Classifica Utenti */}
              <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Classifica Utenti</h2>
                <table className="w-full text-left text-white">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-700 pb-2">Posizione 🏆 </th>
                      <th className="border-b border-gray-700 pb-2">Nome</th>
                      <th className="border-b border-gray-700 pb-2">Recensioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={index}>
                        <td className="py-2">
                        <span className={index + 1 === 1 ? 'text-yellow-500' : index + 1 === 2 ? 'text-gray-400' : index + 1 === 3 ? 'text-orange-500' : ''}>
                          {index + 1}
                        </span>
                        {index + 1 === 1 && " 🥇"} {/* Medaglia d'oro per il primo */}
                        {index + 1 === 2 && " 🥈"} {/* Medaglia d'argento per il secondo */}
                        {index + 1 === 3 && " 🥉"} {/* Medaglia di bronzo per il terzo */}
                      </td>

                        <td className="py-2">{`${user.nome} ${user.cognome}`}</td>
                        <td className="py-2">{user.reviewCount}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* Grafici affiancati */}
              <div className="mt-8 grid grid-cols-2 gap-8">
                {/* Grafico Giochi Più Recensiti e Valutazione Media */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-4">Giochi più Recensiti e Valutazione Media</h2>
                  <Scatter 
                    data={gamesChartData} 
                    options={{ ...gamesChartOptions, fill: true }} 
                    height={150} 
                    width={150} 
                  />
                </div>

                {/* Grafico Giochi per Genere */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-4">Distribuzione per Genere</h2>
                  <Doughnut 
                    data={genresChartData} 
                    options={genresChartOptions} 
                    height={150} 
                    width={150}
                  />
                </div>
              </div>

              {/* Grafici sotto affiancati */}
              <div className="mt-8 grid grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Distribuzione dei Giochi per Anno di Rilascio</h2>
                <Bar 
                  data={releaseYearChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { position: 'top', labels: { color: 'white' } },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.label}: ${context.raw} %`,
                        },
                      },
                    },
                  }} 
                  height={150} 
                  width={150}
                />
              </div>


                {/* Grafico Giochi per Piattaforma */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-4">Giochi per Piattaforma</h2>
                  <Pie 
                    data={platformChartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: true, 
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const percentage = context.raw; // Valore assoluto
                              const total = context.chart._metasets[0].total; // Somma totale dei dati
                              const percent = ((percentage / total) * 100).toFixed(2); // Calcola la percentuale
                              return `${context.label}: ${percent}%`;
                            },
                          },
                        },
                      },
                    }} 
                    height={150} 
                    width={150}
                  />
                </div>

              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Homepage;
