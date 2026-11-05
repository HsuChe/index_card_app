// Builds dist/index.html: inlines the generators and content into src/app.html.
// Usage: node scripts/build.js            -> dist/index.html (publishable fragment)
//        node scripts/build.js --standalone -> also dist/standalone.html (opens directly in a browser)
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

const app = read("src/app.html");
const generator = read("src/leetcode/generator.js");
const patterns = read("src/leetcode/patterns.js");
const ml = read("src/ml/content.js");

// The LeetCode generator defines its own helpers (ri, pick, shuffle...) that
// clash with the ML content's, so it runs in its own scope.
const wrappedGenerator = `const { TEMPLATES, buildProblem } = (() => {\n${generator}\nreturn { TEMPLATES, buildProblem };\n})();`;

const replacements = { "/*LCGEN*/": wrappedGenerator, "/*MLCONTENT*/": ml, "/*LCPATTERNS*/": patterns };
let out = app;
for (const [marker, code] of Object.entries(replacements)) {
  if (!out.includes(marker)) throw new Error(`Marker ${marker} missing from src/app.html`);
  out = out.replace(marker, () => code);
}

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/index.html"), out);
console.log(`dist/index.html  ${(out.length / 1024).toFixed(0)} KB`);

if (process.argv.includes("--standalone")) {
  const head = '<!doctype html>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n';
  fs.writeFileSync(path.join(root, "dist/standalone.html"), head + out);
  console.log("dist/standalone.html (open this one directly in a browser)");
}
