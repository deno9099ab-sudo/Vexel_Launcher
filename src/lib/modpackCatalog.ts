import type { ModpackFile } from './types';

export type ModpackCategory = 'performance' | 'adventure' | 'tech' | 'visual';

export interface CatalogModpack {
  id: string;
  author: string;
  tagline: string;
  description: string;
  category: ModpackCategory;
  cover: string;
  downloads: number;
  featured?: boolean;
  pack: ModpackFile;
}

export const MODPACK_CATEGORIES: Array<{ id: ModpackCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'performance', label: 'Hiệu năng' },
  { id: 'adventure', label: 'Phiêu lưu' },
  { id: 'tech', label: 'Kỹ thuật' },
  { id: 'visual', label: 'Đồ họa' },
];

const on = (...slugs: string[]) => slugs.map((slug) => ({ slug, enabled: true }));

const base = (p: Partial<ModpackFile> & Pick<ModpackFile, 'name' | 'mc_version' | 'loader' | 'accent'>): ModpackFile => ({
  format: 'vexel-modpack',
  version: 1,
  notes: '',
  ram_mb: 0,
  java_args: '',
  mods: [],
  packs: [],
  ...p,
});

export const MODPACK_CATALOG: CatalogModpack[] = [
  {
    id: 'vexel-optimized',
    author: 'Vexel Team',
    tagline: 'Gấp đôi FPS, giữ nguyên cảm giác vanilla',
    description:
      'Bộ tối ưu nhẹ nhàng cho mọi cấu hình: Sodium và Lithium tăng tốc kết xuất và xử lý thế giới, kèm vài tiện ích nhỏ không làm thay đổi lối chơi gốc.',
    category: 'performance',
    cover: '/hero-minecraft.webp',
    downloads: 1_284_000,
    featured: true,
    pack: base({
      name: 'Vexel Optimized',
      mc_version: '1.21.3',
      loader: 'fabric',
      accent: 'emerald',
      notes: 'Bộ tối ưu hiệu năng chính thức của Vexel.',
      mods: on('fabric-api', 'sodium', 'lithium', 'modmenu', 'appleskin'),
      packs: on('clear-glass', 'low-on-fire'),
    }),
  },
  {
    id: 'shader-showcase',
    author: 'Vexel Team',
    tagline: 'Ánh sáng điện ảnh, nước phản chiếu chân thực',
    description:
      'Sẵn sàng cho shader ngay khi mở game: Iris và Sodium chạy nền, kèm Complementary Reimagined, BSL và Fresh Animations cho thế giới sống động.',
    category: 'visual',
    cover: '/packs-hero.webp',
    downloads: 642_500,
    featured: true,
    pack: base({
      name: 'Shader Showcase',
      mc_version: '1.21.3',
      loader: 'fabric',
      accent: 'sky',
      ram_mb: 6144,
      mods: on('fabric-api', 'sodium', 'iris', 'modmenu'),
      packs: on('fresh-animations', 'complementary-reimagined', 'bsl-shaders'),
    }),
  },
  {
    id: 'wild-horizons',
    author: 'Terra Crew',
    tagline: 'Hơn 90 quần xã mới để khám phá',
    description:
      'Terralith thay đổi hoàn toàn cách sinh địa hình với núi non hùng vĩ, hẻm vực và đảo nổi. Kết hợp gói Stay True để thế giới thêm tự nhiên.',
    category: 'adventure',
    cover: '/world-survival.webp',
    downloads: 418_900,
    pack: base({
      name: 'Wild Horizons',
      mc_version: '1.21.1',
      loader: 'fabric',
      accent: 'lime',
      ram_mb: 4096,
      mods: on('fabric-api', 'terralith', 'sodium', 'lithium', 'appleskin', 'modmenu'),
      packs: on('stay-true'),
    }),
  },
  {
    id: 'create-engineers',
    author: 'Gearworks',
    tagline: 'Bánh răng, băng chuyền và cỗ máy khổng lồ',
    description:
      'Xây dựng nhà máy cơ khí với Create, tra công thức nhanh bằng JEI và di chuyển giữa các xưởng bằng Waystones. Dành cho người thích tự động hóa.',
    category: 'tech',
    cover: '/world-creative.webp',
    downloads: 356_200,
    pack: base({
      name: 'Create Engineers',
      mc_version: '1.20.1',
      loader: 'forge',
      accent: 'amber',
      ram_mb: 6144,
      mods: on('create', 'jei', 'waystones'),
      packs: on('faithful-32x'),
    }),
  },
  {
    id: 'hardcore-trials',
    author: 'Nightfall',
    tagline: 'Một mạng sống, thế giới khắc nghiệt',
    description:
      'Địa hình Terralith đầy thử thách cùng AppleSkin để quản lý cơn đói chính xác. Giao diện tối Default Dark Mode cho những đêm sinh tồn dài.',
    category: 'adventure',
    cover: '/world-hardcore.webp',
    downloads: 127_400,
    pack: base({
      name: 'Hardcore Trials',
      mc_version: '1.21.3',
      loader: 'fabric',
      accent: 'rose',
      mods: on('fabric-api', 'terralith', 'appleskin', 'sodium'),
      packs: on('default-dark-mode'),
    }),
  },
  {
    id: 'potato-pc',
    author: 'Vexel Team',
    tagline: 'Chạy mượt cả trên máy yếu nhất',
    description:
      'Cấu hình tối giản với Sodium, Lithium và shader MakeUp Ultra Fast. Gói Bare Bones giảm chi tiết texture để tiết kiệm bộ nhớ.',
    category: 'performance',
    cover: '/news-launcher.webp',
    downloads: 289_700,
    pack: base({
      name: 'Potato PC',
      mc_version: '1.21.3',
      loader: 'fabric',
      accent: 'emerald',
      ram_mb: 2048,
      mods: on('fabric-api', 'sodium', 'lithium', 'iris'),
      packs: on('bare-bones', 'makeup-ultra-fast'),
    }),
  },
];
