import Editor from "@monaco-editor/react";
import { Play } from "lucide-react";

export default function CodePanel({ code = "", onExport }) {
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

        <button className="flex items-center gap-2 bg-contract hover:bg-opacity-80 px-4 py-1.5 rounded-full font-bold text-xs transition-all shadow-lg active:scale-95 group">
           <Play size={12} fill="white" className="group-hover:translate-x-0.5 transition-transform" />
           Deploy
        </button>
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
          value={code || "// Drag blocks from the explorer to generate code..."}
        />
      </div>
    </div>
  );
}