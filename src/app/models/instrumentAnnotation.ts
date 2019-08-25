import { InstrumentUnit } from "./instrumentUnit";

export class InstrumentAnnotation {
    name: String;
    data: InstrumentUnit[];

    constructor(name: String, data: InstrumentUnit[]) {
        this.name = name;
        this.data = data;
    }
}