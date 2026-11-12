import { Globe, Plus, RefreshCw, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Server } from '../lib/types';
import { accentClasses } from '../lib/minecraftVersions';
import { Modal } from './WorldsView';

interface Props {
  servers: Server[];
  onAdd: (name: string, address: string) => void;
  onRemove: (server: Server) => void;
  onToggleFavorite: (server: Server) => void;
  onRefresh: (server: Server) => void;
  onRefreshAll: () => void;
}

export function ServersView({ servers, onAdd, onRemove, onToggleFavorite, onRefresh, onRefreshAll }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const submit = () => {
    if (!name.trim() || !address.trim()) return;
    onAdd(name.trim(), address.trim());
    setName('');
    setAddress('');
    setOpen(false);
  };

  return (
    <section className="vex-fade-up flex-1">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-50">Servers</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {servers.length} server đã lưu — ping để cập nhật trạng thái trực tiếp.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefreshAll}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06]"
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Thêm server
          </button>
        </div>
      </header>

      {servers.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-vex-border py-24 text-center">
          <div>
            <Globe className="mx-auto mb-3 h-8 w-8 text-zinc-700" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">Chưa có server nào — thêm server đầu tiên.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {servers.map((s) => {
            const a = accentClasses(s.accent);
            const pct = Math.min(100, Math.round((s.players_online / s.players_max) * 100));
            return (
              <div
                key={s.id}
                className="group flex flex-wrap items-center gap-4 rounded-2xl border border-vex-border bg-vex-panel p-4 transition hover:border-white/15 hover:bg-vex-card"
              >
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${a.bg} font-display text-xl font-bold text-emerald-950`}
                >
                  {s.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-[15px] font-bold tracking-tight text-zinc-50">
                      {s.name}
                    </h3>
                    <span className="flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 ring-1 ring-white/[0.06]">
                      {s.address}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{s.motd}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-emerald-400/80 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-[11px] text-zinc-500">
                      {s.players_online.toLocaleString()} / {s.players_max.toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="hidden rounded-lg bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-emerald-300 ring-1 ring-white/[0.06] sm:block">
                  {s.last_ping_ms != null ? `${s.last_ping_ms}ms` : '—'}
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => onRefresh(s)}
                    title="Ping server"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleFavorite(s)}
                    title={s.favorited ? 'Bỏ yêu thích' : 'Yêu thích'}
                    className={`rounded-lg p-2 transition hover:bg-white/[0.06] ${
                      s.favorited ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${s.favorited ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => onRemove(s)}
                    title="Xóa server"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-500/15 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h3 className="mb-5 font-display text-xl font-bold tracking-tight text-zinc-50">Thêm server</h3>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Tên server</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Hypixel"
            autoFocus
            className="mb-4 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
          />
          <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Địa chỉ IP</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="mc.example.net"
            className="mb-6 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
          />
          <button
            onClick={submit}
            disabled={!name.trim() || !address.trim()}
            className="w-full rounded-xl bg-emerald-400 py-3 font-display text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            Thêm server
          </button>
        </Modal>
      )}
    </section>
  );
}
