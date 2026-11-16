import { ListMusic } from "lucide-react";
import type { MusicObject } from "@/types/music";
import styles from "./MusicSelector.module.css";

type MusicSelectorProps = {
  repertoire: readonly MusicObject[];
  selectedPieceId: string;
  onSelectPiece: (pieceId: string) => void;
  onCreateNew: () => void;
};

export default function MusicSelector({
  repertoire,
  selectedPieceId,
  onSelectPiece,
  onCreateNew,
}: MusicSelectorProps) {
  return (
    <div className={styles.repertoireControl}>
      <label htmlFor="repertoire-select" className={styles.visuallyHidden}>
        Select repertoire piece
      </label>
      <ListMusic aria-hidden="true" className={styles.repertoireIcon} />
      <select
        id="repertoire-select"
        value={selectedPieceId}
        onChange={(event) => {
          if (event.target.value === "__new__") {
            onCreateNew();
          } else {
            onSelectPiece(event.target.value);
          }
        }}
        className={styles.repertoireDropdown}
      >
        <option value="__new__">&lt;New&gt;</option>
        {repertoire.map((piece) => (
          <option key={piece.id} value={piece.id}>
            {piece.title}
          </option>
        ))}
      </select>
    </div>
  );
}
