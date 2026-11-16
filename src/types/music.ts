export type NoteObject = {
  pitch: string;
  duration: number;
};

export type MeasureObject = NoteObject[];

export type MusicObject = {
  id: string;
  title: string;
  keySignature?: string;
  timeSignature: string;
  measures: MeasureObject[];
};

export const TIME_SIGNATURES = ["4/4", "3/4", "6/8"] as const;

export function getMeasureBeatCount(timeSignature: string): number {
  switch (timeSignature) {
    case "4/4":
      return 4;
    case "3/4":
    case "6/8":
      return 3;
    default:
      throw new Error(`Unsupported time signature: ${timeSignature}`);
  }
}