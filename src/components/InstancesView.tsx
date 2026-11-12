import { CalendarClock, Check, Clock, FileUp, Package, Plus, Settings2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Instance } from '../lib/types';
import { ACCENTS, LOADERS, MC_VERSIONS, LOADER_ICON, accentClasses, formatPlaytime, timeAgo } from '../lib/minecraftVersions';

interface Props {
  instances: Instance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string, version: string, loader: string, accent: string) => void;
  modsCountFor: (id: string) => number;
  onManage: (id: string) => void;
  onImport: (file: File) => Promise<string | null>;
}

export function InstancesView({ instances, selectedId, onSelect, onCreate, modsCountFor, onManage, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [version, setVersion] = useState(MC_VERSIONS[0].id);
  const [loader, setLoader] = useState<string>('vanilla');
  const [accent, setAccent] = useState<string>('emerald');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    setImportError(null);
    const err = await onImport(file);
    setImporting(false);
    if (err) setImportError(err);
  };

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), version, loader, accent);
    setName('');
    setOpen(false);
  };

  return (
    <section className="vex-fade-up flex-1">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-50">Instances</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {instances.length} bộ cài độc lập — mỗi instance có phiên bản, loader và mods riêng.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06] disabled:opacity-40"
          >
            <FileUp className="h-4 w-4" /> {importing ? 'Đang nhập…' : 'Nhập modpack'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              void handleImport(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Tạo instance
          </button>
        </div>
      </header>

      {importError && (
        <p className="mb-4 rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-300 ring-1 ring-rose-400/20">
          {importError}
        </p>
      )}

      {instances.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-vex-border py-24 text-center">
          <div>
            <Package className="mx-auto mb-3 h-8 w-8 text-zinc-700" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">Chưa có instance nào — tạo instance đầu tiên để bắt đầu.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {instances.map((inst) => {
            const a = accentClasses(inst.accent);
            const selected = inst.id === selectedId;
            const cover = COVERS[[...inst.id].reduce((n, c) => n + c.charCodeAt(0), 0) % COVERS.length];
            return (
              <div
                key={inst.id}
                onClick={() => onSelect(inst.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-vex-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 ${
                  selected ? `ring-2 ${a.ring} shadow-xl shadow-black/30` : 'ring-1 ring-white/[0.07] hover:ring-white/15'
                }`}
              >
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={cover}
                    alt=""
                    className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-vex-panel" />
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay"
                    style={{ background: `linear-gradient(135deg, ${a.dot}, transparent 70%)` }}
                  />
                  {selected && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-50 ring-1 ring-white/15 backdrop-blur-md">
                      <Check className={`h-3 w-3 ${a.text}`} strokeWidth={3} /> Đang chọn
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onManage(inst.id);
                    }}
                    title="Quản lý instance"
                    aria-label="Quản lý instance"
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-black/45 text-zinc-300 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/70 hover:text-white"
                  >
                    <Settings2 className="h-4 w-4 transition group-hover:rotate-45" />
                  </button>
                </div>

                <div className="relative -mt-7 px-5 pb-5">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl font-display text-xl font-bold text-zinc-950 shadow-lg shadow-black/50 ring-4 ring-vex-panel ${a.bg}`}
                  >
                    {LOADER_ICON[inst.loader] ?? 'V'}
                  </span>
                  <h3 className="mt-3 truncate font-display text-base font-bold tracking-tight text-zinc-50">{inst.name}</h3>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-semibold tabular-nums text-zinc-300">
                      {inst.mc_version}
                    </span>
                    <span className={`rounded-md px-1.5 py-0.5 font-semibold capitalize ${a.text} bg-white/[0.04]`}>
                      {inst.loader}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] rounded-xl bg-black/25 py-2.5 ring-1 ring-white/[0.05]">
                    <Stat icon={Package} value={String(modsCountFor(inst.id))} label="mods" />
                    <Stat icon={Clock} value={formatPlaytime(inst.playtime_minutes)} label="đã chơi" />
                    <Stat
                      icon={CalendarClock}
                      value={inst.last_played_at ? timeAgo(inst.last_played_at) : 'Chưa'}
                      label="lần cuối"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="vex-fade-up w-full max-w-md rounded-2xl border border-vex-border bg-vex-panel p-6 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold tracking-tight text-zinc-50">Instance mới</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Tên instance</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Survival 1.21"
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
              autoFocus
            />

            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Phiên bản Minecraft</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mb-2 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-emerald-400/60"
            >
              {MC_VERSIONS.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#141814]">
                  {v.id} {v.type !== 'release' ? `(${v.type})` : ''}
                </option>
              ))}
            </select>
            <p className="mb-4 text-[11px] leading-relaxed text-zinc-600">
              Gồm cả snapshot mới nhất và các bản beta/alpha cổ điển — bật/tắt hiển thị snapshot trong Cài đặt.
            </p>

            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Mod loader</label>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {LOADERS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLoader(l.id)}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                    loader === l.id
                      ? 'border-emerald-400/70 bg-emerald-400/10 text-emerald-300'
                      : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Màu chủ đạo</label>
            <div className="mb-6 flex gap-2.5">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  className={`h-8 w-8 rounded-full ${a.swatch} transition ${
                    accent === a.id
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-vex-panel'
                      : 'opacity-45 hover:opacity-90'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={submit}
              disabled={!name.trim()}
              className="w-full rounded-xl bg-emerald-400 py-3 font-display text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              Tạo instance
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

const COVERS = ['/world-survival.webp', '/world-creative.webp', '/world-hardcore.webp', '/hero-minecraft.webp', '/packs-hero.webp'];

function Stat({ icon: Icon, value, label }: { icon: typeof Package; value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center px-2 text-center">
      <span className="flex max-w-full items-center gap-1 text-xs font-bold text-zinc-100">
        <Icon className="h-3 w-3 shrink-0 text-zinc-500" />
        <span className="truncate">{value}</span>
      </span>
      <span className="mt-0.5 text-[10px] text-zinc-500">{label}</span>
    </div>
  );
}
