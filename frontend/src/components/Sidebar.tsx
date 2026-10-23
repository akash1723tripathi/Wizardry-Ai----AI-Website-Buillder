import { ArrowUpIcon, EyeIcon, HistoryIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import type { Message, Project, Version } from "../types";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "@/configs/axios";
import { toast } from "sonner";


interface SidebarProps {
      isMenuOpen: boolean;
      project: Project;
      setProject: (project: Project) => void;
      isGenerating: boolean;
      setIsGenerating: (setIsGenerating: boolean) => void;
}

const Sidebar = ({ isMenuOpen, project, setProject, isGenerating, setIsGenerating }: SidebarProps) => {

      const [input, setInput] = useState<string>('');

      const fetchProject = async () => {
            try {
                  const { data } = await api.get(`/api/user/project/${project.id}`)
                  setProject(data.project)
            } catch (error: any) {
                  toast.error(error?.response?.data?.message || 'Failed to load project')
                  console.log(error)
            }
      }

      const handleRollback = async (versionId: string) => {
            const confirmed = window.confirm('Restore this version? Any unsaved changes will be lost.')
            if (!confirmed) return;
            try {
                  setIsGenerating(true);
                  const { data } = await api.get(`/api/project/rollback/${project.id}/${versionId}`);
                  await fetchProject();
                  toast.success(data.message);
            } catch (error: any) {
                  toast.error(error?.response?.data?.message || 'Failed to restore this version')
                  console.log(error)
            } finally {
                  setIsGenerating(false);
            }
      }

      const handleRevision = async (e: React.FormEvent) => {
            e.preventDefault();
            const prompt = input.trim();
            if (!prompt || isGenerating) return;

            setIsGenerating(true);
            setInput('');
            // Show progress messages (enhanced prompt etc.) while the request is running
            const interval = window.setInterval(fetchProject, 5000);
            try {
                  const { data } = await api.post(`/api/project/revision/${project.id}`, { revision_prompt: prompt });
                  toast.success(data.message);
            } catch (error: any) {
                  toast.error(error?.response?.data?.message || 'Failed to apply your change')
                  console.log(error)
                  setInput(prompt);
            } finally {
                  window.clearInterval(interval);
                  await fetchProject();
                  setIsGenerating(false);
            }
      }

      const messagesEndRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [project.conversation.length, project.versions.length, isGenerating]);

      const timeline = [...project.conversation, ...project.versions]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return (
            <div className={`h-full shrink-0 transition-all ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'} sm:w-[380px]`}>
                  <div className="flex h-full flex-col">
                        {/* Message Container */}
                        <div className="no-scrollbar flex flex-1 flex-col gap-5 overflow-auto px-4 pb-4 pt-2">
                              {timeline.map((item) => {
                                    if ('content' in item) {
                                          const msg = item as Message;
                                          if (msg.role === 'user') {
                                                return (
                                                      <div key={msg.id} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-slate-100">
                                                            {msg.content}
                                                      </div>
                                                )
                                          }
                                          return (
                                                <div key={msg.id} className="flex items-start gap-3">
                                                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5">
                                                            <SparklesIcon className="h-3.5 w-3.5 text-[#a5d8ff]" />
                                                      </span>
                                                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{msg.content}</p>
                                                </div>
                                          )
                                    }

                                    const vr = item as Version;
                                    const isCurrent = project.current_version_index === vr.id;
                                    return (
                                          <div key={vr.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
                                                <HistoryIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                                <div className="min-w-0 flex-1">
                                                      <p className="text-xs font-medium text-slate-100">{isCurrent ? 'Current version' : 'Saved version'}</p>
                                                      <p className="text-xs text-slate-400">{new Date(vr.timestamp).toLocaleString()}</p>
                                                </div>
                                                {!isCurrent && (
                                                      <button
                                                            onClick={() => handleRollback(vr.id)}
                                                            disabled={isGenerating}
                                                            className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
                                                      >
                                                            Restore
                                                      </button>
                                                )}
                                                <Link
                                                      target="_blank"
                                                      to={`/preview/${project.id}/${vr.id}`}
                                                      aria-label="Preview this version in a new tab"
                                                      title="Preview this version"
                                                      className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
                                                >
                                                      <EyeIcon className="h-4 w-4" />
                                                </Link>
                                          </div>
                                    )
                              })}

                              {isGenerating && (
                                    <div className="flex items-center gap-3" aria-live="polite">
                                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5">
                                                <SparklesIcon className="h-3.5 w-3.5 text-[#a5d8ff]" />
                                          </span>
                                          <div className="flex gap-1.5">
                                                <span className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0s' }} />
                                                <span className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.2s' }} />
                                                <span className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.4s' }} />
                                          </div>
                                          <span className="sr-only">Working on your request</span>
                                    </div>
                              )}
                              <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleRevision} className="p-3 pt-0">
                              <div className="rounded-2xl border border-white/15 bg-white/[0.03] transition focus-within:border-[#a5d8ff]/50 focus-within:ring-2 focus-within:ring-[#a5d8ff]/20">
                                    <textarea
                                          onChange={(e) => setInput(e.target.value)}
                                          onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                      e.preventDefault();
                                                      e.currentTarget.form?.requestSubmit();
                                                }
                                          }}
                                          value={input}
                                          rows={3}
                                          aria-label="Describe a change to your website"
                                          placeholder={project.current_code ? "Describe a change, e.g. make the hero darker" : "Your website is being generated…"}
                                          className="w-full resize-none bg-transparent px-4 pt-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
                                          disabled={isGenerating || !project.current_code}
                                    />
                                    <div className="flex items-center justify-between px-3 pb-3">
                                          <span className="text-xs text-slate-500">Each change uses 5 credits</span>
                                          <button
                                                type="submit"
                                                aria-label="Send change request"
                                                disabled={isGenerating || input.trim() === '' || !project.current_code}
                                                className="grid h-8 w-8 place-items-center rounded-full bg-[#f6f8ff] text-black transition hover:bg-white disabled:bg-white/10 disabled:text-slate-500"
                                          >
                                                {isGenerating ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <ArrowUpIcon className="h-4 w-4" />}
                                          </button>
                                    </div>
                              </div>
                        </form>
                  </div>
            </div>
      )
}

export default Sidebar
