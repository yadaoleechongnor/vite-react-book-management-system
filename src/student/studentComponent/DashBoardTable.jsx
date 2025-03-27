import React from 'react'
import { FaDownload, FaUserCircle } from 'react-icons/fa'

function DashBoardTable() {
  return (
    <div className="w-full lg:w-2/3 bg-white p-3 sm:p-6 rounded-xl shadow-sm overflow-x-auto">
    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center sm:text-left">Lessons</h3>
    <div className="overflow-x-auto -mx-3 px-3">
      <table className="w-full text-xs sm:text-sm border-collapse min-w-full">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left py-1 sm:py-3 px-1 sm:px-4">Class</th>
            <th className="text-left py-1 sm:py-3 px-1 sm:px-4">Teacher</th>
            <th className="text-left py-1 sm:py-3 px-1 sm:px-4">Members</th>
            <th className="text-left py-1 sm:py-3 px-1 sm:px-4">Starting</th>
            <th className="text-left py-1 sm:py-3 px-1 sm:px-4">Material</th>
            <th className="text-left py-1 sm:py-3 px-1 sm:px-4">Payment</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1 sm:py-3 px-1 sm:px-4">A1</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">Bernard Carr</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4 flex">
              <FaUserCircle className="text-base sm:text-xl mr-1" />
              <FaUserCircle className="text-base sm:text-xl mr-1" />
              <FaUserCircle className="text-base sm:text-xl" />
            </td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">12-12-2022</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">
              <button className="flex items-center bg-gray-200 text-gray-700 px-1 sm:px-3 py-1 rounded-full text-xs">
                <FaDownload className="mr-1" /> Download
              </button>
            </td>
            <td className="py-1 sm:py-3 px-1 sm:px-4 text-blue-500">Done</td>
          </tr>
          <tr>
            <td className="py-1 sm:py-3 px-1 sm:px-4">A1</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">Henry Poole</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4 flex">
              <FaUserCircle className="text-base sm:text-xl mr-1" />
              <FaUserCircle className="text-base sm:text-xl mr-1" />
              <FaUserCircle className="text-base sm:text-xl" />
            </td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">17-12-2022</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">
              <button className="flex items-center bg-gray-200 text-gray-700 px-1 sm:px-3 py-1 rounded-full text-xs">
                <FaDownload className="mr-1" /> Download
              </button>
            </td>
            <td className="py-1 sm:py-3 px-1 sm:px-4 text-red-500">Pending</td>
          </tr>
          <tr>
            <td className="py-1 sm:py-3 px-1 sm:px-4">A1</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">Helena Lowe</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4 flex">
              <FaUserCircle className="text-base sm:text-xl mr-1" />
              <FaUserCircle className="text-base sm:text-xl mr-1" />
              <FaUserCircle className="text-base sm:text-xl" />
            </td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">22-07-2022</td>
            <td className="py-1 sm:py-3 px-1 sm:px-4">
              <button className="flex items-center bg-gray-200 text-gray-700 px-1 sm:px-3 py-1 rounded-full text-xs">
                <FaDownload className="mr-1" /> Download
              </button>
            </td>
            <td className="py-1 sm:py-3 px-1 sm:px-4 text-blue-500">Done</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  )
}

export default DashBoardTable