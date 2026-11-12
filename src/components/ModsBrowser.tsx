import { Check, Download, Power, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Instance, InstanceMod, Mod } from '../lib/types';
import { formatDownloads } from '../lib/minecraftVersions';

const CATEGORIES = ['all', 'performance', 'graphics', 'utility', 'content', 'worldgen', 'library'] as const;
const CATEGORY_LABEL: Record<string, string> = {
  all: 'Tất cả',
  performance: 'Hiệu năng',
  graphics: 'Đồ họa',
  utility: 'Tiện ích',
  content: 'Nội dung',
  worldgen: 'Thế giới',
  library: 'Thư viện',
};

const MOD_PALETTES = [
  'from-emerald-400/25 to-emerald-400/5 text-emerald-300',
  'from-sky-400/25 to-sky-400/5 text-sky-300',
  'from-amber-400/25 to-amber-400/5 text-amber-300',
  'from-rose-400/25 to-rose-400/5 text-rose-300',
  'from-lime-400/25 to-lime-400/5 text-lime-300',
];

interface Props {
  mods: Mod[];
  instanceMods: InstanceMod[];
  instance: Instance | null;
  updatesAvailable: number;
  onToggle: (mod: Mod) => void;
  onToggleEnabled: (mod: Mod) => void;
  onUpdateAll: () => void;
}

export function ModsBrowser({ mods, instanceMods, instance, updatesAvailable, onToggle, onToggleEnabled, onUpdateAll }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [view, setView] = useState<'discover' | 'installed'>('discover');
  const [pulse, setPulse] = useState<string | null>(null);

  const installedMap = useMemo(
    () =>
      new Map(
        instanceMods
          .filter((x) => x.instance_id === instance?.id)
          .map((x) => [x.mod_id, x.enabled]),
      ),
    [instanceMods, instance?.id],
  );
  const installedIds = useMemo(() => new Set(installedMap.keys()), [installedMap]);
  const installedCount = installedIds.size;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mods.filter((m) => {
      if (view === 'installed' && !installedIds.has(m.id)) return false;
      if (category !== 'all' && m.category !== category) return false;
      if (q && !`${m.name} ${m.author} ${m.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [mods, query, category, view, installedIds]);

  const compatible = (m: Mod) => !instance || m.mc_versions.includes(instance.mc_version);

  const handleToggle = (mod: Mod) => {
    onToggle(mod);
    setPulse(mod.id);
    setTimeout(() => setPulse(null), 400);
  };

  return (
    <section className="vex-fade-up flex min-h-0 flex-1 flex-col">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-50">Mods</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {instance
              ? `Đang cài cho "${instance.name}" · Minecraft ${instance.mc_version}`
              : 'Chọn một instance trên tab Instances để cài mod.'}
          </p>
        </div>
        {updatesAvailable > 0 && (
          <button
            onClick={onUpdateAll}
            className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
          >
            <Download className="h-4 w-4" /> Cập nhật {updatesAvailable} mod
          </button>
        )}
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-vex-panel p-1 ring-1 ring-vex-border">
          {(
            [
              { id: 'discover', label: 'Khám phá' },
              { id: 'installed', label: `Đã cài (${installedCount})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                view === t.id ? 'bg-white/[0.09] text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, tác giả…"
            className="w-full rounded-xl border border-white/10 bg-vex-panel py-2.5 pl-10 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                category === c
                  ? 'bg-emerald-400 text-emerald-950'
                  : 'bg-vex-panel text-zinc-500 ring-1 ring-vex-border hover:text-zinc-200'
              }`}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            {view === 'installed'
              ? 'Chưa cài mod nào cho instance này — chuyển sang tab Khám phá.'
              : 'Không tìm thấy mod nào phù hợp.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 pb-6 lg:grid-cols-2">
            {filtered.map((mod, idx) => {
              const installed = installedIds.has(mod.id);
              const enabled = installedMap.get(mod.id) ?? false;
              const ok = compatible(mod);
              const pulsing = pulse === mod.id;
              return (
                <div
                  key={mod.id}
                  className={`group flex items-start gap-3.5 rounded-2xl border bg-vex-panel p-4 transition-all duration-200 hover:bg-vex-card ${
                    installed ? 'border-emerald-400/30' : 'border-vex-border hover:border-white/15'
                  }`}
                >
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br font-display text-lg font-bold ${MOD_PALETTES[idx % MOD_PALETTES.length]} ring-1 ring-white/10`}
                  >
                    {mod.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold tracking-tight text-zinc-50">{mod.name}</h3>
                      <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 ring-1 ring-white/[0.06]">
                        {mod.loader}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {mod.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {formatDownloads(mod.downloads)}
                      </span>
                      <span>bởi {mod.author}</span>
                      {!ok && instance && (
                        <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/20">
                          Không hỗ trợ {instance.mc_version}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {installed && (
                      <button
                        onClick={() => onToggleEnabled(mod)}
                        title={enabled ? 'Tắt mod (giữ cài đặt)' : 'Bật mod'}
                        className={`rounded-lg p-2 transition ${
                          enabled
                            ? 'text-emerald-400 hover:bg-emerald-400/10'
                            : 'text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-300'
                        }`}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => instance && handleToggle(mod)}
                      disabled={!instance}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                        pulsing ? 'scale-95' : ''
                      } ${
                        installed
                          ? 'flex items-center gap-1.5 bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-rose-500/15 hover:text-rose-300 hover:ring-rose-400/30'
                          : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300 disabled:opacity-40'
                      }`}
                    >
                      {installed ? (
                        <>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          <span className={enabled ? '' : 'opacity-60'}>Đã cài</span>
                        </>
                      ) : (
                        'Cài đặt'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
