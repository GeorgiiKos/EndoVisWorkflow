const express = require('express')
const app = express();
const fs = require('fs')
const SurgeryMetadata = require('./SurgeryMetadata')
const bodyParser = require('body-parser');
const path = require('path');
const files = require('./files')

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

phaseAnnotation = files.phaseAnnotation;
deviceData = files.deviceData;

metadata = [];

re = new RegExp('(Prokto|Sigma|Rektum){1}[6-8]{1}')

function readVideoData() {
  var data = fs.readFileSync(files.mediaContent.output + "/video_properties.csv")
  .toString() // convert Buffer to string
  .trim()
  .split('\n') // split string to lines
  .map(e => e.trim()) // remove white spaces for each line
  .map(e => e.split(',').map(e => e.trim()))
  .map(e => metadata.push(new SurgeryMetadata(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8])));}

readVideoData();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/api/getPhasesArray', (req, res) => {
  res.sendFile(files.csvLocation + "/PhaseAnnotation/" + req.query.surgeryName + ".csv");
});

app.get('/api/getDeviceArray', (req, res) => {
  res.sendFile(files.csvLocation + "/DeviceData/" + req.query.surgeryName + "_Device.csv");
});

app.get('/api/getSurgeryList', (req, res) => {
  res.send(metadata);
});

app.get('/api/getImage', (req, res) => {
  frameNr = Number(req.query.frame)
  surgery = req.query.surgeryName
  while (frameNr % files.mediaContent.rate != 0) {
    frameNr--
  }
  res.sendFile(files.mediaContent.output + "/" + surgery + "/frame" + frameNr + ".jpg")
});

app.get('/api/getInstrumentArray', (req, res) => {
  res.sendFile(files.csvLocation + "/InstrumentAnnotation/" + req.query.surgeryName + ".csv");
});

app.listen(8000, () => {
  console.log('Server runnung on port 8000!')
});