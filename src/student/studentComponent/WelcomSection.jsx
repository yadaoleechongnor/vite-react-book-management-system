import React from 'react'
import { FaBook } from 'react-icons/fa'

function WelcomSection() {
  return (
    <div className="flex flex-col sm:flex-row justify-between bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
      <div className="mb-4 sm:mb-0">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Welcome back, Stella Walton!</h2>
        <p className="text-gray-500 text-xs sm:text-sm mb-3">
          New French speaking classes available for B1 and B2 levels!{' '}
          <a href="#" className="text-red-500 font-bold">
            LEARN MORE
          </a>
        </p>
        <button className="bg-gray-200 text-gray-700 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm">
          Buy Lesson
        </button>
      </div>
      <div className="flex justify-center sm:justify-end">
        <FaBook className="text-6xl sm:text-8xl text-red-500" />
      </div>
    </div>
  )
}

export default WelcomSection