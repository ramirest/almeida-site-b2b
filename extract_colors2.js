const fs = require('fs');

const text = fs.readFileSync('parsed_pdf.txt', 'utf8');

const lines = text.split('\n').map(l => l.trim()).filter(l => l);

const colors = [];
let currentCategory = 'Geral';
let tempCodes = [];
let tempRGBs = [];

const possibleCategories = [
    "PALE / LIGHT COLOURS",
    "BRIGHT COLOURS",
    "TONS CLAROS",
    "TONS ESCUROS",
    "TONS NEUTROS",
    "TONS PASTEL",
    "TONS VIVOS",
    "TONS TERROSOS",
    "TONS VERDES",
    "TONS AZUIS",
    "TONS AMARELOS",
    "TONS MARRONS",
    "TONS ROSADOS"
];

for (let line of lines) {
    const isCategory = possibleCategories.some(cat => line.toUpperCase().includes(cat));
    if (isCategory) {
        // Zip pending
        while (tempCodes.length > 0 && tempRGBs.length > 0) {
            colors.push({
                codigo: tempCodes.shift(),
                rgb: tempRGBs.shift(),
                categoria: currentCategory
            });
        }
        tempCodes = [];
        tempRGBs = [];
        
        currentCategory = possibleCategories.find(cat => line.toUpperCase().includes(cat));
        continue;
    }

    const codeMatch = line.match(/^([A-Z]\d{3})$/i);
    if (codeMatch) {
        tempCodes.push(codeMatch[1]);
        continue;
    }

    const rgbMatch = line.match(/RGB\s+(\d+)\s*-\s*(\d+)\s*-\s*(\d+)/i);
    if (rgbMatch) {
        tempRGBs.push(`${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]}`);
        
        // Sometimes they are just on following lines, so if we have pairs we can zip them.
        while (tempCodes.length > 0 && tempRGBs.length > 0) {
            colors.push({
                codigo: tempCodes.shift(),
                rgb: tempRGBs.shift(),
                categoria: currentCategory
            });
        }
        continue;
    }
}

// flush any remaining
while (tempCodes.length > 0 && tempRGBs.length > 0) {
    colors.push({
        codigo: tempCodes.shift(),
        rgb: tempRGBs.shift(),
        categoria: currentCategory
    });
}

const formattedColors = colors.map(c => {
    let [r, g, b] = c.rgb.split(',');
    let hex = '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('').toUpperCase();
    return {
        ...c,
        hex
    };
});

fs.writeFileSync('src/data/colors.json', JSON.stringify(formattedColors, null, 2));
console.log("Saved", formattedColors.length, "colors");
