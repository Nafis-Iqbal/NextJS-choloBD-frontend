"use client";

import React from 'react';

type StarRatingProps = {
  rating: number; // Float between 0 and 5
  max?: number;   // Number of stars to show, default 5
  className?: string;
};

export const StarRating: React.FC<StarRatingProps> = ({ rating, max = 5, className = "" }) => {
  const stars = [];

  for (let i = 0; i < max; i++) {
    const fillLevel = Math.min(Math.max(rating - i, 0), 1) * 100;
    stars.push(
      <div key={i} className={`relative w-6 h-6 inline-block ${className}`}>
        {/* Background empty star */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute w-full h-full text-gray-300"
        >
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24
             l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46
             4.73L5.82 21z"
            fill="currentColor"
          />
        </svg>

        {/* Filled part */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute w-full h-full text-yellow-400"
          style={{ clipPath: `inset(0 ${100 - fillLevel}% 0 0)` }}
        >
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24
             l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46
             4.73L5.82 21z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return <div className={`flex ${className}`}>{stars}</div>;
};
