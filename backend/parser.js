const fs = require('fs')
const csv = require('csv-parser')

// configuration file
const config = require('./config')

// funtion to parse VideoMetadata.csv file
function parseVideoMetadata() {
    var result = []
    return new Promise((resolve, reject) => {
        fs.createReadStream(config.mediaContent.output + "/VideoMetadata.csv")
            .pipe(csv())
            .on('data', (row) => result.push(row))
            .on('end', () => resolve(result))
    })
}

// function to parse a csv file containing data stream
function parseDataStream(path, name, mapping, skipLines = 0) {
    var result = {}
    result.name = name
    for (var col in mapping) {
        var attr = mapping[col]
        result[attr] = []
    }
    return new Promise((resolve, reject) => {
        fs.createReadStream(path)
            .pipe(csv({
                headers: Object.keys(mapping),
                skipLines: skipLines,
                mapValues: ({ header, index, value }) => parseInt(value)
            }))
            .on('data', (row) => {
                for (var key in row) {
                    var attr = mapping[key]
                    result[attr].push(row[key])
                }
            })
            .on('end', () => resolve(result))
    })
}

module.exports.parseVideoMetadata = parseVideoMetadata
module.exports.parseDataStream = parseDataStream