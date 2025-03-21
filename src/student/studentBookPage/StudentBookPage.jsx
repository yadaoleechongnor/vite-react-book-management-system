import React, { useEffect, useState } from "react";
import book_img from "../../../public/images/book_img.jpeg";
import StudentLayout from "../studentComponent/StudentLayout";
import { API_BASE_URL } from "../../utils/api";

function StudentBookPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${API_BASE_URL}/v1/books`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setBooks(result.data.books || []);
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Function to truncate title if longer than 50 characters
  const truncateTitle = (title) => {
    if (title.length > 50) {
      return title.substring(0, 47) + "...";
    }
    return title;
  };

  return (
    <StudentLayout>
      <div className="border p-6 min-h-screen bg-gradient-to-b from-[#fdf6e3] to-[#f7e8c5] flex justify-center">
        <div className="w-full p-6 bg-[#fdf6e3] shadow-lg rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <button className="px-4 py-2 bg-[#e4c99b] text-white rounded-lg">Shelves</button>
            <input
              type="text"
              placeholder="Search in My Library"
              className="p-2 border border-gray-300 rounded-lg w-1/2"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">Available Books</h3>

          {loading ? (
            <p className="text-center text-gray-500">Loading books...</p>
          ) : books.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book, index) => (
                <div
                  key={`${book.id}-${index}`}
                  className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center justify-between h-full"
                >
                  <div className="mb-2 flex flex-col ">
                    <img
                      src={book_img}
                      alt={`Preview of ${book.title}`}
                      className="w-auto mb-2"
                    />
                    <h4 className="text-sm text-left ">{truncateTitle(book.title)}</h4>
                    <p className="text-sm text-gray-600 text-left">ຂຽນໂດຍ:ທ່ານ {book.author}</p>
                  </div>
                  {book.book_file?.url && (
                    <a
                      href={book.book_file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto px-3 py-1 bg-blue-500 text-white rounded-lg w-full text-center"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No books available</p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentBookPage;