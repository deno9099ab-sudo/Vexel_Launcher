import { ArrowRight, Check, Download, Layers, Loader2, MemoryStick, Package, Play, Search, SwatchBook, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Instance, Mod, ModpackFile, ResourcePack } from '@/lib/types';
import { LOADERS, accentClasses, formatDownloads } from '@/lib/minecraftVersions';
import { MODPACK_CATALOG, MODPACK_CATEGORIES, type CatalogModpack, type ModpackCategory } from '@/lib/modpackCatalog';

interface Props {
  mods: Mod[];
  resourcePacks: ResourcePack[];
  instances: Instance[];
  onInstall: (pack: ModpackFile) => Promise<string | null>;
  onPlay: () => void;
}

const loaderLabel = (id: string) => LOADERS.find((l) => l.id === id)?.label ?? id;

export function ModpacksView({ mods, resourcePacks, instances, onInstall, onPlay }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ModpackCategory | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const installedNames = useMemo(() => new Set(instances.map((i) => i.name)), [instances]);
  const featured = MODPACK_CATALOG.find((m) => m.featured) ?? MODPACK_CATALOG[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MODPACK_CATALOG.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (q && !`${m.pack.name} ${m.author} ${m.tagline}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category]);

  const open = MODPACK_CATALOG.find((m) => m.id === openId) ?? null;

  return (
    <section className="vex-fade-up flex-1">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-50">Modpack</h1>
        <p className="mt-1 text-sm text-zinc-500">Bộ mod dựng sẵn — cài một lần, có ngay instance mới để chơi.</p>
      </header>

      <button
        onClick={() => setOpenId(featured.id)}
        className="group relative mb-8 block h-60 w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/[0.08] transition hover:ring-white/20"
      >
        <img
          src={featured.cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="relative flex h-full max-w-lg flex-col justify-end p-7">
          <span className="mb-3 w-fit rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300 ring-1 ring-emerald-400/30">
            Nổi bật
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">{featured.pack.name}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{featured.tagline}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
            <span>
              {featured.pack.mc_version} · {loaderLabel(featured.pack.loader)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> {formatDownloads(featured.downloads)}
            </span>
            <span className="ml-auto flex items-center gap-1.5 font-semibold text-zinc-100 transition group-hover:gap-2.5">
              Xem chi tiết <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </button>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm modpack…"
            className="w-full rounded-xl border border-white/10 bg-vex-panel py-2.5 pl-10 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MODPACK_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                category === c.id
                  ? 'bg-emerald-400 text-emerald-950'
                  : 'bg-vex-panel text-zinc-500 ring-1 ring-vex-border hover:text-zinc-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-vex-border py-20 text-center">
          <div>
            <Layers className="mx-auto mb-3 h-8 w-8 text-zinc-700" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">Không tìm thấy modpack phù hợp.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <PackCard key={m.id} item={m} installed={installedNames.has(m.pack.name)} onOpen={() => setOpenId(m.id)} />
          ))}
        </div>
      )}

      {open && (
        <PackDetail
          key={open.id}
          item={open}
          mods={mods}
          resourcePacks={resourcePacks}
          installed={installedNames.has(open.pack.name)}
          onInstall={onInstall}
          onPlay={onPlay}
          onClose={() => setOpenId(null)}
        />
      )}
    </section>
  );
}

function PackCard({ item, installed, onOpen }: { item: CatalogModpack; installed: boolean; onOpen: () => void }) {
  const a = accentClasses(item.pack.accent);
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-2xl bg-vex-panel text-left ring-1 ring-white/[0.07] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 hover:ring-white/15"
    >
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={item.cover}
          alt=""
          className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vex-panel via-transparent to-transparent" />
        {installed && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur-md">
            <Check className="h-3 w-3" strokeWidth={3} /> Đã cài
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-semibold tabular-nums text-zinc-300">
            {item.pack.mc_version}
          </span>
          <span className={`rounded-md bg-white/[0.04] px-1.5 py-0.5 font-semibold ${a.text}`}>
            {loaderLabel(item.pack.loader)}
          </span>
        </div>
        <h3 className="mt-2.5 font-display text-base font-bold tracking-tight text-zinc-50">{item.pack.name}</h3>
        <p className="text-[11px] text-zinc-600">bởi {item.author}</p>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-400">{item.tagline}</p>
        <div className="mt-4 flex items-center gap-4 border-t border-white/[0.06] pt-3.5 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" /> {formatDownloads(item.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> {item.pack.mods.length} mod
          </span>
          <ArrowRight className="ml-auto h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-200" />
        </div>
      </div>
    </button>
  );
}

interface DetailProps {
  item: CatalogModpack;
  mods: Mod[];
  resourcePacks: ResourcePack[];
  installed: boolean;
  onInstall: (pack: ModpackFile) => Promise<string | null>;
  onPlay: () => void;
  onClose: () => void;
}

function PackDetail({ item, mods, resourcePacks, installed, onInstall, onPlay, onClose }: DetailProps) {
  const [status, setStatus] = useState<'idle' | 'installing' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const a = accentClasses(item.pack.accent);

  const modNames = item.pack.mods.map((m) => mods.find((x) => x.slug === m.slug)?.name ?? m.slug);
  const packNames = item.pack.packs.map((p) => resourcePacks.find((x) => x.slug === p.slug)?.name ?? p.slug);

  const install = async () => {
    setStatus('installing');
    setError(null);
    const err = await onInstall(item.pack);
    if (err) {
      setError(err);
      setStatus('idle');
    } else setStatus('done');
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="vex-fade-up flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-vex-border bg-vex-panel shadow-2xl shadow-black/60"
      >
        <div className="relative h-44 shrink-0">
          <img src={item.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-vex-panel via-black/30 to-black/10" />
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-black/50 text-zinc-300 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-6 bottom-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white">{item.pack.name}</h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              bởi {item.author} · {formatDownloads(item.downloads)} lượt tải
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          <p className="text-sm leading-relaxed text-zinc-300">{item.description}</p>

          <div className="mt-5 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl bg-black/25 ring-1 ring-white/[0.05]">
            <Spec label="Phiên bản" value={item.pack.mc_version} />
            <Spec label="Loader" value={loaderLabel(item.pack.loader)} accent={a.text} />
            <Spec
              label="RAM gợi ý"
              value={item.pack.ram_mb ? `${item.pack.ram_mb / 1024} GB` : 'Mặc định'}
              icon={<MemoryStick className="h-3.5 w-3.5 text-zinc-500" />}
            />
          </div>

          <ContentList title="Mod" icon={Package} names={modNames} />
          {packNames.length > 0 && <ContentList title="Resource & Shader" icon={SwatchBook} names={packNames} />}
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-vex-border bg-black/20 px-6 py-4">
          <p className="min-w-0 flex-1 text-xs text-zinc-500">
            {error ? (
              <span className="text-rose-300">{error}</span>
            ) : status === 'done' ? (
              <span className="text-emerald-300">Đã tạo instance mới và chọn sẵn để chơi.</span>
            ) : installed ? (
              'Bạn đã có instance cùng tên — cài lại sẽ tạo thêm bản mới.'
            ) : (
              'Sẽ tạo một instance mới với toàn bộ nội dung trên.'
            )}
          </p>
          {status === 'done' ? (
            <button
              onClick={onPlay}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.97]"
            >
              <Play className="h-4 w-4 fill-current" /> Chơi ngay
            </button>
          ) : (
            <button
              onClick={install}
              disabled={status === 'installing'}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
            >
              {status === 'installing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang cài…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Cài modpack
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value, accent, icon }: { label: string; value: string; accent?: string; icon?: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 flex items-center gap-1.5 text-sm font-bold ${accent ?? 'text-zinc-100'}`}>
        {icon}
        {value}
      </p>
    </div>
  );
}

function ContentList({ title, icon: Icon, names }: { title: string; icon: typeof Package; names: string[] }) {
  return (
    <div className="mt-6">
      <p className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        <Icon className="h-3.5 w-3.5" /> {title} · {names.length}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {names.map((n) => (
          <span key={n} className="rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-white/[0.06]">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
