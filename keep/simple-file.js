/*
    program = simple-file.js
    directory = $home/dev/mark-x/
    for = read and write files in nodejs
    versiion = 0.9.0
    license = none
    by = @devster/nex-era
    note = only support utf-8
    release = 7:33 apr18/2025 +7
*/

const fs = require('fs')

async function xRead(FILE_NAME) { //test=ok
  try {
    const content = fs.readFileSync(FILE_NAME, 'utf8')
    return content
  } catch (err) {
    console.error('! error/read:', FILE_NAME )
    throw err
  }
}

async function xWrite(CONTENT, FILE_NAME) { //test=ok
  try {
    fs.writeFileSync(FILE_NAME, CONTENT, 'utf8')
    console.log('! done/write to file name: ' + FILE_NAME )
  } catch (err) {
    console.error('! error/write to file name: ' + FILE_NAME )
  }
}

module.exports = { xRead, xWrite }