const fs = require('fs');

const text = fs.readFileSync('parsed_pdf.txt', 'utf8');

// Find all codes (Letter + 2 or 3 digits) like F167 or X077
const codesMatches = [...text.matchAll(/\b([A-Z]\d{3})\b/g)].map(m => m[1]);

// Find all RGBs
const rgbMatches = [...text.matchAll(/RGB\s+(\d+)\s*-\s*(\d+)\s*-\s*(\d+)/g)].map(m => `${m[1]},${m[2]},${m[3]}`);

console.log("Codes found:", codesMatches.length);
console.log("RGBs found:", rgbMatches.length);

if (codesMatches.length > 0 && codesMatches.length === rgbMatches.length) {
    let colors = [];
    for (let i = 0; i < codesMatches.length; i++) {
        let [r, g, b] = rgbMatches[i].split(',');
        let hex = '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('').toUpperCase();
        colors.push({
            codigo: codesMatches[i],
            rgb: rgbMatches[i],
            hex: hex,
            categoria: "Geral" // Default
        });
    }
    fs.writeFileSync('colors_temp.json', JSON.stringify(colors, null, 2));
    console.log("Saved to colors_temp.json");
} else {
    console.log("Mismatch! Codes:", codesMatches.length, "RGBs:", rgbMatches.length);
}
