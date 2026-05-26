/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TabId = 'home' | 'sobre-mi' | 'proyectos' | 'contacto';

export interface NodeStatus {
  id: string;
  name: string;
  type: string;
  status: 'ONLINE' | 'STANDBY' | 'CRITICAL' | 'REPLICATING';
  ip: string;
}

export interface SystemMetrics {
  cpu: number;
  ram: number;
  txRate: number; // in KB/s
  rxRate: number; // in KB/s
  diskIdle: boolean;
  uptimeSeconds: number;
  nodes: NodeStatus[];
}

export interface NetworkFlowRecord {
  id: string;
  timestamp: string;
  src: string;
  dst: string;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'SSH' | 'BGP';
  bytes: number;
  packets: number;
  status: 'allowed' | 'filtered' | 'blocked';
}

export interface ClusterLog {
  id: string;
  timestamp: string;
  node: string;
  level: 'info' | 'warning' | 'success' | 'error';
  message: string;
}

export interface ShellCommandHistory {
  input: string;
  output: string;
  timestamp: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  date: string;
}
