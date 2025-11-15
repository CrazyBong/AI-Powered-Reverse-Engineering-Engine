import { Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import CardNav from './CardNav';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <CardNav
      logo={
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          <span className="text-white tracking-wider">Re:verse</span>
        </div>
      }
      baseColor="rgba(0, 0, 0, 0.3)"
      menuColor="#fff"
    />
  );
}