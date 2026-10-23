import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import { Loader2Icon, SearchIcon } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import SiteCard from '../components/community/SiteCard';
import api from '@/configs/axios';
import type { CommunitySite } from '@/lib/community';
import PageTransition from '../components/PageTransition';

const Community = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sites, setSites] = useState<CommunitySite[]>([]);
  const [query, setQuery] = useState('');

  const fetchSites = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get(`/api/project/published`, { params: { limit: 100 } });
      setSites(data.projects);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSites();
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((s) => `${s.name} ${s.initial_prompt} ${s.user?.name ?? ''}`.toLowerCase().includes(q));
  }, [sites, query]);

  return (
    <PageTransition>
      <div className='min-h-screen bg-black text-slate-300'>
        <Navbar />
        <main className='px-4 pb-24 pt-10 md:px-16 lg:px-24 xl:px-32'>
          <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
            <div>
              <h1 className='text-3xl font-medium text-white md:text-4xl'>Community</h1>
              <p className='mt-3 max-w-lg text-sm leading-6 text-slate-400'>
                Websites people built with Wizardry AI and chose to share. Open any of them to see it live.
              </p>
            </div>
            {sites.length > 0 && (
              <label className='flex h-11 w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 focus-within:border-[#a5d8ff]/50 md:w-72'>
                <SearchIcon className='h-4 w-4 text-slate-500' />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search websites'
                  aria-label='Search community websites'
                  className='w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500'
                />
              </label>
            )}
          </div>

          {loading ? (
            <div className='flex h-[50vh] items-center justify-center'>
              <Loader2Icon className='h-6 w-6 animate-spin text-slate-300' />
            </div>
          ) : error ? (
            <div className='flex h-[50vh] flex-col items-center justify-center gap-4 text-center'>
              <p className='text-lg text-white'>We couldn't load the community right now</p>
              <button onClick={fetchSites} className='rounded-full border border-white/15 px-5 py-2 text-sm text-slate-100 hover:bg-white/10'>Try again</button>
            </div>
          ) : sites.length === 0 ? (
            <div className='flex h-[50vh] flex-col items-center justify-center gap-4 text-center'>
              <p className='text-lg text-white'>No websites have been published yet</p>
              <p className='max-w-sm text-sm text-slate-400'>Build a website, then press Publish in the builder to share it here.</p>
              <Link to='/' className='mt-2 rounded-full bg-[#f6f8ff] px-5 py-2.5 text-sm font-medium text-black hover:bg-white'>Build a website</Link>
            </div>
          ) : filtered.length === 0 ? (
            <p className='py-24 text-center text-sm text-slate-400'>No websites match "{query}".</p>
          ) : (
            <div className='mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {filtered.map((site) => <SiteCard key={site.id} site={site} />)}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}

export default Community
