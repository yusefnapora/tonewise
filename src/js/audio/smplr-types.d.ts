export type SampleOptions = {
  decayTime?: number;
  detune?: number;
  duration?: number | null;
  velocity?: number;
  lpfCutoffHz?: number;
  loop?: boolean;
  loopStart?: number;
  loopEnd?: number;
  gainOffset?: number;
};
export type SampleStart = {
  name?: string;
  note: string | number;
  onEnded?: (sample: SampleStart) => void;
  onStart?: (sample: SampleStart) => void;
  stop?: Subscribe<number>;
  stopId?: string | number;
  time?: number;
} & SampleOptions;