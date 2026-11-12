import React from 'react';

const offers = [
  {
    id: 1,
    title: 'Flat 15% OFF* on Domestic Flights',
    desc: 'Use Code: MMTSPECIAL',
    image: 'https://promos.mmtcdn.com/promos/dt/promos/dt_offers_1.jpg',
    category: 'FLIGHTS'
  },
  {
    id: 2,
    title: 'Up to 25% OFF* on International Hotels',
    desc: 'Limited Period Offer',
    image: 'https://promos.mmtcdn.com/promos/dt/promos/dt_offers_2.jpg',
    category: 'HOTELS'
  },
  {
    id: 3,
    title: 'Flat ₹500 OFF* on Bus Bookings',
    desc: 'Valid for New Users',
    image: 'https://promos.mmtcdn.com/promos/dt/promos/dt_offers_3.jpg',
    category: 'BUSES'
  }
];

const Offers: React.FC = () => {
  return (
    <div className="bg-gray-50 py-6">
      <div className="px-4 flex justify-between items-center mb-4">
        <h2 className="text-lg font-black text-gray-800">Offers for You</h2>
        <span className="text-blue-600 text-xs font-bold uppercase">View All</span>
      </div>
      
      <div className="flex overflow-x-auto space-x-4 px-4 no-scrollbar">
        {offers.map((offer) => (
          <div key={offer.id} className="min-w-[280px] bg-white rounded-xl shadow-sm overflow-hidden flex border border-gray-100">
            <div className="w-24">
              <img 
                src={offer.image} 
                alt={offer.title} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/100x100?text=${offer.category}`;
                }}
              />
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">{offer.category}</span>
                <h3 className="font-bold text-xs mt-0.5 line-clamp-2 leading-tight">{offer.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1">{offer.desc}</p>
              </div>
              <div className="text-blue-600 text-[10px] font-bold uppercase mt-2">Book Now</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
