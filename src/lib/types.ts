export type Loader = 'vanilla' | 'fabric' | 'forge' | 'quilt';
export type LogKind = 'info' | 'success' | 'warning' | 'error';

export interface Instance {
  id: string;
  name: string;
  mc_version: string;
  loader: Loader | string;
  accent: string;
  notes: string;
  game_dir: string;
  width: number;
  height: number;
  ram_mb: number;
  java_args: string;
  last_played_at: string | null;
  playtime_minutes: number;
  created_at: string;
}

export interface ModpackFile {
  format: 'vexel-modpack';
  version: 1;
  name: string;
  mc_version: string;
  loader: string;
  accent: string;
  notes: string;
  ram_mb: number;
  java_args: string;
  mods: Array<{ slug: string; enabled: boolean }>;
  packs: Array<{ slug: string; enabled: boolean }>;
}

export interface World {
  id: string;
  instance_id: string;
  name: string;
  game_mode: string;
  size_mb: number;
  last_played_at: string | null;
  created_at: string;
}

export interface Server {
  id: string;
  name: string;
  address: string;
  accent: string;
  players_online: number;
  players_max: number;
  motd: string;
  last_ping_ms: number | null;
  favorited: boolean;
  created_at: string;
}

export interface Mod {
  id: string;
  name: string;
  slug: string;
  description: string;
  author: string;
  category: string;
  downloads: number;
  mc_versions: string[];
  loader: string;
}

export interface InstanceMod {
  instance_id: string;
  mod_id: string;
  enabled: boolean;
  installed_at: string;
}

export interface ResourcePack {
  id: string;
  name: string;
  slug: string;
  description: string;
  author: string;
  category: string;
  resolution: string;
  downloads: number;
  size_mb: number;
  mc_versions: string[];
  accent: string;
  kind: PackKind;
  is_local: boolean;
}

export type PackKind = 'resource' | 'shader';

export interface InstanceResourcePack {
  instance_id: string;
  pack_id: string;
  enabled: boolean;
  position: number;
  installed_at: string;
}

export interface ActivityLog {
  id: string;
  message: string;
  kind: LogKind;
  created_at: string;
}

export interface NewsPost {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  body: string;
  published_at: string;
}

export interface OfflineAccount {
  id: string;
  username: string;
  avatarSeed: number;
}

export interface LauncherSettings {
  username: string;
  avatarSeed: number;
  accounts: OfflineAccount[];
  activeAccountId: string;
  ramMb: number;
  resolutionWidth: number;
  resolutionHeight: number;
  javaArgs: string;
  closeOnLaunch: boolean;
  showSnapshots: boolean;
  isolateInstances: boolean;
  autoUpdateMods: boolean;
  keepLauncherOpen: boolean;
  downloadSource: 'official' | 'bmclapi';
}

export const DEFAULT_SETTINGS: LauncherSettings = {
  username: 'Steve',
  avatarSeed: 3,
  accounts: [{ id: 'default', username: 'Steve', avatarSeed: 3 }],
  activeAccountId: 'default',
  ramMb: 4096,
  resolutionWidth: 1280,
  resolutionHeight: 720,
  javaArgs: '',
  closeOnLaunch: false,
  showSnapshots: false,
  isolateInstances: true,
  autoUpdateMods: true,
  keepLauncherOpen: true,
  downloadSource: 'official',
};

export interface VersionInfo {
  id: string;
  type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha';
}

export interface DownloadTask {
  id: string;
  label: string;
  progress: number;
  speed: string;
  status: 'queued' | 'downloading' | 'verifying' | 'done' | 'error';
}

export type DownloadPhase =
  | 'idle'
  | 'auth'
  | 'download'
  | 'launching'
  | 'running'
  | 'error';

export type TabId = 'play' | 'instances' | 'modpacks' | 'worlds' | 'mods' | 'packs' | 'servers' | 'settings';
