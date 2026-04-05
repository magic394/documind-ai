import React from 'react';
import { AlertTriangle, Shield, Zap } from 'lucide-react';

export default function RiskBadge({ score, showIcon = true, size = 'md' }) {
  const getRiskLevel = (score) => {
    if (score < 30) return 'low';
    if (score < 60) return 'medium';
    return 'high';
  };

  const getConfig = (level) => {
    const configs = {
      low: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        icon: Shield,
        label: 'Low Risk'
      },
      medium: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: Zap,
        label: 'Medium Risk'
      },
      high: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        icon: AlertTriangle,
        label: 'High Risk'
      }
    };
    return configs[level];
  };

  const level = getRiskLevel(score);
  const config = getConfig(level);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />}
      <span className="font-medium">{config.label}</span>
      <span className={`font-bold ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
        ({score})
      </span>
    </div>
  );
}