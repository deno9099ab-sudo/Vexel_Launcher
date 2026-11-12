import { Copy, Map, MoreVertical, Pencil, Play, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Instance, World } from '../lib/types';
import { accentClasses, timeAgo } from '../lib/minecraftVersions';

const GAME_MODE_LABEL: Record<string, string> = {
  survival: 'Sinh tồn',
  creative: 'Sáng tạo',
  hardcore: 'Hardcore',
};

const WORLD_THUMB: Record<string, string> = {
  survival: '/world-survival.webp',
  creative: '/world-creative.webp',
  hardcore: '/world-hardcore.webp',
};

function formatSize(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

interface Props {
  worlds: World[];
  instances: Instance[];
  selectedInstanceId: string | null;
  onCreate: (name: string, gameMode: string) => void;
  onDuplicate: (world: World) => void;
  onRename: (world: World, name: string) => void;
  onDelete: (world: World) => void;
}

export function WorldsView({
  worlds,
  instances,
  selectedInstanceId,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [mode, setMode] = useState('survival');
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<World | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<World | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selected = instances.find((i) => i.id === selectedInstanceId) ?? null;
  const filtered = selected ? worlds.filter((w) => w.instance_id === selected.id) : [];

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), mode);
    setName('');
    setOpen(false);
  };

  const submitRename = () => {
    if (renaming && renameValue.trim()) onRename(renaming, renameValue.trim());
    setRenaming(null);
  };

  const accent = accentClasses(selected?.accent ?? 'emerald');

  return (
    <section className="vex-fade-up flex-1">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-50">Thế giới</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {selected
              ? `${filtered.length} bản lưu trong instance "${selected.name}"`
              : 'Chọn một instance để xem thế giới của nó.'}
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={!selected}
          className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.97] disabled:opacity-40 disabled:shadow-none"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} /> Tạo thế giới
        </button>
      </header>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-vex-border py-24 text-center">
          <div>
            <Map className="mx-auto mb-3 h-8 w-8 text-zinc-700" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">
              {selected ? 'Chưa có thế giới nào — tạo thế giới đầu tiên.' : 'Chọn instance ở tab Chơi.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((world) => (
            <div
              key={world.id}
              className={`group relative rounded-2xl border border-vex-border bg-vex-panel transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-black/30 ${
                menuFor === world.id ? 'z-20' : ''
              }`}
            >
              <div className="relative h-36">
                <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
                  <img
                    src={WORLD_THUMB[world.game_mode] ?? WORLD_THUMB.survival}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
                <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-100 backdrop-blur-sm ring-1 ring-white/15">
                  {GAME_MODE_LABEL[world.game_mode] ?? world.game_mode}
                </span>
                <div className="absolute bottom-2.5 right-2.5" ref={menuFor === world.id ? menuRef : undefined}>
                  <button
                    onClick={() => setMenuFor((cur) => (cur === world.id ? null : world.id))}
                    className="rounded-lg bg-black/45 p-1.5 text-zinc-200 backdrop-blur-sm ring-1 ring-white/15 transition hover:bg-black/65"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuFor === world.id && (
                    <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl border border-vex-border bg-[#151a15] py-1 shadow-2xl shadow-black/60">
                      <MenuItem
                        icon={<Pencil className="h-3.5 w-3.5" />}
                        label="Đổi tên"
                        onClick={() => {
                          setRenaming(world);
                          setRenameValue(world.name);
                          setMenuFor(null);
                        }}
                      />
                      <MenuItem
                        icon={<Copy className="h-3.5 w-3.5" />}
                        label="Nhân đôi"
                        onClick={() => {
                          onDuplicate(world);
                          setMenuFor(null);
                        }}
                      />
                      <div className="my-1 h-px bg-white/[0.07]" />
                      <MenuItem
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        label="Xóa thế giới"
                        danger
                        onClick={() => {
                          setConfirmDelete(world);
                          setMenuFor(null);
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDuplicate(world)}
                  title="Chơi thế giới này"
                  className={`absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-950 opacity-0 shadow-lg transition group-hover:opacity-100 ${accent.bg}`}
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Chơi
                </button>
              </div>
              <div className="p-4">
                <h3 className="truncate font-display text-[15px] font-bold tracking-tight text-zinc-50">
                  {world.name}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                  <span className="tabular-nums">{formatSize(world.size_mb)}</span>
                  <span>·</span>
                  <span>
                    {world.last_played_at ? `Chơi ${timeAgo(world.last_played_at)}` : 'Chưa chơi'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h3 className="mb-5 font-display text-xl font-bold tracking-tight text-zinc-50">Thế giới mới</h3>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Tên thế giới</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Thành phố mùa hạ"
            autoFocus
            className="mb-4 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
          />
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Chế độ chơi</label>
          <div className="mb-6 grid grid-cols-3 gap-2">
            {Object.entries(GAME_MODE_LABEL).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                  mode === id
                    ? 'border-emerald-400/70 bg-emerald-400/10 text-emerald-300'
                    : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="w-full rounded-xl bg-emerald-400 py-3 font-display text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            Tạo thế giới
          </button>
        </Modal>
      )}

      {renaming && (
        <Modal onClose={() => setRenaming(null)} small>
          <h3 className="mb-4 font-display text-lg font-bold tracking-tight text-zinc-50">Đổi tên thế giới</h3>
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
            className="mb-5 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
          />
          <button
            onClick={submitRename}
            disabled={!renameValue.trim()}
            className="w-full rounded-xl bg-emerald-400 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-40"
          >
            Lưu
          </button>
        </Modal>
      )}

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)} small>
          <h3 className="font-display text-lg font-bold tracking-tight text-zinc-50">Xóa thế giới?</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Thế giới "{confirmDelete.name}" sẽ bị xóa vĩnh viễn, không thể khôi phục.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onDelete(confirmDelete);
                setConfirmDelete(null);
              }}
              className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-zinc-50 transition hover:bg-rose-400"
            >
              Xóa
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition ${
        danger ? 'text-rose-400 hover:bg-rose-500/10' : 'text-zinc-300 hover:bg-white/[0.06]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function Modal({
  children,
  onClose,
  small,
}: {
  children: React.ReactNode;
  onClose: () => void;
  small?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`vex-fade-up w-full ${small ? 'max-w-sm' : 'max-w-md'} relative rounded-2xl border border-vex-border bg-vex-panel p-6 shadow-2xl shadow-black/50`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
