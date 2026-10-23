import { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import SiteThumbnail from '../components/community/SiteThumbnail';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { timeAgo } from '@/lib/community';
import PageTransition from '../components/PageTransition';

const MyProjects = () => {
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const { data } = await api.get(`/api/user/projects`);
      setProjects(data.projects);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }

  const deleteProject = async (project: Project) => {
    const confirmed = window.confirm(`Delete "${project.name}"? This can't be undone.`);
    if (!confirmed) return;
    try {
      const { data } = await api.delete(`/api/project/${project.id}`);
      toast.success(data.message);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to delete project");
    }
  }

  useEffect(() => {
    if (!isPending && !session) {
      navigate('/');
      toast("Please login to view your projects");
    } else if (!isPending && session?.user) {
      fetchProjects();
    }
  }, [session?.user, isPending])

  return (
    <PageTransition>
      <div className='min-h-screen bg-black text-slate-300'>
        <Navbar />
        <main className='px-4 pb-24 pt-10 md:px-16 lg:px-24 xl:px-32'>
          <div className='flex items-end justify-between gap-6'>
            <div>
              <h1 className='text-3xl font-medium text-white md:text-4xl'>My projects</h1>
              {!loading && projects.length > 0 && (
                <p className='mt-3 text-sm text-slate-400'>{projects.length} {projects.length === 1 ? 'website' : 'websites'}</p>
              )}
            </div>
            <Link to='/' className='flex shrink-0 items-center gap-2 rounded-full bg-[#f6f8ff] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white'>
              <PlusIcon className='h-4 w-4' /> New website
            </Link>
          </div>

          {loading ? (
            <div className='flex h-[50vh] items-center justify-center'>
              <Loader2Icon className='h-6 w-6 animate-spin text-slate-300' />
            </div>
          ) : projects.length === 0 ? (
            <div className='flex h-[50vh] flex-col items-center justify-center gap-3 text-center'>
              <p className='text-lg text-white'>You haven't built a website yet</p>
              <p className='max-w-sm text-sm text-slate-400'>Describe one on the home page and it will show up here.</p>
            </div>
          ) : (
            <div className='mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {projects.map((project) => {
                const status = !project.current_code ? 'Generating' : project.isPublished ? 'Published' : 'Draft';
                return (
                  <div key={project.id} className='group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/25'>
                    <Link to={`/projects/${project.id}`} className='block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a5d8ff]'>
                      <SiteThumbnail
                        code={project.current_code}
                        title={project.name}
                        placeholder={<span className='flex items-center gap-2'><Loader2Icon className='h-4 w-4 animate-spin' /> Generating…</span>}
                      />
                      <div className='p-4 pr-14'>
                        <h2 className='line-clamp-1 text-base font-medium capitalize text-slate-100'>{project.name}</h2>
                        <div className='mt-3 flex items-center gap-3 text-xs text-slate-400'>
                          <span className='flex items-center gap-1.5'>
                            <span className={`h-1.5 w-1.5 rounded-full ${status === 'Published' ? 'bg-emerald-400' : status === 'Generating' ? 'animate-pulse bg-[#a5d8ff]' : 'bg-slate-500'}`} />
                            {status}
                          </span>
                          <span>Edited {timeAgo(project.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => deleteProject(project)}
                      aria-label={`Delete ${project.name}`}
                      title='Delete project'
                      className='absolute bottom-4 right-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-red-500/15 hover:text-red-300'
                    >
                      <Trash2Icon className='h-4 w-4' />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}

export default MyProjects
