import { ListMusic } from "lucide-react";
import type { MusicObject } from "@/types/music";

type MusicSelectorProps = {
  repertoire: readonly MusicObject[];
  selectedPieceId: string;
  onSelectPiece: (pieceId: string) => void;
};

export default function MusicSelector({
  repertoire,
  selectedPieceId,
  onSelectPiece,
}: MusicSelectorProps) {
  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 md:p-4 shadow-md">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <ListMusic className="w-4 h-4 text-indigo-400" />
        <span>Select Piece</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {repertoire.map((piece) => {
          const isSelected = selectedPieceId === piece.id;

          return (
            <button
              key={piece.id}
              onClick={() => onSelectPiece(piece.id)}
              className={`px-4 py-3 rounded-xl font-bold text-base md:text-lg whitespace-nowrap transition-all shadow-sm flex items-center gap-2 ${
                isSelected
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-102"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-650 hover:text-white"
              }`}
            >
              <span>{piece.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
