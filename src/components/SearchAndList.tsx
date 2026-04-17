/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, ChevronRight, User } from "lucide-react";
import { FamilyMember } from "../types";
import { useState } from "react";
import { searchMembers } from "../lib/treeUtils";

interface Props {
  root: FamilyMember;
  onSelect: (member: FamilyMember) => void;
  selectedId?: string;
}

export default function SearchAndList({ root, onSelect, selectedId }: Props) {
  const [query, setQuery] = useState("");
  const results = query ? searchMembers(root, query) : [];

  const renderItem = (member: FamilyMember) => (
    <button
      key={member.id}
      onClick={() => onSelect(member)}
      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
        selectedId === member.id
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
          : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <div className={`p-1.5 rounded-lg ${selectedId === member.id ? 'bg-blue-500' : 'bg-slate-200'}`}>
        <User size={16} />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="font-semibold truncate">{member.name}</div>
        {member.birthDate && (
          <div className={`text-[10px] uppercase font-bold tracking-wider ${selectedId === member.id ? 'text-blue-100' : 'text-slate-400'}`}>
            Born: {member.birthDate}
          </div>
        )}
      </div>
      <ChevronRight size={14} className="opacity-40" />
    </button>
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
        {query ? (
          <>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Search Results ({results.length})</div>
            {results.map(renderItem)}
            {results.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No family members found</div>}
          </>
        ) : (
          <>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Recent Hierarchy</div>
            <RecursiveList node={root} onSelect={onSelect} selectedId={selectedId} depth={0} />
          </>
        )}
      </div>
    </div>
  );
}

function RecursiveList({ node, onSelect, selectedId, depth }: { node: FamilyMember, onSelect: (m: FamilyMember) => void, selectedId?: string, depth: number }) {
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onSelect(node)}
        className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 transition-all ${
          selectedId === node.id ? "bg-blue-50 text-blue-700 font-bold border border-blue-100" : "hover:bg-slate-50 text-slate-600"
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        <div className={`w-1 h-4 rounded-full ${selectedId === node.id ? 'bg-blue-600' : 'bg-slate-200'}`} />
        <span className="truncate">{node.name}</span>
      </button>
      {node.children.map(child => (
        <div key={child.id}>
          <RecursiveList node={child} onSelect={onSelect} selectedId={selectedId} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}
