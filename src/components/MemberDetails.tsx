/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, Trash2, X } from "lucide-react";
import { FamilyMember } from "../types";
import { useState, useEffect } from "react";

interface Props {
  member: FamilyMember | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<FamilyMember>) => void;
  onAddChild: (parentId: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function MemberDetails({ member, onClose, onUpdate, onAddChild, onDelete }: Props) {
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setShowConfirmDelete(false);
    setIsAddingChild(false);
  }, [member?.id]);

  if (!member) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl p-6 border-l border-slate-200 z-50 flex flex-col gap-6 transform transition-transform animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center border-bottom pb-4 border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Member Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* ... existing detail fields ... */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1 font-sans">Name</label>
          <input
            type="text"
            value={member.name}
            onChange={(e) => onUpdate(member.id, { name: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1 font-sans">Birth Date</label>
          <input
            type="date"
            value={member.birthDate || ""}
            onChange={(e) => onUpdate(member.id, { birthDate: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1 font-sans">About</label>
          <textarea
            value={member.bio || ""}
            onChange={(e) => onUpdate(member.id, { bio: e.target.value })}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none text-sm"
            placeholder="Tell something about this person..."
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Family Actions</h3>
        
        {isAddingChild ? (
          <div className="flex flex-col gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <input
              type="text"
              placeholder="Child's full name"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              className="p-2 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (newChildName.trim()) {
                    onAddChild(member.id, newChildName);
                    setNewChildName("");
                    setIsAddingChild(false);
                  }
                }}
                className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 text-sm font-bold shadow-sm"
              >
                Save
              </button>
              <button
                onClick={() => setIsAddingChild(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-50 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingChild(true)}
            className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Plus size={18} />
            <span className="font-bold text-sm">Add Child Member</span>
          </button>
        )}

        {member.parentId && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            {showConfirmDelete ? (
              <div className="flex flex-col gap-2 p-3 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                <p className="text-[10px] text-red-600 font-bold text-center uppercase leading-tight">Delete member and all descendants?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onDelete(member.id);
                      setShowConfirmDelete(false);
                    }}
                    className="flex-1 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 text-xs font-bold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 bg-white border border-red-200 text-red-600 p-2 rounded-lg hover:bg-red-50 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center justify-center gap-2 w-full p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
                <span className="font-bold text-xs">Remove Member</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
