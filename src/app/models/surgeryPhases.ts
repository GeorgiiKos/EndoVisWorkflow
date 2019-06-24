import { Phase } from "./phase";

export class SurgeryPhases {
  name: String;
  phases: Phase[];

  constructor(name: String, phases: Phase[]) {
    this.name = name;
    this.phases = phases;
  }
} 