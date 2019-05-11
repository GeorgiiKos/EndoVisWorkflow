
const express = require('express')
const app = express();
const fs = require('fs')
const csv = require('csv-parser')
const SurgeryPhases = require('./SurgeryPhases')
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

phaseAnnotation = [
  // File locations here
];

phasesArray = [];

function readData() {
    re = new RegExp('(Prokto|Sigma|Rektum){1}[6-8]*')
    console.log(phaseAnnotation[1].match(re)[0]);
    for(let i = 0; i < phaseAnnotation.length; i++) {
        console.log(i)
        input = []
        fs.createReadStream(phaseAnnotation[i])
        .pipe(csv(['frame', 'phase'])).on('data', (data) =>  input.push(data))
        .on('end', () => phasesArray.push(new SurgeryPhases(phaseAnnotation[i].match(re)[0], input)));
    }
}

readData();


app.get('/', (req, res) => {
  res.send('Server is running!')
});

app.get('/getPhaseArray', (req, res) => {
  console.log('here')
  console.log(req.body.name)
  for(let i in phasesArray) {
    console.log(phasesArray[i].name)
    if(phasesArray[i].name == req.body.name) {
      console.log('found')
      res.send(phasesArray[i]);
    }
  }
});

app.listen(8000, () => {
  console.log('Server on port 8000!')
});