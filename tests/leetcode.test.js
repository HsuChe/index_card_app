// Checks every LeetCode template builds valid problems, and cross-checks
// the sliding-window solvers against brute force.
const test = require("node:test");
const assert = require("node:assert");
const { TEMPLATES, buildProblem } = require("../src/leetcode/generator.js");
const { PATTERNS, ORDER } = require("../src/leetcode/patterns.js");

test("template ids are unique and patterns exist", () => {
  const ids = new Set();
  for (const t of TEMPLATES) {
    assert.ok(!ids.has(t.id), `duplicate id ${t.id}`);
    ids.add(t.id);
    assert.ok(PATTERNS[t.p], `${t.id} uses unknown pattern ${t.p}`);
  }
  for (const p of ORDER) assert.ok(TEMPLATES.some(t => t.p === p), `no templates for ${p}`);
});

test("every template builds 200 valid problems", () => {
  for (const t of TEMPLATES) {
    for (let i = 0; i < 200; i++) {
      const p = buildProblem(t);
      assert.ok(p.examples.length >= 2, `${t.id}: only ${p.examples.length} examples`);
      for (const e of p.examples) {
        assert.ok(e.output !== undefined && !/^(undefined|NaN|Infinity)$/.test(e.output), `${t.id}: bad output ${e.output}`);
      }
      assert.ok(!p.body.some(x => /undefined/.test(x)), `${t.id}: undefined in statement`);
      assert.ok(!p.cons.some(x => /undefined/.test(x)), `${t.id}: undefined in constraints`);
    }
  }
});

const subs = a => { const o = []; for (let i = 0; i < a.length; i++) for (let j = i; j < a.length; j++) o.push(a.slice(i, j + 1)); return o; };
const sum = a => a.reduce((x, y) => x + y, 0);
const brute = {
  "sw-kdistinct": ({ nums, k }) => Math.max(0, ...subs(nums).filter(s => new Set(s).size <= k).map(s => s.length)),
  "sw-minlen": ({ nums, target }) => { const v = subs(nums).filter(s => sum(s) >= target).map(s => s.length); return v.length ? Math.min(...v) : 0; },
  "sw-norepeat": ({ s }) => Math.max(0, ...subs([...s]).filter(x => new Set(x).size === x.length).map(x => x.length)),
  "sw-flips": ({ nums, k }) => Math.max(0, ...subs(nums).filter(s => s.filter(x => !x).length <= k).map(s => s.length)),
  "sw-vowels": ({ s, k }) => Math.max(...subs([...s]).filter(x => x.length === k).map(x => x.filter(c => "aeiou".includes(c)).length)),
  "sw-fixed": ({ nums, k }) => Math.max(...subs(nums).filter(x => x.length === k).map(sum))
};
test("sliding-window solvers match brute force", () => {
  for (const [id, f] of Object.entries(brute)) {
    const t = TEMPLATES.find(x => x.id === id);
    for (let i = 0; i < 2000; i++) {
      const inp = t.gen(i % 3);
      assert.strictEqual(t.solve(inp), f(inp), `${id} mismatch on ${JSON.stringify(inp)}`);
    }
  }
});
