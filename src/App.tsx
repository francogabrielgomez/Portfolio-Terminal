/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, ShieldCheck, Cpu, HardDrive, LayoutGrid, Github, Linkedin, Mail, Send, CheckCircle, Database, HelpCircle, ArrowRight
} from 'lucide-react';
import { TabId, SystemMetrics, ContactMessage } from './types';
import { TerminalFrame } from './components/TerminalFrame';
import { SystemMetricBars } from './components/SystemMetricBars';
import { NetworkFlowSim } from './components/NetworkFlowSim';
import { ClusterHardenedSim } from './components/ClusterHardenedSim';
import { InteractiveCliSession } from './components/InteractiveCliSession';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [scanlineEnabled, setScanlineEnabled] = useState<boolean>(true);
  
  // Real-time ticking system metrics
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 6.8,
    ram: 34.2,
    txRate: 14.5,
    rxRate: 28.1,
    diskIdle: true,
    uptimeSeconds: 86450,
    nodes: [
      { id: 'gw-ingress', name: 'gw-edge-ingress', type: 'gateway', status: 'ONLINE', ip: '10.0.10.1' },
      { id: 'node-worker', name: 'k8s-node-worker', type: 'worker', status: 'ONLINE', ip: '10.0.10.5' },
      { id: 'db-replica', name: 'db-patroni-standby', type: 'database', status: 'REPLICATING', ip: '10.0.10.12' }
    ]
  });

  // Dynamic fluctuation of metrics 
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => {
        const cpuDelta = (Math.random() * 2.4 - 1.2);
        const ramDelta = (Math.random() * 0.4 - 0.2);
        const rxDelta = (Math.random() * 6.0 - 3.0);
        const txDelta = (Math.random() * 3.0 - 1.5);
        
        const nextCpu = Math.max(2.5, Math.min(22.0, prev.cpu + cpuDelta));
        const nextRam = Math.max(33.0, Math.min(36.0, prev.ram + ramDelta));
        const nextRx = Math.max(5.0, prev.rxRate + rxDelta);
        const nextTx = Math.max(2.0, prev.txRate + txDelta);

        return {
          ...prev,
          cpu: nextCpu,
          ram: nextRam,
          rxRate: nextRx,
          txRate: nextTx,
          uptimeSeconds: prev.uptimeSeconds + 1,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshMetrics = () => {
    setMetrics(prev => ({
      ...prev,
      cpu: Math.random() * 10 + 3,
      ram: 34.1,
      rxRate: Math.random() * 15 + 10,
      txRate: Math.random() * 8 + 4,
    }));
  };

  // Contact Form Engine States
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formMessage, setFormMessage] = useState<string>('');
  const [formProgress, setFormProgress] = useState<string[]>([]);
  const [formIsSending, setFormIsSending] = useState<boolean>(false);
  const [formDone, setFormDone] = useState<boolean>(false);
  const [savedMessages, setSavedMessages] = useState<ContactMessage[]>([]);

  // Load saved local logs of messages from localStorage 
  useEffect(() => {
    try {
      const existing = localStorage.getItem('local_messages');
      if (existing) {
        setSavedMessages(JSON.parse(existing));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) return;

    setFormIsSending(true);
    setFormProgress([]);
    setFormDone(false);

    const steps = [
      'Iniciando daemon local SMTP (postfix.service)... [OK]',
      'Abriendo canal TLS seguro con la puerta cifrada SSL de destino... [OK]',
      'Verificando validez del correo emisor y cabeceras... [OK]',
      'Inyectando paquete JSON codificado en almacenamiento seguro [localStorage]... [OK]',
      'Encolando mensaje con éxito para entrega diferida. ¡Se ha establecido contacto!',
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setFormProgress(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setFormIsSending(false);
          setFormDone(true);
          
          const newMsg: ContactMessage = {
            name: formName,
            email: formEmail,
            message: formMessage,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };

          const updated = [newMsg, ...savedMessages];
          setSavedMessages(updated);
          localStorage.setItem('local_messages', JSON.stringify(updated));

          // Clear form fields
          setFormName('');
          setFormEmail('');
          setFormMessage('');
        }
      }, (index + 1) * 700);
    });
  };

  const clearSavedMessages = () => {
    localStorage.removeItem('local_messages');
    setSavedMessages([]);
  };

  // Selected sub-simulation inside projects
  const [selectedDemo, setSelectedDemo] = useState<'akvorado' | 'cluster-hardened'>('akvorado');

  return (
    <div className="min-h-screen bg-[#0c1609] text-[#00ff00] flex flex-col justify-between select-none p-2 sm:p-4">
      {/* Background Ambience Banner - Bare Metal Server Aesthetic */}
      <header className="py-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-black/60 border border-[#00ff00]/10 px-4 py-1.5 rounded-full text-xs" id="infra-badge">
          <TerminalIcon className="w-3.5 h-3.5 text-[#00ff00]" />
          <span>ESTADO DEL SISTEMA: <span className="text-emerald-400 font-bold">OPERATIVO EN NODO-2</span></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </header>

      {/* Main Interactive Container Frame */}
      <TerminalFrame
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        scanlineEnabled={scanlineEnabled}
        onToggleScanlines={() => setScanlineEnabled(!scanlineEnabled)}
      >
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Display banner ASCII art styled header */}
            <div className="bg-[#020502]/80 border-l-4 border-[#00ff00] p-4 rounded-sm">
              <span className="text-xs uppercase text-zinc-500 block font-bold tracking-wider">Presentación de Servicios</span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase tracking-tight">
                Arquitectura de Infraestructura, Redes y Cybersecurity
              </h1>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed font-light">
                Asegurando la resiliencia integral de sistemas mediante orquestación autoconfigurable, 
                auditorías de seguridad (hardening defensivo) y observabilidad exhaustiva de flujos de red.
              </p>
            </div>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="infrastructure-pillars">
              <div className="border border-[#00ff00]/15 bg-black/50 p-4 rounded-sm">
                <div className="flex items-center gap-2 text-white mb-2 font-bold uppercase text-xs">
                  <Cpu className="w-4 h-4 text-[#00ff00]" />
                  <span>Sistemas Distribuidos</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-light">
                  Configuración declarativa (IaC) de clústeres elásticos y balanceo multicapa que eliminan puntos únicos de falla (SPOF).
                </p>
              </div>

              <div className="border border-[#00ff00]/15 bg-black/50 p-4 rounded-sm">
                <div className="flex items-center gap-2 text-white mb-2 font-bold uppercase text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#00ff00]" />
                  <span>Hardening & Defensivo</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-light">
                  Mitigación activa de vulnerabilidades en kernel, políticas restrictivas WAF/ACL, Docker isolation y cifrado TLS ubicuo.
                </p>
              </div>

              <div className="border border-[#00ff00]/15 bg-black/50 p-4 rounded-sm">
                <div className="flex items-center gap-2 text-white mb-2 font-bold uppercase text-xs">
                  <Database className="w-4 h-4 text-[#00ff00]" />
                  <span>Observabilidad Completa</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-light">
                  Captura automatizada de telemetrías NetFlow/IPFIX para auditar el rendimiento y detectar anomalías en ms.
                </p>
              </div>
            </div>

            {/* Resource Monitor Visual Widgets */}
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">
                ◆ Telemetría en Vivo del Nodo Servidor
              </span>
              <SystemMetricBars 
                metrics={metrics} 
                onRefreshMetrics={handleRefreshMetrics} 
              />
            </div>
          </div>
        )}

        {/* TAB 2: SOBRE MI */}
        {activeTab === 'sobre-mi' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Profiles Bento grids style */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card left */}
              <div className="lg:col-span-1 border border-[#00ff00]/15 bg-black/60 p-4 rounded-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#00ff00]/15 pb-2">
                    <span className="font-bold text-white text-xs uppercase uppercase">Información / Host</span>
                    <span className="text-[9px] text-[#00ff00] font-mono">[DECR_FILE]</span>
                  </div>

                  {/* Character Avatar Simulation */}
                  <div className="bg-neutral-950 p-4 border border-[#00ff00]/10 rounded-sm text-center">
                    <pre className="text-[9px] text-[#00ff00]/60 leading-tight font-black select-none">
{`   _____ _      _____
  / ____| |    |_   _|
 | |    | |      | |  
 | |    | |      | |  
 | |____| |____ _| |_ 
  \\_____|______|_____|
                      `}
                    </pre>
                    <span className="text-white font-extrabold block text-xs mt-3 uppercase tracking-wider">CLI Systems Architect</span>
                    <span className="text-[10px] text-gray-500">eltrolfransamFG@gmail.com</span>
                  </div>

                  {/* Bio specifications list */}
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Localización:</span>
                      <span className="text-white">Remote (GMT-5)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Filosofía:</span>
                      <span className="text-white">IaC Declarativo 100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">OS Host:</span>
                      <span className="text-white">RHEL / Linux Kernel</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nivel Seguridad:</span>
                      <span className="text-emerald-400 font-bold">Hardened VPS</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#00ff00]/10 flex justify-center gap-4">
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#00ff00] transition-colors cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#00ff00] transition-colors cursor-pointer"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Specializations right */}
              <div className="lg:col-span-2 border border-[#00ff00]/15 bg-black/40 p-5 rounded-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#00ff00]/15 pb-2">
                  <span className="font-bold text-white text-xs uppercase">Especialización de Ingeniería de Sistemas</span>
                  <span className="text-[10px] text-gray-500 font-mono">STABILIZATION_PROTOCOL://LIVE</span>
                </div>

                <div className="space-y-4 text-xs text-gray-300 leading-relaxed font-light">
                  <p>
                    Apasionado por la optimización extrema del <strong className="text-white font-bold">metal de procesamiento</strong>, el desarrollo de automatizaciones resilientes y la eliminación sistemática de cuellos de botella mediante observabilidad continua.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1 bg-black/60 p-3 border border-[#00ff00]/5 rounded-sm">
                      <span className="text-[#00ff00] font-bold block text-[10px] uppercase">◆ IaC & Orquestación</span>
                      <span className="text-gray-400 block text-[10px]">Terraform, Ansible playbooks avanzados, Helm charts, Kubernetes cluster hardening, GitOps (ArgoCD), Docker multi-stage builds.</span>
                    </div>

                    <div className="space-y-1 bg-black/60 p-3 border border-[#00ff00]/5 rounded-sm">
                      <span className="text-[#00ff00] font-bold block text-[10px] uppercase">◆ Infraestructura de Redes</span>
                      <span className="text-gray-400 block text-[10px]">Ruteo BGP transit, resolución DNS autoritativa de baja latencia, seguridad de red WireGuard IPSec VPN, TLS certificates, HTTP/3, firewalls NFtables.</span>
                    </div>

                    <div className="space-y-1 bg-black/60 p-3 border border-[#00ff00]/5 rounded-sm">
                      <span className="text-[#00ff00] font-bold block text-[10px] uppercase">◆ Lenguajes & Tools</span>
                      <span className="text-gray-400 block text-[10px]">Bash scripting experto, TypeScript (Node/Vite), Go, Rust básico, sintaxis SQL Postgres, git hooks defensivos.</span>
                    </div>

                    <div className="space-y-1 bg-black/60 p-3 border border-[#00ff00]/5 rounded-sm">
                      <span className="text-[#00ff00] font-bold block text-[10px] uppercase">◆ Observabilidad & Seguridad</span>
                      <span className="text-gray-400 block text-[10px]">Akvorado IPFIX NetFlow collectors, Prometheus scraping endpoints, Grafana custom security dashboards, Wazuh HIDS logs analysis.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Interactive Cli Shell Terminal block underneath biography */}
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">
                ◆ Explorar Perfil Mediante Terminal Simulado (`cat` & `grep` activos)
              </span>
              <InteractiveCliSession 
                onTabChange={(tabId) => setActiveTab(tabId)}
                activeTab={activeTab}
              />
            </div>
          </div>
        )}

        {/* TAB 3: PROYECTOS */}
        {activeTab === 'proyectos' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Folder layout overview */}
            <div className="border border-[#00ff00]/15 bg-black/70 p-4 rounded-sm">
              <span className="text-[9px] text-gray-500 block">~$ ls -la projects/</span>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div 
                  onClick={() => setSelectedDemo('akvorado')}
                  className={`p-3 border rounded-sm transition-all cursor-pointer ${
                    selectedDemo === 'akvorado' 
                      ? 'border-[#00ff00] bg-[#00ff00]/5' 
                      : 'border-[#00ff00]/10 bg-black hover:border-[#00ff00]/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">📂 [01] Akvorado Flow Collector</span>
                    <span className="text-[9px] text-emerald-400 font-bold">[ACTIVE MODEL]</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Simulación en vivo de tráfico de red IPFIX / NetFlow auditado por WAF.</p>
                </div>

                <div 
                  onClick={() => setSelectedDemo('cluster-hardened')}
                  className={`p-3 border rounded-sm transition-all cursor-pointer ${
                    selectedDemo === 'cluster-hardened' 
                      ? 'border-[#00ff00] bg-[#00ff00]/5' 
                      : 'border-[#00ff00]/10 bg-black hover:border-[#00ff00]/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">📂 [02] Cluster Hardened HA Sync</span>
                    <span className="text-[9px] text-amber-500 font-bold">[READY TEST]</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Visualizador de failover automático ante cortes de nodos activos físicos.</p>
                </div>
              </div>
            </div>

            {/* Display selected simulation framework */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#00ff00]/25 pb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Auditoría interactiva de infraestructuras
                </span>
                <span className="text-[9px] text-gray-600 font-mono">DEMO_ID: {selectedDemo.toUpperCase()}</span>
              </div>

              {selectedDemo === 'akvorado' ? (
                <NetworkFlowSim />
              ) : (
                <ClusterHardenedSim />
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CONTACTO */}
        {activeTab === 'contacto' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column: Form Details / SSH Access codes */}
              <div className="lg:col-span-2 border border-[#00ff00]/15 bg-black/50 p-4 rounded-sm space-y-4">
                <div className="border-b border-[#00ff00]/15 pb-2">
                  <span className="font-bold text-white text-xs uppercase uppercase">Canales de Comunicación</span>
                  <div className="text-[9px] text-gray-500 mt-0.5">SMTP Server: secure-mail.portfolio.local</div>
                </div>

                <div className="space-y-3.5 text-xs text-gray-400">
                  <p className="leading-relaxed text-[11px] font-light">
                    Establece un enlace seguro con mi nodo local. Si necesitas soporte de infraestructura, auditorías defensivas o ingeniería DevOps, transmite un mensaje a continuación.
                  </p>

                  <div className="space-y-2 bg-[#020501] border border-[#00ff00]/10 p-3 rounded-sm font-mono text-xs">
                    <div className="text-[#00ff00] font-bold mb-1">COORDINADAS DIRECTAS:</div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Email:</span>
                      <a href="mailto:eltrolfransamFG@gmail.com" className="text-white hover:text-[#00ff00] transition-colors font-bold underline">
                        eltrolfransamFG@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">LinkedIn:</span>
                      <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">
                        linkedin.com/my-profile
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">PGP Public Key:</span>
                      <span className="text-gray-600 truncate text-[9px]">A8D4 F391 2E9B CE77 02B0...</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 leading-normal border-t border-[#00ff00]/10 pt-2 flex items-start gap-1">
                    <span>* los mensajes transmitidos se resguardan de manera local en el caché de sandbox local (localStorage) para auditar el canal de logs del navegador.</span>
                  </p>
                </div>
              </div>

              {/* Right Column: Contact Form CLI interface */}
              <div className="lg:col-span-3 border border-[#00ff00]/15 bg-black p-4 rounded-sm flex flex-col justify-between">
                <div>
                  <div className="border-b border-[#00ff00]/15 pb-2 mb-4 flex items-center justify-between">
                    <span className="font-bold text-white text-xs uppercase uppercase flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#00ff00]" />
                      Formulario de Contacto (SMTP client)
                    </span>
                    <span className="text-[10px] text-gray-500">guest@portfolio:~$ contact --send</span>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold flex items-center gap-1">
                        <span>guest@portfolio:~$ contact --name</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ingresa tu nombre..."
                        className="w-full bg-black text-[#00ff00] border border-[#00ff00]/30 rounded-sm px-3 py-1.5 focus:outline-none focus:border-[#00ff00] text-xs font-mono placeholder-emerald-950/60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold flex items-center gap-1">
                        <span>guest@portfolio:~$ contact --email</span>
                      </label>
                      <input 
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="correo@servidor-dns.net"
                        className="w-full bg-black text-[#00ff00] border border-[#00ff00]/30 rounded-sm px-3 py-1.5 focus:outline-none focus:border-[#00ff00] text-xs font-mono placeholder-emerald-950/60"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 font-bold flex items-center gap-1">
                        <span>guest@portfolio:~$ contact --message</span>
                      </label>
                      <textarea 
                        required
                        rows={4}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="Escribe tu mensaje técnico o propuesta de infraestructura aquí..."
                        className="w-full bg-black text-[#00ff00] border border-[#00ff00]/30 rounded-sm px-3 py-2 focus:outline-none focus:border-[#00ff00] text-xs font-mono placeholder-emerald-950/60 leading-relaxed resize-none"
                      />
                    </div>

                    {/* Console progress stream log */}
                    {formProgress.length > 0 && (
                      <div className="p-3 bg-[#030602] border border-[#00ff00]/10 rounded-sm space-y-1 font-mono text-[9px] text-[#00ff00]/85" id="form-smtp-terminal">
                        {formProgress.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={formIsSending || !formName || !formEmail || !formMessage}
                        className="w-full py-2 bg-[#004d00]/35 border border-[#00ff00]/40 hover:bg-[#00ff00]/15 text-[#00ff00] font-bold text-xs rounded-sm hover:border-[#00ff00] transition-colors duration-200 disabled:opacity-45 cursor-pointer flex items-center justify-center gap-1.5 uppercase"
                      >
                        <Send className={`w-3.5 h-3.5 ${formIsSending ? 'animate-bounce' : ''}`} />
                        {formIsSending ? 'Transmitiendo Paquetes...' : 'Ejecutar ./send_message.sh'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Saved Messages Logs View (LocalStorage persist audit) */}
            {savedMessages.length > 0 && (
              <div className="border border-[#00ff00]/15 bg-black rounded-sm overflow-hidden" id="smtp-localhost-audit">
                <div className="bg-[#010601] p-2 border-b border-[#00ff00]/15 flex items-center justify-between">
                  <span className="font-bold text-white text-[10px] uppercase">📬 Auditoría de Logs SMTP Recibidos (LocalStorage Cache)</span>
                  <button 
                    onClick={clearSavedMessages}
                    className="text-[9px] text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                  >
                    VACIAR COLA LOCAL
                  </button>
                </div>

                <div className="p-3 max-h-48 overflow-y-auto space-y-3">
                  {savedMessages.map((msg, idx) => (
                    <div key={idx} className="border-l-2 border-emerald-500 pl-3 py-1 space-y-1 text-xs">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#00ff00] font-bold">{msg.name} ({msg.email})</span>
                        <span className="text-gray-500">{msg.date}</span>
                      </div>
                      <p className="text-gray-300 italic">"{msg.message}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </TerminalFrame>
    </div>
  );
}
