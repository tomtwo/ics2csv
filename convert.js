const fs = require('fs');
const path = require('path');
const ical = require('ical');
const papa = require('papaparse');

const [interpreter, scriptname, inputFileRaw, outputFileRaw] = process.argv;

if (!inputFileRaw || !outputFileRaw) {
  console.error('Usage: node convert.js [inputFile] [outputFile]');
  process.exit(1);
}

const inputFile = path.resolve(process.cwd(), inputFileRaw);
const outputFile = path.resolve(process.cwd(), outputFileRaw);

let str;

try {
  str = fs.readFileSync(inputFile, { encoding: 'utf8' });
} catch (err) {
  console.error('Failed to process input:', err.message);
  process.exit(1);
}

if (!str.startsWith('BEGIN:VCALENDAR')) {
  console.error('Failed to process input: file does not appear to be an ics / vcal file');
  process.exit(1);
}

const data = ical.parseICS(str);

const transformed = Object.values(data).map(item => ({
  'Start date': item.start || '',
  'End date': item.end || '',
  'Location': item.location || '',
  'Summary': item.summary || '',
  'Description': item.description || '',
}));

console.log('Transformed', transformed.length, 'items');

const csv = papa.unparse(transformed);

try {
  fs.writeFileSync(outputFile, csv, { encoding: 'utf8' });
} catch (err) {
  console.error('Failed to process output: ', err.message);
  process.exit(1);
}

console.log('... saved');
