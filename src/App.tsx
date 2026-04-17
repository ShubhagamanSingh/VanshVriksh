/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Download, Share2, Users, Printer, Hand, MousePointer2, SlidersHorizontal, ChevronDown, ChevronUp, FileJson, FileSpreadsheet, ImageIcon, Loader2, Keyboard, ZoomIn, Upload } from "lucide-react";
import { toPng, toSvg } from 'html-to-image';
import { FamilyMember } from "./types";
import { INITIAL_DATA } from "./constants";
import { addMember, updateMember, deleteMember, exportToJSON, exportToCSV } from "./lib/treeUtils";
import FamilyTreeVisualizer from "./components/FamilyTreeVisualizer";
import MemberDetails from "./components/MemberDetails";
import SearchAndList from "./components/SearchAndList";

export default function App() {
  const [treeData, setTreeData] = useState<FamilyMember>(INITIAL_DATA);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  const [interactionMode, setInteractionMode] = useState<'pointer' | 'hand'>('pointer');
  
  // Gap states
  const [siblingGap, setSiblingGap] = useState(2);
  const [subtreeGap, setSubtreeGap] = useState(2);
  const [levelGap, setLevelGap] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [printTip, setPrintTip] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Basic shortcuts (if not typing in input)
      const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      if (!isTyping) {
        if (e.key.toLowerCase() === 'h') setInteractionMode('hand');
        if (e.key.toLowerCase() === 'p') setInteractionMode('pointer');
        if (e.key.toLowerCase() === 'v') setOrientation(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
        if (e.key === 'Escape') setSelectedMember(null);
        if (e.key === '?' ) setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateMember = (id: string, updates: Partial<FamilyMember>) => {
    const newData = JSON.parse(JSON.stringify(treeData));
    updateMember(newData, id, updates);
    setTreeData(newData);
    if (selectedMember?.id === id) {
      setSelectedMember({ ...selectedMember, ...updates });
    }
  };

  const handleAddChild = (parentId: string, name: string) => {
    const newData = JSON.parse(JSON.stringify(treeData));
    addMember(newData, parentId, { name });
    setTreeData(newData);
  };

  const handleDeleteMember = (id: string) => {
    const newData = JSON.parse(JSON.stringify(treeData));
    const result = deleteMember(newData, id);
    if (result) {
      setTreeData({ ...result });
    }
    setSelectedMember(null);
  };

  const handlePrint = () => {
    setPrintTip(true);
    setTimeout(() => setPrintTip(false), 5000);
    window.print();
  };

  const handleDownloadImage = async () => {
    const el = document.getElementById('family-tree-canvas');
    if (!el) return;
    
    setIsExportingImage(true);
    try {
      // For very large trees (up to 40 generations), we use a high pixel ratio
      // and ensure the entire bounding box of the D3 graph is captured.
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 4, 
        backgroundColor: '#ffffff',
        // Fix for "Error inlining remote css file" and "cssRules" access errors
        // By providing an empty string for fontEmbedCSS, we skip the automatic (and often failing) 
        // process of scanning and embedding remote fonts like Google Fonts.
        fontEmbedCSS: '', 
        filter: (node) => {
          return !node.classList?.contains('details-panel');
        },
        style: {
          borderRadius: '0',
          border: 'none',
          boxShadow: 'none',
          padding: '80px',
          overflow: 'visible'
        }
      });
      
      const link = document.createElement('a');
      link.download = `VanshVriksh-Full-Export-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image export failed:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.id && json.name && Array.isArray(json.children)) {
          setTreeData(json);
          setIsImportOpen(false);
          setSelectedMember(null);
          alert("Family Data Imported Successfully!");
        } else {
          alert("Invalid file format. Please upload a valid VanshVriksh JSON file.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-slate-100 flex flex-col bg-white">
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">VanshVriksh</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Family Lineage Explorer</p>
            </div>
          </div>

          <SearchAndList
            root={treeData}
            onSelect={setSelectedMember}
            selectedId={selectedMember?.id}
          />
        </div>

        {/* Global Controls Section */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/50">
          <button 
            onClick={() => setShowControls(!showControls)}
            className="flex items-center justify-between w-full mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} />
              <span>Layout Controls</span>
            </div>
            {showControls ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {showControls && (
            <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-200">
              <div>
                <label className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Sibling Gap</span>
                  <span>{siblingGap}x</span>
                </label>
                <input 
                  type="range" min="1" max="5" step="0.1" 
                  value={siblingGap} onChange={(e) => setSiblingGap(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Sub-Family Gap</span>
                  <span>{subtreeGap}x</span>
                </label>
                <input 
                  type="range" min="1" max="10" step="0.5" 
                  value={subtreeGap} onChange={(e) => setSubtreeGap(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Level Distance</span>
                  <span>{levelGap}x</span>
                </label>
                <input 
                  type="range" min="1" max="5" step="0.1" 
                  value={levelGap} onChange={(e) => setLevelGap(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                setIsImportOpen(!isImportOpen);
                setIsExportOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors font-semibold"
            >
              <Upload size={20} />
              <span>Import History</span>
            </button>

            {isImportOpen && (
              <div className="flex flex-col gap-1 pl-3 border-l-2 border-slate-100 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm p-2 text-slate-500 hover:text-blue-600 font-medium"
                >
                  <FileJson size={14} /> Upload JSON File
                </button>
              </div>
            )}

            <button 
              onClick={() => {
                setIsExportOpen(!isExportOpen);
                setIsImportOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors font-semibold"
            >
              <Download size={20} />
              <span>Export History</span>
            </button>
            
            {isExportOpen && (
              <div className="flex flex-col gap-1 pl-3 border-l-2 border-slate-100 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => exportToJSON(treeData)}
                  className="flex items-center gap-2 text-sm p-2 text-slate-500 hover:text-blue-600 font-medium"
                >
                  <FileJson size={14} /> JSON Format
                </button>
                <button 
                  onClick={() => exportToCSV(treeData)}
                  className="flex items-center gap-2 text-sm p-2 text-slate-500 hover:text-blue-600 font-medium"
                >
                  <FileSpreadsheet size={14} /> CSV Dataset
                </button>
              </div>
            )}

            <button 
              onClick={handlePrint}
              className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors font-semibold shadow-sm border border-slate-100"
            >
              <Printer size={20} />
              <span>Print Full Tree</span>
            </button>

            <button 
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors font-semibold shadow-sm border border-slate-100 disabled:opacity-50"
            >
              {isExportingImage ? <Loader2 size={20} className="animate-spin text-blue-500" /> : <ImageIcon size={20} />}
              <span>Download HD Image</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative bg-white">
        {/* Header Bar */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setInteractionMode('pointer')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${interactionMode === 'pointer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MousePointer2 size={12} />
                Pointer
              </button>
              <button 
                onClick={() => setInteractionMode('hand')}
                className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${interactionMode === 'hand' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Hand size={12} />
                Hand Tool
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200" />
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setOrientation('horizontal')}
                className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${orientation === 'horizontal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Left to Right
              </button>
              <button 
                onClick={() => setOrientation('vertical')}
                className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${orientation === 'vertical' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Top to Bottom
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Share2 size={20} />
            </button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
              Save Changes
            </button>
          </div>
        </header>

        {/* The Tree Visualization */}
        <div id="family-tree-canvas" className="flex-1 p-8 relative overflow-hidden print:p-0 print:overflow-visible">
          {printTip && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <Printer size={18} className="text-blue-400" />
              <div className="text-sm">
                <p className="font-bold">Printing initiated!</p>
                <p className="text-[10px] opacity-70">If the dialog doesn't appear, please open the app in a new tab.</p>
              </div>
            </div>
          )}
          
          <FamilyTreeVisualizer
            data={treeData}
            onSelectMember={setSelectedMember}
            selectedId={selectedMember?.id}
            orientation={orientation}
            siblingGap={siblingGap}
            subtreeGap={subtreeGap}
            levelGap={levelGap}
            interactionMode={interactionMode}
          />
        </div>

        {/* Footer Info */}
        <footer className="h-10 px-8 flex items-center justify-between bg-white border-t border-slate-100 relative">
          {showShortcuts && (
            <div className="absolute bottom-12 right-8 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-50 text-[10px] animate-in slide-in-from-bottom-2">
              <h4 className="font-bold border-b border-white/20 pb-2 mb-2 flex items-center gap-2">
                <Keyboard size={12} /> Keyboard Shortcuts
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <div className="flex justify-between gap-4"><span>Pointer Tool</span> <span className="text-blue-400 font-mono">P</span></div>
                <div className="flex justify-between gap-4"><span>Hand Tool</span> <span className="text-blue-400 font-mono">H</span></div>
                <div className="flex justify-between gap-4"><span>Flip View</span> <span className="text-blue-400 font-mono">V</span></div>
                <div className="flex justify-between gap-4"><span>Close Panel</span> <span className="text-blue-400 font-mono">Esc</span></div>
                <div className="flex justify-between gap-4"><span>Show Help</span> <span className="text-blue-400 font-mono">?</span></div>
              </div>
            </div>
          )}
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
            <span>© 2026 VanshVriksh</span>
            <span>|</span>
            <span>Total Family Nodes: {countNodes(treeData)}</span>
            <span>|</span>
            <span className="text-blue-500">{interactionMode === 'hand' ? 'Pan Mode Active' : 'Selection Mode Active'}</span>
          </div>
          <div 
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 cursor-pointer flex items-center gap-2"
          >
            <Keyboard size={12} /> Keyboard Shortcuts (?)
          </div>
        </footer>

        {/* Details Panel Overlay */}
        <MemberDetails
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={handleUpdateMember}
          onAddChild={handleAddChild}
          onDelete={handleDeleteMember}
        />
      </main>
    </div>
  );
}

function countNodes(node: FamilyMember): number {
  return 1 + node.children.reduce((acc, child) => acc + countNodes(child), 0);
}
