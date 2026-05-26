/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Terminal, ShieldCheck, HardDrive, Wifi, Eye, RefreshCw, Cpu, Database
} from 'lucide-react';
import { TabId } from '../types';

interface TerminalFrameProps {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  scanlineEnabled: boolean;
  onToggleScanlines: () => void;
}

export const TerminalFrame: React.FC<TerminalFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  scanlineEnabled,
  onToggleScanlines,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [latency, setLatency] = useState<number>(14);

  // UTC clock updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Soft fluctuate latency of simulated SSH server
  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(prev => {
        const adjustment = Math.floor(Math.random() * 5) - 2;
        const next = prev + adjustment;
        return next < 5 ? 5 : next > 25 ? 25 : next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const tabItems = [
    { id: 'home' as TabId, label: '[01] INVENTARIO (home.sh)', desc: 'Dashboard del Sistema' },
    { id: 'sobre-mi' as TabId, label: '[02] SOBRE_MI (cat_profile.md)', desc: 'Especializaciones' },
    { id: 'proyectos' as TabId, label: '[03] PROYECTOS (ls_projects.bin)', desc: 'Simulaciones Técnicas' },
    { id: 'contacto' as TabId, label: '[04] CONTACTO (smtp_client.elf)', desc: 'Formulario de Terminal' },
  ];

  return (
    <div className="max-w-[1020px] mx-auto w-full px-2 sm:px-4 py-4 md:py-8 font-mono">
      {/* Outer Shell Wrapper (Deep Green Glow & Border) */}
      <div 
        className={`border-2 border-[#1a3a14] rounded-lg bg-black relative shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          scanlineEnabled ? 'terminal-scanlines crt-effect' : ''
        }`}
        id="terminal-outer-shell"
      >
        {/* Terminal Header Bar */}
        <div className="h-10 bg-[#1a1a1a] border-b border-[#1a3a14] flex items-center px-4 justify-between select-none z-10">
          {/* OS Windows control markers */}
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full bg-[#ff5f56] cursor-pointer"
              title="Cerrar Conexión (Limpiar logs)"
              onClick={() => window.location.reload()}
            ></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          
          <div className="text-xs text-[#00ff00] opacity-50 uppercase tracking-widest text-[9px] md:text-xs">
            session: dev@remote-vps-01 — ssh
          </div>
          
          <div className="w-12"></div>
        </div>

        {/* Top Command Line Navigation Rails */}
        <div className="flex border-b border-[#1a3a14] bg-[#0c0c0c] z-10 overflow-x-auto whitespace-nowrap scrollbar-none justify-between select-none">
          <div className="flex shrink-0">
            {tabItems.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 sm:px-6 py-2.5 border-r border-[#1a3a14] transition-all relative cursor-pointer font-bold text-xs uppercase tracking-tight duration-150 ${
                    active 
                      ? 'bg-black text-white border-t-2 border-t-[#00ff00]' 
                      : 'text-gray-400 opacity-60 hover:opacity-100 hover:bg-neutral-900/40'
                  }`}
                >
                  <div>{tab.label.split(' ')[0]} {tab.id.toUpperCase()}</div>
                  <div className="text-[7px] tracking-widest text-gray-500 font-light lowercase mt-0.5 leading-none">
                    {tab.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* CRT Switch Helper button */}
          <div className="flex items-center pr-3 shrink-0 max-sm:hidden">
            <button
              onClick={onToggleScanlines}
              className={`px-2.5 py-1 border rounded text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                scanlineEnabled 
                  ? 'border-[#00ff00] text-[#00ff00] bg-[#00ff00]/10' 
                  : 'border-[#1a3a14] text-gray-500'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              CRT_EFFECT {scanlineEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Dense Inner Layout Area (Sidebar Info + Main Tab Children Container) */}
        <div className="flex-1 flex overflow-hidden z-10 flex-col md:flex-row min-h-[500px]">
          {/* High Density Left Sidebar column */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1a3a14] p-4 flex flex-col space-y-5 bg-[#050505] shrink-0">
            <div>
              <div className="text-[10px] uppercase opacity-40 mb-2 tracking-tighter">System Information</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">OS</span>
                  <span className="text-white">Hardened-Linux</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Uptime</span>
                  <span className="text-white">432d 12h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kernel</span>
                  <span className="text-white">5.15.0-v8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shell</span>
                  <span className="text-white">zsh 5.8</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase opacity-40 mb-2 tracking-tighter">Network Nodes</div>
              <div className="space-y-1.5 p-1">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff00] animate-pulse"></div>
                  <span className="text-gray-300">gw-edge-ingress</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff00] animate-pulse"></div>
                  <span className="text-gray-300">k8s-node-worker</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]"></div>
                  <span className="text-orange-400">db-patroni-sync</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-2">
              <div className="p-2.5 border border-[#1a3a14] bg-black rounded text-[10px]">
                <div className="text-[#ffbd2e] mb-1 font-bold tracking-wide">⚠️ ALERT_LOG</div>
                <div className="opacity-70 leading-relaxed text-gray-400">
                  Intento de ingreso no autorizado mitigado via WAF a las {currentTime.split(' ')[1] || '04:22 UTC'}.
                </div>
              </div>
            </div>
          </aside>

          {/* Main output area */}
          <main className="flex-1 p-4 md:p-6 flex flex-col justify-between bg-[#000000] overflow-y-auto">
            {children}
          </main>
        </div>

        {/* High Density Footer Status Rails */}
        <footer className="h-8 bg-[#1a1a1a] border-t border-[#1a3a14] px-4 flex items-center justify-between text-[10px] z-10 text-gray-500 select-none">
          <div className="flex space-x-4 items-center">
            <span className="max-sm:hidden">UTF-8</span>
            <span className="max-sm:hidden">L: 42, C: 12</span>
            <span className="text-[#ffbd2e] flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#ffbd2e] animate-ping"></span>
              WARN: Disk 82% Full
            </span>
          </div>
          <div className="flex space-x-4">
            <span className="max-sm:hidden">v2.4.0-stable</span>
            <span className="text-[#00ff00] font-bold">● CONNECTED</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
