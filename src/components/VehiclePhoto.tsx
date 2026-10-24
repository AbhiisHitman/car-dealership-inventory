import { useState } from 'react';
import type { Vehicle } from '../lib/types';
import { CarArt } from './CarArt';

interface VehiclePhotoProps {
  vehicle: Pick<Vehicle, 'id' | 'make' | 'model' | 'year' | 'category' | 'color' | 'imageUrl' | 'imageCredit' | 'imageSourceUrl'>;
  className?: string;
  /** Openly licensed photos must be attributed; small thumbnails can skip the overlay. */
  showCredit?: boolean;
}

/** The vehicle's photo with its attribution, or the illustrated fallback when there is none (or it fails to load). */
export function VehiclePhoto({ vehicle, className = '', showCredit = true }: VehiclePhotoProps) {
  const [failed, setFailed] = useState(false);
  const label = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');

  if (!vehicle.imageUrl || failed) {
    return (
      <div className={`flex items-end justify-center overflow-hidden bg-gradient-to-b from-surface-3/80 to-surface-2/40 px-4 pt-8 ${className}`}>
        <CarArt category={vehicle.category} color={vehicle.color} seed={vehicle.id} className="h-full max-h-28 w-full" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface-3 ${className}`}>
      <img
        src={vehicle.imageUrl}
        alt={`${label}${vehicle.color ? ` in ${vehicle.color}` : ''}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
      />
      {showCredit && vehicle.imageCredit && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
          {vehicle.imageSourceUrl ? (
            <a
              href={vehicle.imageSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2 bottom-1.5 max-w-[90%] truncate text-[10px] text-white/75 hover:text-white hover:underline"
            >
              Photo: {vehicle.imageCredit}
            </a>
          ) : (
            <span className="absolute right-2 bottom-1.5 max-w-[90%] truncate text-[10px] text-white/75">Photo: {vehicle.imageCredit}</span>
          )}
        </>
      )}
    </div>
  );
}
