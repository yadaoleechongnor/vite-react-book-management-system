"use client"; // Add this directive since we're using client-side interactivity

import { useState } from "react";
import { useRouter } from "next/router";
import { FcNext } from "react-icons/fc";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  AiOutlineDashboard,
  AiOutlineSwap,
  AiOutlineWallet,
  AiOutlineAim,
  AiOutlineMoneyCollect,
  AiOutlineLineChart,
  AiOutlineSetting,
  AiOutlineQuestionCircle,
  AiOutlineLogout,
} from "react-icons/ai"; // Importing icons from react-icons

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      {/* Toggle Icon */}
      <div
        className="absolute top-16 right-[-20px] flex items-center justify-center p-2 cursor-pointer bg-white rounded-full border-r-1"
        onClick={toggleSidebar}
      >
        {isExpanded ? (
          <IoChevronBackOutline className="text-gray-600 text-2xl" />
        ) : (
          <FcNext className="text-gray-600 text-2xl" />
        )}
      </div>

      {/* Logo */}
      <div className="flex items-center justify-center p-4">
        <span
          className={`text-2xl font-bold text-purple-600 transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          FinSet
        </span>
      </div>

      {/* Sidebar Items */}
      <div className="flex-1 flex flex-col space-y-2 mt-4">
        <SidebarItem
          icon={<AiOutlineDashboard />}
          label="Dashboard"
          isExpanded={isExpanded}
          path="/teacher/dashboard"
        />
        <SidebarItem
          icon={<AiOutlineSwap />}
          label="Transactions"
          isExpanded={isExpanded}
          path="/transactions"
        />
        <SidebarItem
          icon={<AiOutlineWallet />}
          label="Wallet"
          isExpanded={isExpanded}
          path="/wallet"
        />
        <SidebarItem
          icon={<AiOutlineAim />}
          label="Goals"
          isExpanded={isExpanded}
          path="/goals"
        />
        <SidebarItem
          icon={<AiOutlineMoneyCollect />}
          label="Budget"
          isExpanded={isExpanded}
          path="/budget"
        />
        <SidebarItem
          icon={<AiOutlineLineChart />}
          label="Analytics"
          isExpanded={isExpanded}
          path="/analytics"
        />
        <SidebarItem
          icon={<AiOutlineSetting />}
          label="Settings"
          isExpanded={isExpanded}
          path="/settings"
        />
        <SidebarItem
          icon={<AiOutlineQuestionCircle />}
          label="Help"
          isExpanded={isExpanded}
          path="/help"
        />
        <SidebarItem
          icon={<AiOutlineLogout />}
          label="Log out"
          isExpanded={isExpanded}
          path="/logout"
        />
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, isExpanded, path }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(path);
  };

  return (
    <div
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
        isExpanded ? "justify-start" : "justify-center"
      }`}
      onClick={handleClick}
    >
      <div className="text-gray-600 text-lg">{icon}</div>
      <span
        className={`ml-4 text-gray-700 transition-opacity duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0"
        } ${isExpanded ? "block" : "hidden"}`}
      >
        {label}
      </span>
    </div>
  );
}
