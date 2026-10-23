import { useEffect, useRef, useState, type ReactNode } from "react";
import { PUBLISHED_SITE_SANDBOX } from "@/lib/community";

// The site is rendered at desktop size and scaled down to fit the card
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 800;

interface SiteThumbnailProps {
    code?: string | null;
    title: string;
    // Shown instead of the site when there is no code yet
    placeholder?: ReactNode;
}

const SiteThumbnail = ({ code, title, placeholder }: SiteThumbnailProps) => {
    const thumbRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.25);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = thumbRef.current;
        if (!el) return;
        const resize = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_WIDTH));
        resize.observe(el);
        // Only mount the live site once the card is close to the viewport
        const visible = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                visible.disconnect();
            }
        }, { rootMargin: "300px" });
        visible.observe(el);
        return () => {
            resize.disconnect();
            visible.disconnect();
        };
    }, []);

    return (
        <div ref={thumbRef} className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-neutral-900">
            {code ? (
                inView && (
                    <iframe
                        title={`Preview of ${title}`}
                        srcDoc={code}
                        sandbox={PUBLISHED_SITE_SANDBOX}
                        loading="lazy"
                        tabIndex={-1}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0 bg-white"
                        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, transform: `scale(${scale})` }}
                    />
                )
            ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">{placeholder}</div>
            )}
        </div>
    );
};

export default SiteThumbnail;
