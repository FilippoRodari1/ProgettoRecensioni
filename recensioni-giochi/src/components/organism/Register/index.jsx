import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../atoms/input';
import Button from '../../atoms/button';

const Register = () => {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [dataNascita, setDataNascita] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Per il redirect

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Controllo campi vuoti
    if (!nome || !cognome || !dataNascita || !email || !password) {
      setError('Tutti i campi sono obbligatori.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/src/php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cognome, dataNascita, email, password }),
        credentials: 'include' 
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registrazione fallita');
      }

      setMessage('Registrazione avvenuta con successo');

      // Reindirizza alla pagina di login
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Tempo per mostrare il messaggio di successo
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-400 to-yellow-500 animate-pulse"></div>
      
      {/* Side Animations */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-b from-blue-500 to-transparent animate-slide-left"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-b from-pink-500 to-transparent animate-slide-right"></div>

      <div className="max-w-md w-full bg-gray-800 p-10 rounded-lg shadow-lg transition transform hover:scale-105 duration-300 ease-in-out relative z-10">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center animate__animated animate__fadeIn">Registrati</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <Input
            label="Nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Inserisci il tuo nome"
            className="w-full px-4 py-2 text-gray-900 bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          />
          <Input
            label="Cognome"
            type="text"
            value={cognome}
            onChange={(e) => setCognome(e.target.value)}
            placeholder="Inserisci il tuo cognome"
            className="w-full px-4 py-2 text-gray-900 bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          />
          <Input
            label="Data di Nascita"
            type="date"
            value={dataNascita}
            onChange={(e) => setDataNascita(e.target.value)}
            className="w-full px-4 py-2 text-gray-900 bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Inserisci la tua email"
            className="w-full px-4 py-2 text-gray-900 bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Inserisci la tua password"
            className="w-full px-4 py-2 text-gray-900 bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          />
          <Button 
            type="submit" 
            text="Registrati" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg"
          />
        </form>
        {message && <p className="mt-4 text-center text-blue-500">{message}</p>}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Register;
