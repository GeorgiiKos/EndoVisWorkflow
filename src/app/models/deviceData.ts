import { DeviceDataUnit } from "./deviceDataUnit";

export class DeviceData {
    name: String;
    data: DeviceDataUnit[];
    
    constructor(name: String, data: DeviceDataUnit[]) {
        this.name = name;
        this.data = data;
    }
}