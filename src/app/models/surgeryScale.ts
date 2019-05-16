import { PhasePercentage } from "./phasePercentage";

export class SurgeryScale {
    name: String
    percentage: PhasePercentage[]

    constructor(name: String, percentage: PhasePercentage[]) {
        this.name = name;
        this.percentage = percentage;
    }
}