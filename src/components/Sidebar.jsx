import { Code, Files } from 'lucide-react';

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
        <Files size={20} />
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
