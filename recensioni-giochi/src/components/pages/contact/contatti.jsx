import React from 'react';
import Navbar from '../../organism/Navbar/navbar';
import Sidebar from '../../organism/sideBar/sideBar';


const ContactPage = () => {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 ml-56">
        {/* Navbar */}
        <Navbar />
        <main className="bg-gray-900 p-12 flex-1 text-white">
          <h1 className="text-4xl font-bold text-center mb-6">Contattami</h1>
          <p className="text-center text-gray-300 mb-12">
            Sono qui per rispondere a qualsiasi domanda tu abbia. Scrivimi o connettiti con me attraverso i social!
          </p>
          <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Scrivimi un messaggio</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Inserisci il tuo nome"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Inserisci la tua email"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300">Messaggio</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Scrivi il tuo messaggio qui"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-200"
              >
                Invia Messaggio
              </button>
            </form>
          </div>

        <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Connettiti con me</h2>
            <div className="flex justify-center space-x-6">
                {/* LinkedIn */}
                <a
                href="https://www.linkedin.com/in/filippo-rodari-7b73502a2/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition duration-200 text-2xl"
                >
                <i className="fab fa-linkedin"></i>
                </a>
                {/* GitHub */}
                <a
                href="https://github.com/FilippoRodari1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition duration-200 text-2xl"
                >
                <i className="fab fa-github"></i>
                </a>
            </div>
        </div>

        </main>
      </div>
    </div>
  );
};

export default ContactPage;
