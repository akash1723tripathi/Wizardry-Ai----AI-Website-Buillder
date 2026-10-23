import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden px-6 md:px-16 lg:px-24 xl:px-32 w-full text-sm text-slate-400 bg-black border-t border-white/10 pt-10">
      {/* Background watermark logo */}
      <img
        src="/assets/logo.svg"
        alt=""
        className="hidden md:block absolute -bottom-30 -left-80 opacity-[0.04] brightness-0 invert w-full h-full pointer-events-none"
      />

      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand Column */}
        <div className="flex flex-col space-y-4 max-w-md">
          <Link to="/" className="inline-block">
            <img
              src="/assets/logo.svg"
              alt="Wizardry AI home"
              className="h-7 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-sm leading-7 text-slate-400">
            Wizardry AI is an AI-powered website builder that lets you create stunning, production-ready websites by simply describing your idea. No code, no design skills needed.
          </p>
        </div>

        {/* Company Links */}
        <div className="flex flex-col space-y-3">
          <h2 className="font-semibold text-slate-100 text-sm tracking-wide mb-2">Company</h2>
          <Link to="/" className="text-slate-400 hover:text-white transition">Home</Link>
          <Link to="/community" className="text-slate-400 hover:text-white transition">Community</Link>
          <Link to="/pricing" className="text-slate-400 hover:text-white transition">Pricing</Link>
          <Link to="/projects" className="text-slate-400 hover:text-white transition">My Projects</Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-6 border-t mt-12 border-white/10 text-center text-xs sm:text-sm text-slate-500">
        <p>Copyright 2026 © Wizardry AI. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;