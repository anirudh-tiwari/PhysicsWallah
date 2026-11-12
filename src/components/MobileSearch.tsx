import React from 'react';
import { Search, MapPin } from 'lucide-react';

const MobileSearch: React.FC = () => {
  return (
    <div className="px-4 pb-6 bg-white">
      <div className="bg-gray-100 rounded-xl p-4 flex items-center shadow-inner cursor-pointer active:bg-gray-200 transition-colors">
        <Search size={18} className="text-gray-400 mr-3" />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-blue-600 uppercase">Where to?</p>
          <p className="text-sm font-bold text-gray-800">Explore flights, hotels & more</p>
        </div>
        <div className="border-l border-gray-300 pl-3 flex items-center">
          <MapPin size={18} className="text-blue-500" />
        </div>
      </div>
      
      <div className="flex overflow-x-auto space-x-3 mt-4 no-scrollbar pb-1">
        {['Nearby', 'Goa', 'Mumbai', 'Delhi', 'Bangalore', 'Dubai'].map((tag) => (
          <div key={tag} className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 whitespace-nowrap text-xs font-semibold text-gray-600">
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileSearch;
