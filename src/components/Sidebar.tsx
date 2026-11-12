import { Boxes, Gamepad2, Globe, Layers, Map, Package, RefreshCw, Settings, SwatchBook } from 'lucide-react';
import type { TabId } from '../lib/types';
import { Avatar } from './Avatar';
import { VexelLogo } from './VexelLogo';

const NAV: Array<{ id: TabId; label: string; icon: typeof Gamepad2 }> = [
  { id: 'play', label: 'Chơi', icon: Gamepad2 },
  { id: 'instances', label: 'Instances', icon: Layers },
  { id: 'modpacks', label: 'Modpack', icon: Boxes },
  { id: 'worlds', label: 'Thế giới', icon: Map },
  { id: 'mods', label: 'Mods', icon: Package },
  { id: 'packs', label: 'Resource & Shader', icon: SwatchBook },
  { id: 'servers', label: 'Servers', icon: Globe },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

interface Props {
  tab: TabId;
  onTab: (t: TabId) => void;
  username: string;
  avatarSeed: number;
  onCycleAvatar: () => void;
  updatesAvailable: number;
}

export function Sidebar({ tab, onTab, username, avatarSeed, onCycleAvatar, updatesAvailable }: Props) {
  return (
    <aside className="flex w-[72px] shrink-0 flex-col border-r border-vex-border bg-[#0d110e] lg:w-60">
      <div className="flex items-center gap-3 px-4 pb-6 pt-6 lg:px-5">
        <div className="relative shrink-0 drop-shadow-[0_0_14px_rgba(52,211,153,0.35)]">
          <VexelLogo size={40} />
        </div>
        <div className="hidden lg:block">
          <p className="font-display text-[17px] font-bold leading-none tracking-tight text-zinc-50">
            VEXEL
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400/90">
            Launcher
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2.5 lg:px-3">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => onTab(id)}
              className={`group relative flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 lg:justify-start ${
                active
                  ? 'bg-white/[0.07] text-zinc-50'
                  : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400 lg:block" />
              )}
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition ${active ? 'text-emerald-400' : 'group-hover:text-zinc-300'}`}
                strokeWidth={2.2}
              />
              <span className="hidden lg:inline">{label}</span>
              {id === 'mods' && updatesAvailable > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-400 px-1 text-[9px] font-bold text-emerald-950 lg:static lg:ml-auto">
                  {updatesAvailable}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-vex-border p-2.5 lg:p-3">
        <div className="flex items-center justify-center gap-3 rounded-xl p-2 lg:justify-start lg:bg-white/[0.03] lg:p-3">
          <button
            onClick={onCycleAvatar}
            title="Đổi avatar"
            className="group relative shrink-0"
          >
            <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-emerald-400/0 to-emerald-400/40 opacity-0 transition group-hover:opacity-100" />
            <Avatar seed={avatarSeed} size={34} className="relative rounded-lg ring-1 ring-white/15" />
            <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 opacity-0 transition group-hover:opacity-100">
              <RefreshCw className="h-2.5 w-2.5 text-emerald-950" strokeWidth={3} />
            </span>
          </button>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-[13px] font-semibold leading-tight text-zinc-100">{username}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Sẵn sàng chơi
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
