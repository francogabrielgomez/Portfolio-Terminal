/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Database, Server, Radio, Shield, HelpCircle } from 'lucide-react';
import { SystemMetrics, NodeStatus } from '../types';

interface SystemMetricBarsProps {
  metrics: SystemMetrics;
  onRefreshMetrics: () => void;
}

export const SystemMetricBars: React.FC<SystemMetricBarsProps> = ({ metrics, onRefreshMetrics }) => {
  const [activeNodes, setActiveNodes] = useState<NodeStatus[]>(metrics.nodes);

  useEffect(() => {
    setActiveNodes(metrics.nodes);
  }, [metrics.nodes]);

  // Generate ASCII progressive indicator bar from value percentage
  const renderAsciiBar = (percentage: number, char: string = '■', emptyChar: string = '▱', length: number = 20) => {
    const filledCount = Math.round((percentage / 100) * length);
    const emptyCount = length - filledCount;
    return (
      <span className="font-mono text-xs">
        <span className="text-[#00ff00]">{char.repeat(filledCount)}</span>
        <span className="text-gray-700">{emptyChar.repeat(emptyCount)}</span>
        <span className="ml-2 text-white font-semibold">{percentage.toFixed(1)}%</span>
      </span>
    );
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor((seconds % (3600*24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Metrics Card */}
      <div className="border border-[#00ff00]/20 bg-black/60 p-4 rounded-sm" id="resource-monitors">
        <div className="flex items-center justify-between border-b border-[#00ff00]/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00ff00] animate-pulse" />
            <span className="text-xs uppercase font-bold text-[#00ff00]">Recursos del Sistema</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">NODE-K8S://HOST_PRIMARY</span>
        </div>

        <div className="space-y-4 font-mono">
          <div>
            <div className="flex justify-between text-xs mb-1 text-gray-400">
              <span>Carga de CPU (Control Plane)</span>
              <span>{metrics.cpu > 70 ? 'WARNING' : 'OPTIMAL'}</span>
            </div>
            {renderAsciiBar(metrics.cpu, '■', ' ', 24)}
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 text-gray-400">
              <span>Asignación de Memoria (RAM)</span>
              <span>{metrics.ram.toFixed(1)}% / 100%</span>
            </div>
            {renderAsciiBar(metrics.ram, '■', ' ', 24)}
          </div>

          {/* Infrastructure speeds */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#00ff00]/10 text-xs">
            <div>
              <span className="text-gray-500">Tráfico de Entrada:</span>
              <div className="text-[#00ff00] font-semibold">{metrics.rxRate.toFixed(2)} KB/s</div>
            </div>
            <div>
              <span className="text-gray-500">Tráfico de Salida:</span>
              <div className="text-[#00ff00] font-semibold">{metrics.txRate.toFixed(2)} KB/s</div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#00ff00]/10 flex justify-between text-xs items-center">
            <span className="text-gray-500">Uptime del Servidor:</span>
            <span className="text-[#00ff00] font-semibold">{formatUptime(metrics.uptimeSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Cluster Nodes Mapping */}
      <div className="border border-[#00ff00]/20 bg-black/60 p-4 rounded-sm" id="cluster-mapping">
        <div className="flex items-center justify-between border-b border-[#00ff00]/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#00ff00]" />
            <span className="text-xs uppercase font-bold text-[#00ff00]">Mapeo de Clúster de Red</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">PROD-ZONE://AMER-WEST</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {activeNodes.map((node) => (
            <div 
              key={node.id} 
              className="flex justify-between items-center p-1.5 border border-[#00ff00]/5 bg-black/40 rounded-sm hover:border-[#00ff00]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                {node.type === 'gateway' && <Radio className="w-3.5 h-3.5 text-gray-400" />}
                {node.type === 'worker' && <Cpu className="w-3.5 h-3.5 text-gray-400" />}
                {node.type === 'database' && <Database className="w-3.5 h-3.5 text-gray-400" />}
                
                <span className="font-semibold text-white">{node.name}</span>
                <span className="text-[10px] text-gray-500">({node.ip})</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  node.status === 'ONLINE' ? 'bg-[#00ff00] shadow-[0_0_4px_#00ff00]' : 
                  node.status === 'STANDBY' ? 'bg-[#ffbd2e] shadow-[0_0_4px_#ffbd2e]' : 
                  node.status === 'REPLICATING' ? 'bg-indigo-400 shadow-[0_0_4px_rgba(129,140,248,1)]' :
                  'bg-[#ff5f56] shadow-[0_0_4px_#ff5f56] animate-pulse'
                }`}></span>
                <span className={`text-[10px] font-bold ${
                  node.status === 'ONLINE' ? 'text-[#00ff00]' : 
                  node.status === 'STANDBY' ? 'text-amber-400' : 
                  node.status === 'REPLICATING' ? 'text-indigo-400' :
                  'text-[#ff5f56]'
                }`}>{node.status}</span>
              </div>
            </div>
          ))}

          <div className="mt-2 text-[10px] text-gray-500 leading-relaxed border-t border-[#00ff00]/10 pt-2 flex items-start gap-1">
            <Shield className="w-3 h-3 text-[#00ff00]/60 shrink-0 mt-0.5" />
            <span>Verificando heartbeat cíclico cada 2.5s. Integridad de topología de cluster garantizada.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
