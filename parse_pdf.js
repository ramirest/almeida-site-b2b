const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:\\Users\\pedro\\Projetos\\grupo-almeida\\jateart\\docs\\cartela_sayersystem (1).pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('c:\\Users\\pedro\\Projetos\\grupo-almeida\\jateart\\parsed_pdf.txt', data.text);
    console.log("Pages:", data.numpages);
    console.log("Done");
}).catch(console.error);
