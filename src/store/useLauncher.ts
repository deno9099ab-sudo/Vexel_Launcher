import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_SETTINGS,
  type ActivityLog,
  type DownloadPhase,
  type DownloadTask,
  type Instance,
  type InstanceMod,
  type LauncherSettings,
  type Mod,
  type NewsPost,
  type OfflineAccount,
  type InstanceResourcePack,
  type ResourcePack,
  type PackKind,
  type ModpackFile,
  type Server,
  type World,
} from '../lib/types';
import { parseModpack } from '../lib/modpack';

const WORLD_IMAGES = ['world-survival', 'world-creative', 'world-hardcore'];

const AVATAR_SEEDS = [3, 7, 11, 19, 23, 31];

const DOWNLOAD_PLAN: Array<{ label: string; weight: number }> = [
  { label: 'client.jar', weight: 30 },
  { label: 'Assets & tài nguyên (2300 files)', weight: 25 },
  { label: 'Native libraries (LWJGL)', weight: 14 },
  { label: 'Java Runtime 21', weight: 28 },
  { label: 'Xác minh checksums', weight: 3 },
];

export interface LauncherState {
  loading: boolean;
  settings: LauncherSettings;
  instances: Instance[];
  mods: Mod[];
  instanceMods: InstanceMod[];
  logs: ActivityLog[];
  news: NewsPost[];
  worlds: World[];
  servers: Server[];
  resourcePacks: ResourcePack[];
  instancePacks: InstanceResourcePack[];
  selectedInstanceId: string | null;
  phase: DownloadPhase;
  tasks: DownloadTask[];
  launchError: string | null;
  updatesAvailable: number;
}

export function useLauncher() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<LauncherSettings>(DEFAULT_SETTINGS);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [mods, setMods] = useState<Mod[]>([]);
  const [instanceMods, setInstanceMods] = useState<InstanceMod[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [resourcePacks, setResourcePacks] = useState<ResourcePack[]>([]);
  const [instancePacks, setInstancePacks] = useState<InstanceResourcePack[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [phase, setPhase] = useState<DownloadPhase>('idle');
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [updatesAvailable, setUpdatesAvailable] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const pushLog = useCallback(
    (message: string, kind: ActivityLog['kind'] = 'info') => {
      const entry: ActivityLog = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message,
        kind,
        created_at: new Date().toISOString(),
      };
      setLogs((prev) => [entry, ...prev].slice(0, 80));
      void supabase.from('activity_logs').insert({ message, kind });
    },
    [],
  );

  const loadAll = useCallback(async () => {
    const [s, i, m, im, l, n, w, sv, rp, irp] = await Promise.all([
      supabase.from('launcher_settings').select('key, value'),
      supabase.from('instances').select('*').order('created_at', { ascending: true }),
      supabase.from('mods').select('*').order('downloads', { ascending: false }),
      supabase.from('instance_mods').select('*'),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('news_posts').select('*').order('published_at', { ascending: false }),
      supabase.from('worlds').select('*').order('created_at', { ascending: true }),
      supabase.from('servers').select('*').order('favorited', { ascending: false }),
      supabase.from('resource_packs').select('*').order('downloads', { ascending: false }),
      supabase.from('instance_resource_packs').select('*').order('position', { ascending: true }),
    ]);
    if (s.data?.length) {
      const row = s.data.find((r) => r.key === 'launcher');
      if (row) setSettings({ ...DEFAULT_SETTINGS, ...(row.value as Partial<LauncherSettings>) });
    }
    if (i.data) {
      setInstances(i.data as Instance[]);
      setSelectedInstanceId((cur) => cur ?? i.data[0]?.id ?? null);
    }
    if (m.data) setMods(m.data as Mod[]);
    if (im.data) setInstanceMods(im.data as InstanceMod[]);
    if (l.data) setLogs(l.data as ActivityLog[]);
    if (n.data) setNews(n.data as NewsPost[]);
    if (w.data) setWorlds(w.data as World[]);
    if (sv.data) setServers(sv.data as Server[]);
    if (rp.data) setResourcePacks(rp.data as ResourcePack[]);
    if (irp.data) setInstancePacks(irp.data as InstanceResourcePack[]);
    setUpdatesAvailable(2);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadAll();
    return () => timers.current.forEach(clearTimeout);
  }, [loadAll]);

  const saveSettings = useCallback(
    (patch: Partial<LauncherSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        void supabase
          .from('launcher_settings')
          .upsert({ key: 'launcher', value: next, updated_at: new Date().toISOString() });
        return next;
      });
    },
    [],
  );

  const createInstance = useCallback(
    async (name: string, mc_version: string, loader: string, accent: string) => {
      const { data, error } = await supabase
        .from('instances')
        .insert({ name, mc_version, loader, accent })
        .select()
        .maybeSingle();
      if (error || !data) return;
      setInstances((prev) => [...prev, data as Instance]);
      setSelectedInstanceId(data.id);
      pushLog(`Đã tạo instance "${name}" (${mc_version} · ${loader})`, 'success');

      const img = WORLD_IMAGES[Math.floor(Math.random() * WORLD_IMAGES.length)];
      const starter = {
        instance_id: data.id,
        name: 'Thế giới mới',
        game_mode: 'survival',
        size_mb: 40 + Math.floor(Math.random() * 80),
      };
      void supabase.from('worlds').insert(starter).select().maybeSingle().then(({ data: w }) => {
        if (w) setWorlds((prev) => [...prev, w as World]);
      });
      void img;
    },
    [pushLog],
  );

  const updateInstance = useCallback(
    async (
      id: string,
      patch: Partial<Pick<Instance, 'name' | 'mc_version' | 'loader' | 'accent' | 'notes' | 'width' | 'height' | 'ram_mb' | 'java_args'>>,
    ): Promise<boolean> => {
      const { error } = await supabase.from('instances').update(patch).eq('id', id);
      if (error) {
        pushLog('Không lưu được thay đổi của instance', 'error');
        return false;
      }
      setInstances((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      return true;
    },
    [pushLog],
  );

  const insertInstanceWithContent = useCallback(
    async (
      base: Pick<Instance, 'name' | 'mc_version' | 'loader' | 'accent' | 'notes' | 'width' | 'height' | 'ram_mb' | 'java_args'>,
      mods: Array<{ mod_id: string; enabled: boolean }>,
      packs: Array<{ pack_id: string; enabled: boolean; position: number }>,
    ): Promise<Instance | null> => {
      const { data, error } = await supabase.from('instances').insert(base).select().maybeSingle();
      if (error || !data) return null;
      const inst = data as Instance;
      const [m, p] = await Promise.all([
        mods.length
          ? supabase
              .from('instance_mods')
              .insert(mods.map((x) => ({ ...x, instance_id: inst.id })))
              .select()
          : Promise.resolve({ data: [], error: null }),
        packs.length
          ? supabase
              .from('instance_resource_packs')
              .insert(packs.map((x) => ({ ...x, instance_id: inst.id })))
              .select()
          : Promise.resolve({ data: [], error: null }),
      ]);
      setInstances((prev) => [...prev, inst]);
      if (m.data) setInstanceMods((prev) => [...prev, ...(m.data as InstanceMod[])]);
      if (p.data) setInstancePacks((prev) => [...prev, ...(p.data as InstanceResourcePack[])]);
      if (m.error || p.error) pushLog('Một số mod hoặc gói không sao chép được', 'warning');
      setSelectedInstanceId(inst.id);
      return inst;
    },
    [pushLog],
  );

  const duplicateInstance = useCallback(
    async (id: string) => {
      const src = instances.find((x) => x.id === id);
      if (!src) return;
      const inst = await insertInstanceWithContent(
        {
          name: `${src.name} (bản sao)`.slice(0, 60),
          mc_version: src.mc_version,
          loader: src.loader,
          accent: src.accent,
          notes: src.notes,
          width: src.width,
          height: src.height,
          ram_mb: src.ram_mb,
          java_args: src.java_args,
        },
        instanceMods.filter((x) => x.instance_id === id).map((x) => ({ mod_id: x.mod_id, enabled: x.enabled })),
        instancePacks
          .filter((x) => x.instance_id === id)
          .map((x) => ({ pack_id: x.pack_id, enabled: x.enabled, position: x.position })),
      );
      if (inst) pushLog(`Đã nhân bản "${src.name}" thành "${inst.name}"`, 'success');
      else pushLog(`Không nhân bản được "${src.name}"`, 'error');
    },
    [insertInstanceWithContent, instanceMods, instancePacks, instances, pushLog],
  );

  const exportInstance = useCallback(
    (id: string): ModpackFile | null => {
      const inst = instances.find((x) => x.id === id);
      if (!inst) return null;
      const modSlug = new Map(mods.map((m) => [m.id, m.slug]));
      const packById = new Map(resourcePacks.map((p) => [p.id, p]));
      pushLog(`Đã xuất modpack "${inst.name}"`, 'success');
      return {
        format: 'vexel-modpack',
        version: 1,
        name: inst.name,
        mc_version: inst.mc_version,
        loader: inst.loader,
        accent: inst.accent,
        notes: inst.notes,
        ram_mb: inst.ram_mb,
        java_args: inst.java_args,
        mods: instanceMods
          .filter((x) => x.instance_id === id && modSlug.has(x.mod_id))
          .map((x) => ({ slug: modSlug.get(x.mod_id) as string, enabled: x.enabled })),
        packs: instancePacks
          .filter((x) => x.instance_id === id)
          .map((x) => ({ pack: packById.get(x.pack_id), row: x }))
          .filter((x) => x.pack && !x.pack.is_local)
          .sort((a, b) => a.row.position - b.row.position)
          .map((x) => ({ slug: x.pack!.slug, enabled: x.row.enabled })),
      };
    },
    [instanceMods, instancePacks, instances, mods, pushLog, resourcePacks],
  );

  const installModpack = useCallback(
    async (pack: ModpackFile): Promise<string | null> => {
      const modBySlug = new Map(mods.map((m) => [m.slug, m.id]));
      const packBySlug = new Map(resourcePacks.map((p) => [p.slug, p.id]));
      const modRows = pack.mods
        .filter((m) => modBySlug.has(m.slug))
        .map((m) => ({ mod_id: modBySlug.get(m.slug) as string, enabled: m.enabled }));
      const packRows = pack.packs
        .filter((p) => packBySlug.has(p.slug))
        .map((p, i) => ({ pack_id: packBySlug.get(p.slug) as string, enabled: p.enabled, position: i }));
      const inst = await insertInstanceWithContent(
        {
          name: pack.name,
          mc_version: pack.mc_version,
          loader: pack.loader,
          accent: pack.accent,
          notes: pack.notes,
          width: 0,
          height: 0,
          ram_mb: pack.ram_mb,
          java_args: pack.java_args,
        },
        modRows,
        packRows,
      );
      if (!inst) return 'Không tạo được instance từ modpack.';
      const skipped = pack.mods.length - modRows.length + (pack.packs.length - packRows.length);
      pushLog(
        `Đã cài modpack "${inst.name}" · ${modRows.length} mod, ${packRows.length} gói${skipped ? ` · bỏ qua ${skipped} mục không có trong kho` : ''}`,
        'success',
      );
      setSelectedInstanceId(inst.id);
      return null;
    },
    [insertInstanceWithContent, mods, pushLog, resourcePacks],
  );

  const importModpack = useCallback(
    async (file: File): Promise<string | null> => {
      if (file.size > 1024 * 1024) return 'Tệp modpack quá lớn.';
      let parsed: unknown;
      try {
        parsed = JSON.parse(await file.text());
      } catch {
        return 'Tệp không đúng định dạng modpack Vexel.';
      }
      const pack = parseModpack(parsed);
      if (!pack) return 'Tệp không đúng định dạng modpack Vexel.';
      return installModpack(pack);
    },
    [installModpack],
  );

  const deleteInstance = useCallback(
    async (id: string) => {
      const target = instances.find((x) => x.id === id);
      const { error } = await supabase.from('instances').delete().eq('id', id);
      if (error) return;
      setInstances((prev) => prev.filter((x) => x.id !== id));
      setInstanceMods((prev) => prev.filter((x) => x.instance_id !== id));
      setWorlds((prev) => prev.filter((x) => x.instance_id !== id));
      setInstancePacks((prev) => prev.filter((x) => x.instance_id !== id));
      setSelectedInstanceId((cur) => (cur === id ? instances.find((x) => x.id !== id)?.id ?? null : cur));
      pushLog(`Đã xóa instance "${target?.name ?? id}"`, 'warning');
    },
    [instances, pushLog],
  );

  const cycleAvatar = useCallback(() => {
    const idx = AVATAR_SEEDS.indexOf(settings.avatarSeed);
    const next = AVATAR_SEEDS[(idx + 1) % AVATAR_SEEDS.length];
    saveSettings({ avatarSeed: next });
    pushLog('Đã thay đổi avatar người chơi', 'info');
  }, [settings.avatarSeed, saveSettings, pushLog]);

  const addAccount = useCallback(
    (username: string) => {
      const clean = username.trim();
      if (!clean || settings.accounts.some((a) => a.username === clean)) return;
      const account: OfflineAccount = {
        id: `acc-${Date.now()}`,
        username: clean,
        avatarSeed: AVATAR_SEEDS[settings.accounts.length % AVATAR_SEEDS.length],
      };
      saveSettings({
        accounts: [...settings.accounts, account],
        activeAccountId: account.id,
        username: clean,
        avatarSeed: account.avatarSeed,
      });
      pushLog(`Đã thêm tài khoản offline "${clean}"`, 'success');
    },
    [settings.accounts, saveSettings, pushLog],
  );

  const switchAccount = useCallback(
    (id: string) => {
      const acc = settings.accounts.find((a) => a.id === id);
      if (!acc) return;
      saveSettings({ activeAccountId: id, username: acc.username, avatarSeed: acc.avatarSeed });
      pushLog(`Đã chuyển sang tài khoản "${acc.username}"`, 'info');
    },
    [settings.accounts, saveSettings, pushLog],
  );

  const removeAccount = useCallback(
    (id: string) => {
      if (settings.accounts.length <= 1 || id === 'default') return;
      const acc = settings.accounts.find((a) => a.id === id);
      const rest = settings.accounts.filter((a) => a.id !== id);
      const patch: Partial<LauncherSettings> = { accounts: rest };
      if (settings.activeAccountId === id && rest[0]) {
        patch.activeAccountId = rest[0].id;
        patch.username = rest[0].username;
        patch.avatarSeed = rest[0].avatarSeed;
      }
      saveSettings(patch);
      pushLog(`Đã xóa tài khoản "${acc?.username ?? id}"`, 'warning');
    },
    [settings.accounts, settings.activeAccountId, saveSettings, pushLog],
  );

  const toggleMod = useCallback(
    async (mod: Mod) => {
      if (!selectedInstanceId) return;
      const existing = instanceMods.find(
        (x) => x.instance_id === selectedInstanceId && x.mod_id === mod.id,
      );
      const inst = instances.find((x) => x.id === selectedInstanceId);
      if (existing) {
        const { error } = await supabase
          .from('instance_mods')
          .delete()
          .eq('instance_id', selectedInstanceId)
          .eq('mod_id', mod.id);
        if (error) return;
        setInstanceMods((prev) =>
          prev.filter((x) => !(x.instance_id === selectedInstanceId && x.mod_id === mod.id)),
        );
        pushLog(`Gỡ mod "${mod.name}" khỏi ${inst?.name ?? 'instance'}`, 'warning');
      } else {
        const { error } = await supabase
          .from('instance_mods')
          .insert({ instance_id: selectedInstanceId, mod_id: mod.id });
        if (error) return;
        setInstanceMods((prev) => [
          ...prev,
          { instance_id: selectedInstanceId, mod_id: mod.id, enabled: true, installed_at: new Date().toISOString() },
        ]);
        pushLog(`Cài mod "${mod.name}" vào ${inst?.name ?? 'instance'}`, 'success');
      }
    },
    [instanceMods, instances, pushLog, selectedInstanceId],
  );

  const toggleModEnabled = useCallback(
    async (mod: Mod) => {
      if (!selectedInstanceId) return;
      const existing = instanceMods.find(
        (x) => x.instance_id === selectedInstanceId && x.mod_id === mod.id,
      );
      if (!existing) return;
      const next = !existing.enabled;
      const { error } = await supabase
        .from('instance_mods')
        .update({ enabled: next })
        .eq('instance_id', selectedInstanceId)
        .eq('mod_id', mod.id);
      if (error) return;
      setInstanceMods((prev) =>
        prev.map((x) =>
          x.instance_id === selectedInstanceId && x.mod_id === mod.id ? { ...x, enabled: next } : x,
        ),
      );
      pushLog(`${next ? 'Bật' : 'Tắt'} mod "${mod.name}"`, next ? 'info' : 'warning');
    },
    [instanceMods, pushLog, selectedInstanceId],
  );

  const createWorld = useCallback(
    async (name: string, gameMode: string) => {
      if (!selectedInstanceId) return;
      const inst = instances.find((x) => x.id === selectedInstanceId);
      const { data, error } = await supabase
        .from('worlds')
        .insert({
          instance_id: selectedInstanceId,
          name,
          game_mode: gameMode,
          size_mb: 30 + Math.floor(Math.random() * 60),
        })
        .select()
        .maybeSingle();
      if (error || !data) return;
      setWorlds((prev) => [...prev, data as World]);
      pushLog(`Đã tạo thế giới "${name}" trong ${inst?.name ?? 'instance'}`, 'success');
    },
    [instances, pushLog, selectedInstanceId],
  );

  const duplicateWorld = useCallback(
    async (world: World) => {
      const { data, error } = await supabase
        .from('worlds')
        .insert({
          instance_id: world.instance_id,
          name: `${world.name} (bản sao)`,
          game_mode: world.game_mode,
          size_mb: world.size_mb,
        })
        .select()
        .maybeSingle();
      if (error || !data) return;
      setWorlds((prev) => [...prev, data as World]);
      pushLog(`Đã nhân đôi thế giới "${world.name}"`, 'success');
    },
    [pushLog],
  );

  const renameWorld = useCallback(
    async (world: World, name: string) => {
      const { error } = await supabase.from('worlds').update({ name }).eq('id', world.id);
      if (error) return;
      setWorlds((prev) => prev.map((x) => (x.id === world.id ? { ...x, name } : x)));
    },
    [],
  );

  const deleteWorld = useCallback(
    async (world: World) => {
      const { error } = await supabase.from('worlds').delete().eq('id', world.id);
      if (error) return;
      setWorlds((prev) => prev.filter((x) => x.id !== world.id));
      pushLog(`Đã xóa thế giới "${world.name}"`, 'warning');
    },
    [pushLog],
  );

  const addServer = useCallback(
    async (name: string, address: string) => {
      const { data, error } = await supabase
        .from('servers')
        .insert({
          name,
          address,
          players_online: Math.floor(Math.random() * 800),
          players_max: 1000,
          motd: 'Đã thêm thủ công — nhấn ping để cập nhật',
          last_ping_ms: 30 + Math.floor(Math.random() * 120),
        })
        .select()
        .maybeSingle();
      if (error || !data) return;
      setServers((prev) => [...prev, data as Server]);
      pushLog(`Đã thêm server "${name}" (${address})`, 'success');
    },
    [pushLog],
  );

  const removeServer = useCallback(
    async (server: Server) => {
      const { error } = await supabase.from('servers').delete().eq('id', server.id);
      if (error) return;
      setServers((prev) => prev.filter((x) => x.id !== server.id));
      pushLog(`Đã xóa server "${server.name}"`, 'warning');
    },
    [pushLog],
  );

  const toggleFavoriteServer = useCallback(
    async (server: Server) => {
      const next = !server.favorited;
      const { error } = await supabase.from('servers').update({ favorited: next }).eq('id', server.id);
      if (error) return;
      setServers((prev) => prev.map((x) => (x.id === server.id ? { ...x, favorited: next } : x)));
    },
    [],
  );

  const refreshServer = useCallback(
    async (server: Server) => {
      const patch = {
        players_online: Math.floor(Math.random() * (server.players_max > 1000 ? 40000 : 800)),
        last_ping_ms: 25 + Math.floor(Math.random() * 160),
      };
      const { error } = await supabase.from('servers').update(patch).eq('id', server.id);
      if (error) return;
      setServers((prev) => prev.map((x) => (x.id === server.id ? { ...x, ...patch } : x)));
      pushLog(`Đã ping lại ${server.name} — ${patch.last_ping_ms}ms`, 'info');
    },
    [pushLog],
  );

  const refreshAllServers = useCallback(() => {
    servers.forEach((s) => {
      const patch = {
        players_online: Math.floor(Math.random() * (s.players_max > 1000 ? 40000 : 800)),
        last_ping_ms: 25 + Math.floor(Math.random() * 160),
      };
      void supabase.from('servers').update(patch).eq('id', s.id);
      setServers((prev) => prev.map((x) => (x.id === s.id ? { ...x, ...patch } : x)));
    });
    pushLog('Đã làm mới trạng thái tất cả server', 'info');
  }, [servers, pushLog]);

  const packLabel = (pack: ResourcePack) => (pack.kind === 'shader' ? 'shader' : 'resource pack');

  const disableOtherShaders = useCallback(
    async (instanceId: string, keepPackId: string) => {
      const shaderIds = new Set(resourcePacks.filter((p) => p.kind === 'shader').map((p) => p.id));
      const others = instancePacks
        .filter((x) => x.instance_id === instanceId && x.enabled && x.pack_id !== keepPackId && shaderIds.has(x.pack_id))
        .map((x) => x.pack_id);
      if (others.length === 0) return;
      const { error } = await supabase
        .from('instance_resource_packs')
        .update({ enabled: false })
        .eq('instance_id', instanceId)
        .in('pack_id', others);
      if (error) return;
      setInstancePacks((prev) =>
        prev.map((x) => (x.instance_id === instanceId && others.includes(x.pack_id) ? { ...x, enabled: false } : x)),
      );
    },
    [instancePacks, resourcePacks],
  );

  const installPack = useCallback(
    async (pack: ResourcePack, instanceId: string) => {
      const inst = instances.find((x) => x.id === instanceId);
      const mine = instancePacks.filter((x) => x.instance_id === instanceId);
      const position = mine.reduce((max, x) => Math.max(max, x.position), -1) + 1;
      const { data, error } = await supabase
        .from('instance_resource_packs')
        .insert({ instance_id: instanceId, pack_id: pack.id, position })
        .select()
        .maybeSingle();
      if (error || !data) {
        pushLog(`Không cài được ${packLabel(pack)} "${pack.name}"`, 'error');
        return;
      }
      if (pack.kind === 'shader') await disableOtherShaders(instanceId, pack.id);
      setInstancePacks((prev) => [...prev, data as InstanceResourcePack]);
      pushLog(`Cài ${packLabel(pack)} "${pack.name}" vào ${inst?.name ?? 'instance'}`, 'success');
    },
    [disableOtherShaders, instancePacks, instances, pushLog],
  );

  const togglePackInstalled = useCallback(
    async (pack: ResourcePack) => {
      if (!selectedInstanceId) return;
      const inst = instances.find((x) => x.id === selectedInstanceId);
      const existing = instancePacks.find((x) => x.instance_id === selectedInstanceId && x.pack_id === pack.id);
      if (!existing) {
        await installPack(pack, selectedInstanceId);
        return;
      }
      const { error } = await supabase
        .from('instance_resource_packs')
        .delete()
        .eq('instance_id', selectedInstanceId)
        .eq('pack_id', pack.id);
      if (error) {
        pushLog(`Không gỡ được ${packLabel(pack)} "${pack.name}"`, 'error');
        return;
      }
      setInstancePacks((prev) =>
        prev.filter((x) => !(x.instance_id === selectedInstanceId && x.pack_id === pack.id)),
      );
      pushLog(`Gỡ ${packLabel(pack)} "${pack.name}" khỏi ${inst?.name ?? 'instance'}`, 'warning');
    },
    [installPack, instancePacks, instances, pushLog, selectedInstanceId],
  );

  const togglePackEnabled = useCallback(
    async (pack: ResourcePack) => {
      if (!selectedInstanceId) return;
      const existing = instancePacks.find(
        (x) => x.instance_id === selectedInstanceId && x.pack_id === pack.id,
      );
      if (!existing) return;
      const next = !existing.enabled;
      const { error } = await supabase
        .from('instance_resource_packs')
        .update({ enabled: next })
        .eq('instance_id', selectedInstanceId)
        .eq('pack_id', pack.id);
      if (error) return;
      if (next && pack.kind === 'shader') await disableOtherShaders(selectedInstanceId, pack.id);
      setInstancePacks((prev) =>
        prev.map((x) =>
          x.instance_id === selectedInstanceId && x.pack_id === pack.id ? { ...x, enabled: next } : x,
        ),
      );
      pushLog(`${next ? 'Bật' : 'Tắt'} ${packLabel(pack)} "${pack.name}"`, next ? 'info' : 'warning');
    },
    [disableOtherShaders, instancePacks, pushLog, selectedInstanceId],
  );

  const importPack = useCallback(
    async (file: File, kind: PackKind): Promise<string | null> => {
      if (!selectedInstanceId) return 'Hãy chọn một instance trước.';
      if (!file.name.toLowerCase().endsWith('.zip')) return 'Chỉ nhận tệp .zip.';
      if (file.size > 512 * 1024 * 1024) return 'Tệp quá lớn (tối đa 512 MB).';
      const inst = instances.find((x) => x.id === selectedInstanceId);
      const name = file.name.replace(/\.zip$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 80) || 'Gói tự nhập';
      const { data, error } = await supabase
        .from('resource_packs')
        .insert({
          name,
          slug: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          description: `Nhập từ tệp ${file.name}`,
          author: settings.username || 'Bạn',
          category: kind === 'shader' ? 'custom' : 'utility',
          resolution: kind === 'shader' ? 'Tùy chỉnh' : '16x',
          downloads: 0,
          size_mb: Math.max(1, Math.round(file.size / (1024 * 1024))),
          mc_versions: inst ? [inst.mc_version] : [],
          accent: 'sky',
          kind,
          is_local: true,
        })
        .select()
        .maybeSingle();
      if (error || !data) return 'Không nhập được tệp, thử lại sau.';
      const pack = data as ResourcePack;
      setResourcePacks((prev) => [pack, ...prev]);
      await installPack(pack, selectedInstanceId);
      return null;
    },
    [installPack, instances, selectedInstanceId, settings.username],
  );

  const movePack = useCallback(
    async (packId: string, direction: -1 | 1) => {
      if (!selectedInstanceId) return;
      const ordered = instancePacks
        .filter((x) => x.instance_id === selectedInstanceId)
        .sort((a, b) => a.position - b.position);
      const idx = ordered.findIndex((x) => x.pack_id === packId);
      const swapIdx = idx + direction;
      if (idx < 0 || swapIdx < 0 || swapIdx >= ordered.length) return;
      const a = ordered[idx];
      const b = ordered[swapIdx];
      const [r1, r2] = await Promise.all([
        supabase
          .from('instance_resource_packs')
          .update({ position: b.position })
          .eq('instance_id', selectedInstanceId)
          .eq('pack_id', a.pack_id),
        supabase
          .from('instance_resource_packs')
          .update({ position: a.position })
          .eq('instance_id', selectedInstanceId)
          .eq('pack_id', b.pack_id),
      ]);
      if (r1.error || r2.error) return;
      setInstancePacks((prev) =>
        prev.map((x) => {
          if (x.instance_id !== selectedInstanceId) return x;
          if (x.pack_id === a.pack_id) return { ...x, position: b.position };
          if (x.pack_id === b.pack_id) return { ...x, position: a.position };
          return x;
        }),
      );
    },
    [instancePacks, selectedInstanceId],
  );

  const clearLogs = useCallback(async () => {
    setLogs([]);
    await supabase.from('activity_logs').delete().neq('kind', '__never__');
  }, []);

  const launch = useCallback(() => {
    if (phase !== 'idle' && phase !== 'error') return;
    const inst = instances.find((x) => x.id === selectedInstanceId);
    if (!inst) {
      setLaunchError('Chưa có instance nào — hãy tạo một instance trước.');
      setPhase('error');
      return;
    }
    if (!settings.username.trim()) {
      setLaunchError('Tên người chơi không được để trống.');
      setPhase('error');
      return;
    }
    setLaunchError(null);
    setTasks(
      DOWNLOAD_PLAN.map((s, i) => ({
        id: String(i),
        label: s.label,
        progress: 0,
        speed: '—',
        status: 'queued',
      })),
    );
    setPhase('auth');
    pushLog(`Xác thực tài khoản "${settings.username}"…`);

    const startDownload = setTimeout(() => {
      setPhase('download');
      pushLog(`Bắt đầu tải Minecraft ${inst.mc_version} (${inst.loader})`, 'info');
      DOWNLOAD_PLAN.forEach((step, idx) => {
        const timer = setTimeout(() => {
          setTasks((prev) => prev.map((t, ti) => (ti === idx ? { ...t, status: 'downloading' } : t)));
          let p = 0;
          const iv = setInterval(
            () => {
              p = Math.min(100, p + 6 + Math.random() * 12);
              const done = p >= 100;
              setTasks((prev) =>
                prev.map((t, ti) =>
                  ti === idx
                    ? {
                        ...t,
                        progress: Math.round(p),
                        status: done ? (step.label.startsWith('Xác minh') ? 'verifying' : 'done') : 'downloading',
                        speed: done ? '—' : `${(2 + Math.random() * 9).toFixed(1)} MB/s`,
                      }
                    : t,
                ),
              );
              if (done) clearInterval(iv);
            },
            180 + step.weight * 4,
          );
          timers.current.push(iv as unknown as ReturnType<typeof setTimeout>);
        }, idx * 1500);
        timers.current.push(startDownload, timer);
      });
    }, 1300);
    timers.current.push(startDownload);

    const total = 1300 + DOWNLOAD_PLAN.length * 1500 + 3200;
    const tLaunch = setTimeout(() => {
      setPhase('launching');
      const ram = inst.ram_mb > 0 ? inst.ram_mb : settings.ramMb;
      const args = (inst.java_args || settings.javaArgs).trim();
      const w = inst.width > 0 ? inst.width : settings.resolutionWidth;
      const h = inst.height > 0 ? inst.height : settings.resolutionHeight;
      const activeMods = instanceMods.filter((x) => x.instance_id === inst.id && x.enabled).length;
      const activePacks = instancePacks.filter((x) => x.instance_id === inst.id && x.enabled).length;
      pushLog(`Khởi động JVM: -Xmx${ram}M${args ? ` ${args}` : ''} · cửa sổ ${w}×${h}`, 'info');
      pushLog(`Nạp ${activeMods} mod và ${activePacks} resource/shader pack`, 'info');
    }, total);
    const tRun = setTimeout(() => {
      setPhase('running');
      pushLog(`Minecraft ${inst.mc_version} đang chạy — GL mới!`, 'success');
      const mins = 1 + Math.floor(Math.random() * 5);
      const playedAt = new Date().toISOString();
      setInstances((prev) =>
        prev.map((x) =>
          x.id === inst.id
            ? { ...x, last_played_at: playedAt, playtime_minutes: x.playtime_minutes + mins }
            : x,
        ),
      );
      void supabase
        .from('instances')
        .update({
          last_played_at: playedAt,
          playtime_minutes: (inst.playtime_minutes ?? 0) + mins,
        })
        .eq('id', inst.id);
    }, total + 1800);
    timers.current.push(tLaunch, tRun);
  }, [instanceMods, instancePacks, instances, phase, pushLog, selectedInstanceId, settings]);

  const stopGame = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase('idle');
    setTasks([]);
    pushLog('Đã tắt tiến trình game.', 'warning');
  }, [pushLog]);

  const resetLaunch = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase('idle');
    setTasks([]);
    setLaunchError(null);
  }, []);

  const dismissUpdates = useCallback(() => {
    setUpdatesAvailable(0);
    pushLog('Đã cập nhật 2 mod lên phiên bản mới nhất', 'success');
  }, [pushLog]);

  return {
    loading,
    settings,
    saveSettings,
    instances,
    mods,
    instanceMods,
    logs,
    news,
    worlds,
    servers,
    selectedInstanceId,
    setSelectedInstanceId,
    phase,
    tasks,
    launchError,
    updatesAvailable,
    createInstance,
    deleteInstance,
    updateInstance,
    duplicateInstance,
    exportInstance,
    importModpack,
    installModpack,
    toggleMod,
    toggleModEnabled,
    resourcePacks,
    instancePacks,
    togglePackInstalled,
    togglePackEnabled,
    movePack,
    importPack,
    cycleAvatar,
    addAccount,
    switchAccount,
    removeAccount,
    createWorld,
    duplicateWorld,
    renameWorld,
    deleteWorld,
    addServer,
    removeServer,
    toggleFavoriteServer,
    refreshServer,
    refreshAllServers,
    launch,
    stopGame,
    resetLaunch,
    clearLogs,
    pushLog,
    dismissUpdates,
  };
}
