import React from "react";

export default function ShopInfoSkelton() {
  return (
    <div className="w-full max-w-md mx-auto  space-y-4">
      {/* Top section */}
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse" />

        <div className="flex-1 space-y-2">
          {/* Shop name */}
          <div className="h-4 w-2/3 bg-gray-300 rounded animate-pulse" />
          {/* Email */}
          <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* About us */}
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Contact info */}
      <div className="space-y-2">
        <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Orders & Products */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <div className="h-10 w-full bg-gray-300 rounded-xl animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
