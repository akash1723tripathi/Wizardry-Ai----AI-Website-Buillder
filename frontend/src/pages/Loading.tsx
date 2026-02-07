import { Loader2Icon } from "lucide-react"
import { useEffect } from "react"


const Loading = () => {

      useEffect(()=>{
            setTimeout(() => {
                  window.location.href = "/"  
            }, 6000);
      },[])

  return (
    <>
    <div className="h-screen flex-col flex">
      <div className="flex items-center justify-center flex-1">
            <Loader2Icon className="animate-spin mx-auto mt-48" size={40} />
      </div>

    </div>
    </>
  )
}

export default Loading