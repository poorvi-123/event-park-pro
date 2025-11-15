import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Seat {
  row: string;
  number: number;
  section: string;
  price: number;
  isBooked: boolean;
  isSelected: boolean;
}

interface SeatMapProps {
  layout: {
    sections: Array<{
      name: string;
      rows: string[];
      columns: number[];
      price: number;
      color: string;
    }>;
  };
  bookedSeats: string[];
  onSeatSelect: (seats: string[]) => void;
  onPriceChange: (total: number) => void;
}

export function SeatMap({ layout, bookedSeats, onSeatSelect, onPriceChange }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize seats from layout
    const allSeats: Seat[] = [];
    layout.sections.forEach((section) => {
      section.rows.forEach((row) => {
        section.columns.forEach((col) => {
          const seatId = `${section.name}-${row}${col}`;
          allSeats.push({
            row,
            number: col,
            section: section.name,
            price: section.price,
            isBooked: bookedSeats.includes(seatId),
            isSelected: false,
          });
        });
      });
    });
    setSeats(allSeats);
  }, [layout, bookedSeats]);

  const toggleSeat = (seatId: string, seat: Seat) => {
    if (seat.isBooked) return;

    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatId)) {
      newSelected.delete(seatId);
    } else {
      if (newSelected.size >= 10) {
        return; // Limit to 10 seats
      }
      newSelected.add(seatId);
    }

    setSelectedSeats(newSelected);
    onSeatSelect(Array.from(newSelected));

    // Calculate total price
    const total = Array.from(newSelected).reduce((sum, id) => {
      const seat = seats.find((s) => `${s.section}-${s.row}${s.number}` === id);
      return sum + (seat?.price || 0);
    }, 0);
    onPriceChange(total);
  };

  const getSeatStatus = (seat: Seat, seatId: string) => {
    if (seat.isBooked) return 'booked';
    if (selectedSeats.has(seatId)) return 'selected';
    return 'available';
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-muted border-2 border-border" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-muted-foreground/20" />
          <span>Booked</span>
        </div>
      </div>

      {/* Screen */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-full max-w-3xl h-2 bg-gradient-to-r from-transparent via-foreground to-transparent rounded-full opacity-20" />
        <p className="text-sm text-muted-foreground">Screen</p>
      </div>

      {/* Seat Sections */}
      <div className="space-y-8">
        {layout.sections.map((section) => (
          <div key={section.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  style={{
                    borderColor: section.color,
                    color: section.color,
                  }}
                >
                  {section.name}
                </Badge>
                <span className="text-sm text-muted-foreground">₹{section.price}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {section.rows.map((row) => (
                <div key={`${section.name}-${row}`} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-muted-foreground font-mono">{row}</span>
                  <div className="flex gap-1 flex-wrap">
                    {section.columns.map((col) => {
                      const seatId = `${section.name}-${row}${col}`;
                      const seat = seats.find(
                        (s) => s.section === section.name && s.row === row && s.number === col
                      );
                      if (!seat) return null;

                      const status = getSeatStatus(seat, seatId);

                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId, seat)}
                          disabled={seat.isBooked}
                          className={cn(
                            'w-7 h-7 rounded text-xs font-medium transition-all hover:scale-110',
                            status === 'available' &&
                              'bg-muted border-2 border-border hover:border-primary',
                            status === 'selected' && 'bg-primary text-primary-foreground shadow-glow',
                            status === 'booked' &&
                              'bg-muted-foreground/20 cursor-not-allowed opacity-50'
                          )}
                          style={
                            status === 'available'
                              ? { borderColor: section.color + '40' }
                              : undefined
                          }
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedSeats.size > 0 && (
        <div className="sticky bottom-0 p-4 bg-card border-t border-border shadow-card animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedSeats.size} seat{selectedSeats.size > 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Array.from(selectedSeats).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
