import React from 'react';
import { Plane, Hotel, Home, Palmtree, Train, Bus, Car, DollarSign } from 'lucide-react';

const services = [
  { icon: Plane, label: 'Flights', color: 'bg-blue-100', iconColor: 'text-blue-600' },
  { icon: Hotel, label: 'Hotels', color: 'bg-orange-100', iconColor: 'text-orange-600' },
  { icon: Home, label: 'Homestays', color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { icon: Palmtree, label: 'Holidays', color: 'bg-green-100', iconColor: 'text-green-600' },
  { icon: Train, label: 'Trains', color: 'bg-red-100', iconColor: 'text-red-600' },
  { icon: Bus, label: 'Buses', color: 'bg-purple-100', iconColor: 'text-purple-600' },
  { icon: Car, label: 'Cabs', color: 'bg-blue-100', iconColor: 'text-blue-600' },
  { icon: DollarSign, label: 'Forex', color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
];

const ServiceNav: React.FC = () => {
  return (
    <div className="bg-white px-4 py-6">
      <div className="grid grid-cols-4 gap-y-6 gap-x-2">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center cursor-pointer transition-transform active:scale-95"
          >
            <div className={`w-12 h-12 ${service.color} rounded-2xl flex items-center justify-center mb-1.5 shadow-sm`}>
              <service.icon size={24} className={service.iconColor} />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 text-center">
              {service.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceNav;
