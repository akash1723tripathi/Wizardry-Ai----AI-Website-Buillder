import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import type { Project } from "../types";
import { iframeScript } from "../assets/assets";
import EditorPanel from "./EditorPanel";
import LoaderSteps from "./LoaderSteps";
import { Loader2Icon } from "lucide-react";

export interface ProjectPreviewRef {
      getCode: () => string | undefined;
}

interface ProjectPreviewProps {
      project: Project;
      isGenerating: boolean;
      device?: 'desktop' | 'mobile' | 'tablet';
      showEditorPanel?: boolean;
      variant?: 'builder' | 'plain';
      onRetry?: () => void;
      retrying?: boolean;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({ project, isGenerating, device = 'desktop', showEditorPanel = true, variant = 'builder', onRetry, retrying }, ref) => {

      const iframeRef = useRef<HTMLIFrameElement>(null);
      const [selectedElement,setSelectedElement] = useState<any>(null)

      useEffect(()=>{
            const handleMessage = (e: MessageEvent) => {
            if(e.data.type === 'ELEMENT_SELECTED'){
                        setSelectedElement(e.data.payload);
                  }else if(e.data.type === 'CLEAR_SELECTION'){
                        setSelectedElement(null);
                  }
            }
            window.addEventListener('message', handleMessage);
            return () => {
                  window.removeEventListener('message', handleMessage);
            };
      },[])

      const handleUpdate = (updates: any)=>{
            if(iframeRef.current?.contentWindow){
                  iframeRef.current.contentWindow.postMessage({
                        type:'UPDATE_ELEMENT',
                        payload:updates
                  },'*');
            }

      }

      const resolutions = {
            mobile:'w-[412px]',
            tablet: 'w-[768px]',
            desktop: 'w-full'
      }

      useImperativeHandle(ref,()=>({
            getCode: ()=>{
                  const doc = iframeRef.current?.contentDocument;
                  if(!doc) return undefined;

                  //Remove the selection highlight before getting the code
                  doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').
                  forEach((el)=>{
                        el.classList.remove('ai-selected-element');
                        el.removeAttribute('data-ai-selected');
                        (el as HTMLElement).style.outline = '';
                  });
                  //Remove any injected scripts
                  const previewStyle = doc.getElementById('ai-preview-style');
                  if(previewStyle){
                        previewStyle.remove();
                  }

                  const previewScript = doc.getElementById('ai-preview-script');
                  if(previewScript){
                        previewScript.remove();
                  }

                  //Serrialize the document
                  const html = doc.documentElement.outerHTML;
                  return html;
            }
      }))

      const injectPreview= (html:string)=>{
            if(!html) return "";
            if(!showEditorPanel){
                  return html;
            }
            if(html.includes('</body>')){
                  return html.replace('</body>', iframeScript + '</body>');
            }else{
                  return html + iframeScript;
            }
      }

      // "plain" is the full-screen preview page: just the site, no builder chrome
      if (variant === 'plain') {
            return (
                  <iframe
                        ref={iframeRef}
                        title="Website preview"
                        srcDoc={injectPreview(project.current_code)}
                        className="h-full w-full border-0 bg-white"
                  />
            )
      }

      return (
            <div className="relative h-full flex-1 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px] max-sm:ml-2">
                  {project.current_code ? (
                        <div className={`flex h-full justify-center ${device === 'desktop' ? '' : 'p-4'}`}>
                              <iframe
                                    ref={iframeRef}
                                    title="Website preview"
                                    srcDoc={injectPreview(project.current_code)}
                                    className={`h-full max-sm:w-full ${resolutions[device]} bg-white transition-[width] duration-300 ${device === 'desktop' ? '' : 'rounded-xl border border-white/15 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]'}`}
                              />
                              {isGenerating && (
                                    <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
                                          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/80 px-4 py-2 text-sm text-slate-100 shadow-lg backdrop-blur-md">
                                                <Loader2Icon className="h-4 w-4 animate-spin text-[#a5d8ff]" />
                                                Applying your changes…
                                          </div>
                                    </div>
                              )}
                              {showEditorPanel && selectedElement && (
                                    <EditorPanel selectedElement={selectedElement} onUpdate={handleUpdate} onClose={() => {
                                          setSelectedElement(null);
                                          if(iframeRef.current?.contentWindow){
                                                iframeRef.current.contentWindow.postMessage({type:'CLEAR_SELECTION_REQUEST'},'*');
                                          }
                                    }}/>
                              )}
                        </div>
                  ) : (
                        <LoaderSteps project={project} onRetry={onRetry} retrying={retrying} />
                  )}
            </div>
      )
})

export default ProjectPreview
