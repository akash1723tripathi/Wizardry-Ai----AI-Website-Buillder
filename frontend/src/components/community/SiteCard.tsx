import { Link } from "react-router-dom";
import { timeAgo, type CommunitySite } from "@/lib/community";
import SiteThumbnail from "./SiteThumbnail";

const SiteCard = ({ site }: { site: CommunitySite }) => {
    const author = site.user?.name || "Anonymous";

    return (
        <Link
            to={`/view/${site.id}`}
            className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5d8ff]"
        >
            <SiteThumbnail code={site.current_code} title={site.name} />
            <div className="p-4">
                <h3 className="line-clamp-1 text-base font-medium capitalize text-slate-100 group-hover:text-white">{site.name}</h3>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span className="flex min-w-0 items-center gap-2">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-semibold uppercase text-black">
                            {author.slice(0, 1)}
                        </span>
                        <span className="truncate">{author}</span>
                    </span>
                    <span className="shrink-0">{timeAgo(site.updatedAt)}</span>
                </div>
            </div>
        </Link>
    );
};

export default SiteCard;
