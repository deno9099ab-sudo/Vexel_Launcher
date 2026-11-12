import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  HardDrive,
  Layers3,
  Power,
  Search,
  Sparkles,
  SwatchBook,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { Instance, InstanceResourcePack, PackKind, ResourcePack } from '../lib/types';
import { formatDownloads } from '../lib/minecraftVersions';

const CATEGORIES: Record<PackKind, string[]> = {
  resource: ['all', 'faithful', 'realistic', 'cartoon', 'pvp', 'utility'],
  shader: ['all', 'balanced', 'vibrant', 'realistic', 'performance'],
};
const CATEGORY_LABEL: Record<string, string> = {
  all: 'Tất cả',
  faithful: 'Giống gốc',
  realistic: 'Chân thực',
  cartoon: 'Hoạt hình',
  pvp: 'PvP',
  utility: 'Tiện ích',
  balanced: 'Cân bằng',
  vibrant: 'Rực rỡ',
  performance: 'Máy yếu',
  custom: 'Tự nhập',
};

const RESOLUTIONS: Record<PackKind, string[]> = {
  resource: ['all', '16x', '32x', '64x', '128x'],
  shader: ['all', 'Low', 'Medium', 'High', 'Ultra'],
};
const SHADER_LEVEL: Record<string, string> = {
  Low: 'Nhẹ',
  Medium: 'Vừa',
  High: 'Nặng',
  Ultra: 'Rất nặng',
};

const KIND_COPY: Record<PackKind, { eyebrow: string; title: string; desc: string; noun: string }> = {
  resource: {
    eyebrow: 'Gói tài nguyên',
    title: 'Resource Packs',
    desc: 'Thay đổi texture, âm thanh và giao diện',
    noun: 'resource pack',
  },
  shader: {
    eyebrow: 'Ánh sáng & bóng đổ',
    title: 'Shader Packs',
    desc: 'Thêm ánh sáng động, bóng đổ, nước phản chiếu',
    noun: 'shader',
  },
};

const TILE: Record<string, string> = {
  emerald: 'from-emerald-400/30 to-emerald-600/5 text-emerald-200 ring-emerald-400/25',
  sky: 'from-sky-400/30 to-sky-600/5 text-sky-200 ring-sky-400/25',
  amber: 'from-amber-400/30 to-amber-600/5 text-amber-200 ring-amber-400/25',
  rose: 'from-rose-400/30 to-rose-600/5 text-rose-200 ring-rose-400/25',
  lime: 'from-lime-400/30 to-lime-600/5 text-lime-200 ring-lime-400/25',
};

interface Props {
  packs: ResourcePack[];
  instancePacks: InstanceResourcePack[];
  instance: Instance | null;
  onToggleInstalled: (pack: ResourcePack) => void;
  onToggleEnabled: (pack: ResourcePack) => void;
  onMove: (packId: string, direction: -1 | 1) => void;
  onImport: (file: File, kind: PackKind) => Promise<string | null>;
  shaderReady: boolean;
  onInstallIris: (() => void) | null;
}

function PackTile({ pack, size = 'md' }: { pack: ResourcePack; size?: 'md' | 'sm' }) {
  const dims = size === 'md' ? 'h-12 w-12' : 'h-10 w-10';
  const label = pack.kind === 'shader' ? (SHADER_LEVEL[pack.resolution] ?? pack.resolution) : pack.resolution;
  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br font-display font-bold ring-1 ${dims} ${TILE[pack.accent] ?? TILE.emerald}`}
    >
      {pack.kind === 'shader' ? (
        <>
          <Sparkles className={size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={2} />
          <span className="absolute bottom-0.5 text-[8px] font-bold uppercase tracking-wide opacity-80">{label}</span>
        </>
      ) : (
        <span className={size === 'md' ? 'text-[11px]' : 'text-[10px]'}>{label}</span>
      )}
    </div>
  );
}

export function ResourcePacksView({
  packs,
  instancePacks,
  instance,
  onToggleInstalled,
  onToggleEnabled,
  onMove,
  onImport,
  shaderReady,
  onInstallIris,
}: Props) {
  const [kind, setKind] = useState<PackKind>('resource');
  const [view, setView] = useState<'discover' | 'installed'>('discover');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [resolution, setResolution] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const kindPackIds = useMemo(
    () => new Set(packs.filter((p) => p.kind === kind).map((p) => p.id)),
    [packs, kind],
  );

  const mine = useMemo(
    () =>
      instancePacks
        .filter((x) => x.instance_id === instance?.id && kindPackIds.has(x.pack_id))
        .sort((a, b) => a.position - b.position),
    [instancePacks, instance?.id, kindPackIds],
  );

  const switchKind = (k: PackKind) => {
    setKind(k);
    setCategory('all');
    setResolution('all');
    setImportError(null);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    setImportError(null);
    const err = await onImport(file, kind);
    setImporting(false);
    if (err) setImportError(err);
    else setView('installed');
  };

  const copy = KIND_COPY[kind];
  const installedMap = useMemo(() => new Map(mine.map((x) => [x.pack_id, x])), [mine]);
  const activeCount = mine.filter((x) => x.enabled).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packs.filter((p) => {
      if (p.kind !== kind || p.is_local) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (resolution !== 'all' && p.resolution !== resolution) return false;
      if (q && !`${p.name} ${p.author} ${p.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [packs, kind, query, category, resolution]);

  const installedPacks = mine
    .map((row) => ({ row, pack: packs.find((p) => p.id === row.pack_id) }))
    .filter((x): x is { row: InstanceResourcePack; pack: ResourcePack } => Boolean(x.pack));

  const compatible = (p: ResourcePack) => !instance || p.mc_versions.includes(instance.mc_version);

  return (
    <section className="vex-fade-up flex min-h-0 flex-1 flex-col">
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-vex-border">
        <img src="/packs-hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f0c] via-[#0b0f0c]/85 to-[#0b0f0c]/30" />
        <div className="relative flex flex-wrap items-end justify-between gap-4 p-6 lg:p-8">
          <div className="max-w-lg">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400">{copy.eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-50">{copy.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {instance
                ? `${copy.desc} cho "${instance.name}" · Minecraft ${instance.mc_version}`
                : `Chọn một instance ở tab Instances để cài ${copy.noun}.`}
            </p>
          </div>
          <div className="flex gap-3">
            <Stat label="Đã cài" value={mine.length} />
            <Stat label={kind === 'shader' ? 'Đang dùng' : 'Đang bật'} value={activeCount} />
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:max-w-md">
        {(
          [
            { id: 'resource', label: 'Gói tài nguyên', icon: SwatchBook },
            { id: 'shader', label: 'Shader', icon: Sparkles },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => switchKind(id)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              kind === id
                ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                : 'border-vex-border bg-vex-panel text-zinc-500 hover:border-white/15 hover:text-zinc-200'
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} /> {label}
          </button>
        ))}
      </div>

      {kind === 'shader' && instance && !shaderReady && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-amber-100/90">
            {onInstallIris
              ? 'Shader cần mod Iris để chạy. Instance này chưa cài Iris.'
              : 'Shader chỉ chạy trên instance Fabric hoặc Quilt có mod Iris. Hãy tạo instance Fabric để dùng shader.'}
          </p>
          {onInstallIris && (
            <button
              onClick={onInstallIris}
              className="shrink-0 rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-bold text-amber-950 transition hover:bg-amber-200"
            >
              Cài Iris ngay
            </button>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-vex-panel p-1 ring-1 ring-vex-border">
          {(
            [
              { id: 'discover', label: 'Khám phá' },
              { id: 'installed', label: `Đã cài (${mine.length})` },
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
        {view === 'discover' && (
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Tìm ${copy.noun}…`}
              className="w-full rounded-xl border border-white/10 bg-vex-panel py-2.5 pl-10 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!instance || importing}
          className="ml-auto flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06] disabled:opacity-40"
        >
          <Upload className="h-4 w-4" /> {importing ? 'Đang nhập…' : 'Nhập tệp .zip'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {importError && (
        <p className="mb-4 rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-300 ring-1 ring-rose-400/20">
          {importError}
        </p>
      )}

      {view === 'discover' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES[kind].map((c) => (
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
            <span className="hidden h-5 w-px bg-white/10 sm:block" />
            <div className="flex flex-wrap gap-1.5">
              {RESOLUTIONS[kind].map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold tabular-nums transition ${
                    resolution === r
                      ? 'bg-white/[0.12] text-zinc-50 ring-1 ring-white/20'
                      : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {r === 'all' ? (kind === 'shader' ? 'Mọi mức cấu hình' : 'Mọi độ phân giải') : kind === 'shader' ? SHADER_LEVEL[r] : r}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-500">Không tìm thấy {copy.noun} nào phù hợp.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 pb-6 lg:grid-cols-2">
              {filtered.map((pack) => {
                const installed = installedMap.has(pack.id);
                const ok = compatible(pack);
                return (
                  <div
                    key={pack.id}
                    className={`group flex items-start gap-3.5 rounded-2xl border bg-vex-panel p-4 transition-all duration-200 hover:bg-vex-card ${
                      installed ? 'border-emerald-400/30' : 'border-vex-border hover:border-white/15'
                    }`}
                  >
                    <PackTile pack={pack} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold tracking-tight text-zinc-50">{pack.name}</h3>
                        <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 ring-1 ring-white/[0.06]">
                          {CATEGORY_LABEL[pack.category] ?? pack.category}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">{pack.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" /> {formatDownloads(pack.downloads)}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" /> {pack.size_mb} MB
                        </span>
                        <span>bởi {pack.author}</span>
                        {!ok && instance && (
                          <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/20">
                            Có thể lỗi trên {instance.mc_version}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleInstalled(pack)}
                      disabled={!instance}
                      className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                        installed
                          ? 'flex items-center gap-1.5 bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-rose-500/15 hover:text-rose-300 hover:ring-rose-400/30'
                          : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300 disabled:opacity-40'
                      }`}
                    >
                      {installed ? (
                        <>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} /> Đã cài
                        </>
                      ) : (
                        'Cài đặt'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : installedPacks.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`grid place-items-center rounded-2xl border border-dashed py-20 text-center transition ${
            dragOver ? 'border-emerald-400/70 bg-emerald-400/[0.06]' : 'border-vex-border'
          }`}
        >
          <div>
            <Layers3 className="mx-auto mb-3 h-8 w-8 text-zinc-700" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">
              {instance
                ? `Chưa cài ${copy.noun} nào — chọn từ tab Khám phá hoặc kéo thả tệp .zip vào đây.`
                : 'Chưa chọn instance.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="pb-6">
          <p className="mb-3 text-xs leading-relaxed text-zinc-500">
            {kind === 'shader'
              ? 'Mỗi lần chỉ dùng được một shader — bật shader này sẽ tự tắt shader đang dùng.'
              : 'Gói ở trên cùng được ưu tiên cao nhất và sẽ ghi đè các gói bên dưới — giống thứ tự trong game.'}
          </p>
          <ol className="flex flex-col gap-2">
            {installedPacks.map(({ row, pack }, idx) => (
              <li
                key={pack.id}
                className={`group flex items-center gap-3 rounded-2xl border p-3 transition ${
                  row.enabled
                    ? 'border-vex-border bg-vex-panel hover:border-white/15'
                    : 'border-dashed border-white/[0.08] bg-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <span className="w-6 shrink-0 text-center font-display text-sm font-bold tabular-nums text-zinc-600">
                  {idx + 1}
                </span>
                <PackTile pack={pack} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold tracking-tight text-zinc-50">{pack.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {pack.kind === 'shader' ? `Cấu hình ${SHADER_LEVEL[pack.resolution] ?? pack.resolution}` : pack.resolution} ·{' '}
                    {pack.size_mb} MB · {pack.is_local ? 'Tự nhập · ' : ''}
                    {row.enabled ? (kind === 'shader' ? 'Đang dùng' : 'Đang bật') : 'Đã tắt'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {kind === 'resource' && (
                    <>
                      <IconBtn title="Ưu tiên cao hơn" disabled={idx === 0} onClick={() => onMove(pack.id, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        title="Ưu tiên thấp hơn"
                        disabled={idx === installedPacks.length - 1}
                        onClick={() => onMove(pack.id, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </IconBtn>
                    </>
                  )}
                  <IconBtn
                    title={row.enabled ? 'Tắt' : kind === 'shader' ? 'Dùng shader này' : 'Bật gói'}
                    onClick={() => onToggleEnabled(pack)}
                    active={row.enabled}
                  >
                    <Power className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn title="Gỡ cài đặt" danger onClick={() => onToggleInstalled(pack)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-black/40 px-4 py-2.5 text-center ring-1 ring-white/10 backdrop-blur-sm">
      <p className="font-display text-xl font-bold tabular-nums text-zinc-50">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
    </div>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  disabled,
  active,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-lg p-2 transition disabled:pointer-events-none disabled:opacity-25 ${
        danger
          ? 'text-zinc-500 hover:bg-rose-500/15 hover:text-rose-400'
          : active
            ? 'text-emerald-400 hover:bg-emerald-400/10'
            : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  );
}
