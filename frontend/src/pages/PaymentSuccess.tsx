import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AlertTriangleIcon, CheckIcon, Loader2Icon } from "lucide-react"
import api from "@/configs/axios"
import { authClient } from "@/lib/auth-client"

type Status = "checking" | "paid" | "pending" | "error"

// Card payments are usually confirmed instantly; this covers a slow webhook or bank
const MAX_ATTEMPTS = 8
const RETRY_MS = 3000

const PaymentSuccess = () => {
  const [params] = useSearchParams()
  const sessionId = params.get("session_id")
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const [status, setStatus] = useState<Status>("checking")
  const [creditsAdded, setCreditsAdded] = useState(0)
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!session?.user) {
      navigate("/auth/sign-in")
      return
    }
    if (!sessionId) {
      setStatus("error")
      return
    }

    let cancelled = false
    let timer: number | undefined

    const verify = async (attempt: number) => {
      try {
        const { data } = await api.post("/api/user/verify-payment", { sessionId })
        if (cancelled) return
        setBalance(data.credits)
        if (data.status === "paid") {
          setCreditsAdded(data.creditsAdded)
          setStatus("paid")
        } else if (attempt < MAX_ATTEMPTS) {
          timer = window.setTimeout(() => verify(attempt + 1), RETRY_MS)
        } else {
          setStatus("pending")
        }
      } catch {
        if (!cancelled) setStatus("error")
      }
    }
    verify(1)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [isPending, session?.user, sessionId])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center">
      <div className="w-full max-w-md">
        {status === "checking" && (
          <>
            <Loader2Icon className="mx-auto h-8 w-8 animate-spin text-slate-300" />
            <h1 className="mt-6 text-2xl font-medium text-white">Confirming your payment</h1>
            <p className="mt-2 text-sm text-slate-400">This only takes a few seconds.</p>
          </>
        )}

        {status === "paid" && (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#a5d8ff] text-black">
              <CheckIcon className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <h1 className="mt-6 text-2xl font-medium text-white">{creditsAdded} credits added</h1>
            <p className="mt-2 text-sm text-slate-400">You now have {balance} credits. Thanks for your purchase.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/" className="rounded-full bg-[#f6f8ff] px-5 py-2.5 text-sm font-medium text-black hover:bg-white">Build a website</Link>
              <Link to="/projects" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-100 hover:bg-white/10">My projects</Link>
            </div>
          </>
        )}

        {(status === "pending" || status === "error") && (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-amber-300/30 bg-amber-300/10">
              <AlertTriangleIcon className="h-6 w-6 text-amber-200" />
            </div>
            <h1 className="mt-6 text-2xl font-medium text-white">
              {status === "pending" ? "Your payment is still processing" : "We couldn't confirm this payment"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {status === "pending"
                ? "Credits are added automatically as soon as Stripe confirms it, usually within a few minutes. You won't be charged twice."
                : "If you were charged, your credits will still be added automatically once Stripe confirms the payment."}
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/" className="rounded-full bg-[#f6f8ff] px-5 py-2.5 text-sm font-medium text-black hover:bg-white">Back to home</Link>
              <Link to="/pricing" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-100 hover:bg-white/10">Pricing</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentSuccess
