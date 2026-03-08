export interface TuningOption {
  value: string;
  label: string;
  notes: string;
}

export interface TuningGroup {
  label: string;
  tunings: TuningOption[];
}

export const TUNING_GROUPS: TuningGroup[] = [
  {
    label: "Standard & Step Down",
    tunings: [
      { value: "Standard", label: "Standard", notes: "E A D G B E" },
      { value: "Half Step Down", label: "Half Step Down", notes: "Eb Ab Db Gb Bb Eb" },
      { value: "Full Step Down", label: "Full Step Down", notes: "D G C F A D" },
      { value: "1½ Steps Down", label: "1½ Steps Down", notes: "C# F# B E G# C#" },
      { value: "2 Steps Down", label: "2 Steps Down", notes: "C F Bb Eb G C" },
    ],
  },
  {
    label: "Drop Tunings",
    tunings: [
      { value: "Drop D", label: "Drop D", notes: "D A D G B E" },
      { value: "Drop C#", label: "Drop C#", notes: "C# G# C# F# A# D#" },
      { value: "Drop C", label: "Drop C", notes: "C G C F A D" },
      { value: "Drop B", label: "Drop B", notes: "B F# B E G# C#" },
      { value: "Drop Bb", label: "Drop Bb", notes: "Bb F Bb Eb G C" },
      { value: "Drop A", label: "Drop A", notes: "A E A D F# B" },
    ],
  },
  {
    label: "Open Tunings",
    tunings: [
      { value: "Open D", label: "Open D", notes: "D A D F# A D" },
      { value: "Open E", label: "Open E", notes: "E B E G# B E" },
      { value: "Open G", label: "Open G", notes: "D G D G B D" },
      { value: "Open A", label: "Open A", notes: "E A E A C# E" },
      { value: "Open C", label: "Open C", notes: "C G C G C E" },
      { value: "Open Em", label: "Open Em", notes: "E B E G B E" },
      { value: "Open Dm", label: "Open Dm", notes: "D A D F A D" },
    ],
  },
  {
    label: "Other Tunings",
    tunings: [
      { value: "DADGAD", label: "DADGAD", notes: "D A D G A D" },
      { value: "Double Drop D", label: "Double Drop D", notes: "D A D G B D" },
      { value: "C6", label: "C6", notes: "C A C G C E" },
      { value: "New Standard", label: "New Standard (NST)", notes: "C G D A E G" },
    ],
  },
];

// Flat list of all tuning values (for validation, filters, etc.)
export const ALL_TUNINGS = TUNING_GROUPS.flatMap((g) => g.tunings.map((t) => t.value));
