import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { SeatMap } from '@/components/SeatMap';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, User, IndianRupee, Ticket, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  venue: string;
  guest_speaker: string;
  available_seats: number;
  total_seats: number;
  price: number;
  image_url: string;
  seat_layout: any;
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchBookedSeats();
    }
  }, [id]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load event details',
        variant: 'destructive',
      });
      navigate('/events');
    } else if (data) {
      // Convert simple layout to sections if needed
      let seatLayout: any = data.seat_layout;
      if (seatLayout && typeof seatLayout === 'object') {
        if ('rows' in seatLayout && 'columns' in seatLayout && !('sections' in seatLayout)) {
          // Convert old format to new format with sections
          const rows = seatLayout.rows as string[];
          const columns = seatLayout.columns as number[];
          const midRow = Math.floor(rows.length / 3);
          seatLayout = {
            sections: [
              {
                name: 'Premium',
                rows: rows.slice(0, midRow),
                columns: columns,
                price: Number(data.price) * 1.5,
                color: 'hsl(var(--primary))',
              },
              {
                name: 'Standard',
                rows: rows.slice(midRow, midRow * 2),
                columns: columns,
                price: Number(data.price),
                color: 'hsl(var(--secondary))',
              },
              {
                name: 'Economy',
                rows: rows.slice(midRow * 2),
                columns: columns,
                price: Number(data.price) * 0.7,
                color: 'hsl(var(--accent))',
              },
            ],
          };
        }
      }
      setEvent({ ...data, seat_layout: seatLayout });
    }
    setLoading(false);
  };

  const fetchBookedSeats = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('seats')
      .eq('event_id', id)
      .eq('booking_status', 'active');

    if (data) {
      const booked = data.flatMap((booking) => {
        const seats = booking.seats;
        if (Array.isArray(seats)) {
          return seats.map(s => String(s));
        }
        return [];
      });
      setBookedSeats(booked);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to book tickets',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (selectedSeats.length === 0) {
      toast({
        title: 'No Seats Selected',
        description: 'Please select at least one seat',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      event_id: id!,
      seats: selectedSeats,
      total_amount: totalPrice,
      qr_code: `EVENT-${id}-${Date.now()}`,
      payment_status: 'pending',
    });

    if (error) {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Update available seats
      await supabase
        .from('events')
        .update({ available_seats: (event?.available_seats || 0) - selectedSeats.length })
        .eq('id', id!);

      toast({
        title: 'Booking Successful!',
        description: `${selectedSeats.length} seat(s) booked successfully`,
      });
      navigate('/profile');
    }

    setIsBooking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <div className="h-64 bg-muted" />
            <CardHeader>
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Event Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              {event.image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(event.event_date), 'PPP p')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.venue}</span>
                </div>
                {event.guest_speaker && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{event.guest_speaker}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {event.available_seats} / {event.total_seats} seats available
                  </span>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Selected Seats:</span>
                    <Badge>{selectedSeats.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleBooking}
                    disabled={selectedSeats.length === 0 || isBooking}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                    size="lg"
                  >
                    {isBooking ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seat Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Seats</CardTitle>
                <CardDescription>
                  Click on available seats to select. Maximum 10 seats per booking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SeatMap
                  layout={event.seat_layout}
                  bookedSeats={bookedSeats}
                  onSeatSelect={setSelectedSeats}
                  onPriceChange={setTotalPrice}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
