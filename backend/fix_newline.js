import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === 'dist') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const backendFiles = walk(path.join(__dirname, 'src'));
const frontendFiles = walk(path.join(__dirname, '../frontend/src'));
const allFiles = [...backendFiles, ...frontendFiles];

let fixed = 0;
allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (/\\n\s*$/.test(content)) {
        content = content.replace(/\\n\s*$/, '\n');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
        fixed++;
    }
});
console.log(`Fixed ${fixed} files.`);
