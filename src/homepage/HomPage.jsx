import React from 'react'
import HomePageLayout from './HomePageLayout'

function HomPage() {
  return (
    <HomePageLayout>
    <div className="max-w-7xl mx-auto p-5">
   
      {/* Hero Section */}
      <div className="bg-gray-100 py-16 px-5 text-center rounded-lg mb-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Discover Your Next Favorite Book</h1>
          <p className="text-xl mb-6">Explore thousands of books from various genres and authors</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition duration-300">Browse Collection</button>
        </div>
      </div>
      
      {/* Featured Books Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-center mb-6">Featured Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sample book cards - replace with actual data */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="h-48 bg-gray-200 mb-3 rounded"></div>
            <h3 className="font-semibold text-lg">The Great Gatsby</h3>
            <p className="text-gray-600 mb-2">F. Scott Fitzgerald</p>
            <span className="font-bold text-gray-800 block mb-3">$12.99</span>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition">Add to Cart</button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="h-48 bg-gray-200 mb-3 rounded"></div>
            <h3 className="font-semibold text-lg">To Kill a Mockingbird</h3>
            <p className="text-gray-600 mb-2">Harper Lee</p>
            <span className="font-bold text-gray-800 block mb-3">$14.99</span>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition">Add to Cart</button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="h-48 bg-gray-200 mb-3 rounded"></div>
            <h3 className="font-semibold text-lg">1984</h3>
            <p className="text-gray-600 mb-2">George Orwell</p>
            <span className="font-bold text-gray-800 block mb-3">$11.99</span>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition">Add to Cart</button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="h-48 bg-gray-200 mb-3 rounded"></div>
            <h3 className="font-semibold text-lg">The Hobbit</h3>
            <p className="text-gray-600 mb-2">J.R.R. Tolkien</p>
            <span className="font-bold text-gray-800 block mb-3">$13.99</span>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition">Add to Cart</button>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-center mb-6">Browse by Category</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gray-100 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer transition">Fiction</div>
          <div className="bg-gray-100 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer transition">Non-Fiction</div>
          <div className="bg-gray-100 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer transition">Science</div>
          <div className="bg-gray-100 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer transition">History</div>
          <div className="bg-gray-100 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer transition">Biography</div>
          <div className="bg-gray-100 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer transition">Self-Help</div>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <div className="bg-gray-100 p-10 rounded-lg text-center mb-10">
        <h2 className="text-2xl font-bold mb-3">Subscribe to Our Newsletter</h2>
        <p className="mb-6">Stay updated with the latest books and exclusive offers</p>
        <div className="flex max-w-lg mx-auto">
          <input type="email" placeholder="Enter your email" className="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-r-md transition">Subscribe</button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white p-10 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-bold text-lg mb-4">About Us</h3>
            <p>Your trusted source for quality books since 2023</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul>
              <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition">Home</a></li>
              <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition">Books</a></li>
              <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition">Categories</a></li>
              <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p className="mb-2">Email: contact@bookstore.com</p>
            <p>Phone: +123 456 7890</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center">
          <p>&copy; 2023 Book Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </HomePageLayout>
  )
}

export default HomPage