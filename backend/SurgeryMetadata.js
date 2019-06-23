class SurgeryMetadata {
    constructor(name, type, numFrames, fps, h, m, s, frameWidth, frameHeight) {
        this.name = name;
        this.type = type;
        this.numFrames = parseInt(numFrames);
        this.fps = parseInt(fps);
        this.h = parseInt(h) < 10 ? "0" + h : h;
        this.m = parseInt(m) < 10 ? "0" + m : m;
        this.s = parseInt(s) < 10 ? "0" + s : s;
        this.frameWidth = parseInt(frameWidth);
        this.frameHeight = parseInt(frameHeight);
    }
}

module.exports = SurgeryMetadata;