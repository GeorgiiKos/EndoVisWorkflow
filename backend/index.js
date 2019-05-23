const express = require('express')
const app = express();
const fs = require('fs')
const csv = require('csv-parser')
const SurgeryPhases = require('./SurgeryPhases')
const Surgery = require('./Surgery')
const bodyParser = require('body-parser');
const path = require('path');
const files = require('./files')

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

phaseAnnotation = files.phaseAnnotation;

phasesArray = [];

var testData = [];

function readPhaseAnnotation() {
  re = new RegExp('(Prokto|Sigma|Rektum){1}[6-8]*')
  for (let i = 0; i < phaseAnnotation.length; i++) {
    console.log("PARSING: ", phaseAnnotation[i])

    var data = fs.readFileSync(phaseAnnotation[i])
      .toString() // convert Buffer to string
      .trim()
      .split('\n') // split string to lines
      .map(e => e.trim()) // remove white spaces for each line
      .map(e => e.split(',').map(e => e.trim()));

    phasesArray.push(new SurgeryPhases(phaseAnnotation[i].match(re)[0], data))


    /*
    fs.createReadStream(phaseAnnotation[i])
      .pipe(csv(['frame', 'phase'])).on('data', (data) => input.push(data))
      .on('end', () => phasesArray.push(new SurgeryPhases(phaseAnnotation[i].match(re)[0], input)));*/
  }
}

readPhaseAnnotation();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/api/getPhasesArray', (req, res) => {
  for (let i in phasesArray) {
    if (phasesArray[i].name == req.query.surgeryName) {
      res.send(phasesArray[i]);
    }
  }
});

app.get('/api/getSurgeryList', (req, res) => {
  surgeryList = [];
  for (let i in phasesArray) {
    var type = null;
    if (phasesArray[i].name.includes('Prokto')) {
      type = 'Proctocolectomy'
    } else if (phasesArray[i].name.includes('Sigma')) {
      type = 'Sigmoid resection'
    } else if (phasesArray[i].name.includes('Rektum')) {
      type = 'Rectal resection'
    }
    surgeryList.push(new Surgery(phasesArray[i].name, type))
  }
  res.send(surgeryList);
});

app.get('/api/getImage', (req, res) => {
  frameNr = Number(req.query.frame)
  while(frameNr % files.images.jump != 0) {
    frameNr--
  }
  res.sendFile(files.images.location + "/frame" + frameNr + ".jpg")
});

app.listen(8000, () => {
  console.log('Server runnung on port 8000!')
});