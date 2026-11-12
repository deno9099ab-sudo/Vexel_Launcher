import { useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PlayDashboard } from './components/PlayDashboard';
import { NewsGrid } from './components/NewsGrid';
import { ConsoleFeed } from './components/ConsoleFeed';
import { InstancesView } from './components/InstancesView';
import { InstanceDrawer } from './components/InstanceDrawer';
import { downloadModpack } from './lib/modpack';
import { WorldsView } from './components/WorldsView';
import { ModsBrowser } from './components/ModsBrowser';
import { ModpacksView } from './components/ModpacksView';
import { ServersView } from './components/ServersView';
import { ResourcePacksView } from './components/ResourcePacksView';
import { SettingsView } from './components/SettingsView';
import { useLauncher } from './store/useLauncher';
import type { TabId } from './lib/types';

function App() {
  const [tab, setTab] = useState<TabId>('play');
  const [managingId, setManagingId] = useState<string | null>(null);
  const l = useLauncher();

  const selectedInstance = useMemo(
    () => l.instances.find((i) => i.id === l.selectedInstanceId) ?? null,
    [l.instances, l.selectedInstanceId],
  );

  const managingInstance = l.instances.find((i) => i.id === managingId) ?? null;

  const modsCount = useMemo(
    () => l.instanceMods.filter((x) => x.instance_id === l.selectedInstanceId && x.enabled).length,
    [l.instanceMods, l.selectedInstanceId],
  );

  const irisMod = l.mods.find((m) => m.slug === 'iris') ?? null;
  const shaderLoader = selectedInstance?.loader === 'fabric' || selectedInstance?.loader === 'quilt';
  const irisInstalled = Boolean(
    irisMod &&
      l.instanceMods.some(
        (x) => x.instance_id === l.selectedInstanceId && x.mod_id === irisMod.id && x.enabled,
      ),
  );
  const shaderReady = shaderLoader && irisInstalled;
  const installIris =
    shaderLoader && irisMod && !irisInstalled
      ? () => {
          const row = l.instanceMods.find(
            (x) => x.instance_id === l.selectedInstanceId && x.mod_id === irisMod.id,
          );
          if (row) void l.toggleModEnabled(irisMod);
          else void l.toggleMod(irisMod);
        }
      : null;

  const modsCountFor = (id: string) => l.instanceMods.filter((x) => x.instance_id === id).length;

  const sendReport = () => {
    l.pushLog('Đã gửi báo cáo lỗi tới đội phát triển Vexel.', 'info');
    l.resetLaunch();
  };

  if (l.loading) {
    return (
      <div className="grid h-full place-items-center bg-vex-base">
        <div className="text-center">
          <div className="pulse-dot mx-auto mb-4 h-3 w-3 rounded-full bg-emerald-400" />
          <p className="font-display text-sm font-semibold tracking-[0.3em] text-zinc-500">
            VEXEL ĐANG KHỞI ĐỘNG…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-vex-base text-zinc-200">
      <Sidebar
        tab={tab}
        onTab={setTab}
        username={l.settings.username || 'Player'}
        avatarSeed={l.settings.avatarSeed}
        onCycleAvatar={l.cycleAvatar}
        updatesAvailable={l.updatesAvailable}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {tab === 'play' && (
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-5 lg:p-8">
            <PlayDashboard
              instance={selectedInstance}
              instances={l.instances}
              username={l.settings.username || 'Player'}
              phase={l.phase}
              tasks={l.tasks}
              launchError={l.launchError}
              onLaunch={l.launch}
              onStop={l.stopGame}
              onReset={l.resetLaunch}
              sendReport={sendReport}
              onSelectInstance={l.setSelectedInstanceId}
              modsCount={modsCount}
            />
            <NewsGrid news={l.news} />
            <div className="min-h-56 flex-1">
              <ConsoleFeed logs={l.logs} onClear={l.clearLogs} />
            </div>
          </div>
        )}

        {tab === 'instances' && (
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-5 lg:p-8">
            <InstancesView
              instances={l.instances}
              selectedId={l.selectedInstanceId}
              onSelect={l.setSelectedInstanceId}
              onCreate={l.createInstance}
              modsCountFor={modsCountFor}
              onManage={setManagingId}
              onImport={l.importModpack}
            />
          </div>
        )}

        {tab === 'modpacks' && (
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-5 lg:p-8">
            <ModpacksView
              mods={l.mods}
              resourcePacks={l.resourcePacks}
              instances={l.instances}
              onInstall={l.installModpack}
              onPlay={() => setTab('play')}
            />
          </div>
        )}

        {tab === 'worlds' && (
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-5 lg:p-8">
            <WorldsView
              worlds={l.worlds}
              instances={l.instances}
              selectedInstanceId={l.selectedInstanceId}
              onCreate={l.createWorld}
              onDuplicate={l.duplicateWorld}
              onRename={l.renameWorld}
              onDelete={l.deleteWorld}
            />
          </div>
        )}

        {tab === 'mods' && (
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col p-5 lg:p-8">
            <ModsBrowser
              mods={l.mods}
              instanceMods={l.instanceMods}
              instance={selectedInstance}
              updatesAvailable={l.updatesAvailable}
              onToggle={l.toggleMod}
              onToggleEnabled={l.toggleModEnabled}
              onUpdateAll={l.dismissUpdates}
            />
          </div>
        )}

        {tab === 'packs' && (
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col p-5 lg:p-8">
            <ResourcePacksView
              packs={l.resourcePacks}
              instancePacks={l.instancePacks}
              instance={selectedInstance}
              onToggleInstalled={l.togglePackInstalled}
              onToggleEnabled={l.togglePackEnabled}
              onMove={l.movePack}
              onImport={l.importPack}
              shaderReady={shaderReady}
              onInstallIris={installIris}
            />
          </div>
        )}

        {tab === 'servers' && (
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-5 lg:p-8">
            <ServersView
              servers={l.servers}
              onAdd={l.addServer}
              onRemove={l.removeServer}
              onToggleFavorite={l.toggleFavoriteServer}
              onRefresh={l.refreshServer}
              onRefreshAll={l.refreshAllServers}
            />
          </div>
        )}

        {tab === 'settings' && (
          <div className="mx-auto w-full max-w-6xl flex-1 p-5 lg:p-8">
            <SettingsView
              settings={l.settings}
              onSave={l.saveSettings}
              onAddAccount={l.addAccount}
              onSwitchAccount={l.switchAccount}
              onRemoveAccount={l.removeAccount}
            />
          </div>
        )}
      </main>

      {managingInstance && (
        <InstanceDrawer
          instance={managingInstance}
          modsCount={modsCountFor(managingInstance.id)}
          packsCount={l.instancePacks.filter((x) => x.instance_id === managingInstance.id).length}
          worldsCount={l.worlds.filter((x) => x.instance_id === managingInstance.id).length}
          globalRamMb={l.settings.ramMb}
          globalJavaArgs={l.settings.javaArgs}
          onClose={() => setManagingId(null)}
          onSave={l.updateInstance}
          onDuplicate={l.duplicateInstance}
          onExport={(id) => {
            const pack = l.exportInstance(id);
            if (pack) downloadModpack(pack);
          }}
          onDelete={l.deleteInstance}
        />
      )}
    </div>
  );
}

export default App;
