import { AlertTriangleIcon, CheckIcon, Loader2Icon, RotateCcwIcon } from "lucide-react"
import { useEffect, useState } from "react"
import type { Project } from "../types"
import { GENERATION_STEPS, getGenerationState, getGenerationStep } from "@/lib/generation"

interface LoaderStepsProps {
      project: Project;
      onRetry?: () => void;
      retrying?: boolean;
}

const formatElapsed = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

const LoaderSteps = ({ project, onRetry, retrying }: LoaderStepsProps) => {
      const state = getGenerationState(project)
      const activeStep = getGenerationStep(project)

      // Elapsed time since the project was created, so a long wait still visibly moves
      const startedAt = new Date(project.createdAt).getTime()
      const [now, setNow] = useState(Date.now())
      useEffect(() => {
            if (state !== "generating") return
            const id = setInterval(() => setNow(Date.now()), 1000)
            return () => clearInterval(id)
      }, [state])
      const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))

      if (state === "failed") {
            const reason = [...project.conversation].reverse().find((m) => m.role === "assistant")?.content
            return (
                  <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                        <div className="grid h-14 w-14 place-items-center rounded-full border border-amber-300/30 bg-amber-300/10">
                              <AlertTriangleIcon className="h-6 w-6 text-amber-200" />
                        </div>
                        <h2 className="mt-6 text-xl font-medium text-white">Your website wasn't generated</h2>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{reason}</p>
                        {onRetry && (
                              <button
                                    onClick={onRetry}
                                    disabled={retrying}
                                    className="mt-8 flex items-center gap-2 rounded-full bg-[#f6f8ff] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white disabled:opacity-70"
                              >
                                    {retrying ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <RotateCcwIcon className="h-4 w-4" />}
                                    Try again
                              </button>
                        )}
                  </div>
            )
      }

      return (
            <div className="flex h-full w-full flex-col items-center justify-center px-6">
                  <div className="w-full max-w-sm">
                        <p className="text-sm text-slate-400">Generating · {formatElapsed(elapsed)} elapsed</p>
                        <h2 className="mt-2 text-2xl font-medium text-white">Building your website</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">This usually takes 1–3 minutes. You can leave this page; we'll keep working.</p>

                        <ol className="mt-10 space-y-6">
                              {GENERATION_STEPS.map((step, index) => {
                                    const done = index < activeStep
                                    const active = index === activeStep
                                    return (
                                          <li key={step.label} className="flex gap-4">
                                                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${done ? "border-[#a5d8ff] bg-[#a5d8ff] text-black" : active ? "border-[#a5d8ff]/60 text-[#a5d8ff]" : "border-white/15 text-slate-500"}`}>
                                                      {done ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} /> : active ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <span className="text-xs">{index + 1}</span>}
                                                </span>
                                                <div>
                                                      <p className={`text-sm font-medium ${active || done ? "text-white" : "text-slate-500"}`}>{step.label}</p>
                                                      <p className={`mt-1 text-sm ${active ? "text-slate-400" : "text-slate-600"}`}>{step.detail}</p>
                                                </div>
                                          </li>
                                    )
                              })}
                        </ol>
                  </div>
            </div>
      )
}

export default LoaderSteps
