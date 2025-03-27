import React from 'react'
import { FaUsers } from 'react-icons/fa'

function ClassSection() {
  return (
   <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center sm:text-left">Classes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-2 sm:mb-3">
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm w-full">
                <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">English - UNIT III</h4>
                <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">Teacher: Lorena Jimenez</p>
                <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                  <FaUsers className="mr-1" /> 14
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm w-full">
                <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">English - UNIT II</h4>
                <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">Teacher: Cole Chandler</p>
                <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                  <FaUsers className="mr-1" /> 12
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm w-full">
                <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">UNIT I</h4>
                <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">Teacher: Cole Chandler</p>
                <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                  <FaUsers className="mr-1" /> 18
                </div>
              </div>
            </div>
            <a href="#" className="block text-center sm:text-right text-blue-500 text-xs sm:text-sm">
              View All
            </a>
          </div>
  )
}

export default ClassSection