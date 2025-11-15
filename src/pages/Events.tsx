import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, User, Ticket } from 'lucide-react';
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
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('event_date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upcoming Events</h1>
          <p className="text-muted-foreground">
            Book your tickets for amazing events
          </p>
        </div>

        {events.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Events Available</CardTitle>
              <CardDescription>
                Check back soon for upcoming events!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden transition-all hover:shadow-card hover:-translate-y-1">
                {event.image_url && (
                  <div className="h-48 overflow-hidden bg-muted">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <Badge variant={event.available_seats > 0 ? 'default' : 'destructive'}>
                      {event.available_seats > 0 ? 'Available' : 'Sold Out'}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
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
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold">₹{Number(event.price).toFixed(0)}</span>
                    <Link to={`/event/${event.id}`}>
                      <Button
                        className="bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform"
                        disabled={event.available_seats === 0}
                      >
                        Select Seats
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
