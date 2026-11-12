import React from 'react';
import { User, ChevronRight } from 'lucide-react';

const MobileHeader: React.FC = () => {
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center">
        <img 
          src="https://imgak.mmtcdn.com/pwa_v3/pwa_hotel_assets/header/logo@2x.png" 
          alt="MakeMyTrip" 
          className="h-8"
        />
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 cursor-pointer shadow-sm">
          <div className="bg-blue-100 p-1 rounded-full mr-2">
            <User size={14} className="text-blue-600" />
          </div>
          <span className="text-xs font-bold text-gray-800">Login/Signup</span>
          <ChevronRight size={14} className="text-gray-400 ml-1" />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
