import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Project } from '../types';
import { DownloadIcon, ExternalLinkIcon, GlobeIcon, HomeIcon, Laptop, Loader2, MessageSquare, MonitorIcon, SaveIcon, Smartphone, Tablet } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { getGenerationState } from '@/lib/generation';
import PageTransition from '../components/PageTransition';

type Device = 'desktop' | 'tablet' | 'mobile';

const devices: { id: Device; label: string; icon: typeof Laptop }[] = [
  { id: 'mobile', label: 'Phone', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Laptop },
];

const ghostButton = 'flex h-9 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50';

const Projects = () => {
  const { projectId } = useParams()
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isRevising, setIsRevising] = useState<boolean>(false)
  const [device, setDevice] = useState<Device>('desktop')
  // On phones the chat and preview share the screen; true shows the preview
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isPublishing, setIsPublishing] = useState<boolean>(false)
  const [isRetrying, setIsRetrying] = useState<boolean>(false)
  const projectPreviewRef = useRef<ProjectPreviewRef>(null);

  const generationState = project ? getGenerationState(project) : 'generating';
  const isGenerating = generationState === 'generating' || isRevising;
  const hasCode = Boolean(project?.current_code);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${projectId}`)
      setProject(data.project)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load project')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const saveProject = async () => {
    const code = projectPreviewRef.current?.getCode();
    if (!code) return;
    setIsSaving(true);
    try {
      await api.put(`/api/project/save/${projectId}`, { code })
      setProject((prev) => prev ? { ...prev, current_code: code, current_version_index: '' } : prev)
      toast.success('Changes saved')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save project')
      console.log(error)
    } finally {
      setIsSaving(false);
    }
  }

  const downloadCode = () => {
    const code = projectPreviewRef.current?.getCode() || project?.current_code;
    if (!code) return;
    const element = document.createElement("a");
    element.href = URL.createObjectURL(new Blob([code], { type: 'text/html' }));
    element.download = `index.html`;
    document.body.appendChild(element);
    element.click();
    element.remove();
    URL.revokeObjectURL(element.href);
  }

  const togglePublish = async () => {
    setIsPublishing(true);
    try {
      const { data } = await api.get(`/api/user/publish-toggle/${projectId}`)
      setProject((prev) => prev ? ({ ...prev, isPublished: data.isPublished }) : prev)
      if (data.isPublished) {
        toast.success(data.message, {
          description: 'Anyone visiting Wizardry AI can now see it.',
          action: { label: 'View community', onClick: () => navigate('/community') },
        })
      } else {
        toast.success(data.message)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update publishing')
      console.log(error)
    } finally {
      setIsPublishing(false);
    }
  }

  // Failed generations were refunded, so trying again starts a fresh project with the same prompt
  const retryGeneration = async () => {
    if (!project) return;
    setIsRetrying(true);
    try {
      const { data } = await api.post('/api/user/project', { initial_prompt: project.initial_prompt });
      setLoading(true);
      navigate(`/projects/${data.projectId}`, { replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to start a new generation');
    } finally {
      setIsRetrying(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchProject();
    } else if (!isPending && !session?.user) {
      navigate('/')
      toast("Please login to access the project")
    }
  }, [session?.user, isPending, projectId])

  // Poll while the first version is being generated in the background
  useEffect(() => {
    if (project && generationState === 'generating') {
      const intervalId = setInterval(fetchProject, 4000)
      return () => clearInterval(intervalId);
    }
  }, [project?.id, generationState])

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-black'>
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center'>
        <p className='text-2xl font-medium text-white'>We couldn't open this project</p>
        <p className='text-sm text-slate-400'>It may have been deleted, or it belongs to another account.</p>
        <Link to='/projects' className='rounded-full bg-[#f6f8ff] px-5 py-2.5 text-sm font-medium text-black hover:bg-white'>Go to my projects</Link>
      </div>
    )
  }

  const status = generationState === 'failed'
    ? 'Generation failed'
    : generationState === 'generating'
      ? 'Generating your website…'
      : isRevising
        ? 'Applying changes…'
        : project.isPublished ? 'Published to the community' : 'Draft · not published';

  return (
    <PageTransition>
      <div className='flex h-screen w-full flex-col bg-black text-white'>
        {/* Builder control bar */}
        <header className='flex items-center gap-3 border-b border-white/10 px-3 py-2.5 sm:px-4'>
          {/* left */}
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <Link
              to='/projects'
              aria-label='Back to my projects'
              title='My projects'
              className='grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-slate-100 transition hover:bg-white/10'
            >
              <HomeIcon className='h-4 w-4' />
            </Link>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium capitalize text-white'>{project.name}</p>
              <p className='flex items-center gap-1.5 text-xs text-slate-400'>
                <span className={`h-1.5 w-1.5 rounded-full ${generationState === 'failed' ? 'bg-amber-300' : isGenerating ? 'animate-pulse bg-[#a5d8ff]' : project.isPublished ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                {status}
              </p>
            </div>
          </div>

          {/* middle: device switcher */}
          <div role='radiogroup' aria-label='Preview size' className='hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex'>
            {devices.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role='radio'
                aria-checked={device === id}
                aria-label={label}
                title={label}
                onClick={() => setDevice(id)}
                className={`grid h-7 w-9 place-items-center rounded-full transition ${device === id ? 'bg-[#f6f8ff] text-black' : 'text-slate-400 hover:text-white'}`}
              >
                <Icon className='h-4 w-4' />
              </button>
            ))}
          </div>

          {/* right: actions */}
          <div className='flex flex-1 items-center justify-end gap-2'>
            <button onClick={saveProject} disabled={!hasCode || isSaving || isGenerating} className={`${ghostButton} max-lg:hidden`}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className='h-4 w-4' />}
              Save
            </button>
            <Link
              to={`/preview/${projectId}`}
              target='_blank'
              aria-disabled={!hasCode}
              className={`${ghostButton} max-lg:hidden ${hasCode ? '' : 'pointer-events-none opacity-50'}`}
            >
              <MonitorIcon className='h-4 w-4' /> Preview
            </Link>
            <button onClick={downloadCode} disabled={!hasCode} aria-label='Download HTML' title='Download HTML' className={`${ghostButton} max-sm:hidden`}>
              <DownloadIcon className='h-4 w-4' />
              <span className='max-xl:hidden'>Download</span>
            </button>
            {project.isPublished && (
              <Link to={`/view/${projectId}`} target='_blank' className={`${ghostButton} max-md:hidden`} title='Open the public page'>
                <ExternalLinkIcon className='h-4 w-4' />
                <span className='max-xl:hidden'>Live page</span>
              </Link>
            )}
            <button
              onClick={togglePublish}
              disabled={isPublishing || (!project.isPublished && (!hasCode || isGenerating))}
              className={project.isPublished
                ? ghostButton
                : 'flex h-9 items-center gap-2 rounded-full bg-[#f6f8ff] px-4 text-sm font-medium text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'}
            >
              {isPublishing ? <Loader2 className='h-4 w-4 animate-spin' /> : <GlobeIcon className='h-4 w-4' />}
              {project.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => setShowPreview((open) => !open)}
              aria-label={showPreview ? 'Show chat' : 'Show preview'}
              className='grid h-9 w-9 place-items-center rounded-full border border-white/15 sm:hidden'
            >
              {showPreview ? <MessageSquare className='h-4 w-4' /> : <MonitorIcon className='h-4 w-4' />}
            </button>
          </div>
        </header>

        {/* workspace */}
        <div className='flex min-h-0 flex-1 gap-2 overflow-hidden p-2 pl-0 sm:pl-0'>
          <Sidebar
            isMenuOpen={showPreview}
            project={project}
            setProject={(p) => setProject(p)}
            isGenerating={isGenerating}
            setIsGenerating={setIsRevising}
          />
          <div className={`min-w-0 flex-1 ${showPreview ? '' : 'max-sm:hidden'}`}>
            <ProjectPreview
              ref={projectPreviewRef}
              project={project}
              isGenerating={isGenerating}
              device={device}
              showEditorPanel={!isGenerating}
              onRetry={retryGeneration}
              retrying={isRetrying}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Projects
