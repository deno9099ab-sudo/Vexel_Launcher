import { AlertTriangle, CheckCircle2, ChevronDown, Clock, Loader2, Package, Play, Square } from 'lucide-react';
import type { Instance, DownloadTask, DownloadPhase } from '../lib/types';
import { accentClasses, formatPlaytime, LOADER_ICON, timeAgo } from '../lib/minecraftVersions';

interface Props {
  instance: Instance | null;
  instances: Instance[];
  username: string;
  phase: DownloadPhase;
  tasks: DownloadTask[];
  launchError: string | null;
  onLaunch: () => void;
  onStop: () => void;
  onReset: () => void;
  sendReport: () => void;
  onSelectInstance: (id: string) => void;
  modsCount: number;
}

export function PlayDashboard({
  instance,
  instances,
  username,
  phase,
  tasks,
  launchError,
  onLaunch,
  onStop,
  onReset,
  sendReport,
  onSelectInstance,
  modsCount,
}: Props) {
  const accent = accentClasses(instance?.accent ?? 'emerald');
  const busy = phase === 'auth' || phase === 'download' || phase === 'launching';
  const running = phase === 'running';

  return (
    <section className="vex-fade-up relative overflow-hidden rounded-3xl border border-vex-border shadow-2xl shadow-black/40">
      <img
        src="/hero-minecraft.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e0c]/95 via-[#0b0e0c]/78 to-[#0b0e0c]/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e0c]/95 via-[#0b0e0c]/20 to-transparent" />

      <div className="relative flex min-h-[340px] flex-col justify-end p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300/90">
              {running ? 'Đang chơi' : 'Sẵn sàng'}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white lg:text-5xl">
              {instance ? instance.name : 'Chưa có instance'}
            </h1>
            {instance && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-100 backdrop-blur-sm ring-1 ring-white/10">
                  <span className={`grid h-4 w-4 place-items-center rounded text-[9px] font-bold ${accent.bg} text-zinc-950`}>
                    {LOADER_ICON[instance.loader] ?? 'V'}
                  </span>
                  Minecraft {instance.mc_version} · <span className="capitalize">{instance.loader}</span>
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-sm ring-1 ring-white/10">
                  <Package className="h-3 w-3" /> {modsCount} mods
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-sm ring-1 ring-white/10">
                  <Clock className="h-3 w-3" /> {formatPlaytime(instance.playtime_minutes)}
                </span>
                {instance.last_played_at && (
                  <span className="text-[11px] text-zinc-400">Chơi gần nhất: {timeAgo(instance.last_played_at)}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {instances.length > 1 && (
              <div className="relative">
                <select
                  value={instance?.id ?? ''}
                  onChange={(e) => onSelectInstance(e.target.value)}
                  className="appearance-none rounded-xl border border-white/15 bg-white/10 py-4 pl-4 pr-10 text-sm font-medium text-zinc-100 backdrop-blur-md outline-none transition hover:bg-white/15 focus:border-emerald-400/60"
                >
                  {instances.map((i) => (
                    <option key={i.id} value={i.id} className="bg-[#141814]">
                      {i.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            )}

            {running ? (
              <button
                onClick={onStop}
                className="flex items-center gap-2.5 rounded-xl bg-rose-500 px-9 py-4 font-display text-lg font-bold tracking-tight text-zinc-950 shadow-xl shadow-rose-950/40 transition hover:bg-rose-400 active:scale-[0.97]"
              >
                <Square className="h-5 w-5 fill-current" /> DỪNG
              </button>
            ) : (
              <button
                onClick={onLaunch}
                disabled={busy || !instance}
                className={`group flex items-center gap-3 rounded-xl px-10 py-4 font-display text-xl font-bold tracking-tight transition active:scale-[0.97] ${
                  busy
                    ? 'cursor-wait bg-zinc-800 text-zinc-500 ring-1 ring-white/10'
                    : 'bg-emerald-400 text-emerald-950 shadow-2xl shadow-emerald-500/30 hover:bg-emerald-300 hover:shadow-emerald-400/40'
                } disabled:opacity-50 disabled:shadow-none`}
              >
                {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6 fill-current" />}
                {phase === 'auth'
                  ? 'XÁC THỰC…'
                  : phase === 'download'
                    ? 'ĐANG TẢI…'
                    : phase === 'launching'
                      ? 'KHỞI ĐỘNG…'
                      : 'CHƠI'}
              </button>
            )}
          </div>
        </div>

        {phase === 'error' && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 backdrop-blur-md">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-300" />
            <p className="flex-1 text-sm font-medium text-rose-100">
              {launchError ?? 'Đã xảy ra lỗi không xác định.'}
            </p>
            <button
              onClick={sendReport}
              className="rounded-lg bg-rose-400/20 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/30"
            >
              Gửi báo cáo
            </button>
            <button
              onClick={onReset}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
            >
              Thử lại
            </button>
          </div>
        )}

        {tasks.length > 0 && !running && phase !== 'error' && (
          <div className="mt-5 space-y-2.5 rounded-2xl bg-black/40 p-4 ring-1 ring-white/10 backdrop-blur-md">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-52 truncate text-xs font-medium text-zinc-300">{t.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`progress-shimmer h-full rounded-full transition-all duration-300 ${
                      t.status === 'done' || t.status === 'verifying' ? 'bg-emerald-400' : accent.bg
                    }`}
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
                <span className="w-[72px] text-right text-[10px] font-medium tabular-nums text-zinc-400">
                  {t.status === 'done' ? (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-400" />
                  ) : t.status === 'verifying' ? (
                    'xác minh…'
                  ) : (
                    t.speed
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {running && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-sm font-medium text-emerald-100">
              Game đang chạy với <span className="font-bold">{username}</span> — Vexel runtime đang theo dõi tiến trình.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
