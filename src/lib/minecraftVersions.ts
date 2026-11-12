import type { VersionInfo } from './types';

export const MC_VERSIONS: VersionInfo[] = [
  { id: '1.21.3', type: 'release' },
  { id: '1.21.2', type: 'release' },
  { id: '1.21.1', type: 'release' },
  { id: '1.20.6', type: 'release' },
  { id: '1.20.4', type: 'release' },
  { id: '1.20.1', type: 'release' },
  { id: '1.19.4', type: 'release' },
  { id: '1.19.2', type: 'release' },
  { id: '1.18.2', type: 'release' },
  { id: '1.16.5', type: 'release' },
  { id: '1.12.2', type: 'release' },
  { id: '1.8.9', type: 'release' },
  { id: '25w46a', type: 'snapshot' },
  { id: '25w45a', type: 'snapshot' },
  { id: '1.21.4-pre3', type: 'snapshot' },
  { id: 'b1.7.3', type: 'old_beta' },
  { id: 'a1.2.6', type: 'old_alpha' },
];

export const LOADERS = [
  { id: 'vanilla', label: 'Vanilla' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'forge', label: 'Forge' },
  { id: 'quilt', label: 'Quilt' },
] as const;

export const ACCENTS = [
  { id: 'emerald', swatch: 'bg-emerald-400' },
  { id: 'amber', swatch: 'bg-amber-400' },
  { id: 'rose', swatch: 'bg-rose-400' },
  { id: 'sky', swatch: 'bg-sky-400' },
  { id: 'lime', swatch: 'bg-lime-400' },
] as const;

export function accentClasses(accent: string) {
  switch (accent) {
    case 'amber':
      return { text: 'text-amber-400', ring: 'ring-amber-400/50', bg: 'bg-amber-400', grad: 'from-amber-500/20', dot: '#fbbf24' };
    case 'rose':
      return { text: 'text-rose-400', ring: 'ring-rose-400/50', bg: 'bg-rose-400', grad: 'from-rose-500/20', dot: '#fb7185' };
    case 'sky':
      return { text: 'text-sky-400', ring: 'ring-sky-400/50', bg: 'bg-sky-400', grad: 'from-sky-500/20', dot: '#38bdf8' };
    case 'lime':
      return { text: 'text-lime-400', ring: 'ring-lime-400/50', bg: 'bg-lime-400', grad: 'from-lime-500/20', dot: '#a3e635' };
    default:
      return { text: 'text-emerald-400', ring: 'ring-emerald-400/50', bg: 'bg-emerald-400', grad: 'from-emerald-500/20', dot: '#34d399' };
  }
}

export const LOADER_ICON: Record<string, string> = {
  vanilla: 'V',
  fabric: 'F',
  forge: 'G',
  quilt: 'Q',
};

export function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
