const fs = require('fs');
let clubs = [];
try {
    // read contents of the file
    const data = fs.readFileSync('futbinPageSrc', 'UTF-8');

    // split the contents by new line
    const lines = data.split(/\r?\n/);

    // print all lines
    lines.forEach((line) => {
        if (line.includes('/clubs/')) {
            let index = line.substring(line.indexOf('/clubs/') + 7, line.indexOf('.png'));
            let club = line.substring(line.indexOf('width') + 12, line.indexOf('</a>'));
            club=club.trim();
            clubs.push({ index: index, club: club });

        }
    });
} catch (err) {
    console.error(err);
}
let data = JSON.stringify(clubs);
fs.writeFileSync('futbinClubs.json', data);
