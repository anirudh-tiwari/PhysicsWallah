import React from 'react';
import { Home, Briefcase, MapPin, DollarSign, Menu } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Briefcase, label: 'My Trips' },
    { icon: MapPin, label: 'Where2Go' },
    { icon: DollarSign, label: 'Trip Money' },
    { icon: Menu, label: 'More' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 pb-safe z-50">
      {navItems.map((item, index) => (
        <div 
          key={index} 
          className={`flex flex-col items-center justify-center space-y-1 cursor-pointer ${item.active ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <item.icon size={20} strokeWidth={item.active ? 3 : 2} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNav;
