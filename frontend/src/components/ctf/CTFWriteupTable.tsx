import React from 'react';
import { CTFEntry } from '../../types';
import { Badge } from '../ui/Badge';
import { ExternalLink } from 'lucide-react';
interface CTFWriteupTableProps {
  entries: CTFEntry[];
}
export function CTFWriteupTable({
  entries
}: CTFWriteupTableProps) {
  return <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-slate-500 uppercase bg-navy-800/50 border-b border-navy-700">
          <tr>
            <th className="px-6 py-3 font-medium">Event / Challenge</th>
            <th className="px-6 py-3 font-medium">Category</th>
            <th className="px-6 py-3 font-medium">Rank/Role</th>
            <th className="px-6 py-3 font-medium">Writeup</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-800">
          {entries.map(entry => <tr key={entry.id} className="hover:bg-navy-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-warm-50">{entry.event}</div>
                <div className="text-xs text-slate-500">{entry.name}</div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline">{entry.category}</Badge>
              </td>
              <td className="px-6 py-4 text-slate-400">
                {entry.rank || entry.type}
              </td>
              <td className="px-6 py-4">
                {entry.writeupUrl ? <a href={entry.writeupUrl} className="text-electric-500 hover:text-electric-400 flex items-center gap-1">
                    Read <ExternalLink className="h-3 w-3" />
                  </a> : <span className="text-slate-600">-</span>}
              </td>
            </tr>)}
        </tbody>
      </table>
    </div>;
}