import { Blocks, Box, CalendarClock, ChevronRight, Clock, CopyPlus, Cpu, Earth, Info, Layers, Package, PackageOpen, Palette, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Instance } from '../lib/types';
import { ACCENTS, LOADERS, LOADER_ICON, MC_VERSIONS, accentClasses, formatPlaytime, timeAgo } from '../lib/minecraftVersions';

type Patch = Partial<
  Pick<Instance, 'name' | 'mc_version' | 'loader' | 'accent' | 'notes' | 'width' | 'height' | 'ram_mb' | 'java_args'>
>;

interface Props {
  instance: Instance;
  modsCount: number;
  packsCount: number;
  worldsCount: number;
  globalRamMb: number;
  globalJavaArgs: string;
  onClose: () => void;
  onSave: (id: string, patch: Patch) => Promise<boolean>;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
}

const TABS = [
  { id: 'general', label: 'Tổng quan', icon: Info },
  { id: 'java', label: 'Java & cửa sổ', icon: Cpu },
  { id: 'manage', label: 'Quản lý', icon: Package },
] as const;
type TabKey = (typeof TABS)[number]['id'];

const input =
  'w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20';

export function InstanceDrawer({
  instance,
  modsCount,
  packsCount,
  worldsCount,
  globalRamMb,
  globalJavaArgs,
  onClose,
  onSave,
  onDuplicate,
  onExport,
  onDelete,
}: Props) {
  const [tab, setTab] = useState<TabKey>('general');
  const [draft, setDraft] = useState<Patch>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft({});
    setConfirmDelete(false);
  }, [instance.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const v = { ...instance, ...draft };
  const set = (patch: Patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };
  const dirty = Object.keys(draft).length > 0;
  const nameOk = (v.name ?? '').trim().length > 0;
  const a = accentClasses(v.accent);

  const versionChanged = draft.mc_version !== undefined && draft.mc_version !== instance.mc_version;
  const loaderChanged = draft.loader !== undefined && draft.loader !== instance.loader;

  const save = async () => {
    if (!dirty || !nameOk) return;
    setSaving(true);
    const patch = { ...draft, name: draft.name?.trim() };
    if (patch.name === undefined) delete patch.name;
    const ok = await onSave(instance.id, patch);
    setSaving(false);
    if (ok) {
      setDraft({});
      setSaved(true);
    }
  };

  const ramOverride = v.ram_mb > 0;
  const resOverride = v.width > 0 && v.height > 0;
  const ramFill = (((ramOverride ? v.ram_mb : globalRamMb) - 1024) / (16384 - 1024)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="vex-slide-in flex h-full w-full max-w-xl flex-col border-l border-vex-border bg-vex-panel shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative overflow-hidden border-b border-vex-border">
          <img
            src="/hero-minecraft.webp"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(120% 90% at 0% 0%, ${a.dot}2e 0%, transparent 55%), linear-gradient(to bottom, rgba(18,22,18,0.35), rgb(18,22,18) 92%)`,
            }}
          />
          <div className="relative px-6 pt-6">
            <div className="flex items-start gap-4">
              <span
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${a.bg} font-display text-2xl font-bold text-zinc-950 shadow-lg shadow-black/40 ring-1 ring-white/20`}
              >
                {LOADER_ICON[v.loader] ?? 'V'}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${a.text}`}>Quản lý instance</p>
                <h2 className="mt-1 truncate font-display text-[22px] font-bold leading-tight tracking-tight text-zinc-50">
                  {v.name || 'Chưa đặt tên'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="-mr-1.5 -mt-1 rounded-xl p-2 text-zinc-500 transition hover:rotate-90 hover:bg-white/[0.07] hover:text-zinc-100"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip icon={Box}>Minecraft {v.mc_version}</Chip>
              <Chip icon={Layers}>
                <span className="capitalize">{v.loader}</span>
              </Chip>
              <Chip icon={Clock}>{formatPlaytime(instance.playtime_minutes)}</Chip>
              <Chip icon={CalendarClock}>
                {instance.last_played_at ? `Chơi ${timeAgo(instance.last_played_at)}` : 'Chưa chơi lần nào'}
              </Chip>
            </div>

            <nav className="mt-5 flex gap-6">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`relative flex items-center gap-1.5 pb-3 pt-1 text-[13px] font-semibold transition ${
                      active ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? a.text : ''}`} /> {label}
                    <span
                      className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-all duration-200 ${
                        active ? `${a.bg} opacity-100` : 'bg-transparent opacity-0'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {tab === 'general' && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Tên instance</label>
                <input value={v.name} maxLength={60} onChange={(e) => set({ name: e.target.value })} className={input} />
                {!nameOk && <p className="mt-1.5 text-[11px] text-rose-400">Tên không được để trống.</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Phiên bản</label>
                  <select value={v.mc_version} onChange={(e) => set({ mc_version: e.target.value })} className={input}>
                    {MC_VERSIONS.map((ver) => (
                      <option key={ver.id} value={ver.id} className="bg-[#141814]">
                        {ver.id} {ver.type !== 'release' ? `(${ver.type})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Mod loader</label>
                  <select value={v.loader} onChange={(e) => set({ loader: e.target.value })} className={input}>
                    {LOADERS.map((l) => (
                      <option key={l.id} value={l.id} className="bg-[#141814]">
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(versionChanged || loaderChanged) && modsCount > 0 && (
                <p className="rounded-xl bg-amber-400/[0.08] px-4 py-3 text-xs leading-relaxed text-amber-200 ring-1 ring-amber-400/20">
                  Đổi phiên bản hoặc loader có thể làm {modsCount} mod đã cài không còn tương thích. Hãy kiểm tra lại ở tab
                  Mods sau khi lưu.
                </p>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Màu chủ đạo</label>
                <div className="flex gap-2.5">
                  {ACCENTS.map((ac) => (
                    <button
                      key={ac.id}
                      onClick={() => set({ accent: ac.id })}
                      aria-label={ac.id}
                      className={`h-8 w-8 rounded-full ${ac.swatch} transition ${
                        v.accent === ac.id
                          ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-vex-panel'
                          : 'opacity-45 hover:opacity-90'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Ghi chú</label>
                <textarea
                  value={v.notes}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="VD: Server chơi với bạn bè, nhớ backup trước khi update…"
                  className={`${input} resize-none leading-relaxed`}
                />
              </div>
            </div>
          )}

          {tab === 'java' && (
            <div className="flex flex-col gap-5">
              <Section
                title="RAM riêng cho instance"
                hint={ramOverride ? `Đang dùng ${(v.ram_mb / 1024).toFixed(1)} GB` : `Theo cài đặt chung (${(globalRamMb / 1024).toFixed(1)} GB)`}
                on={ramOverride}
                onToggle={() => set({ ram_mb: ramOverride ? 0 : globalRamMb })}
              >
                <input
                  type="range"
                  min={1024}
                  max={16384}
                  step={512}
                  value={ramOverride ? v.ram_mb : globalRamMb}
                  disabled={!ramOverride}
                  onChange={(e) => set({ ram_mb: Number(e.target.value) })}
                  className="w-full disabled:opacity-40"
                  style={{ '--fill': `${ramFill}%` } as React.CSSProperties}
                />
                <div className="mt-2 flex justify-between text-[10px] font-medium tabular-nums text-zinc-600">
                  <span>1 GB</span>
                  <span>8 GB</span>
                  <span>16 GB</span>
                </div>
              </Section>

              <Section
                title="JVM arguments riêng"
                hint={v.java_args ? 'Ghi đè tham số chung khi chạy instance này' : `Theo cài đặt chung${globalJavaArgs ? `: ${globalJavaArgs}` : ''}`}
              >
                <input
                  value={v.java_args}
                  maxLength={300}
                  onChange={(e) => set({ java_args: e.target.value })}
                  placeholder={globalJavaArgs || '-XX:+UseG1GC'}
                  className={`${input} font-mono text-xs`}
                />
              </Section>

              <Section
                title="Kích thước cửa sổ riêng"
                hint={resOverride ? `${v.width} × ${v.height}` : 'Theo cài đặt chung'}
                on={resOverride}
                onToggle={() => set(resOverride ? { width: 0, height: 0 } : { width: 1920, height: 1080 })}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={854}
                    max={7680}
                    disabled={!resOverride}
                    value={resOverride ? v.width : ''}
                    onChange={(e) => set({ width: Number(e.target.value) })}
                    className={`${input} tabular-nums disabled:opacity-40`}
                  />
                  <span className="text-sm text-zinc-600">×</span>
                  <input
                    type="number"
                    min={480}
                    max={4320}
                    disabled={!resOverride}
                    value={resOverride ? v.height : ''}
                    onChange={(e) => set({ height: Number(e.target.value) })}
                    className={`${input} tabular-nums disabled:opacity-40`}
                  />
                </div>
              </Section>
            </div>
          )}

          {tab === 'manage' && (
            <div className="flex flex-col gap-7">
              <div className="grid grid-cols-3 divide-x divide-white/[0.06] overflow-hidden rounded-2xl border border-vex-border bg-black/20">
                <Count label="Mods" value={modsCount} icon={Blocks} />
                <Count label="Gói tài nguyên" value={packsCount} icon={Palette} />
                <Count label="Thế giới" value={worldsCount} icon={Earth} />
              </div>

              <div>
                <SectionLabel>Hành động</SectionLabel>
                <div className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-vex-border bg-black/20">
                  <ActionRow
                    icon={PackageOpen}
                   
                    title="Xuất modpack"
                    desc="Lưu phiên bản, mod, gói và cấu hình Java ra tệp để chia sẻ"
                    onClick={() => onExport(instance.id)}
                  />
                  <ActionRow
                    icon={CopyPlus}
                   
                    title="Nhân bản instance"
                    desc="Tạo bản sao để thử nghiệm mà không ảnh hưởng bản gốc"
                    onClick={() => {
                      onDuplicate(instance.id);
                      onClose();
                    }}
                  />
                </div>
              </div>

              <div>
                <SectionLabel>Vùng nguy hiểm</SectionLabel>
                <div
                  className={`rounded-2xl border p-4 transition-colors ${
                    confirmDelete ? 'border-rose-400/40 bg-rose-500/[0.08]' : 'border-rose-500/20 bg-rose-500/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/[0.08] text-rose-300 ring-1 ring-inset ring-rose-400/15">
                      <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-100">
                        {confirmDelete ? 'Chắc chắn xóa?' : 'Xóa instance'}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                        {confirmDelete
                          ? 'Không thể hoàn tác thao tác này.'
                          : `Gồm ${modsCount} mod, ${packsCount} gói và ${worldsCount} thế giới`}
                      </p>
                    </div>
                    {confirmDelete ? (
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => {
                            onDelete(instance.id);
                            onClose();
                          }}
                          className="rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-400 active:scale-[0.97]"
                        >
                          Xóa vĩnh viễn
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold text-rose-300 ring-1 ring-rose-400/30 transition hover:bg-rose-500/15 hover:text-rose-200"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {tab !== 'manage' && (
          <footer className="flex items-center justify-between gap-3 border-t border-vex-border p-4">
            <p className="text-xs text-zinc-500">
              {dirty ? 'Có thay đổi chưa lưu' : saved ? 'Đã lưu' : 'Chưa có thay đổi'}
            </p>
            <div className="flex gap-2">
              {dirty && (
                <button
                  onClick={() => setDraft({})}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5"
                >
                  Hoàn tác
                </button>
              )}
              <button
                onClick={save}
                disabled={!dirty || !nameOk || saving}
                className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.97] disabled:opacity-40 disabled:shadow-none"
              >
                {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}

function Section({
  title,
  hint,
  on,
  onToggle,
  children,
}: {
  title: string;
  hint: string;
  on?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-vex-border bg-black/15 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight text-zinc-100">{title}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{hint}</p>
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            role="switch"
            aria-checked={on}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-emerald-400' : 'bg-white/10'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200 ${
                on ? 'left-[22px] bg-emerald-950' : 'left-0.5 bg-white'
              }`}
            />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Count({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Info }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {label}
      </span>
      <p className="font-display text-2xl font-bold leading-none tabular-nums text-zinc-50">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{children}</p>;
}

function ActionRow({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: typeof Info;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 p-4 text-left transition hover:bg-white/[0.04]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-zinc-400 ring-1 ring-inset ring-white/[0.08] transition group-hover:bg-emerald-400/10 group-hover:text-emerald-300 group-hover:ring-emerald-400/25">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-zinc-100">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{desc}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-300" />
    </button>
  );
}

function Chip({ icon: Icon, children }: { icon: typeof Info; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-zinc-300 ring-1 ring-white/[0.08] backdrop-blur-sm">
      <Icon className="h-3 w-3 text-zinc-500" />
      {children}
    </span>
  );
}
