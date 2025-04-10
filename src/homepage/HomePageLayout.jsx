import React from 'react'
import HomePageNavbar from './HomePageNavbar'

function HomePageLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">

       <HomePageNavbar/>
      <main className="flex-1 p-8">
        {children}
      </main>

      <footer className="py-6 px-8 bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">&copy; {new Date().getFullYear()} BookStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePageLayout