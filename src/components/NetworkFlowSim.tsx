/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Network, Play, Pause, Activity, Filter, ShieldCheck, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react';
import { NetworkFlowRecord } from '../types';

export const NetworkFlowSim: React.FC = () => {
  const [trafficLevel, setTrafficLevel] = useState<'IDLE' | 'LOW' | 'NORMAL' | 'HIGH'>('NORMAL');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [firewallActive, setFirewallActive] = useState<boolean>(true);
  const [flows, setFlows] = useState<NetworkFlowRecord[]>([]);
  const [totalBytes, setTotalBytes] = useState<number>(10485760); // Starts off at exactly 10MB
  const [totalPackets, setTotalPackets] = useState<number>(34211);
  const [activePaths, setActivePaths] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Source and Destination IPs for packet generation
  const sources = [
    { ip: '198.51.100.42', label: 'User Node (SUD-AM)' },
    { ip: '203.0.113.89', label: 'App Client (EUX)' },
    { ip: '192.0.2.115', label: 'Backup Engine (US)' },
    { ip: '10.0.0.8', label: 'Admin VPN SSH' },
    { ip: '198.51.100.222', label: 'Suspicious IP' }, // Malicious node to test firewall
  ];

  const destinations = [
    { ip: '10.10.1.2', label: 'Ingress Web Gateway' },
    { ip: '10.10.1.15', label: 'Main API Service' },
    { ip: '10.10.2.100', label: 'Auth-Cache Server' },
    { ip: '10.10.3.50', label: 'DB Master Cluster' },
  ];

  const protocols: ('TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'SSH' | 'BGP')[] = [
    'TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'BGP'
  ];

  // Helper code to trigger simulated pathway lighting
  const triggerVisualFlow = (srcIndex: number, dstIndex: number) => {
    const key = `path-${srcIndex}-${dstIndex}`;
    setActivePaths((prev) => [...prev, key]);
    setTimeout(() => {
      setActivePaths((prev) => prev.filter((p) => p !== key));
    }, 400);
  };

  // Setup initial data
  useEffect(() => {
    const initialFlows: NetworkFlowRecord[] = Array.from({ length: 8 }).map((_, i) => {
      const srcObj = sources[Math.floor(Math.random() * sources.length)];
      const dstObj = destinations[Math.floor(Math.random() * destinations.length)];
      const proto = protocols[Math.floor(Math.random() * protocols.length)];
      const bytes = Math.floor(Math.random() * (proto === 'SSH' ? 4500 : 15000)) + 300;
      const packets = Math.round(bytes / 120) + 1;
      
      const isSuspicious = srcObj.ip === '198.51.100.222';
      const status = isSuspicious && firewallActive ? 'filtered' : 'allowed';

      return {
        id: `flow-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - i * 12000).toISOString().split('T')[1].substring(0, 8),
        src: srcObj.ip,
        dst: dstObj.ip,
        protocol: proto,
        bytes,
        packets,
        status,
      } as NetworkFlowRecord;
    });
    setFlows(initialFlows);
  }, []);

  // Set up packet generator loop
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (trafficLevel === 'IDLE') return;

    let delay = 1000;
    if (trafficLevel === 'LOW') delay = 2200;
    if (trafficLevel === 'HIGH') delay = 400;

    intervalRef.current = setInterval(() => {
      const srcIndex = Math.floor(Math.random() * sources.length);
      const dstIndex = Math.floor(Math.random() * destinations.length);
      const srcObj = sources[srcIndex];
      const dstObj = destinations[dstIndex];
      const proto = protocols[Math.floor(Math.random() * protocols.length)];
      
      // Calculate packet sizes
      const baseMultiplier = trafficLevel === 'LOW' ? 1 : trafficLevel === 'HIGH' ? 3 : 1.8;
      const bytes = Math.floor(Math.random() * 8000 * baseMultiplier) + 150;
      const packets = Math.round(bytes / 250) + 1;

      // Suspicious node checking
      const isSuspicious = srcObj.ip === '198.51.100.222';
      let status: 'allowed' | 'filtered' | 'blocked' = 'allowed';
      if (isSuspicious) {
        status = firewallActive ? 'filtered' : 'allowed';
      }

      // Visual animation blinker trigger
      triggerVisualFlow(srcIndex, dstIndex);

      setTotalBytes((prev) => prev + (status === 'allowed' ? bytes : 0));
      setTotalPackets((prev) => prev + (status === 'allowed' ? packets : 1));

      setFlows((prev) => {
        const nextFlow: NetworkFlowRecord = {
          id: `flow-${Date.now()}`,
          timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
          src: srcObj.ip,
          dst: dstObj.ip,
          protocol: proto,
          bytes,
          packets,
          status,
        };
        return [nextFlow, ...prev.slice(0, 19)];
      });
    }, delay);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trafficLevel, firewallActive]);

  const filteredFlows = flows.filter(
    (flow) => protocolFilter === 'ALL' || flow.protocol === protocolFilter
  );

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Simulation Controls & Flow Info */}
      <div className="flex flex-col md:flex-row gap-4 p-3 bg-black/80 border border-[#00ff00]/10 rounded-sm items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Activity className="w-5 h-5 text-[#00ff00] animate-pulse shrink-0" />
          <div>
            <span className="font-bold text-white text-sm block">Akvorado NetFlow v9 IPFIX Collector</span>
            <span className="text-[10px] text-gray-500">Servicio de auditoría de paquetes de infraestructura en vivo.</span>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-left w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-[#00ff00]/15">
          <div>
            <span className="text-gray-500 block uppercase text-[9px]">Captura Total</span>
            <span className="text-[#00ff00] font-bold">{(totalBytes / 1024 / 1024).toFixed(3)} MB</span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase text-[9px]">Paquetes Validados</span>
            <span className="text-white font-bold">{totalPackets.toLocaleString()} pkts</span>
          </div>
          <div className="hidden lg:block">
            <span className="text-gray-500 block uppercase text-[9px]">Estado de Auditor</span>
            <span className="text-emerald-400 font-bold leading-none flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ESCUCHANDO
            </span>
          </div>
        </div>
      </div>

      {/* Visual Infrastructure Network Map Grid */}
      <div className="border border-[#00ff00]/20 bg-black/95 p-4 rounded-sm relative overflow-hidden">
        <div className="absolute top-2 right-2 text-[10px] text-gray-600 uppercase font-semibold">
          Flujo de Datos en Tiempo Real
        </div>

        {/* The Graphic Topology */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 max-w-4xl mx-auto">
          {/* Node Tier 1: Sources */}
          <div className="space-y-4 w-full md:w-1/4">
            <span className="text-gray-500 text-[10px] block border-b border-[#00ff00]/10 pb-1 uppercase font-bold text-center">Orígenes (Clients)</span>
            {sources.map((src, idx) => (
              <div 
                key={src.ip}
                className={`p-2 border transition-colors text-center rounded-sm ${
                  src.ip === '198.51.100.222' 
                    ? firewallActive 
                      ? 'border-red-900 bg-red-950/25 text-red-400' 
                      : 'border-[#ffbd2e]/50 bg-[#ffbd2e]/10 text-[#ffbd2e]'
                    : 'border-[#00ff00]/10 bg-[#00ff00]/5 text-white'
                }`}
              >
                <div className="font-bold text-[10px] truncate">{src.label}</div>
                <div className="text-[9px] text-gray-500">{src.ip}</div>
              </div>
            ))}
          </div>

          {/* Core Gateway Collector Gateway */}
          <div className="w-full md:w-1/5 flex flex-col items-center justify-center py-4">
            <div className="h-full w-0.5 bg-dashed bg-[#00ff00]/20 absolute hidden md:block"></div>
            <div className="p-4 border border-[#00ff00]/40 bg-black text-[#00ff00] text-center rounded-lg shadow-[0_0_10px_rgba(0,255,0,0.15)] relative z-20 w-full">
              <Network className="w-8 h-8 mx-auto mb-2 text-[#00ff00]" />
              <div className="font-bold text-xs">WAF & GATEWAY</div>
              <div className="text-[9px] text-gray-500">PORT: 443 / IPFIX</div>
              
              <div className="mt-2 text-[10px] flex items-center justify-center gap-1 border-t border-[#00ff00]/20 pt-1.5">
                {firewallActive ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">WAF ACTIVE</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                    <span className="text-amber-500 font-bold">BYPASS MODE</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Node Tier 2: Microservice Destinations */}
          <div className="space-y-4 w-full md:w-1/4">
            <span className="text-gray-500 text-[10px] block border-b border-[#00ff00]/10 pb-1 uppercase font-bold text-center">Destinos (L-Host)</span>
            {destinations.map((dst, idx) => (
              <div 
                key={dst.ip}
                className="p-2 border border-[#00ff00]/10 bg-black text-center rounded-sm hover:border-[#00ff00]/40 transition-colors"
              >
                <div className="font-bold text-[10px] text-emerald-300">{dst.label}</div>
                <div className="text-[9px] text-gray-500">{dst.ip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control Filters and Action Presets */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Simulator controls */}
        <div className="p-3 bg-black/70 border border-[#00ff00]/15 rounded-sm flex-1 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">Tráfico:</span>
            <div className="inline-flex rounded-md shadow-sm">
              {(['IDLE', 'LOW', 'NORMAL', 'HIGH'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setTrafficLevel(level)}
                  className={`px-2.5 py-1 text-[10px] font-bold first:rounded-l-sm last:rounded-r-sm transition-colors border-r last:border-r-0 ${
                    trafficLevel === level 
                      ? 'bg-[#00ff00] text-black border-[#00ff00]' 
                      : 'bg-black text-[#00ff00] hover:bg-[#00ff00]/10 border-[#00ff00]/20'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">Verificar Protocolo:</span>
            <div className="relative">
              <select
                value={protocolFilter}
                onChange={(e) => setProtocolFilter(e.target.value)}
                className="bg-black text-[#00ff00] border border-[#00ff00]/30 rounded-sm px-2 py-0.5 text-[10px] focus:outline-none focus:border-[#00ff00]/70 appearance-none font-mono pr-6 cursor-pointer"
              >
                <option value="ALL">ALL PROTOCOLS</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
                <option value="SSH">SSH</option>
                <option value="BGP">BGP</option>
              </select>
              <Filter className="w-3 h-3 text-[#00ff00] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Firewall action toggler */}
          <button
            onClick={() => setFirewallActive(!firewallActive)}
            className={`flex items-center gap-1.5 px-3 py-1 border rounded-sm font-bold text-[10px] transition-all cursor-pointer ${
              firewallActive 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/20' 
                : 'border-red-500 animate-pulse text-red-500 bg-red-950/10 hover:bg-red-950/20'
            }`}
          >
            {firewallActive ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
            {firewallActive ? 'WAF CORE: PROTEGIDO (REGLAS ACTIVAS)' : 'WAF CORE: DESACTIVADO (BYPASS)'}
          </button>
        </div>
      </div>

      {/* Captured Flow Table (IPFIX telemetry log output) */}
      <div className="border border-[#00ff00]/15 rounded-sm overflow-hidden bg-black/90">
        <div className="bg-[#000a00] p-2 border-b border-[#00ff00]/15 flex items-center justify-between">
          <span className="font-bold text-white text-[10px] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
            Logs de Conversación (Akvorado Flow Analyzer)
          </span>
          <span className="text-[9px] text-gray-500 uppercase">Filtro activo: {protocolFilter}</span>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-b-sm">
          <table className="w-full text-left font-mono border-collapse" id="flow-table">
            <thead>
              <tr className="border-b border-[#00ff00]/15 bg-black text-[#00ff00]/60 text-[10px]">
                <th className="p-2 font-medium">TIMESTAMP</th>
                <th className="p-2 font-medium">SRC ADDR</th>
                <th className="p-2 font-medium">DST ADDR</th>
                <th className="p-2 font-medium">PROTO</th>
                <th className="p-2 font-medium text-right">SIZE (BYTES)</th>
                <th className="p-2 font-medium text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00ff00]/5 text-[10px]">
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    <WifiOff className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    Sin flujos que reportar para el protocolo seleccionado o la captura está en pausa.
                  </td>
                </tr>
              ) : (
                filteredFlows.map((flow) => (
                  <tr 
                    key={flow.id} 
                    className={`hover:bg-[#00ff00]/5 max-sm:text-[9px] ${
                      flow.status === 'filtered' 
                        ? 'bg-red-950/20 text-red-400' 
                        : flow.status === 'blocked' 
                          ? 'bg-orange-950/25 text-orange-400 line-through'
                          : 'text-gray-300'
                    }`}
                  >
                    <td className="p-2 font-light text-gray-500">{flow.timestamp}</td>
                    <td className="p-2 font-semibold">
                      {flow.src === '198.51.100.222' ? (
                        <span className="text-rose-500 font-bold decoration-dotted underline cursor-help" title="Suspicious activity from external botnet cluster">
                          {flow.src}⚠️
                        </span>
                      ) : flow.src}
                    </td>
                    <td className="p-2">{flow.dst}</td>
                    <td className="p-2">
                      <span className="px-1 py-0.5 rounded-sm bg-neutral-900 border border-neutral-700 text-neutral-300 text-[9px] font-bold">
                        {flow.protocol}
                      </span>
                    </td>
                    <td className="p-2 text-right font-medium">{flow.bytes.toLocaleString()} B</td>
                    <td className="p-2 text-center font-bold">
                      {flow.status === 'allowed' ? (
                        <span className="text-emerald-500 uppercase text-[9px]">ALLOWED</span>
                      ) : (
                        <span className="text-rose-500 uppercase text-[9px] bg-red-950/40 border border-red-800 px-1 py-0.10 tracking-wide rounded-sm font-semibold">
                          BLOCKED (WAF)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
