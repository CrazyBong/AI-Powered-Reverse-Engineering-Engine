interface CardNavProps {
  logo: React.ReactNode;
  logoAlt?: string;
  className?: string;
  baseColor?: string;
  menuColor?: string;
}

export default function CardNav({
  logo,
  className = '',
  baseColor = '#fff',
  menuColor
}: CardNavProps) {
  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] ${className}`}>
      <nav
        className={`block h-[60px] p-0 border border-white/10 rounded-xl shadow-lg relative overflow-hidden`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-between px-6 z-[2]">
          {/* Left side - About */}
          <a
            href="#/about"
            className="px-4 py-2 rounded-lg transition-all hover:bg-white/10"
            style={{ color: menuColor || '#fff' }}
          >
            About
          </a>

          {/* Center - Logo */}
          <a 
            href="#/"
            className="flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {logo}
          </a>

          {/* Right side - Contact */}
          <a
            href="#/contact"
            className="px-4 py-2 rounded-lg transition-all hover:bg-white/10"
            style={{ color: menuColor || '#fff' }}
          >
            Contact
          </a>
        </div>
      </nav>
    </div>
  );
}
