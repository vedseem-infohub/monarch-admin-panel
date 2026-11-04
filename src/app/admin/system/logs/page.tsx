'use client';

import React from 'react';
import { History, Search, ShieldCheck } from 'lucide-react';
import { settingsService } from '@/services/settingsService';

export default function ActivityLogsPage() {
  const logs = settingsService.getActivityLogs();

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Audit & Security
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            System Activity Logs
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Immutable chronological record of administrative actions, pricing adjustments, and orders.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#E8E3D9] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8E3D9] bg-[#FAF9F5] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#77736C]" suppressHydrationWarning>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#24221E]">{log.user}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7F5F0] border border-[#E8E3D9] text-[#24221E]">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#24221E]">{log.action}</td>
                  <td className="py-3 px-3 text-[#77736C] max-w-sm">{log.details}</td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-[#A8A49C]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
