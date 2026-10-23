import { useEffect, useState } from 'react'
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
  const [atTop, setAtTop] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = authClient.useSession();

  const isLanding = location.pathname === '/';

  const landingLinks: NavLink[] = [
      { name: "Home", href: "#home", isAnchor: true },
      { name: "Features", href: "#features", isAnchor: true },
      { name: "Process", href: "#process", isAnchor: true },
      { name: "Community", href: "/community" },
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
    const handleScroll = () => setAtTop(window.scrollY < 16);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Once the user scrolls, the full-width bar detaches into a floating pill and stays visible
  const floating = !atTop;
  // On the landing page the hero gradient runs behind the navbar until the user scrolls
  const transparentNav = isLanding && atTop;

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
      <div className={`fixed inset-x-0 top-0 z-40 flex justify-center transition-[padding] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${floating ? "px-3 pt-3 md:px-6 md:pt-4" : "px-0 pt-0"}`}>
      <nav className={`w-full border transition-[max-width,border-radius,background-color,border-color,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
        floating
          ? "max-w-6xl rounded-full border-white/10 bg-neutral-950/75 backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9)]"
          : `max-w-[100vw] rounded-none border-x-transparent border-t-transparent ${transparentNav ? "border-b-transparent bg-transparent text-shadow-hero" : "border-b-white/10 bg-black/60 backdrop-blur-md"}`
      }`}>
        <div className={`relative flex items-center justify-between transition-[padding] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${floating ? "px-4 py-2.5 md:px-6" : "px-4 py-4 md:px-16 lg:px-24 xl:px-32"}`}>
          <Link to="/">
            <img src="/assets/logo.svg" alt="Wizardry AI home" className="h-7 w-auto brightness-0 invert" />
          </Link>

          <div className={"hidden md:flex items-center gap-8 text-slate-100 absolute left-1/2 -translate-x-1/2"}>
            {navLinks.map((link) => (
              link.isAnchor ? (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link); }}
                  className={"group relative overflow-hidden inline-block h-5 hover:text-white"}
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
                  className={"group relative overflow-hidden inline-block h-5 hover:text-white"}
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
                  className={`px-6 py-2.5 transition hover:bg-white/10 text-slate-100 hover:text-white ${floating ? "rounded-full" : "rounded-lg"}`}
                >
                  Login
                </Link>
                <button
                  onClick={() => navigate('/auth/sign-in')}
                  className={`bg-[#f6f8ff] hover:bg-white transition-all px-5 py-2 text-black font-medium ${floating ? "rounded-full" : "rounded-lg"}`}
                >
                  Get Started
                </button>
              </div>
            ) : (
              <>
                <Link to="/pricing" title="Buy more credits" className="px-3 py-2 text-xs sm:text-sm border rounded-full bg-white/5 text-slate-200 border-white/15 transition hover:bg-white/10">
                  Credits: <span className="text-[#a5d8ff] font-medium">{credits}</span>
                </Link>
                <UserButton />
              </>
            )}

            <button
              id="open-menu"
              aria-label="Open menu"
              className="md:hidden active:scale-90 transition"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon className={"w-6 h-6 text-white"} />
            </button>
          </div>
        </div>
      </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`flex flex-col items-center justify-center gap-6 text-lg font-medium fixed inset-0 z-50 transition-all duration-300 bg-black/90 backdrop-blur-md text-white ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
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
              className="bg-[#f6f8ff] px-5 py-2 text-black font-medium rounded-lg"
            >
              Get Started
            </button>
          </>
        )}

        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          className="rounded-md border border-white/15 bg-white/5 p-2 text-white ring-white active:ring-2"
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