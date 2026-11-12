import { Plus, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { LauncherSettings, OfflineAccount } from '../lib/types';

interface Props {
  settings: LauncherSettings;
  onSave: (patch: Partial<LauncherSettings>) => void;
  onAddAccount: (username: string) => void;
  onSwitchAccount: (id: string) => void;
  onRemoveAccount: (id: string) => void;
}

const RAM_MIN = 1024;
const RAM_MAX = 16384;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-vex-border bg-vex-panel p-5 transition hover:border-white/15">
      <p className="text-sm font-bold tracking-tight text-zinc-100">{label}</p>
      {hint && <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{hint}</p>}
      <div className="mt-3.5">{children}</div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full transition ${value ? 'bg-emerald-400' : 'bg-white/10'}`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full transition-all duration-200 ${
          value ? 'left-6 bg-emerald-950' : 'left-1 bg-white'
        }`}
      />
    </button>
  );
}

export function SettingsView({ settings, onSave, onAddAccount, onSwitchAccount, onRemoveAccount }: Props) {
  const [newName, setNewName] = useState('');
  const fill = ((settings.ramMb - RAM_MIN) / (RAM_MAX - RAM_MIN)) * 100;

  const addAccount = () => {
    if (!newName.trim()) return;
    onAddAccount(newName);
    setNewName('');
  };

  return (
    <section className="vex-fade-up flex-1">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-50">Cài đặt</h1>
        <p className="mt-1 text-sm text-zinc-500">Tùy chỉnh tài khoản và runtime — mọi thay đổi được lưu tự động.</p>
      </header>

      <div className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
        <Field label={`Tài khoản offline (${settings.accounts.length})`} hint="Đổi nhanh tài khoản mà không đăng nhập lại">
          <ul className="mb-3 flex flex-col gap-1.5">
            {settings.accounts.map((acc: OfflineAccount) => {
              const active = acc.id === settings.activeAccountId;
              return (
                <li
                  key={acc.id}
                  className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2 transition ${
                    active
                      ? 'border-emerald-400/50 bg-emerald-400/10'
                      : 'border-white/[0.07] bg-black/20 hover:border-white/15'
                  }`}
                >
                  <UserRound className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <button
                    onClick={() => onSwitchAccount(acc.id)}
                    className={`flex-1 truncate text-left text-sm transition ${
                      active ? 'font-semibold text-emerald-200' : 'text-zinc-300 hover:text-zinc-100'
                    }`}
                  >
                    {acc.username}
                  </button>
                  {active && (
                    <span className="rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                      Đang dùng
                    </span>
                  )}
                  {acc.id !== 'default' && settings.accounts.length > 1 && (
                    <button
                      onClick={() => onRemoveAccount(acc.id)}
                      title="Xóa tài khoản"
                      className="rounded-md p-1 text-zinc-600 opacity-0 transition hover:text-rose-400 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAccount()}
              placeholder="Thêm tài khoản mới…"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/25 px-3.5 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
            />
            <button
              onClick={addAccount}
              disabled={!newName.trim()}
              className="grid w-10 shrink-0 place-items-center rounded-xl bg-emerald-400 text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </Field>

        <Field label="RAM cấp cho game" hint={`Hiện tại: ${(settings.ramMb / 1024).toFixed(1)} GB`}>
          <input
            type="range"
            min={RAM_MIN}
            max={RAM_MAX}
            step={512}
            value={settings.ramMb}
            onChange={(e) => onSave({ ramMb: Number(e.target.value) })}
            className="w-full"
            style={{ '--fill': `${fill}%` } as React.CSSProperties}
          />
          <div className="mt-2 flex justify-between text-[10px] font-medium tabular-nums text-zinc-600">
            <span>1 GB</span>
            <span>8 GB</span>
            <span>16 GB</span>
          </div>
        </Field>

        <Field label="Độ phân giải khởi động">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={854}
              max={7680}
              value={settings.resolutionWidth}
              onChange={(e) => onSave({ resolutionWidth: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm tabular-nums text-zinc-100 outline-none transition focus:border-emerald-400/60"
            />
            <span className="shrink-0 text-sm text-zinc-600">×</span>
            <input
              type="number"
              min={480}
              max={4320}
              value={settings.resolutionHeight}
              onChange={(e) => onSave({ resolutionHeight: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-sm tabular-nums text-zinc-100 outline-none transition focus:border-emerald-400/60"
            />
          </div>
        </Field>

        <Field label="Nguồn tải xuống" hint="Mirror nhanh cho vùng mạng chậm">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'official', label: 'Chính thức' },
                { id: 'bmclapi', label: 'BMCLAPI' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => onSave({ downloadSource: s.id })}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  settings.downloadSource === s.id
                    ? 'border-emerald-400/70 bg-emerald-400/10 text-emerald-300'
                    : 'border-white/10 text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="JVM arguments" hint="Nâng cao — ví dụ: -XX:+UseZGC">
          <input
            value={settings.javaArgs}
            onChange={(e) => onSave({ javaArgs: e.target.value })}
            placeholder="-XX:+UseG1GC"
            className="w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 font-mono text-xs text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
          />
        </Field>

        <Field label="Ẩn launcher khi chạy" hint="Thu nhỏ cửa sổ launcher sau khi game khởi động">
          <Toggle value={settings.closeOnLaunch} onChange={(v) => onSave({ closeOnLaunch: v })} />
        </Field>

        <Field label="Hiển thị bản snapshot" hint="Liệt kê cả snapshot/beta trong bộ chọn phiên bản">
          <Toggle value={settings.showSnapshots} onChange={(v) => onSave({ showSnapshots: v })} />
        </Field>

        <Field label="Tách thư mục mỗi instance" hint="Mỗi instance có thư mục game riêng để tránh xung đột mod">
          <Toggle value={settings.isolateInstances} onChange={(v) => onSave({ isolateInstances: v })} />
        </Field>

        <Field label="Tự cập nhật mod" hint="Kiểm tra và cài bản mới của mod đang bật khi khởi động">
          <Toggle value={settings.autoUpdateMods} onChange={(v) => onSave({ autoUpdateMods: v })} />
        </Field>

        <Field label="Giữ launcher mở trong khi chơi" hint="Trở về launcher ngay sau khi tắt game">
          <Toggle value={settings.keepLauncherOpen} onChange={(v) => onSave({ keepLauncherOpen: v })} />
        </Field>
      </div>
    </section>
  );
}
