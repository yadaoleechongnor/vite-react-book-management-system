"use client";
import React from 'react';
import AdminLayout from './adminLayout'; // Import AdminLayout

const DashboardPage = () => {
  return (
    
      <AdminLayout>
      <div className="flex h-screen bg-gray-100 w-full">
    
   
      <div className="flex-1 p-6 w-full">
        {/* Header */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-2 text-gray-500">
            <span>10-06-2020</span>
            <span>-</span>
            <span>10-10-2020</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-Purple-300 p-4 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-primaryPurple">178+</h2>
            <p className="text-sm text-gray-500">Save</p>
          </div>
          <div className="bg-blue-500 p-4 rounded-lg shadow text-white">
            <h2 className="text-2xl font-semibold">20+</h2>
            <p className="text-sm">Products</p>
          </div>
          <div className="bg-pink-500 p-4 rounded-lg shadow text-white">
            <h2 className="text-2xl font-semibold">190+</h2>
            <p className="text-sm">Sales</p>
          </div>
          <div className="bg-orange-500 p-4 rounded-lg shadow text-white">
            <h2 className="text-2xl font-semibold">12+</h2>
            <p className="text-sm">Application</p>
          </div>
        </div>

        {/* Chart and Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <h2 className="text-lg font-semibold mb-2 md:mb-0">Overview of Latest Month</h2>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 bg-gray-100 rounded-lg text-sm">Daily</button>
                <button className="px-3 py-1 bg-gray-100 rounded-lg text-sm">Weekly</button>
                <button className="px-3 py-1 bg-gray-100 rounded-lg text-sm">Monthly</button>
                <button className="px-3 py-1 bg-gray-100 rounded-lg text-sm">Yearly</button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between mb-4">
              <div className="mb-2 sm:mb-0">
                <p className="text-2xl font-semibold">$6468.96</p>
                <p className="text-sm text-gray-500">Current Month Earnings</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">82</p>
                <p className="text-sm text-gray-500">Current Month Sales</p>
              </div>
            </div>
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">[Chart Placeholder]</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Analytics</h2>
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <p className="text-2xl font-semibold">80%</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-around mt-4">
              <div className="flex items-center mb-2 sm:mb-0">
                <div className="w-4 h-4 bg-primaryPurple rounded-full mr-2"></div>
                <span>Sale</span>
              </div>
              <div className="flex items-center mb-2 sm:mb-0">
                <div className="w-4 h-4 bg-orange rounded-full mr-2"></div>
                <span>Distribute</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-pink rounded-full mr-2"></div>
                <span>Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary and Recent Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <div className="w-8 h-8 bg-pink rounded-full mr-2"></div>
                <div>
                  <p className="text-sm font-semibold">Nikalo Updated a Task</p>
                  <p className="text-xs text-gray-500">40 Mins ago</p>
                </div>
              </li>
              <li className="flex items-center">
                <div className="w-8 h-8 bg-primaryPurple rounded-full mr-2"></div>
                <div>
                  <p className="text-sm font-semibold">Deal Added</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </li>
              <li className="flex items-center">
                <div className="w-8 h-8 bg-blue rounded-full mr-2"></div>
                <div>
                  <p className="text-sm font-semibold">Published Article</p>
                  <p className="text-xs text-gray-500">40 Mins ago</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Last Month Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-lightPink rounded-lg">
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="text-xl font-semibold">$357.80</p>
              </div>
              <div className="p-4 bg-lightBlue rounded-lg">
                <p className="text-sm text-gray-500">Referral Earnings</p>
                <p className="text-xl font-semibold">$159.53</p>
              </div>
              <div className="p-4 bg-lightPurple rounded-lg">
                <p className="text-sm text-gray-500">Estimate Sales</p>
                <p className="text-xl font-semibold">$261.50</p>
              </div>
              <div className="p-4 bg-lightOrange rounded-lg">
                <p className="text-sm text-gray-500">Earnings</p>
                <p className="text-xl font-semibold">$557.54</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-lg font-semibold mb-2 sm:mb-0">Order of Latest Month</h2>
            <input
              type="text"
              placeholder="Search"
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primaryPurple w-full sm:w-auto"
            />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500">
                <th className="p-2">INVOICE</th>
                <th className="p-2">CUSTOMERS</th>
                <th className="p-2">FROM</th>
                <th className="p-2">PRICE</th>
                <th className="p-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">12386</td>
                <td className="p-2">Charly dues</td>
                <td className="p-2">Russia</td>
                <td className="p-2">$2952</td>
                <td className="p-2">
                  <span className="bg-pink text-white px-2 py-1 rounded">Process</span>
                </td>
              </tr>
              <tr>
                <td className="p-2">12386</td>
                <td className="p-2">Charly dues</td>
                <td className="p-2">Russia</td>
                <td className="p-2">$2952</td>
                <td className="p-2">
                  <span className="bg-primaryPurple text-white px-2 py-1 rounded">Open</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            <button className="px-3 py-1 bg-gray-100 rounded-lg mx-1">1</button>
            <button className="px-3 py-1 bg-gray-100 rounded-lg mx-1">2</button>
            <button className="px-3 py-1 bg-gray-100 rounded-lg mx-1">3</button>
          </div>
        </div>
      </div>
    </div>
      </AdminLayout>
   
  );
};

export default DashboardPage;
