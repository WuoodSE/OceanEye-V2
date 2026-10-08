import type { Severity, ResponsePriority, IncidentStatus, PollutionType } from '@/types';

export function severityColor(severity: Severity): string {
  switch (severity) {
    case 'Low': return '#22c55e';
    case 'Medium': return '#eab308';
    case 'High': return '#ef4444';
    case 'Critical': return '#dc2626';
  }
}

export function severityBgClass(severity: Severity): string {
  switch (severity) {
    case 'Low': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'Medium': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'High': return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'Critical': return 'bg-red-600/20 text-red-500 border-red-600/40';
  }
}

export function priorityBgClass(priority: ResponsePriority): string {
  switch (priority) {
    case 'Low': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    case 'Medium': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'High': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'Urgent': return 'bg-red-600/20 text-red-500 border-red-600/40';
  }
}

export function statusBgClass(status: IncidentStatus): string {
  switch (status) {
    case 'Detected': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'Under Investigation': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    case 'In Cleanup': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'Resolved': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }
}

export function pollutionTypeIcon(type: PollutionType): string {
  switch (type) {
    case 'Oil Spill': return '🛢️';
    case 'Plastic Debris': return '🥤';
    case 'Chemical Runoff': return '⚗️';
    case 'Algal Bloom': return '🌿';
    case 'Sediment Plume': return '🌊';
    case 'Thermal Discharge': return '🌡️';
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function confidenceClass(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
}
