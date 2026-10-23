import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Loader2Icon, SparklesIcon } from "lucide-react"
import api from "@/configs/axios"
import { PUBLISHED_SITE_SANDBOX } from "@/lib/community"

interface PublishedSite {
  code: string;
  name: string;
  author?: string;
}

const View = () => {
  const { projectId } = useParams()
  const [site, setSite] = useState<PublishedSite | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    setStatus('loading')
    api.get(`/api/project/published/${projectId}`)
      .then(({ data }) => {
        setSite(data)
        setStatus('ready')
        document.title = `${data.name} · Wizardry AI`
      })
      .catch(() => setStatus('missing'))
  }, [projectId])

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2Icon className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    )
  }

  if (status === 'missing' || !site) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <h1 className="text-2xl font-medium text-white">This website isn't published</h1>
        <p className="max-w-sm text-sm text-slate-400">The creator may have unpublished it. Browse other sites people have built instead.</p>
        <Link to="/community" className="mt-4 rounded-full bg-[#f6f8ff] px-5 py-2.5 text-sm font-medium text-black hover:bg-white">Browse the community</Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-black">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" aria-label="Wizardry AI home">
            <img src="/assets/logo.svg" alt="" className="h-5 w-auto brightness-0 invert" />
          </Link>
          <p className="min-w-0 truncate text-sm text-slate-300">
            <span className="capitalize text-white">{site.name}</span>
            {site.author && <span className="text-slate-400"> by {site.author}</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/community" className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white max-sm:hidden">Community</Link>
          <Link to="/" className="flex items-center gap-2 rounded-full bg-[#f6f8ff] px-4 py-2 text-sm font-medium text-black transition hover:bg-white">
            <SparklesIcon className="h-4 w-4" /> Build your own
          </Link>
        </div>
      </header>
      <iframe
        title={site.name}
        srcDoc={site.code}
        sandbox={PUBLISHED_SITE_SANDBOX}
        className="w-full flex-1 border-0 bg-white"
      />
    </div>
  )
}

export default View
