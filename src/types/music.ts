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