import { Wallet, Store, Users, History, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function BottomNav() {
  const [location] = useLocation();

  const items = [
    { icon: Wallet, label: 'Wallet', href: '/' },
    { icon: Store, label: 'Merchant', href: '/merchant' },
    { icon: Users, label: 'P2P', href: '/p2p' },
    { icon: History, label: 'History', href: '/history' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <nav className="flex justify-around">
        {items.map(({ icon: Icon, label, href }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <a
                className={`flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
