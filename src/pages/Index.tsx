import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Car, QrCode, Shield, Zap, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Book seats for events with real-time availability like BookMyShow',
    },
    {
      icon: Car,
      title: 'Smart Parking',
      description: 'Reserve parking slots with automatic allocation and real-time tracking',
    },
    {
      icon: QrCode,
      title: 'QR Code Entry',
      description: 'Instant digital tickets and parking passes with QR code verification',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and reliable payment processing for bookings',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications about booking status and availability',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Track bookings, revenue, and system performance',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
              Event Booking &{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Smart Parking
              </span>{' '}
              in One Place
            </h1>
            <p className="mb-8 text-lg text-muted-foreground lg:text-xl">
              Experience seamless event registration with BookMyShow-style seat selection and intelligent parking management. All powered by QR code technology.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {user ? (
                <>
                  <Link to="/events">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-secondary shadow-glow">
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/parking">
                    <Button size="lg" variant="outline">
                      Reserve Parking
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary shadow-glow">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Everything You Need
            </h2>
            <p className="text-muted-foreground">
              Powerful features to manage events and parking efficiently
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-border transition-all hover:shadow-card hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
                <h2 className="text-3xl font-bold lg:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="max-w-2xl text-muted-foreground">
                  Join thousands of users who trust EventPark for their event bookings and parking needs.
                </p>
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary shadow-glow">
                    Create Free Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
