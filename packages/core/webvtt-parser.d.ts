// webvtt-parser.d.ts

declare module "webvtt-parser" {
  export interface Cue {
    direction: "horizontal" | "vertical";
    id: string;
    startTime: number;
    endTime: number;
    text: string;
    lineAlign: "start" | "center" | "end";
    linePosition: "auto" | number;
    pauseOnExit: boolean;
    positionAlign: "auto" | "start" | "center" | "end";
    size: number;
    snapToLines: boolean;
    textPosition: "auto" | number;
    tree: {
      children: {
        type: "text";
        value: string;
      }[];
    };
  }

  export class WebVTTParser {
    public parse: (
      input: string,
      mode: "metadata" | "chapters",
    ) => {
      cues: Cue[];
      errors: Error[];
      time: number;
    };
  }
  export class WebVTTSerializer {
    public serialize: (cues: Cue[]) => string;
  }
}
