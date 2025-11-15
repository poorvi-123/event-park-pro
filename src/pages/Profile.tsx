import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Car, MapPin, CreditCard, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

interface Booking {
  id: string;
  event_id: string;
  seats: any;
  total_amount: number;
  payment_status: string;
  booking_status: string;
  qr_code: string;
  created_at: string;
  events: {
    title: string;
    event_date: string;
    venue: string;
  };
}

interface ParkingBooking {
  id: string;
  vehicle_number: string;
  entry_time: string;
  exit_time: string | null;
  parking_fee: number | null;
  qr_code: string;
  payment_status: string;
  status: string;
  parking_slots: {
    slot_number: string;
    slot_type: string;
  };
}

export default function Profile() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [parkingBookings, setParkingBookings] = useState<ParkingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchParkingBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events(title, event_date, venue)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const fetchParkingBookings = async () => {
    const { data, error } = await supabase
      .from('parking_bookings')
      .select('*, parking_slots(slot_number, slot_type)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setParkingBookings(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">View your bookings and history</p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">Event Bookings</TabsTrigger>
            <TabsTrigger value="parking">Parking Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Event Bookings</CardTitle>
                  <CardDescription>
                    You haven't booked any events yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.events.title}</CardTitle>
                        <CardDescription className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.events.event_date), 'PPP p')}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {booking.events.venue}
                          </div>
                        </CardDescription>
                      </div>
                      <Badge variant={booking.booking_status === 'active' ? 'default' : 'secondary'}>
                        {booking.booking_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">₹{booking.total_amount}</span>
                        <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                    {booking.qr_code && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                        <QRCodeSVG value={booking.qr_code} size={200} />
                        <p className="text-sm text-muted-foreground">Scan at venue entrance</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="parking" className="space-y-4">
            {parkingBookings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Parking Bookings</CardTitle>
                  <CardDescription>
                    You haven't reserved any parking slots yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              parkingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          Slot {booking.parking_slots.slot_number}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Vehicle: {booking.vehicle_number}
                        </CardDescription>
                      </div>
                      <Badge variant={booking.status === 'active' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry Time:</span>
                        <span>{format(new Date(booking.entry_time), 'PPP p')}</span>
                      </div>
                      {booking.exit_time && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Exit Time:</span>
                          <span>{format(new Date(booking.exit_time), 'PPP p')}</span>
                        </div>
                      )}
                      {booking.parking_fee && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fee:</span>
                          <span className="font-semibold">₹{booking.parking_fee}</span>
                        </div>
                      )}
                    </div>
                    {booking.qr_code && booking.status === 'active' && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                        <QRCodeSVG value={booking.qr_code} size={200} />
                        <p className="text-sm text-muted-foreground">Scan for entry/exit</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
