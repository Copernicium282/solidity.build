import { Code } from 'lucide-react';

export default function Sidebar({ onToggleFullscreen }) {
  return (
    <div className="w-16 border-r border-gray-800 flex flex-col items-center py-4 gap-6 bg-[#090909] z-20">
      {/* Logo */}
      <div className="w-10 h-10 bg-contract rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-contract/20">
        <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
      </div>

      {/* Active "Files" View */}
      <button
        className="p-3 rounded-xl bg-white/10 text-white"
        title="Explorer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-files"><path d="M20 7h-3a2 2 0 0 1-2-2V2" /><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" /><path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h12.8" /></svg>
      </button>

      {/* Bottom Fullscreen Toggle */}
      <div className="mt-auto">
        <button
          onClick={onToggleFullscreen}
          className="text-gray-500 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all"
          title="Full Screen Code"
        >
          <Code size={20} />
        </button>
      </div>
    </div>
  );
}
