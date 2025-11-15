import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Car, Bike, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import parkingHero from '@/assets/parking-hero.jpg';

interface ParkingSlot {
  id: string;
  slot_number: string;
  slot_type: 'car' | 'bike';
  is_available: boolean;
}

export default function Parking() {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSlots();
    
    const channel = supabase
      .channel('parking-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_slots' },
        () => {
          fetchSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from('parking_slots')
      .select('*')
      .order('slot_number', { ascending: true });

    if (!error && data) {
      setSlots(data as ParkingSlot[]);
    }
    setLoading(false);
  };

  const handleBookSlot = async () => {
    if (!user || !selectedSlot || !vehicleNumber.trim()) return;

    const { error } = await supabase
      .from('parking_bookings')
      .insert({
        user_id: user.id,
        slot_id: selectedSlot.id,
        vehicle_number: vehicleNumber.toUpperCase(),
        qr_code: `PARK-${selectedSlot.slot_number}-${Date.now()}`,
      });

    if (error) {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      await supabase
        .from('parking_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot.id);

      toast({
        title: 'Parking Booked!',
        description: `Slot ${selectedSlot.slot_number} has been reserved.`,
      });
      setVehicleNumber('');
      setSelectedSlot(null);
      fetchSlots();
    }
  };

  const carSlots = slots.filter((s) => s.slot_type === 'car');
  const bikeSlots = slots.filter((s) => s.slot_type === 'bike');
  const availableCars = carSlots.filter((s) => s.is_available).length;
  const availableBikes = bikeSlots.filter((s) => s.is_available).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative h-64 overflow-hidden">
        <img
          src={parkingHero}
          alt="Parking"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-2">Smart Parking</h1>
            <p className="text-white/90">Reserve your parking spot instantly</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Car Parking
              </CardTitle>
              <CardDescription>
                {availableCars} of {carSlots.length} slots available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{availableCars}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="h-5 w-5" />
                Bike Parking
              </CardTitle>
              <CardDescription>
                {availableBikes} of {bikeSlots.length} slots available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{availableBikes}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Car className="h-6 w-6" />
              Car Slots
            </h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {carSlots.map((slot) => (
                <Dialog key={slot.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={`h-20 flex flex-col gap-1 ${
                        slot.is_available
                          ? 'hover:border-primary hover:bg-primary/5'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!slot.is_available}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Car className="h-5 w-5" />
                      <span className="font-mono text-sm">{slot.slot_number}</span>
                      <Badge variant={slot.is_available ? 'default' : 'secondary'} className="text-xs">
                        {slot.is_available ? 'Free' : 'Occupied'}
                      </Badge>
                    </Button>
                  </DialogTrigger>
                  {slot.is_available && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reserve Parking Slot</DialogTitle>
                        <DialogDescription>
                          Book slot {slot.slot_number} for your vehicle
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle">Vehicle Number</Label>
                          <Input
                            id="vehicle"
                            placeholder="KA-01-AB-1234"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            className="uppercase"
                          />
                        </div>
                        <Button
                          onClick={handleBookSlot}
                          className="w-full bg-gradient-to-r from-primary to-secondary"
                        >
                          Confirm Booking
                        </Button>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Bike className="h-6 w-6" />
              Bike Slots
            </h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {bikeSlots.map((slot) => (
                <Dialog key={slot.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={`h-20 flex flex-col gap-1 ${
                        slot.is_available
                          ? 'hover:border-secondary hover:bg-secondary/5'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!slot.is_available}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Bike className="h-5 w-5" />
                      <span className="font-mono text-sm">{slot.slot_number}</span>
                      <Badge variant={slot.is_available ? 'default' : 'secondary'} className="text-xs">
                        {slot.is_available ? 'Free' : 'Occupied'}
                      </Badge>
                    </Button>
                  </DialogTrigger>
                  {slot.is_available && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reserve Parking Slot</DialogTitle>
                        <DialogDescription>
                          Book slot {slot.slot_number} for your vehicle
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle-bike">Vehicle Number</Label>
                          <Input
                            id="vehicle-bike"
                            placeholder="KA-01-AB-1234"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            className="uppercase"
                          />
                        </div>
                        <Button
                          onClick={handleBookSlot}
                          className="w-full bg-gradient-to-r from-primary to-secondary"
                        >
                          Confirm Booking
                        </Button>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
