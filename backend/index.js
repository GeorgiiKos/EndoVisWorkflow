const express = require('express')
const app = express();
const fs = require('fs')
const csv = require('csv-parser')
const SurgeryPhases = require('./SurgeryPhases')
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

phaseAnnotation = [
  // File locations here
];

phasesArray = [];

function readData() {
  re = new RegExp('(Prokto|Sigma|Rektum){1}[6-8]*')
  console.log(phaseAnnotation[1].match(re)[0]);
  for (let i = 0; i < phaseAnnotation.length; i++) {
    console.log(i)
    input = []
    fs.createReadStream(phaseAnnotation[i])
      .pipe(csv(['frame', 'phase'])).on('data', (data) => input.push(data))
      .on('end', () => phasesArray.push(new SurgeryPhases(phaseAnnotation[i].match(re)[0], input)));
  }
}

readData();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/getPhasesArray', (req, res) => {
  for (let i in phasesArray) {
    if (phasesArray[i].name == req.body.name) {
      res.send(phasesArray[i]);
    }
  }
});

app.get('/getSurgeryList', (req, res) => {
  names = [];
  for (let i in phasesArray) {
    names.push(phasesArray[i].name)
  }
  res.send(names);
});

app.listen(8000, () => {
  console.log('Server on port 8000!')
});