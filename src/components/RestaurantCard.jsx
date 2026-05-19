import React from 'react'
import { Star, Clock, ArrowRight } from 'lucide-react'

export default function RestaurantCard({ restaurant, onViewMenu }) {
  const { name, cuisine, image, rating, deliveryTime } = restaurant

  return (
    <div className="bg-white rounded-3xl border border-gray-100/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
      
      {/* 1. Image Container */}
      <div className="relative overflow-hidden aspect-video w-full bg-gray-100">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-orange-600 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm">
            {cuisine}
          </span>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between text-left space-y-4">
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-gray-900 text-lg leading-snug group-hover:text-orange-500 transition-colors">
            {name}
          </h3>
          
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-1 text-gray-800">
              <Star size={14} className="fill-amber-400 text-amber-400 stroke-[1.5]" />
              <span>{rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-gray-400" />
              <span>{deliveryTime} mins</span>
            </div>
          </div>
        </div>

        {/* 3. Action Link */}
        <button
          onClick={onViewMenu}
          className="w-full flex items-center justify-center gap-2 bg-gray-50 group-hover:bg-orange-500 text-gray-700 group-hover:text-white font-extrabold text-xs py-3 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm"
        >
          <span>View Menu</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>

    </div>
  )
}
