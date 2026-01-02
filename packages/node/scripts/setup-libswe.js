const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../../../native/libswe');
const targetDir = path.resolve(__dirname, '../libswe');

// Function to copy files recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Main logic
if (fs.existsSync(sourceDir)) {
    console.log('Development environment detected (native source found).');
    console.log(`Copying libswe files from ${sourceDir} to ${targetDir}...`);
    try {
        copyDir(sourceDir, targetDir);
        console.log('Copy complete.');
    } catch (err) {
        console.error('Error copying files:', err);
        process.exit(1);
    }
} else {
    console.log('Production environment detected (no native source).');
    console.log('Assuming libswe files are already present in the package.');
}
