import { Play, Eye, Terminal, ChevronUp, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

import Editor from "@monaco-editor/react";

export default function CodePanel({ code = "", onExport, onCompile, compilationResult, isCompiling }) {
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  return (
    <div className="flex-1 flex flex-col bg-[#050505] min-h-0 w-full overflow-hidden">
      {/* Header (full width) */}
      <div className="h-[68px] border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d] flex-shrink-0 w-full px-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse transition-all shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 font-sans leading-none">
            Solidity Preview
          </h2>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onCompile}
            disabled={isCompiling}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs transition-all shadow-lg active:scale-95 group border border-gray-700
              ${isCompiling ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white/5 text-white hover:bg-white/10'}`}
          >
             <Eye size={12} className={isCompiling ? "animate-spin" : ""} />
             {isCompiling ? "Compiling..." : "Compile"}
          </button>

          <button className="flex items-center gap-2 bg-contract hover:bg-opacity-80 px-4 py-1.5 rounded-full font-bold text-xs transition-all shadow-lg active:scale-95 group text-[#000]">
             <Play size={12} fill="currentColor" className="group-hover:translate-x-0.5 transition-transform" />
             Deploy
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative bg-[#050505] w-full min-h-0 overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="sol"
          language="sol"
          theme="vs-dark"
          loading={<div className="p-8 text-gray-600 font-mono text-sm">Initializing Editor...</div>}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 20 },
            wordWrap: "on",
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            }
          }}
          value={code || "// Drag block to generate code..."}
        />
      </div>

      {/* Terminal */}
      <div className={`overflow-hidden transition-all duration-300 border-t border-gray-800 bg-[#0a0a0a] flex flex-col
                    ${isTerminalOpen ? 'h-48' : 'h-10'}`}>
        <div 
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className="h-10 px-6 flex justify-between items-center bg-[#0d0d0d] cursor-pointer hover:bg-white/5 transition-colors border-b border-gray-800"
        >
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Terminal</span>
          </div>
          {compilationResult && (
             <div className="flex items-center gap-4">
                {compilationResult.errors?.filter(e => e.severity === 'error').length > 0 ? (
                  <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold">
                    <AlertCircle size={12} />
                    {compilationResult.errors.filter(e => e.severity === 'error').length} Errors
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold">
                    <CheckCircle2 size={12} />
                    Compiled Successfully
                  </div>
                )}
                {isTerminalOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronUp size={14} className="text-gray-500" />}
             </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 font-code text-[12px] leading-relaxed">
           {!compilationResult ? (
              <div className="text-gray-600 italic">No compilation results. Click 'Compile' to check for errors.</div>
           ) : (
              <div className="space-y-3">
                 {compilationResult.errors?.map((err, i) => (
                    <div key={i} className={`p-3 rounded-lg border flex flex-col gap-1
                                      ${err.severity === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'}`}>
                       <div className="font-bold uppercase text-[9px] tracking-widest flex justify-between">
                          <span>{err.severity}</span>
                          <span className="text-gray-500">{err.type}</span>
                       </div>
                       <div className="whitespace-pre-wrap">{err.message}</div>
                    </div>
                 ))}
                 {(!compilationResult.errors || compilationResult.errors.length === 0) && (
                    <div className="text-green-500 font-bold">✓ Workspace blocks are valid Solidity. ready for deployment.</div>
                 )}
              </div>
           )}
        </div>
      </div>
    </div>
  );
}