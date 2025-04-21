import React from 'react'
import { useNavigate } from 'react-router-dom'
import HomePageLayout from './HomePageLayout'

function About() {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate('/login');
  };

  return (
    <HomePageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
          Digital Library Portal
        </h1>
        
        <section className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About Our Online Library</h2>
          <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
            Experience unlimited access to our vast collection of digital resources, e-books, and academic materials. Our online library is designed to serve students, researchers, and knowledge seekers worldwide.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To provide accessible digital knowledge resources and promote global learning through our innovative online platform.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Digital Services</h3>
            <ul className="space-y-2 text-gray-600">
              <li>📚 E-book Downloads</li>
              <li>📱 Mobile Reading App</li>
              <li>🔍 Advanced Search Tools</li>
              <li>💻 Virtual Study Rooms</li>
              <li>📖 Online Catalogs</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Available 24/7</h3>
            <div className="text-gray-600">
              <p className="mb-2">Access our services anytime:</p>
              <p>✓ 24/7 Digital Access</p>
              <p>✓ Real-time Support</p>
              <p>✓ Instant Downloads</p>
              <p>✓ Global Availability</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">Get in Touch</h3>
            <div className="text-gray-600">
              <p className="mb-2">📧 support@digitallibrary.com</p>
              <p className="mb-2">💬 Live Chat Support</p>
              <p className="mb-2">🌐 help.digitallibrary.com</p>
              <p>📱 Mobile App Support</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={handleExplore}
            className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </HomePageLayout>
  )
}

export default About