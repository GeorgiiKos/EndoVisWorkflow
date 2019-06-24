export class Phase {
    frame: number
    phase: number

    constructor(frame: string, phase: string) {
        this.frame = parseInt(frame);
        this.phase = parseInt(phase);
    }
}
