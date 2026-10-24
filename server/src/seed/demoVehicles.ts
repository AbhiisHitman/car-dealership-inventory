import type { CreateVehicleInput } from '../validation/schemas.js';

/** A small, varied showroom so a fresh deployment has something to browse. */
export const demoVehicles: CreateVehicleInput[] = [
  { make: 'Toyota', model: 'Corolla Hybrid', category: 'Sedan', price: 23500, quantity: 8, year: 2025, color: 'Celestite Grey', description: 'Efficient daily driver with a quiet hybrid powertrain and adaptive cruise.' },
  { make: 'Honda', model: 'Civic Type R', category: 'Hatchback', price: 45890, quantity: 2, year: 2025, color: 'Championship White', description: 'Six-speed manual hot hatch tuned on the Nurburgring.' },
  { make: 'Tesla', model: 'Model Y Long Range', category: 'Electric', price: 47990, quantity: 5, year: 2026, color: 'Pearl White', description: 'Dual-motor crossover with over 500 km of range and a glass roof.' },
  { make: 'Ford', model: 'F-150 Lightning', category: 'Truck', price: 62995, quantity: 3, year: 2025, color: 'Antimatter Blue', description: 'All-electric pickup that can power your house during an outage.' },
  { make: 'Porsche', model: '911 Carrera S', category: 'Coupe', price: 131300, quantity: 1, year: 2025, color: 'Guards Red', description: 'Rear-engined icon with a twin-turbo flat six and rear-axle steering.' },
  { make: 'BMW', model: 'X5 xDrive40i', category: 'SUV', price: 67600, quantity: 4, year: 2025, color: 'Carbon Black', description: 'Five-seat luxury SUV with an inline six and air suspension.' },
  { make: 'Mazda', model: 'MX-5 Miata RF', category: 'Convertible', price: 38450, quantity: 0, year: 2025, color: 'Soul Red Crystal', description: 'Retractable hardtop roadster with a perfect 50:50 weight balance.' },
  { make: 'Hyundai', model: 'Ioniq 5 N', category: 'Electric', price: 66100, quantity: 2, year: 2026, color: 'Performance Blue', description: '641 hp electric hatch with simulated gear shifts and drift mode.' },
  { make: 'Jeep', model: 'Wrangler Rubicon', category: 'SUV', price: 51995, quantity: 6, year: 2025, color: 'Sarge Green', description: 'Removable doors, locking differentials and 33-inch mud tyres.' },
  { make: 'Mercedes-Benz', model: 'E 350 Sedan', category: 'Sedan', price: 62050, quantity: 3, year: 2026, color: 'Obsidian Black', description: 'Executive sedan with a superscreen dashboard and mild-hybrid boost.' },
  { make: 'Chevrolet', model: 'Corvette Stingray', category: 'Coupe', price: 69995, quantity: 0, year: 2025, color: 'Rapid Blue', description: 'Mid-engine V8 sports car with a removable roof panel.' },
  { make: 'Kia', model: 'EV9 GT-Line', category: 'Electric', price: 73900, quantity: 4, year: 2026, color: 'Ocean Blue', description: 'Three-row electric SUV with swivelling second-row seats.' },
  { make: 'Volkswagen', model: 'Golf GTI', category: 'Hatchback', price: 33670, quantity: 7, year: 2025, color: 'Kings Red', description: 'The original hot hatch, now with a 2.0 turbo and plaid seats.' },
  { make: 'Toyota', model: 'Tacoma TRD Pro', category: 'Truck', price: 65395, quantity: 2, year: 2025, color: 'Terra', description: 'Mid-size off-roader with IsoDynamic seats and a hybrid turbo four.' },
  { make: 'Audi', model: 'A5 Cabriolet', category: 'Convertible', price: 61200, quantity: 1, year: 2025, color: 'Navarra Blue', description: 'Four-seat soft-top with quattro all-wheel drive.' },
  { make: 'Subaru', model: 'Outback Wilderness', category: 'Wagon', price: 41720, quantity: 5, year: 2025, color: 'Geyser Blue', description: 'Lifted all-wheel-drive wagon built for gravel roads and campsites.' }
];
