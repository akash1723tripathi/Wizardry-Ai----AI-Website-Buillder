import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/configs/axios";
import type { CommunitySite } from "@/lib/community";
import SiteCard from "../community/SiteCard";

export default function CommunitySection() {
    const [sites, setSites] = useState<CommunitySite[] | null>(null);

    useEffect(() => {
        api.get("/api/project/published", { params: { limit: 6 } })
            .then(({ data }) => setSites(data.projects))
            .catch(() => setSites([]));
    }, []);

    return (
        <section id="community" className="mx-auto mt-32 max-w-6xl scroll-mt-28">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <h3 className="font-domine text-3xl text-slate-100">Built by the community</h3>
                    <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                        Real websites made with Wizardry AI and published by their creators. Open one to see it live.
                    </p>
                </div>
                {sites && sites.length > 0 && (
                    <Link to="/community" className="shrink-0 rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-100 transition hover:bg-white/10">
                        See all websites
                    </Link>
                )}
            </div>

            {sites === null ? (
                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="aspect-[16/13] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
                    ))}
                </div>
            ) : sites.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
                    <p className="text-base text-slate-100">No websites have been published yet</p>
                    <p className="mt-2 text-sm text-slate-400">Build one above, then press Publish to be the first here.</p>
                </div>
            ) : (
                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {sites.map((site) => <SiteCard key={site.id} site={site} />)}
                </div>
            )}
        </section>
    );
}
