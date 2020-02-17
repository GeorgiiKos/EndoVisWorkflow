const express = require('express')
const router = express.Router()

const config = require('./config')  // configuration file
const parser = require('./parser')  // parser module

// get video metadata
router.get('/VideoMetadata', (req, res) => {
    parser.parseVideoMetadata().then((result) => res.send(result));
});

// get frame sampling
router.get('/FrameSamplingRate', (req, res) => {
    res.send({ frameSamplingRate: config.frameSamplingRate });
});

// get a single frame
router.get('/Frame/:name/:frameNr', (req, res) => {
    var name = req.params.name
    var frameNr = parseInt(req.params.frameNr)
    if (frameNr < 0) {
        res.status(400).json({ error: "Frame number cannot be negative" })
        return
    }
    while (frameNr % config.mediaContent.rate != 0) {
        frameNr--
    }
    res.sendFile(config.mediaContent.output + "/" + name + "/frame" + frameNr + ".jpg")
});

// get phase annotation
router.get('/PhaseAnnotation/:name', (req, res) => {
    var name = req.params.name
    var path = config.csvLocation + "/PhaseAnnotation/" + name + ".csv"
    var mapping = { frame: 'frames', phase: 'phases' }
    parser.parseDataStream(path, name, mapping).then((result) => res.send(result));
});

// get instrument annotation
router.get('/InstrumentAnnotation/:name', (req, res) => {
    var name = req.params.name
    var path = config.csvLocation + "/InstrumentAnnotation/" + name + ".csv"
    var mapping = {
        Frame: 'frames', Grasper: 'grasperArr', HarmonicScalpel: 'harmonicScalpelArr', 'J-hook': 'jHookArr',
        Ligasure: 'ligasureArr', Scissors: 'scissorsArr', Stapler: 'staplerArr', Aspirator: 'AspiratorArr',
        Swapholder: 'swapholderArr', SiliconeDrain: 'siliconeDrainArr', Clipper: 'clipperArr', 'I-Hook': 'iHookArr',
        NeedleHolder: 'needleHolderArr'
    }
    parser.parseDataStream(path, name, mapping, 1).then((result) => res.send(result));
});

// get device data
router.get('/DeviceData/:name', (req, res) => {
    var name = req.params.name
    var path = config.csvLocation + "/DeviceData/" + name + "_Device.csv"
    var mapping = {
        frame: 'frames', currentGasFlowRate: 'currentGasFlowRateArr', targetGasFlowRate: 'targetGasFlowRateArr', currentGasPressure: 'currentGasPressureArr',
        targetGasPressure: 'targetGasPressureArr', usedGasVolume: 'usedGasVolumeArr', gasSupplyPressure: 'gasSupplyPressureArr',
        deviceOn: 'deviceOnArr', allLightsOff: 'allLightsOffArr', intensityLight1: 'intensityLight1Arr', intensityLight2: 'intensityLight2Arr',
        intensity: 'intensityArr', whiteBalance: 'whiteBalanceArr', gains: 'gainsArr', exposureIndex: 'exposureIndexArr'
    }
    parser.parseDataStream(path, name, mapping).then((result) => res.send(result));
});

module.exports = router