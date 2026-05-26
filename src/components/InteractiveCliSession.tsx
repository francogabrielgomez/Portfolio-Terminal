/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, HelpCircle, ArrowRight, Play } from 'lucide-react';
import { ShellCommandHistory } from '../types';

interface InteractiveCliSessionProps {
  onTabChange: (tabId: 'home' | 'sobre-mi' | 'proyectos' | 'contacto') => void;
  activeTab: string;
}

export const InteractiveCliSession: React.FC<InteractiveCliSessionProps> = ({ onTabChange, activeTab }) => {
  const [history, setHistory] = useState<ShellCommandHistory[]>([]);
  const [commandInput, setCommandInput] = useState<string>('');
  const historyEndRef = useRef<HTMLDivElement | null>(null);

  // Default virtual filesystem
  const virtualFiles: Record<string, string> = {
    'bio.md': `# PERFIL PROFESIONAL\n\nIngeniero en Infraestructura, Redes y Operaciones Críticas.\n\nEspecializado en arquitecturas Unix autoconfigurables, hardening defensivo, automatización Terraform/Ansible y orquestación con Kubernetes.\n\n"La redundancia no es un lujo, es una póliza de seguro de negocio."`,
    'architecture.txt': `=== ARQUITECTURA DE INFRAESTRUCTURA DE REFERENCIA ===\n\n- Ingress Layer: Dual Nginx balanceados con Keepalived.\n- Kubernetes Nodes: Rocky Linux + Containerd (CNI Cilium con políticas de red L7 e IPsec).\n- Databases: PostgreSQL Multi-Master (BDR) con Failover automático mediante Patroni.\n- Telemetry Stack: Prometheus, VictoriaMetrics, Akvorado Flow Collector.`,
    'philosophy.json': `{\n  "motto": "Diseñar para fallar, asegurar para resistir.",\n  "values": [\n    "Aislamiento y privilegios mínimos",\n    "Automatización declarativa del 100% de recursos",\n    "Observabilidad exhaustiva en tiempo real"\n  ]\n}`,
  };

  useEffect(() => {
    // Initial welcome line
    setHistory([
      {
        input: 'syscheck --status',
        output: 'SSH Connection established with guest@root-node.local ...\n[OK] Sesión segura SSL/TLS v1.3 establecida.\nEscribe "help" para ver los comandos interactivos disponibles o haz clic en los accesos rápidos de abajo.',
        timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
      },
    ]);
  }, []);

  // Scroll to bottom whenever history loads
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const executeCommand = (cmdStr: string) => {
    const trimmedCmd = cmdStr.trim();
    if (!trimmedCmd) return;

    let output = '';
    const parts = trimmedCmd.split(' ');
    const mainCommand = parts[0].toLowerCase();

    switch (mainCommand) {
      case 'help':
        output = `COMANDOS Soportados:\n` +
          `  help                             - Muestra esta lista de ayuda.\n` +
          `  ls -la                           - Lista el directorio virtual de archivos del servidor.\n` +
          `  cat [archivo]                    - Lee el contenido de un archivo (e.g., "cat bio.md").\n` +
          `  grep "[filtro]" [archivo]         - Busca palabras clave dentro de un archivo.\n` +
          `  goto [dashboard]                 - Cambia de sección principal ("home", "sobre-mi", "proyectos", "contacto").\n` +
          `  clear                            - Limpia los registros de la terminal.\n`;
        break;

      case 'ls':
        const flag = parts[1];
        if (flag === '-la' || flag === '-l' || flag === '-a' || !flag) {
          output = `drwxr-xr-x  2 root  staff   128B May 26 23:37 .\n` +
            `drwxr-xr-x  4 root  staff   256B May 26 23:37 ..\n` +
            `-rw-r--r--  1 guest staff   352B May 26 23:37 architecture.txt\n` +
            `-rw-r--r--  1 guest staff   412B May 26 23:37 bio.md\n` +
            `-rw-r--r--  1 guest staff   210B May 26 23:37 philosophy.json\n`;
        } else {
          output = `ls: bandera no soportada de momento. Intenta "ls -la"`;
        }
        break;

      case 'cat':
        const targetFile = parts[1];
        if (!targetFile) {
          output = `Uso: cat [archivo]. Archivos disponibles: bio.md, architecture.txt, philosophy.json.`;
        } else if (virtualFiles[targetFile]) {
          output = virtualFiles[targetFile];
        } else {
          output = `cat: ${targetFile}: Archivo no encontrado. Intenta "ls -la" para ver los archivos disponibles.`;
        }
        break;

      case 'grep':
        // grep "search" filename
        if (parts.length < 3) {
          output = `Uso: grep "[filtro]" [archivo]. Ej: grep "Infraestructura" bio.md`;
        } else {
          // Reassemble query string (might be enclosed in quotes)
          let searchTerms = parts.slice(1, parts.length - 1).join(' ').replace(/['"]/g, '');
          const fileToSearch = parts[parts.length - 1];

          if (!virtualFiles[fileToSearch]) {
            output = `grep: ${fileToSearch}: Archivo no encontrado.`;
          } else {
            const lines = virtualFiles[fileToSearch].split('\n');
            const matchingLines = lines.filter((line) => 
              line.toLowerCase().includes(searchTerms.toLowerCase())
            );

            if (matchingLines.length > 0) {
              output = matchingLines.map(line => `> ${line}`).join('\n');
            } else {
              output = `grep: No se encontraron coincidencias para "${searchTerms}" en ${fileToSearch}.`;
            }
          }
        }
        break;

      case 'goto':
        const viewName = parts[1]?.toLowerCase();
        if (!viewName) {
          output = `Uso: goto [seccion]. Ej: "goto proyectos" o "goto contacto".`;
        } else if (['home', 'sobre-mi', 'proyectos', 'contacto'].includes(viewName)) {
          const matchedTab = viewName as 'home' | 'sobre-mi' | 'proyectos' | 'contacto';
          onTabChange(matchedTab);
          output = `Redirigiendo sesión a módulo principal: [${viewName.toUpperCase()}] ... [EXIT_OK]`;
        } else {
          output = `goto: "${viewName}" no es un destino válido. Opciones: home, sobre-mi, proyectos, contacto.`;
        }
        break;

      case 'clear':
        setHistory([]);
        setCommandInput('');
        return;

      default:
        output = `sh: comando no encontrado: "${mainCommand}". Escribe "help" para ver instrucciones disponibles.`;
    }

    setHistory((prev) => [
      ...prev,
      {
        input: trimmedCmd,
        output,
        timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
      },
    ]);
    setCommandInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(commandInput);
  };

  const handleShortcutClick = (cmd: string) => {
    executeCommand(cmd);
  };

  return (
    <div className="border border-[#00ff00]/15 rounded-sm bg-black/95 overflow-hidden flex flex-col h-[500px]">
      {/* Shell Header tab panel style */}
      <div className="bg-[#030602] border-b border-[#00ff00]/15 p-2 px-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-[#00ff00]" />
          <span className="text-[10px] text-white font-bold tracking-wider">SHELL INTERACTIVA - guest@terminal-sec.local: ~</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-500 uppercase">Status: 200 OK</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#00ff00]"></span>
        </div>
      </div>

      {/* Commands output logger area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs select-text bg-black/10 text-emerald-300">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1 text-[#ffbd2e]">
              <span>guest@portfolio:~$</span>
              <span className="font-semibold">{item.input}</span>
              <span className="text-[9px] text-gray-500 ml-auto font-light">[{item.timestamp}]</span>
            </div>
            <div className="pl-4 whitespace-pre-wrap text-gray-300 border-l border-[#00ff00]/5 leading-relaxed bg-[#050c04]/10 p-1.5 rounded-sm">
              {item.output}
            </div>
          </div>
        ))}
        <div ref={historyEndRef} />
      </div>

      {/* Quick macro executor suggestions */}
      <div className="p-2 bg-[#020501] border-t border-[#00ff00]/10 flex flex-wrap gap-2 items-center">
        <span className="text-[9px] text-gray-400 uppercase font-bold mr-1 flex items-center gap-1">
          <Play className="w-2.5 h-2.5 text-[#00ff00]" />
          Ver Comandos:
        </span>
        <button 
          onClick={() => handleShortcutClick('ls -la')}
          className="px-1.5 py-0.5 border border-[#00ff00]/20 hover:border-[#00ff00] bg-black text-gray-300 hover:text-[#00ff00] text-[10px] rounded-sm transition-colors cursor-pointer"
        >
          ls -la
        </button>
        <button 
          onClick={() => handleShortcutClick('cat bio.md')}
          className="px-1.5 py-0.5 border border-[#00ff00]/20 hover:border-[#00ff00] bg-black text-gray-300 hover:text-[#00ff00] text-[10px] rounded-sm transition-colors cursor-pointer"
        >
          cat bio.md
        </button>
        <button 
          onClick={() => handleShortcutClick('cat architecture.txt')}
          className="px-1.5 py-0.5 border border-[#00ff00]/20 hover:border-[#00ff00] bg-black text-gray-300 hover:text-[#00ff00] text-[10px] rounded-sm transition-colors cursor-pointer"
        >
          cat architecture.txt
        </button>
        <button 
          onClick={() => handleShortcutClick('grep "design" philosophy.json')}
          className="px-1.5 py-0.5 border border-[#00ff00]/20 hover:border-[#00ff00] bg-black text-gray-300 hover:text-[#00ff00] text-[10px] rounded-sm transition-colors cursor-pointer"
        >
          grep values philosophy.json
        </button>
        <button 
          onClick={() => handleShortcutClick('goto proyectos')}
          className="px-1.5 py-0.5 border border-[#00ff00]/20 hover:border-[#00ff00] bg-black text-gray-300 hover:text-[#00ff00] text-[10px] rounded-sm transition-colors cursor-pointer"
        >
          goto proyectos
        </button>
      </div>

      {/* Live typing interactive prompt line */}
      <form onSubmit={handleSubmit} className="border-t border-[#00ff00]/15 bg-black flex items-center p-2.5 gap-2">
        <div className="text-[#ffbd2e] text-xs font-bold shrink-0 flex items-center gap-1">
          <span>guest@portfolio:~$</span>
        </div>
        
        <input 
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder='Escribe "help" para ver comandos o escribe uno...'
          className="bg-transparent text-[#00ff00] font-mono text-xs flex-1 outline-none border-none placeholder-emerald-950/70 focus:ring-0 min-w-0"
          autoFocus
        />

        <button 
          type="submit"
          className="p-1 px-3 bg-[#004d00]/30 border border-[#00ff00]/30 hover:bg-[#00ff00]/10 text-[#00ff00] text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
        >
          Enviar Esc
          <Send className="w-3 h-3 text-[#00ff00]" />
        </button>
      </form>
    </div>
  );
};
