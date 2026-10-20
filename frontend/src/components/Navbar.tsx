import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authClient } from '@/lib/auth-client';
import UserButton from "@/components/user_button"
import api from '@/configs/axios';
import { toast } from 'sonner';
import { MenuIcon, XIcon } from 'lucide-react';

interface NavLink {
    name: string;
    href: string;
    isAnchor?: boolean;
}

const Navbar = () => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = authClient.useSession();

  const isLanding = location.pathname === '/';

  const landingLinks: NavLink[] = [
      { name: "Home", href: "#home", isAnchor: true },
      { name: "Features", href: "#features", isAnchor: true },
      { name: "Process", href: "#process", isAnchor: true },
      { name: "Pricing", href: "#pricing", isAnchor: true },
  ];

  const appLinks: NavLink[] = [
      { name: 'Home', href: '/' },
      { name: 'Projects', href: '/projects' },
      { name: 'Community', href: '/community' },
      { name: 'Pricing', href: '/pricing' },
  ];

  const navLinks = isLanding ? landingLinks : appLinks;

  const getCredits = async () => {
    try {
      const { data } = await api.get('/api/user/credits')
      setCredits(data.credits);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch credits');
      console.log(error);
    }
  }

  useEffect(() => {
    if (session?.user) {
      getCredits();
    }
  }, [session?.user])

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScrollY.current && currentScroll > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (link: NavLink) => {
    setMenuOpen(false);
    if (link.isAnchor) {
      const el = document.querySelector(link.href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-40 backdrop-blur-md transition-transform duration-400 ${showNavbar ? "translate-y-0" : "-translate-y-full"} ${isLanding ? "bg-white/60 border-b border-gray-200" : "bg-black/40 border-b border-slate-800"}`}>
        <div className="flex items-center justify-between px-4 py-4 md:px-16 lg:px-24 xl:px-32">
          <Link to="/">
            {isLanding ? (
              <img src="/assets/logo.svg" alt="Logo" className="h-7 w-auto" />
            ) : (
              <img src="/assets/logo.svg" alt="Logo" className="h-7 w-auto brightness-0 invert" />
            )}
          </Link>

          <div className={`hidden md:flex items-center gap-8 ${isLanding ? "text-gray-600" : "text-gray-300"}`}>
            {navLinks.map((link) => (
              link.isAnchor ? (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link); }}
                  className={`group relative overflow-hidden inline-block h-5 ${isLanding ? "hover:text-gray-800" : "hover:text-white"}`}
                >
                  <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                    {link.name}
                  </span>
                  <span className="absolute top-full left-0 block w-full transition-transform duration-300 group-hover:-translate-y-full">
                    {link.name}
                  </span>
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`group relative overflow-hidden inline-block h-5 ${isLanding ? "hover:text-gray-800" : "hover:text-white"}`}
                >
                  <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                    {link.name}
                  </span>
                  <span className="absolute top-full left-0 block w-full transition-transform duration-300 group-hover:-translate-y-full">
                    {link.name}
                  </span>
                </Link>
              )
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!session?.user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/auth/sign-in"
                  className={`px-6 py-2.5 rounded-lg transition ${isLanding ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/10 text-gray-300"}`}
                >
                  Login
                </Link>
                <button
                  onClick={() => navigate('/auth/sign-in')}
                  className="bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 transition px-5 py-2 text-white rounded-lg"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <>
                <button className={`px-3 py-2 text-xs sm:text-sm border rounded-full ${isLanding ? "bg-gray-50 text-gray-700 border-gray-200" : "bg-white/10 text-gray-200 border-slate-700"}`}>
                  Credits: <span className="text-indigo-500 font-medium">{credits}</span>
                </button>
                <UserButton />
              </>
            )}

            <button
              id="open-menu"
              className="md:hidden active:scale-90 transition"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon className={`w-6 h-6 ${isLanding ? "text-gray-800" : "text-white"}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`flex flex-col items-center justify-center gap-6 text-lg font-medium fixed inset-0 z-50 transition-all duration-300 ${isLanding ? "bg-white/90 backdrop-blur-md text-gray-800" : "bg-black/80 backdrop-blur-md text-white"} ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        {navLinks.map((link) => (
          link.isAnchor ? (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNavClick(link); }}
            >
              {link.name}
            </a>
          ) : (
            <Link key={link.name} to={link.href} onClick={() => setMenuOpen(false)}>
              {link.name}
            </Link>
          )
        ))}

        {!session?.user && (
          <>
            <Link to="/auth/sign-in" onClick={() => setMenuOpen(false)} className="px-6 py-2.5">
              Login
            </Link>
            <button
              onClick={() => { setMenuOpen(false); navigate('/auth/sign-in'); }}
              className="bg-gradient-to-b from-gray-600 to-gray-800 px-5 py-2 text-white rounded-lg"
            >
              Get Started
            </button>
          </>
        )}

        <button
          onClick={() => setMenuOpen(false)}
          className="rounded-md bg-gradient-to-b from-gray-600 to-gray-800 p-2 text-white ring-white active:ring-2"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[72px]" />
    </>
  )
}

export default Navbar