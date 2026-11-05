// Checks every ML card (bank and generated) produces 4 distinct options with one correct answer.
const test = require("node:test");
const assert = require("node:assert");
const { ITEMS, CATS, makeCard } = require("../src/ml/content.js");

test("item ids are unique and categories exist", () => {
  const ids = new Set();
  for (const it of ITEMS) {
    assert.ok(!ids.has(it.id), `duplicate id ${it.id}`);
    ids.add(it.id);
    assert.ok(CATS[it.cat], `${it.id} has unknown category ${it.cat}`);
  }
});

test("every card has 4 distinct options and a valid answer", () => {
  for (const it of ITEMS) {
    for (let i = 0; i < (it.gen ? 400 : 5); i++) {
      const c = makeCard(it);
      assert.strictEqual(c.opts.length, 4, `${it.id}: ${c.opts.length} options`);
      assert.strictEqual(new Set(c.opts).size, 4, `${it.id}: duplicate options ${JSON.stringify(c.opts)}`);
      assert.ok(c.ans >= 0 && c.ans < 4, `${it.id}: answer index ${c.ans}`);
      for (const o of c.opts) assert.ok(o && !/^(undefined|NaN|Infinity)$/.test(o), `${it.id}: bad option ${o}`);
      assert.ok(!/undefined/.test(c.q), `${it.id}: undefined in question`);
    }
  }
});

test("softmax card computes the right probability", () => {
  const it = ITEMS.find(i => i.id === "c-softmax");
  for (let i = 0; i < 200; i++) {
    const c = makeCard(it);
    const z = c.q.match(/\[([^\]]+)\]/)[1].split(",").map(Number);
    const k = +c.q.match(/<sub>(\d)<\/sub>/)[1];
    const e = z.map(Math.exp);
    assert.strictEqual(c.opts[c.ans], (e[k] / e.reduce((a, b) => a + b)).toFixed(2));
  }
});
