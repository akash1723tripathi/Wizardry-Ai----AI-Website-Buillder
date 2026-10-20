import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden px-6 md:px-16 lg:px-24 xl:px-32 w-full text-sm text-slate-500 bg-white pt-10">
      {/* Background watermark logo */}
      <img
        src="/assets/logo.svg"
        alt=""
        className="hidden md:block absolute -bottom-30 -left-80 opacity-5 w-full h-full pointer-events-none"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
        {/* Brand Column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/">
            <img
              src="/assets/logo.svg"
              alt="Logo"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm leading-7 mt-6">
            An AI-powered website builder that lets you create stunning, production-ready websites by simply describing your idea. No code, no design skills needed.
          </p>
        </div>

        {/* Company Links */}
        <div className="flex flex-col lg:items-center lg:justify-center">
          <div className="flex flex-col text-sm space-y-2.5">
            <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
            <Link to="/" className="hover:text-slate-600 transition">Home</Link>
            <Link to="/community" className="hover:text-slate-600 transition">Community</Link>
            <Link to="/pricing" className="hover:text-slate-600 transition">Pricing</Link>
            <Link to="/projects" className="hover:text-slate-600 transition">My Projects</Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-5">Subscribe to our newsletter</h2>
          <div className="text-sm space-y-6 max-w-sm">
            <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
            <div className="flex items-center">
              <input
                className="rounded-l-md bg-gray-100 outline-none w-full max-w-64 h-11 px-3 text-gray-700"
                type="email"
                placeholder="Enter your email"
              />
              <button className="bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 transition px-4 h-11 text-white rounded-r-md">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t mt-6 border-slate-200">
        <p className="text-center">
          Copyright 2026 © Wizardry AI. All Rights Reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-slate-600 transition">Privacy Policy</Link>
          <Link to="/" className="hover:text-slate-600 transition">Terms of Service</Link>
          <Link to="/" className="hover:text-slate-600 transition">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;