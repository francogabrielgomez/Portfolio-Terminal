/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ToggleLeft, ToggleRight, Radio, ShieldCheck, CornerDownRight, Power, RefreshCw, AlertOctagon, Terminal } from 'lucide-react';
import { ClusterLog } from '../types';

export const ClusterHardenedSim: React.FC = () => {
  const [nodeAState, setNodeAState] = useState<'ONLINE' | 'CRITICAL'>('ONLINE');
  const [nodeBState, setNodeBState] = useState<'STANDBY' | 'ONLINE'>('STANDBY');
  const [dbState, setDbState] = useState<'LOCAL_SYNC' | 'SPLIT_BRAIN_GUARDED'>('LOCAL_SYNC');
  const [logs, setLogs] = useState<ClusterLog[]>([]);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Initial logs template
  useEffect(() => {
    addLog('system', 'info', 'Heartbeat engine inicializado. Protocolo: Gossip / UDP.');
    addLog('system', 'success', 'Conexión de clúster establecida. Quórum verificado (3/3 nodos correctos).');
    addLog('proxy', 'info', 'Proxy-Ingress balanceando tráfico al host principal Node-A (10.0.10.5).');
    addLog('database', 'success', 'Replica asíncrona DB_REPL_MASTER -> DB_REPL_SLAVE sincronizada (~1.2ms).');
  }, []);

  // Scroll to bottom helper for cluster logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (node: string, level: 'info' | 'warning' | 'success' | 'error', message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp,
        node: node.toUpperCase(),
        level,
        message,
      },
    ]);
  };

  // Triggers simulated Active physical crash
  const handleSimulateCrash = () => {
    if (nodeAState === 'CRITICAL') return;

    setNodeAState('CRITICAL');
    addLog('node-a', 'error', 'CRITICAL ERROR: Señal ACPI hardware reporta falla súbita de energía.');
    addLog('system', 'warning', 'Señales Keep-Alive desde Node-A desaparecieron. Evaluando salud del nodo...');

    // Trigger failover step 1
    setTimeout(() => {
      addLog('node-b', 'warning', 'Monitor redundante Node-B reporta: Node-A inalcanzable tras 3 reintentos.');
      addLog('system', 'warning', 'Pérdida de quórum detectada. Iniciando protocolo de Failover automático...');
    }, 1000);

    // Trigger failover step 2
    setTimeout(() => {
      addLog('proxy', 'info', 'Promoviendo VIP Flotante de red (10.0.10.10) hacia interfaz Node-B (10.0.10.6)...');
      addLog('database', 'warning', 'Aislando DB_MASTER original para salvaguardar Split-Brain. Promoviendo replica secundario DB_REPL_SLAVE a MASTER...');
      setDbState('SPLIT_BRAIN_GUARDED');
    }, 2200);

    // Trigger failover step 3
    setTimeout(() => {
      setNodeBState('ONLINE');
      addLog('node-b', 'success', 'Node-B promovido a host ACTIVO temporal. Desbloqueando peticiones REST...');
      addLog('proxy', 'success', 'Configuración de Ingress re-escrita con éxito. Tráfico de red migrado a Node-B.');
      addLog('system', 'success', 'FAILOVER DE CLÚSTER COMPLETADO EN 3.5 segundos. Estado del sistema: DEGRADADO / ESTABLE.');
    }, 3500);
  };

  // Restores infrastructure to primary state
  const handleRecoverCluster = () => {
    if (nodeAState === 'ONLINE') return;
    setIsResetting(true);
    addLog('system', 'info', 'Reiniciando Node-A físicamente y validando hardware periférico...');

    setTimeout(() => {
      setNodeAState('ONLINE');
      setNodeBState('STANDBY');
      setDbState('LOCAL_SYNC');
      setIsResetting(false);
      addLog('node-a', 'info', 'Node-A en línea de nuevo. Sincronizando diferencial de registros de base de datos...');
      addLog('database', 'success', 'Sincronización diferencial de base de datos exitosa. Base de datos re-asociada como replica.');
      addLog('proxy', 'info', 'Devolviendo VIP Flotante de red a la dirección principal Node-A (Failback)...');
      addLog('system', 'success', 'Clúster retornado exitosamente a su topología inicial simétrica de Alta Disponibilidad.');
    }, 3000);
  };

  return (
    <div className="space-y-4 font-mono text-xs text-emerald-300">
      {/* Topology Header */}
      <div className="flex flex-col md:flex-row gap-4 p-3 bg-black/80 border border-[#00ff00]/10 rounded-sm items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <ShieldCheck className="w-5 h-5 text-[#00ff00] shrink-0" />
          <div>
            <span className="font-bold text-white text-sm block">HA Active/Passive Cluster Manager v4.1</span>
            <span className="text-[10px] text-gray-500">Supervisión redundante automatizada ante caídas de infraestructura.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          {nodeAState === 'ONLINE' ? (
            <button
              onClick={handleSimulateCrash}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ff5f56] hover:bg-[#ff5f56]/15 hover:border-[#ff5f56]/80 text-[#ff5f56] transition-all rounded-sm font-bold cursor-pointer"
            >
              <Power className="w-3.5 h-3.5 shrink-0" />
              FORZAR CAÍDA (NODO ACTIVO)
            </button>
          ) : (
            <button
              onClick={handleRecoverCluster}
              disabled={isResetting}
              className={`flex items-center gap-1.5 px-3 py-1.5 border border-[#00ff00] hover:bg-[#00ff00]/15 text-[#00ff00] transition-all rounded-sm font-bold disabled:opacity-40 cursor-pointer ${
                isResetting ? 'animate-pulse' : ''
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              REAPROVISIONAR NODE-A (FAILBACK)
            </button>
          )}
        </div>
      </div>

      {/* Graphical Topology Map Grid */}
      <div className="border border-[#00ff00]/20 bg-black/95 p-4 rounded-sm relative" id="topology-grid">
        <div className="absolute top-2 right-2 text-[10px] uppercase text-gray-500 font-semibold flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-[#00ff00]" />
          Topología física activa
        </div>

        <div className="py-6 flex flex-col md:flex-row items-center justify-around gap-8 max-w-3xl mx-auto relative">
          {/* Level 1: Load Balancer */}
          <div className="flex flex-col items-center">
            <div className="p-3 border border-[#00ff00]/40 bg-black/80 rounded-sm text-center font-bold text-white shadow-[0_0_8px_rgba(0,255,0,0.1)]">
              <div className="text-[10px] text-[#00ff00] font-semibold">Proxy Ingress</div>
              <div>HAProxy - VIP Host</div>
              <div className="text-[9px] text-gray-500 font-light mt-0.5">IP: 10.0.10.10</div>
            </div>
            
            {/* Visual routing pointers */}
            <div className="text-gray-600 text-[11px] font-bold mt-2 text-center select-none">
              {nodeAState === 'ONLINE' ? '▼ VIP ruteando a Node-A' : '▼ Failover: VIP ruteando a Node-B'}
            </div>
          </div>

          {/* Connection Arrows & Mid-level cluster nodes */}
          <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Master Node-A Card */}
            <div className={`p-3.5 border rounded-sm transition-all ${
              nodeAState === 'ONLINE'
                ? 'border-emerald-500 bg-emerald-950/5 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                : 'border-red-500/50 bg-red-950/20 text-red-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold block text-xs">PHYS-NODE-A</span>
                <span className={`px-1 py-0.2 text-[8px] font-mono rounded-sm font-bold ${
                  nodeAState === 'ONLINE' ? 'bg-emerald-500 text-black' : 'bg-[#ff5f56] text-black'
                }`}>{nodeAState}</span>
              </div>
              <div className="text-[9px] text-gray-400 font-light mt-1">IP Principal: 10.0.10.5</div>
              <div className="text-[10px] mt-1 text-gray-500">Asignación rol: {nodeAState === 'ONLINE' ? '✔ MASTER CLUSTER' : '✖ CAÍDO'}</div>
              <div className="mt-2 h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${nodeAState === 'ONLINE' ? 'w-2/3 bg-emerald-500' : 'w-0 bg-red-500'}`}></div>
              </div>
            </div>

            {/* Standby/Active Reserve Node-B Card */}
            <div className={`p-3.5 border rounded-sm transition-all ${
              nodeBState === 'ONLINE'
                ? 'border-emerald-500 bg-emerald-950/5 shadow-[0_0_8px_rgba(16,185,129,0.1)] text-white'
                : 'border-amber-500/40 bg-amber-950/5 text-amber-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold block text-xs">PHYS-NODE-B</span>
                <span className={`px-1 py-0.2 text-[8px] font-mono rounded-sm font-bold ${
                  nodeBState === 'ONLINE' ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black'
                }`}>{nodeBState}</span>
              </div>
              <div className="text-[9px] text-gray-400 font-light mt-1">IP Espejo: 10.0.10.6</div>
              <div className="text-[10px] mt-1 text-gray-500">Asignación rol: {nodeBState === 'ONLINE' ? '✔ PROMOVIDO A MASTER' : '⏱ RESERVA EN ESPERA'}</div>
              <div className="mt-2 h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${nodeBState === 'ONLINE' ? 'w-3/4 bg-emerald-500' : 'w-1/12 bg-amber-500'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Database replication scheme graphic */}
        <div className="mt-4 pt-4 border-t border-[#00ff00]/10 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
            <span className="w-1.5 h-1.5 bg-[#00ff00] rounded-full inline-block"></span>
            Canal Heartbeat OK
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">[DB Cluster Status]:</span>
            <span className={`text-[10px] font-bold ${
              dbState === 'LOCAL_SYNC' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {dbState === 'LOCAL_SYNC' ? 'ONLINE (MASTER-SLAVE REPLICATING)' : 'SAFE-GUARD ACTIVE (PREVINIENDO SPLIT-BRAIN EN RED)'}
            </span>
          </div>
        </div>
      </div>

      {/* Cluster Shell Events Logs Terminal Output */}
      <div className="border border-[#00ff00]/15 bg-black/90 rounded-sm">
        <div className="bg-[#000a00] p-2 border-b border-[#00ff00]/15 flex items-center justify-between">
          <span className="font-bold text-white text-[10px] uppercase tracking-wider flex items-center gap-2">
            <AlertOctagon className="w-3.5 h-3.5 text-green-500 animate-pulse" />
            Consola del Supervisor de Infraestructura
          </span>
          <span className="text-[9px] text-gray-500">Eventos en cola: {logs.length}</span>
        </div>

        <div 
          ref={logContainerRef}
          className="p-3 h-48 overflow-y-auto space-y-1 text-[10px] font-mono select-text bg-[#030702]"
          id="cluster-log-terminal"
        >
          {logs.map((log) => (
            <div key={log.id} className="leading-snug">
              <span className="text-gray-500 mr-1.5">[{log.timestamp}]</span>
              <span className={`font-semibold mr-1.5 ${
                log.node === 'SYSTEM' ? 'text-[#ffbd2e]' : 'text-zinc-400'
              }`}>({log.node})</span>
              <span className={`rounded-sm mr-2 font-black ${
                log.level === 'info' ? 'text-cyan-400' : 
                log.level === 'warning' ? 'text-[#ffbd2e]' : 
                log.level === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                [{log.level.toUpperCase()}]:
              </span>
              <span className="text-gray-200">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
