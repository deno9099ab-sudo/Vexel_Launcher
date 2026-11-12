import type { ModpackFile } from './types';
import { ACCENTS, LOADERS, MC_VERSIONS } from './minecraftVersions';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

function entries(v: unknown): Array<{ slug: string; enabled: boolean }> {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 500)
    .filter((x): x is { slug: string; enabled?: unknown } => !!x && typeof x === 'object' && typeof x.slug === 'string')
    .map((x) => ({ slug: x.slug.slice(0, 120), enabled: x.enabled !== false }));
}

export function parseModpack(raw: unknown): ModpackFile | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.format !== 'vexel-modpack') return null;
  const mc = str(r.mc_version, 32);
  const loader = str(r.loader, 16);
  if (!MC_VERSIONS.some((v) => v.id === mc)) return null;
  if (!LOADERS.some((l) => l.id === loader)) return null;
  const accent = str(r.accent, 16);
  const ram = typeof r.ram_mb === 'number' && Number.isFinite(r.ram_mb) ? Math.round(r.ram_mb) : 0;
  return {
    format: 'vexel-modpack',
    version: 1,
    name: str(r.name, 60).trim() || 'Modpack nhập',
    mc_version: mc,
    loader,
    accent: ACCENTS.some((a) => a.id === accent) ? accent : 'emerald',
    notes: str(r.notes, 500),
    ram_mb: ram >= 1024 && ram <= 32768 ? ram : 0,
    java_args: str(r.java_args, 300),
    mods: entries(r.mods),
    packs: entries(r.packs),
  };
}

export function downloadModpack(pack: ModpackFile) {
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pack.name.replace(/[^\p{L}\p{N} _-]+/gu, '').trim() || 'modpack'}.vexpack.json`;
  a.click();
  URL.revokeObjectURL(url);
}
