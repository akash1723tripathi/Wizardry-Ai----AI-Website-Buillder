import { useSession, signOut } from "@/lib/auth-client"
import { useNavigate } from "react-router-dom"
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CoinsIcon, FolderIcon, Loader2, LogOut } from "lucide-react"

export default function UserButton() {
      const { data: session, isPending } = useSession()
      const navigate = useNavigate()

      if (isPending) return <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      if (!session) return null

      return (
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                        <button
                              aria-label="Account menu"
                              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5d8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                              <Avatar className="h-10 w-10 border border-white/15">
                                    <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                                    <AvatarFallback className="bg-[#f6f8ff] font-semibold text-black">
                                          {session.user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                              </Avatar>
                        </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-60 border-white/10 bg-neutral-950 text-slate-100" align="end">
                        <DropdownMenuLabel className="font-normal">
                              <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">{session.user.name}</p>
                                    <p className="truncate text-xs leading-none text-slate-400">{session.user.email}</p>
                              </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onSelect={() => navigate("/projects")} className="cursor-pointer focus:bg-white/10 focus:text-white">
                              <FolderIcon className="mr-2 h-4 w-4 text-slate-400" />
                              <span>My projects</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => navigate("/pricing")} className="cursor-pointer focus:bg-white/10 focus:text-white">
                              <CoinsIcon className="mr-2 h-4 w-4 text-slate-400" />
                              <span>Buy credits</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                              onSelect={async () => {
                                    await signOut()
                                    window.location.href = "/"
                              }}
                              className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
                        >
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Log out</span>
                        </DropdownMenuItem>
                  </DropdownMenuContent>
            </DropdownMenu>
      )
}
