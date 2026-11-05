# Interview Reflex

A repetition drill for two kinds of interview recognition:

- **LeetCode patterns**: a LeetCode-format problem (statement, examples, constraints) appears and you name the pattern that solves it (Sliding Window, Two Pointers, Binary Search, Heap / Top K, Arrays & Hashing, Stack, Linked List, Tree DFS, Tree BFS, Graph DFS/BFS, Topological Sort, Backtracking).
- **ML interview questions**: six categories (Interview Why, Name It, Pick the Tool, Diagnose, Compute, Shapes) covering softmax, logits, losses, metrics, optimizers, attention, tensor shapes and training failures.

Both share one engine: runs of 30 four-choice cards, a target time per card, misses recycled a few cards later, and a card counts as **automatic** after 3 correct answers in a row under its target time. Problems and numeric questions are generated fresh each time, and their answers are computed by code.

## Project layout

```
src/
  app.html                 UI, run engine, progress tracking, sync (placeholders mark where code is inlined)
  leetcode/generator.js    93 LeetCode problem templates: random inputs + solver that computes outputs
  leetcode/patterns.js     How to spot each pattern, its template code and keyboard key
  ml/content.js            157 ML cards: question bank + numeric/shape generators
scripts/build.js           Inlines the three source files into src/app.html → dist/
tests/                     node:test checks for every template and card
dist/index.html            Built page (the version published as a claude.ai artifact)
```

## Working on it

Requires Node 18+. No dependencies.

```bash
npm test          # runs every generator hundreds of times and cross-checks solvers
npm run build     # writes dist/index.html and dist/standalone.html
```

Open `dist/standalone.html` in a browser to try your changes. Progress is kept in that browser's localStorage when it runs outside claude.ai.

`dist/index.html` has no `<!doctype>`/`<head>` because claude.ai's artifact publisher adds them. `standalone.html` adds them for local use.

### Adding a LeetCode problem type

Add a `T({...})` entry in `src/leetcode/generator.js`:

- `id`, `p` (a key from `ORDER` in `patterns.js`), `diff`
- `stories`: one or more `{ title, text: N => [paragraphs], names? }` variants. `names` renames inputs (e.g. `nums` → `fruits`).
- `gen(i)`: random input object; `i` is the example index (0 = smallest).
- `solve(input)`: returns the output. Use `raw("...")` to print it verbatim.
- `cons(N)`, `why`, `needs`, optional `follow`.

Then `npm test`.

### Adding an ML card

- Fixed question: `W(...)`, `P(...)` or a row in `NAMES` in `src/ml/content.js`, with the answer, 3 wrong options, and a one-line explanation.
- Generated question: `G(id, category, label, () => ({ q, a, d: [3 wrong], x }))`. `numOpts` builds numeric distractors that are a minimum gap away from the answer.

## Progress storage

On claude.ai the page uses the artifact `db` and `user` capabilities to store each viewer's progress privately at `data/users/<id>/reflex`. Elsewhere it falls back to localStorage (`interview-reflex-v1`).
