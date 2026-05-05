const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const MINECRAFT_PATH = './minecraft'; 
const OUTPUT_FILE = './manifest.json';

// Taranacak tüm kritik klasörler
const FOLDERS_TO_SCAN = [
    'mods', 
    'config', 
    'resourcepacks', 
    'shaderpacks', 
    'libraries', 
    'assets', 
    'versions',
    'runtime'
];

// ASLA ellemememiz gereken kişisel dosyalar (Beyaz Liste)
const IGNORED_FILES = [
    'options.txt', 
    'servers.dat', 
    'hotbar.nbt', 
    'screenshots', 
    'saves',
    'logs'
];

function getHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

async function scanRecursive(dir, baseDir, fileList = {}) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        if (IGNORED_FILES.includes(file)) continue;

        const fullPath = path.join(dir, file);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            await scanRecursive(fullPath, baseDir, fileList);
        } else {
            fileList[relPath] = getHash(fullPath);
        }
    }
    return fileList;
}

async function start() {
    console.log("🦆 DuckCraft Full-Sync Manifest Oluşturuluyor...");
    let fullManifest = {};

    for (const folder of FOLDERS_TO_SCAN) {
        const folderPath = path.join(MINECRAFT_PATH, folder);
        if (await fs.pathExists(folderPath)) {
            console.log(`📂 ${folder} taranıyor...`);
            await scanRecursive(folderPath, MINECRAFT_PATH, fullManifest);
        }
    }

    await fs.writeJson(OUTPUT_FILE, fullManifest, { spaces: 2 });
    console.log("\n🚀 BAŞARILI! Tüm dosyalar manifest.json'a eklendi.");
}

start();