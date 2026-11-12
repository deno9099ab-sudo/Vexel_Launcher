import { ArrowRight, Calendar } from 'lucide-react';
import type { NewsPost } from '../lib/types';
import { timeAgo } from '../lib/minecraftVersions';

const IMAGES: Record<string, string> = {
  Launcher: '/news-launcher.webp',
  Minecraft: '/news-update.webp',
  Community: '/news-trials.webp',
  Snapshot: '/news-snapshot.webp',
};

const TAG_COLORS: Record<string, string> = {
  Launcher: 'bg-emerald-400/90 text-emerald-950',
  Minecraft: 'bg-sky-400/90 text-sky-950',
  Community: 'bg-amber-400/90 text-amber-950',
  Snapshot: 'bg-teal-300/90 text-teal-950',
};

export function NewsGrid({ news }: { news: NewsPost[] }) {
  if (news.length === 0) return null;
  return (
    <section className="vex-fade-up" style={{ animationDelay: '0.08s' }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold tracking-tight text-zinc-100">Tin tức mới</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {news.slice(0, 3).map((post) => (
          <article
            key={post.id}
            className="group overflow-hidden rounded-2xl border border-vex-border bg-vex-card transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-black/30"
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={IMAGES[post.tag] ?? '/news-worldgen.webp'}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span
                className={`absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TAG_COLORS[post.tag] ?? TAG_COLORS.Minecraft}`}
              >
                {post.tag}
              </span>
            </div>
            <div className="p-4">
              <h4 className="font-display text-[15px] font-bold leading-snug tracking-tight text-zinc-50">
                {post.title}
              </h4>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{post.excerpt}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                  <Calendar className="h-3 w-3" />
                  {timeAgo(post.published_at)}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 opacity-0 transition duration-200 group-hover:opacity-100">
                  Đọc thêm <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
