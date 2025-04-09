"use client";
import React from "react";
import AdminLayout from "./adminLayout"; // Import AdminLayout
import TimeCalendar from "../AdminComponents/TimeCalendar";
import CardAllBook from "../AdminComponents/CardAllBook";
import AllDownLoaded from "../AdminComponents/AllDownLoaded";
import CardBanchInform from "../AdminComponents/CardBanchInform";
import CardDeparmentInform from "../AdminComponents/CardDeparmentInform";
import CardFacultyInform from "../AdminComponents/CardFacultyInform";
import DownloadTrends from "../AdminComponents/DownloadTrends";

const DashboardPage = () => {
  return (
    <AdminLayout>
      <div className="flex h-screen bg-gray-100 w-full">
        <div className="flex-1 p-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <CardAllBook />
            <AllDownLoaded />
            <CardBanchInform />
            <CardDeparmentInform />
            <CardFacultyInform />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 gap-4 mb-6">
            <DownloadTrends />
            <div className="bg-white p-4 rounded-lg shadow">
              <TimeCalendar />
            </div>
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 bg-pink rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-semibold">
                      Nikalo Updated a Task
                    </p>
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
          </div> */}

          {/* Orders Table */}
          {/* <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h2 className="text-lg font-semibold mb-2 sm:mb-0">
                Order of Latest Month
              </h2>
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
                    <span className="bg-pink text-white px-2 py-1 rounded">
                      Process
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2">12386</td>
                  <td className="p-2">Charly dues</td>
                  <td className="p-2">Russia</td>
                  <td className="p-2">$2952</td>
                  <td className="p-2">
                    <span className="bg-primaryPurple text-white px-2 py-1 rounded">
                      Open
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              <button className="px-3 py-1 bg-gray-100 rounded-lg mx-1">
                1
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded-lg mx-1">
                2
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded-lg mx-1">
                3
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
