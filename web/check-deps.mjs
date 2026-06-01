import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const deps = ['mammoth', 'pdf-parse', 'openai', 'better-sqlite3'];
for (const d of deps) {
  try {
    require(d);
    console.log(`${d}: OK`);
  } catch (e) {
    console.log(`${d}: MISSING`);
  }
}
