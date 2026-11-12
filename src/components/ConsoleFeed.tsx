import { Terminal, Trash2 } from 'lucide-react';
import type { ActivityLog } from '../lib/types';

const KIND_STYLE: Record<ActivityLog['kind'], string> = {
  info: 'text-zinc-400',
  success: 'text-emerald-300',
  warning: 'text-amber-300',
  error: 'text-rose-300',
};

const KIND_BADGE: Record<ActivityLog['kind'], string> = {
  info: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/20',
  success: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/25',
  warning: 'bg-amber-400/15 text-amber-300 ring-amber-400/25',
  error: 'bg-rose-400/15 text-rose-300 ring-rose-400/25',
};

const KIND_LABEL: Record<ActivityLog['kind'], string> = {
  info: 'INFO',
  success: 'OK',
  warning: 'WARN',
  error: 'LỖI',
};

export function ConsoleFeed({ logs, onClear }: { logs: ActivityLog[]; onClear: () => void }) {
  return (
    <section className="vex-fade-up flex min-h-0 flex-col overflow-hidden rounded-2xl border border-vex-border bg-vex-panel" style={{ animationDelay: '0.16s' }}>
      <div className="flex items-center justify-between border-b border-vex-border px-4 py-3">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <Terminal className="h-3.5 w-3.5" /> Nhật ký hoạt động
        </h3>
        <button
          onClick={onClear}
          title="Xóa nhật ký"
          className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-white/5 hover:text-zinc-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {logs.length === 0 && <p className="py-6 text-center text-xs text-zinc-600">Chưa có hoạt động nào</p>}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2.5">
            <span className="mt-px shrink-0 text-[10px] font-medium tabular-nums leading-5 text-zinc-600">
              {new Date(log.created_at).toLocaleTimeString('vi-VN')}
            </span>
            <span
              className={`mt-px shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold leading-3 ring-1 ${KIND_BADGE[log.kind]}`}
            >
              {KIND_LABEL[log.kind]}
            </span>
            <span className={`text-xs leading-5 ${KIND_STYLE[log.kind]}`}>{log.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
