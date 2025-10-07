const fs = require('fs');
const path = require('path');

function checkCatchAll(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      checkCatchAll(fullPath, baseDir);
    } else {
      const relative = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      // Verifica se tem catch-all
      if (/\[\.\.\..+\]/.test(file)) {
        const parts = relative.split('/');
        const last = parts[parts.length - 1];
        if (!/\[\.\.\..+\]/.test(last)) continue;

        // Se o catch-all não for o último segmento
        if (file !== last) {
          console.warn(`⚠️  Catch-all inválido em: ${relative}`);
        }
      }
    }
  }
}

// Verifica nas pastas pages/api e app/api
['src/pages/api', 'src/app/api'].forEach(folder => {
  if (fs.existsSync(folder)) {
    console.log(`Verificando ${folder}...`);
    checkCatchAll(folder);
  }
});
