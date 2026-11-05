// ===== Problem generator: LeetCode-format problems with pattern built in =====
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const arr = (n, a, b) => Array.from({ length: n }, () => ri(a, b));
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const distinct = (n, a, b) => shuffle(range(a, b)).slice(0, n);
const sorted = x => x.slice().sort((p, q) => p - q);
const word = (n, al) => Array.from({ length: n }, () => pick(al)).join("");
const C = s => "<code>" + s + "</code>";
const J = v => JSON.stringify(v);
const raw = s => ({ raw: s });

// ---- trees ----
const node = v => ({ v, l: null, r: null });
function randTree(n, lo, hi, vals) {
  if (n <= 0) return null;
  const take = () => (vals ? vals.pop() : ri(lo, hi));
  const nodes = [node(take())];
  while (nodes.length < n) {
    const p = pick(nodes), side = Math.random() < 0.5 ? "l" : "r";
    if (p[side]) continue;
    p[side] = node(take()); nodes.push(p[side]);
  }
  return nodes[0];
}
function toLevel(root) {
  const out = [], q = [root];
  while (q.length) { const x = q.shift(); if (x) { out.push(x.v); q.push(x.l, x.r); } else out.push(null); }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}
function fromLevel(a) {
  if (!a.length || a[0] === null) return null;
  const root = node(a[0]), q = [root]; let i = 1;
  while (q.length && i < a.length) {
    const x = q.shift();
    if (i < a.length && a[i] !== null) { x.l = node(a[i]); q.push(x.l); } i++;
    if (i < a.length && a[i] !== null) { x.r = node(a[i]); q.push(x.r); } i++;
  }
  return root;
}
function bstFrom(vals) {
  const ins = (n, v) => { if (!n) return node(v); if (v < n.v) n.l = ins(n.l, v); else n.r = ins(n.r, v); return n; };
  let root = null; for (const v of vals) root = ins(root, v); return root;
}
function levels(root) {
  const out = []; if (!root) return out; let q = [root];
  while (q.length) { out.push(q.map(x => x.v)); q = q.flatMap(x => [x.l, x.r].filter(Boolean)); }
  return out;
}
const treeGen = (nlo, nhi, lo, hi) => () => ({ root: toLevel(randTree(ri(nlo, nhi), lo, hi)) });

// ---- graphs ----
function dagEdges(n, m, cycle) {
  const ord = shuffle(range(0, n - 1)), pos = []; ord.forEach((v, i) => (pos[v] = i));
  const seen = new Set(), edges = []; let g = 0;
  while (edges.length < m && g++ < 200) {
    const a = ri(0, n - 1), b = ri(0, n - 1); if (a === b) continue;
    const [u, v] = pos[a] < pos[b] ? [a, b] : [b, a];
    if (seen.has(u + "," + v)) continue; seen.add(u + "," + v); edges.push([u, v]);
  }
  if (cycle && edges.length) {
    // close a cycle along an existing path u -> v by adding v -> u
    const [u, v] = pick(edges); if (!seen.has(v + "," + u)) edges.push([v, u]);
  }
  return shuffle(edges); // [u, v] means u comes before v
}
function kahn(n, edges) { // edges [u,v] u before v; smallest label first on ties
  const indeg = Array(n).fill(0), g = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { g[u].push(v); indeg[v]++; }
  let avail = range(0, n - 1).filter(i => indeg[i] === 0); const order = [];
  while (avail.length) {
    avail.sort((a, b) => a - b); const u = avail.shift(); order.push(u);
    for (const v of g[u]) if (--indeg[v] === 0) avail.push(v);
  }
  return order;
}
const grid = (m, n, f) => Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => f(r, c)));
const DIR4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ---- template registry ----
const TEMPLATES = [];
const T = t => TEMPLATES.push(t);

// ================= SLIDING WINDOW =================
T({ id: "sw-kdistinct", p: "sliding_window", diff: "Medium",
  stories: [
    { title: "Longest Subarray With At Most K Distinct Values", text: () => [`Given an integer array ${C("nums")} and an integer ${C("k")}, return <em>the length of the longest contiguous subarray of</em> ${C("nums")} <em>that contains at most</em> ${C("k")} <em>distinct values</em>.`] },
    { title: "Fruit Baskets", names: { nums: "fruits" }, text: () => [
      `You are visiting a farm with a single row of fruit trees arranged from left to right. The trees are represented by an integer array ${C("fruits")} where ${C("fruits[i]")} is the <strong>type</strong> of fruit the ${C("i<sup>th</sup>")} tree produces.`,
      `You have ${C("k")} baskets, and each basket can only hold a <strong>single type</strong> of fruit. There is no limit on the amount of fruit each basket can hold. Starting from any tree of your choice, you must pick <strong>exactly one fruit</strong> from every tree while moving to the right. Once you reach a tree with fruit that cannot fit in your baskets, you must stop.`,
      `Return <em>the <strong>maximum</strong> number of fruits you can pick</em>.`] }],
  gen: i => ({ nums: arr(ri(5, 8 + i * 2), 1, 4), k: ri(1, 3) }),
  solve: ({ nums, k }) => { let l = 0, b = 0; const m = new Map(); for (let r = 0; r < nums.length; r++) { m.set(nums[r], (m.get(nums[r]) || 0) + 1); while (m.size > k) { const v = nums[l++]; m.set(v, m.get(v) - 1); if (!m.get(v)) m.delete(v); } b = Math.max(b, r - l + 1); } return b; },
  cons: N => [`1 <= ${N("nums")}.length <= 10<sup>5</sup>`, `0 <= ${N("nums")}[i] < ${N("nums")}.length`, `1 <= k <= 10<sup>5</sup>`],
  why: "The answer is a contiguous range. It becomes invalid as it grows (too many distinct values) and valid again as it shrinks.",
  needs: ["Count map of values inside the window", "Shrink from the left while the distinct count is above k", "Record the max length after shrinking"] });

T({ id: "sw-fixed", p: "sliding_window", diff: "Easy",
  stories: [
    { title: "Maximum Sum of a Subarray of Size K", text: () => [`Given an integer array ${C("nums")} and an integer ${C("k")}, return <em>the maximum sum of any contiguous subarray of length exactly</em> ${C("k")}.`] },
    { title: "Busiest Stretch of Days", names: { nums: "visitors" }, text: () => [`A museum records ${C("visitors[i]")}, the number of visitors on day ${C("i")}. Given an integer ${C("k")}, return <em>the largest total number of visitors over any</em> ${C("k")} <em>consecutive days</em>.`] }],
  gen: i => { const n = ri(5, 7 + i * 2); return { nums: arr(n, 0, 40), k: ri(2, Math.min(n, 4)) }; },
  solve: ({ nums, k }) => { let s = 0, b = -Infinity; for (let i = 0; i < nums.length; i++) { s += nums[i]; if (i >= k) s -= nums[i - k]; if (i >= k - 1) b = Math.max(b, s); } return b; },
  cons: N => [`1 <= k <= ${N("nums")}.length <= 10<sup>5</sup>`, `0 <= ${N("nums")}[i] <= 10<sup>4</sup>`],
  why: "Every candidate is a contiguous block of exactly k elements, so slide a fixed-size window instead of re-summing.",
  needs: ["Fixed window of size k", "Add the entering element and subtract the leaving one in O(1)", "Start recording once the window reaches size k"] });

T({ id: "sw-minlen", p: "sliding_window", diff: "Medium",
  stories: [
    { title: "Minimum Size Subarray Sum", text: () => [`Given an array of positive integers ${C("nums")} and a positive integer ${C("target")}, return <em>the <strong>minimal length</strong> of a subarray whose sum is greater than or equal to</em> ${C("target")}. If there is no such subarray, return ${C("0")} instead.`] },
    { title: "Fewest Stations to Refuel", names: { nums: "fuel" }, text: () => [`Stations along a highway are listed in order. ${C("fuel[i]")} is the number of liters available at station ${C("i")}. You may collect fuel from one run of <strong>consecutive</strong> stations.`, `Return <em>the minimum number of consecutive stations you must visit to collect at least</em> ${C("target")} <em>liters</em>, or ${C("0")} if it is impossible.`] }],
  gen: i => ({ target: ri(6, 25), nums: arr(ri(5, 7 + i * 2), 1, 9) }),
  solve: ({ nums, target }) => { let l = 0, s = 0, b = Infinity; for (let r = 0; r < nums.length; r++) { s += nums[r]; while (s >= target) { b = Math.min(b, r - l + 1); s -= nums[l++]; } } return b === Infinity ? 0 : b; },
  cons: N => [`1 <= target <= 10<sup>9</sup>`, `1 <= ${N("nums")}.length <= 10<sup>5</sup>`, `1 <= ${N("nums")}[i] <= 10<sup>4</sup>`],
  follow: "If you have figured out the O(n) solution, try coding another solution of which the time complexity is O(n log(n)).",
  why: "Positive values mean a bigger window always has a bigger sum, so you can shrink from the left while the sum still meets the target.",
  needs: ["Running sum as window state", "Shrink while still valid and record the minimum inside the loop", "Why positive values make shrinking safe"] });

T({ id: "sw-norepeat", p: "sliding_window", diff: "Medium",
  stories: [
    { title: "Longest Substring Without Repeating Characters", text: () => [`Given a string ${C("s")}, find the length of the <strong>longest substring</strong> without repeating characters.`] },
    { title: "Longest Fresh Playlist", names: { s: "songs" }, gen: i => ({ s: arr(ri(6, 8 + i * 2), 1, 6) }), text: () => [`A playlist is given as an integer array ${C("songs")}, where ${C("songs[i]")} is the ID of the ${C("i<sup>th</sup>")} song. Return <em>the length of the longest run of consecutive songs in which no song ID appears twice</em>.`] }],
  gen: i => ({ s: word(ri(5, 8 + i * 2), "abcdef".slice(0, ri(3, 6))) }),
  solve: ({ s }) => { let l = 0, b = 0; const last = new Map(); for (let r = 0; r < s.length; r++) { if (last.has(s[r]) && last.get(s[r]) >= l) l = last.get(s[r]) + 1; last.set(s[r], r); b = Math.max(b, r - l + 1); } return b; },
  cons: N => N("s") === "s" ? [`0 <= s.length <= 5 * 10<sup>4</sup>`, `s consists of English letters, digits, symbols and spaces.`] : [`1 <= songs.length <= 10<sup>5</sup>`, `1 <= songs[i] <= 10<sup>9</sup>`],
  why: "Contiguous range that breaks when a value repeats; jump or shrink the left edge past the previous occurrence.",
  needs: ["Map from value to last seen index", "Move the left edge past the duplicate, never backwards", "Record length after each step"] });

T({ id: "sw-vowels", p: "sliding_window", diff: "Medium",
  stories: [{ title: "Maximum Number of Vowels in a Substring of Given Length", text: () => [`Given a string ${C("s")} and an integer ${C("k")}, return <em>the maximum number of vowel letters in any substring of</em> ${C("s")} <em>with length</em> ${C("k")}.`, `<strong>Vowel letters</strong> in English are ${C("'a'")}, ${C("'e'")}, ${C("'i'")}, ${C("'o'")}, and ${C("'u'")}.`] }],
  gen: i => { const s = word(ri(6, 9 + i * 2), "abcdeiortu"); return { s, k: ri(2, Math.min(4, s.length)) }; },
  solve: ({ s, k }) => { const v = c => "aeiou".includes(c); let c = 0, b = 0; for (let i = 0; i < s.length; i++) { if (v(s[i])) c++; if (i >= k && v(s[i - k])) c--; if (i >= k - 1) b = Math.max(b, c); } return b; },
  cons: () => [`1 <= s.length <= 10<sup>5</sup>`, `s consists of lowercase English letters.`, `1 <= k <= s.length`],
  why: "Fixed-length contiguous window; keep a running vowel count as it slides.",
  needs: ["Fixed window of size k", "Running count updated by the entering and leaving characters"] });

T({ id: "sw-flips", p: "sliding_window", diff: "Medium",
  stories: [
    { title: "Max Consecutive Ones III", text: () => [`Given a binary array ${C("nums")} and an integer ${C("k")}, return <em>the maximum number of consecutive</em> ${C("1")}<em>'s in the array if you can flip at most</em> ${C("k")} ${C("0")}'s.`] },
    { title: "Longest Paved Road", names: { nums: "road" }, text: () => [`A road is split into segments. ${C("road[i]")} is ${C("1")} if segment ${C("i")} is paved and ${C("0")} if it is broken. You can repair at most ${C("k")} broken segments.`, `Return <em>the length of the longest stretch of consecutive paved segments you can achieve</em>.`] }],
  gen: i => ({ nums: arr(ri(6, 9 + i * 2), 0, 1), k: ri(0, 3) }),
  solve: ({ nums, k }) => { let l = 0, z = 0, b = 0; for (let r = 0; r < nums.length; r++) { if (!nums[r]) z++; while (z > k) { if (!nums[l]) z--; l++; } b = Math.max(b, r - l + 1); } return b; },
  cons: N => [`1 <= ${N("nums")}.length <= 10<sup>5</sup>`, `${N("nums")}[i] is either 0 or 1.`, `0 <= k <= ${N("nums")}.length`],
  why: "Longest contiguous range with at most k zeros inside it. The zero count is the window's validity check.",
  needs: ["Count zeros inside the window", "Shrink while zeros exceed k", "Reframe 'flip k' as 'window with at most k zeros'"] });

T({ id: "sw-perm", p: "sliding_window", diff: "Medium",
  stories: [{ title: "Permutation in String", text: () => [`Given two strings ${C("s1")} and ${C("s2")}, return ${C("true")} <em>if</em> ${C("s2")} <em>contains a permutation of</em> ${C("s1")}<em>, or</em> ${C("false")} <em>otherwise</em>.`, `In other words, return ${C("true")} if one of ${C("s1")}'s permutations is the substring of ${C("s2")}.`] }],
  gen: () => { const s1 = word(ri(2, 3), "abcd"); let s2 = word(ri(5, 9), "abcde"); if (Math.random() < 0.5) { const at = ri(0, s2.length - s1.length); s2 = s2.slice(0, at) + shuffle([...s1]).join("") + s2.slice(at + s1.length); } return { s1, s2 }; },
  solve: ({ s1, s2 }) => { const key = x => [...x].sort().join(""); const k = key(s1); for (let i = 0; i + s1.length <= s2.length; i++) if (key(s2.slice(i, i + s1.length)) === k) return true; return false; },
  cons: () => [`1 <= s1.length, s2.length <= 10<sup>4</sup>`, `s1 and s2 consist of lowercase English letters.`],
  why: "A permutation of s1 is a contiguous block of s2 with the same letter counts, so slide a window of length s1 and compare counts.",
  needs: ["Fixed window of size s1.length", "Letter count arrays compared in O(26)", "Track a 'matches' counter to compare in O(1)"] });

// ================= TWO POINTERS =================
T({ id: "tp-sorted2sum", p: "two_pointers", diff: "Medium",
  stories: [{ title: "Two Sum II - Input Array Is Sorted", text: () => [`Given a <strong>1-indexed</strong> array of integers ${C("numbers")} that is already <strong><em>sorted in non-decreasing order</em></strong>, find two numbers such that they add up to a specific ${C("target")} number. Let these two numbers be ${C("numbers[index<sub>1</sub>]")} and ${C("numbers[index<sub>2</sub>]")} where ${C("1 <= index<sub>1</sub> < index<sub>2</sub> <= numbers.length")}.`, `Return <em>the indices of the two numbers,</em> ${C("index<sub>1</sub>")} <em>and</em> ${C("index<sub>2</sub>")}<em>, added by one as an integer array</em> ${C("[index<sub>1</sub>, index<sub>2</sub>]")} <em>of length 2.</em>`, `Your solution must use only constant extra space.`] }],
  gen: () => { for (;;) { const n = ri(4, 8), a = sorted(distinct(n, -10, 25)), x = ri(0, n - 2), y = ri(x + 1, n - 1), t = a[x] + a[y]; let c = 0; for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) if (a[p] + a[q] === t) c++; if (c === 1) return { numbers: a, target: t }; } },
  solve: ({ numbers: a, target: t }) => { for (let p = 0; p < a.length; p++) for (let q = p + 1; q < a.length; q++) if (a[p] + a[q] === t) return [p + 1, q + 1]; },
  cons: () => [`2 <= numbers.length <= 3 * 10<sup>4</sup>`, `-1000 <= numbers[i] <= 1000`, `numbers is sorted in non-decreasing order.`, `The tests are generated such that there is exactly one solution.`],
  why: "Sorted input plus a pair search: start at both ends and move the pointer that brings the sum closer to the target. The constant-space rule excludes a hash map.",
  needs: ["Converging pointers from both ends", "Sum too small → move left; too big → move right", "1-indexed output"] });

T({ id: "tp-palin", p: "two_pointers", diff: "Easy",
  stories: [{ title: "Valid Palindrome", text: () => [`A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.`, `Given a string ${C("s")}, return ${C("true")} <em>if it is a <strong>palindrome</strong>, or</em> ${C("false")} <em>otherwise</em>.`] }],
  gen: () => { const core = word(ri(2, 4), "abcder"); const base = Math.random() < 0.55 ? core + (Math.random() < 0.5 ? pick("xyz") : "") + [...core].reverse().join("") : word(ri(4, 8), "abcer"); let out = ""; for (const ch of base) { out += Math.random() < 0.35 ? ch.toUpperCase() : ch; if (Math.random() < 0.3) out += pick([" ", ", ", ": ", "! ", " "]); } return { s: out.trim() }; },
  solve: ({ s }) => { const t = s.toLowerCase().replace(/[^a-z0-9]/g, ""); return t === [...t].reverse().join(""); },
  cons: () => [`1 <= s.length <= 2 * 10<sup>5</sup>`, `s consists only of printable ASCII characters.`],
  why: "Compare characters from both ends moving inward, skipping non-alphanumerics, with O(1) extra space.",
  needs: ["Pointers at both ends moving inward", "Skip characters that are not alphanumeric", "Case-insensitive comparison"] });

T({ id: "tp-container", p: "two_pointers", diff: "Medium",
  stories: [{ title: "Container With Most Water", text: () => [`You are given an integer array ${C("height")} of length ${C("n")}. There are ${C("n")} vertical lines drawn such that the two endpoints of the ${C("i<sup>th</sup>")} line are ${C("(i, 0)")} and ${C("(i, height[i])")}.`, `Find two lines that together with the x-axis form a container, such that the container contains the most water.`, `Return <em>the maximum amount of water a container can store</em>.`, `<strong>Notice</strong> that you may not slant the container.`] }],
  gen: i => ({ height: arr(ri(5, 7 + i * 2), 1, 9) }),
  solve: ({ height: h }) => { let b = 0; for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) b = Math.max(b, Math.min(h[i], h[j]) * (j - i)); return b; },
  cons: () => [`n == height.length`, `2 <= n <= 10<sup>5</sup>`, `0 <= height[i] <= 10<sup>4</sup>`],
  why: "Start with the widest pair. Only moving the shorter line can increase the area, so each step discards one line safely.",
  needs: ["Area = min(height) × width", "Move the pointer at the shorter line", "Argue why the discarded line can't be in a better answer"] });

T({ id: "tp-dedup", p: "two_pointers", diff: "Easy",
  stories: [{ title: "Remove Duplicates from Sorted Array", text: () => [`Given an integer array ${C("nums")} sorted in <strong>non-decreasing order</strong>, remove the duplicates <strong>in-place</strong> such that each unique element appears only <strong>once</strong>. The <strong>relative order</strong> of the elements should be kept the same. Then return <em>the number of unique elements in</em> ${C("nums")}.`, `Consider the number of unique elements of ${C("nums")} to be ${C("k")}. Change the array ${C("nums")} such that the first ${C("k")} elements of ${C("nums")} contain the unique elements in the order they were present in ${C("nums")} initially. The remaining elements of ${C("nums")} are not important.`] }],
  gen: i => ({ nums: sorted(arr(ri(4, 7 + i * 2), 0, 5)) }),
  solve: ({ nums }) => { const u = [...new Set(nums)]; return raw(`${u.length}, nums = [${u.concat(Array(nums.length - u.length).fill("_")).join(",")}]`); },
  cons: () => [`1 <= nums.length <= 3 * 10<sup>4</sup>`, `-100 <= nums[i] <= 100`, `nums is sorted in non-decreasing order.`],
  why: "In-place rewrite: a slow pointer marks where the next unique value goes while a fast pointer scans.",
  needs: ["Read (fast) and write (slow) pointers moving the same direction", "Sorted order means duplicates are adjacent", "Return the write index as k"] });

T({ id: "tp-squares", p: "two_pointers", diff: "Easy",
  stories: [{ title: "Squares of a Sorted Array", text: () => [`Given an integer array ${C("nums")} sorted in <strong>non-decreasing</strong> order, return <em>an array of <strong>the squares of each number</strong> sorted in non-decreasing order</em>.`] }],
  gen: i => ({ nums: sorted(arr(ri(4, 6 + i), -8, 9)) }),
  solve: ({ nums }) => sorted(nums.map(x => x * x)),
  cons: () => [`1 <= nums.length <= 10<sup>4</sup>`, `-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup>`, `nums is sorted in non-decreasing order.`],
  follow: "Squaring each element and sorting the new array is very trivial, could you find an O(n) solution using a different approach?",
  why: "The largest squares sit at the two ends of the sorted array, so compare the ends and fill the result from the back.",
  needs: ["Pointers at both ends", "Fill the output from the largest position down", "Compare absolute values"] });

T({ id: "tp-3sum", p: "two_pointers", diff: "Medium",
  stories: [{ title: "3Sum", text: () => [`Given an integer array ${C("nums")}, return all the triplets ${C("[nums[i], nums[j], nums[k]]")} such that ${C("i != j")}, ${C("i != k")}, and ${C("j != k")}, and ${C("nums[i] + nums[j] + nums[k] == 0")}.`, `Notice that the solution set must not contain duplicate triplets.`] }],
  gen: i => ({ nums: arr(ri(5, 6 + i), -4, 4) }),
  solve: ({ nums }) => { const s = new Set(), out = []; const a = sorted(nums); for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) for (let k = j + 1; k < a.length; k++) if (a[i] + a[j] + a[k] === 0) { const key = a[i] + "," + a[j] + "," + a[k]; if (!s.has(key)) { s.add(key); out.push([a[i], a[j], a[k]]); } } return out; },
  cons: () => [`3 <= nums.length <= 3000`, `-10<sup>5</sup> <= nums[i] <= 10<sup>5</sup>`],
  why: "Sort, fix one anchor, then the remaining pair search on a sorted suffix is converging two pointers. Skipping equal neighbors removes duplicates.",
  needs: ["Sort first", "Fix an anchor, run two pointers on the rest", "Skip duplicate anchors and duplicate pointer values"] });

T({ id: "tp-trap", p: "two_pointers", diff: "Hard",
  stories: [{ title: "Trapping Rain Water", text: () => [`Given ${C("n")} non-negative integers representing an elevation map where the width of each bar is ${C("1")}, compute how much water it can trap after raining.`] }],
  gen: i => ({ height: arr(ri(6, 8 + i * 2), 0, 4) }),
  solve: ({ height: h }) => { let w = 0; for (let i = 0; i < h.length; i++) { const L = Math.max(...h.slice(0, i + 1)), R = Math.max(...h.slice(i)); w += Math.min(L, R) - h[i]; } return w; },
  cons: () => [`n == height.length`, `1 <= n <= 2 * 10<sup>4</sup>`, `0 <= height[i] <= 10<sup>5</sup>`],
  why: "Water above each bar is set by the smaller of the tallest bars to its left and right. Two pointers track both maxima and process the side with the smaller max.",
  needs: ["Water at i = min(maxLeft, maxRight) − height[i]", "Move the side whose max is smaller; that side's water is already decided", "O(1) space vs prefix-max arrays"] });

T({ id: "tp-movezero", p: "two_pointers", diff: "Easy",
  stories: [{ title: "Move Zeroes", text: () => [`Given an integer array ${C("nums")}, move all ${C("0")}'s to the end of it while maintaining the relative order of the non-zero elements.`, `<strong>Note</strong> that you must do this in-place without making a copy of the array.`] }],
  gen: i => ({ nums: arr(ri(4, 6 + i * 2), 0, 6).map(x => (x < 3 ? 0 : x - 2)) }),
  solve: ({ nums }) => nums.filter(x => x).concat(nums.filter(x => !x)),
  cons: () => [`1 <= nums.length <= 10<sup>4</sup>`, `-2<sup>31</sup> <= nums[i] <= 2<sup>31</sup> - 1`],
  follow: "Could you minimize the total number of operations done?",
  why: "In-place partition: a write pointer collects non-zeros in order while a read pointer scans.",
  needs: ["Same-direction read/write pointers", "Swap or overwrite then fill zeros", "Stable order of non-zeros"] });

// ================= BINARY SEARCH =================
T({ id: "bs-insert", p: "modified_binary_search", diff: "Easy",
  stories: [{ title: "Search Insert Position", text: () => [`Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.`, `You must write an algorithm with ${C("O(log n)")} runtime complexity.`] }],
  gen: i => { const nums = sorted(distinct(ri(3, 5 + i), -5, 20)); return { nums, target: Math.random() < 0.5 ? pick(nums) : ri(-6, 21) }; },
  solve: ({ nums, target }) => { let i = 0; while (i < nums.length && nums[i] < target) i++; return i; },
  cons: () => [`1 <= nums.length <= 10<sup>4</sup>`, `-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup>`, `nums contains distinct values sorted in ascending order.`, `-10<sup>4</sup> <= target <= 10<sup>4</sup>`],
  why: "Sorted array plus O(log n): find the first index whose value is at least the target (lower bound).",
  needs: ["Lower-bound binary search", "Loop while lo < hi with hi = len", "Return lo as the insert point"] });

const rotated = n => { const a = sorted(distinct(n, 0, 30)), k = ri(0, n - 1); return a.slice(k).concat(a.slice(0, k)); };
T({ id: "bs-rotmin", p: "modified_binary_search", diff: "Medium",
  stories: [{ title: "Find Minimum in Rotated Sorted Array", text: () => [`Suppose an array of length ${C("n")} sorted in ascending order is <strong>rotated</strong> between ${C("1")} and ${C("n")} times. For example, the array ${C("nums = [0,1,2,4,5,6,7]")} might become ${C("[4,5,6,7,0,1,2]")} if it was rotated ${C("4")} times.`, `Given the sorted rotated array ${C("nums")} of <strong>unique</strong> elements, return <em>the minimum element of this array</em>.`, `You must write an algorithm that runs in ${C("O(log n)")} time.`] }],
  gen: i => ({ nums: rotated(ri(3, 5 + i * 2)) }),
  solve: ({ nums }) => Math.min(...nums),
  cons: () => [`n == nums.length`, `1 <= n <= 5000`, `-5000 <= nums[i] <= 5000`, `All the integers of nums are unique.`, `nums is sorted and rotated between 1 and n times.`],
  why: "A rotated sorted array still lets you discard half each step: compare mid with the right end to see which side holds the drop.",
  needs: ["Compare nums[mid] with nums[hi]", "hi = mid when mid could be the minimum, else lo = mid + 1", "Loop while lo < hi"] });

T({ id: "bs-rotsearch", p: "modified_binary_search", diff: "Medium",
  stories: [{ title: "Search in Rotated Sorted Array", text: () => [`There is an integer array ${C("nums")} sorted in ascending order (with <strong>distinct</strong> values). Prior to being passed to your function, ${C("nums")} is <strong>possibly rotated</strong> at an unknown pivot index.`, `Given the array ${C("nums")} <strong>after</strong> the possible rotation and an integer ${C("target")}, return <em>the index of</em> ${C("target")} <em>if it is in</em> ${C("nums")}<em>, or</em> ${C("-1")} <em>if it is not in</em> ${C("nums")}.`, `You must write an algorithm with ${C("O(log n)")} runtime complexity.`] }],
  gen: i => { const nums = rotated(ri(4, 5 + i * 2)); return { nums, target: Math.random() < 0.6 ? pick(nums) : ri(0, 31) }; },
  solve: ({ nums, target }) => nums.indexOf(target),
  cons: () => [`1 <= nums.length <= 5000`, `-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup>`, `All values of nums are unique.`, `nums is an ascending array that is possibly rotated.`, `-10<sup>4</sup> <= target <= 10<sup>4</sup>`],
  why: "At every midpoint one half is sorted; check whether the target lies inside that sorted half and discard the other.",
  needs: ["Identify the sorted half with nums[lo] <= nums[mid]", "Range check the target against the sorted half", "Exact-match loop with lo <= hi"] });

T({ id: "bs-ship", p: "modified_binary_search", diff: "Medium",
  stories: [{ title: "Capacity To Ship Packages Within D Days", text: () => [`A conveyor belt has packages that must be shipped from one port to another within ${C("days")} days.`, `The ${C("i<sup>th</sup>")} package on the conveyor belt has a weight of ${C("weights[i]")}. Each day, we load the ship with packages on the conveyor belt (in the order given by ${C("weights")}). We may not load more weight than the maximum weight capacity of the ship.`, `Return the least weight capacity of the ship that will result in all the packages on the conveyor belt being shipped within ${C("days")} days.`] }],
  gen: i => { const w = arr(ri(4, 6 + i * 2), 1, 10); return { weights: w, days: ri(1, Math.min(5, w.length)) }; },
  solve: ({ weights: w, days }) => { const ok = c => { let d = 1, s = 0; for (const x of w) { if (s + x > c) { d++; s = 0; } s += x; } return d <= days; }; let c = Math.max(...w); while (!ok(c)) c++; return c; },
  cons: () => [`1 <= days <= weights.length <= 5 * 10<sup>4</sup>`, `1 <= weights[i] <= 500`],
  why: "Larger capacity is always feasible, so the answer is monotonic. Binary search the capacity between max(weights) and sum(weights) with a greedy day-count check.",
  needs: ["Binary search on the answer, not on the array", "Greedy feasibility: count days for a capacity", "Bounds lo = max, hi = sum"] });

T({ id: "bs-koko", p: "modified_binary_search", diff: "Medium",
  stories: [
    { title: "Koko Eating Bananas", text: () => [`Koko loves to eat bananas. There are ${C("n")} piles of bananas, the ${C("i<sup>th</sup>")} pile has ${C("piles[i]")} bananas. The guards have gone and will come back in ${C("h")} hours.`, `Koko can decide her bananas-per-hour eating speed of ${C("k")}. Each hour, she chooses some pile of bananas and eats ${C("k")} bananas from that pile. If the pile has less than ${C("k")} bananas, she eats all of them instead and will not eat any more bananas during this hour.`, `Return <em>the minimum integer</em> ${C("k")} <em>such that she can eat all the bananas within</em> ${C("h")} <em>hours</em>.`] },
    { title: "Minimum Printing Speed", names: { piles: "jobs" }, text: () => [`A print shop has ${C("n")} jobs; job ${C("i")} has ${C("jobs[i]")} pages. A single printer prints at a fixed speed of ${C("k")} pages per hour, works on one job per hour, and if a job has fewer than ${C("k")} pages left it finishes that job and idles for the rest of the hour.`, `Return <em>the minimum integer speed</em> ${C("k")} <em>that finishes every job within</em> ${C("h")} <em>hours</em>.`] }],
  gen: i => { const p = arr(ri(2, 4 + i), 3, 30); return { piles: p, h: ri(p.length, p.length + 6) }; },
  solve: ({ piles, h }) => { let k = 1; while (piles.reduce((a, x) => a + Math.ceil(x / k), 0) > h) k++; return k; },
  cons: N => [`1 <= ${N("piles")}.length <= 10<sup>4</sup>`, `${N("piles")}.length <= h <= 10<sup>9</sup>`, `1 <= ${N("piles")}[i] <= 10<sup>9</sup>`],
  why: "Faster speed always finishes in fewer hours, so binary search the speed with a ceil-division hour count.",
  needs: ["Binary search over speeds 1..max(pile)", "Hours(k) = Σ ceil(pile / k)", "Find the smallest k with hours(k) <= h"] });

T({ id: "bs-sqrt", p: "modified_binary_search", diff: "Easy",
  stories: [{ title: "Sqrt(x)", text: () => [`Given a non-negative integer ${C("x")}, return <em>the square root of</em> ${C("x")} <em>rounded down to the nearest integer</em>. The returned integer should be <strong>non-negative</strong> as well.`, `You <strong>must not use</strong> any built-in exponent function or operator.`] }],
  gen: i => ({ x: i === 0 ? ri(0, 30) : i === 1 ? ri(30, 500) : ri(1000, 2147395599) }),
  solve: ({ x }) => Math.floor(Math.sqrt(x)),
  cons: () => [`0 <= x <= 2<sup>31</sup> - 1`],
  why: "m² <= x is monotonic in m, so binary search the largest m that satisfies it.",
  needs: ["Search the answer range 0..x", "Last value where mid*mid <= x", "Avoid overflow with mid <= x / mid"] });

T({ id: "bs-range", p: "modified_binary_search", diff: "Medium",
  stories: [{ title: "Find First and Last Position of Element in Sorted Array", text: () => [`Given an array of integers ${C("nums")} sorted in non-decreasing order, find the starting and ending position of a given ${C("target")} value.`, `If ${C("target")} is not found in the array, return ${C("[-1, -1]")}.`, `You must write an algorithm with ${C("O(log n)")} runtime complexity.`] }],
  gen: i => { const nums = sorted(arr(ri(4, 6 + i * 2), 1, 8)); return { nums, target: Math.random() < 0.65 ? pick(nums) : ri(0, 9) }; },
  solve: ({ nums, target }) => [nums.indexOf(target), nums.lastIndexOf(target)],
  cons: () => [`0 <= nums.length <= 10<sup>5</sup>`, `-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup>`, `nums is a non-decreasing array.`, `-10<sup>9</sup> <= target <= 10<sup>9</sup>`],
  why: "Two boundary searches on a sorted array: the first index >= target and the first index > target.",
  needs: ["Lower bound and upper bound templates", "Check the lower bound actually holds the target", "Both in O(log n)"] });

T({ id: "bs-matrix", p: "modified_binary_search", diff: "Medium",
  stories: [{ title: "Search a 2D Matrix", text: () => [`You are given an ${C("m x n")} integer matrix ${C("matrix")} with the following two properties:`, `<ul><li>Each row is sorted in non-decreasing order.</li><li>The first integer of each row is greater than the last integer of the previous row.</li></ul>`, `Given an integer ${C("target")}, return ${C("true")} <em>if</em> ${C("target")} <em>is in</em> ${C("matrix")} <em>or</em> ${C("false")} <em>otherwise</em>.`, `You must write a solution in ${C("O(log(m * n))")} time complexity.`] }],
  gen: () => { const m = ri(2, 3), n = ri(3, 4); let v = ri(1, 5); const mat = grid(m, n, () => (v += ri(1, 6))); const flat = mat.flat(); return { matrix: mat, target: Math.random() < 0.5 ? pick(flat) : ri(1, v + 3) }; },
  solve: ({ matrix, target }) => matrix.flat().includes(target),
  cons: () => [`m == matrix.length`, `n == matrix[i].length`, `1 <= m, n <= 100`, `-10<sup>4</sup> <= matrix[i][j], target <= 10<sup>4</sup>`],
  why: "The matrix reads as one sorted array of length m·n; binary search an index and map it to (i / n, i % n).",
  needs: ["Treat the matrix as a flattened sorted array", "Index mapping row = mid / n, col = mid % n", "Exact-match binary search"] });

// ================= TOP K / HEAPS =================
T({ id: "tk-kth", p: "top_k", diff: "Medium",
  stories: [{ title: "Kth Largest Element in an Array", text: () => [`Given an integer array ${C("nums")} and an integer ${C("k")}, return <em>the</em> ${C("k<sup>th</sup>")} <em>largest element in the array</em>.`, `Note that it is the ${C("k<sup>th</sup>")} largest element in the sorted order, not the ${C("k<sup>th</sup>")} distinct element.`, `Can you solve it without sorting?`] }],
  gen: i => { const nums = arr(ri(5, 7 + i * 2), -3, 12); return { nums, k: ri(1, Math.min(4, nums.length)) }; },
  solve: ({ nums, k }) => nums.slice().sort((a, b) => b - a)[k - 1],
  cons: () => [`1 <= k <= nums.length <= 10<sup>5</sup>`, `-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup>`],
  why: "Only the k largest matter: a min-heap of size k keeps them, and its top is the answer.",
  needs: ["Min-heap of size k", "Pop when the heap size exceeds k", "Quickselect as the average O(n) alternative"] });

T({ id: "tk-freq", p: "top_k", diff: "Medium",
  stories: [
    { title: "Top K Frequent Elements", text: () => [`Given an integer array ${C("nums")} and an integer ${C("k")}, return <em>the</em> ${C("k")} <em>most frequent elements</em>. You may return the answer in <strong>any order</strong>.`] },
    { title: "Trending Hashtags", names: { nums: "tags" }, text: () => [`A feed logs posts by hashtag ID. ${C("tags[i]")} is the hashtag of the ${C("i<sup>th</sup>")} post. Return <em>the</em> ${C("k")} <em>hashtags that appear most often</em>, in any order. The answer is guaranteed to be unique.`] }],
  gen: () => { const m = ri(3, 5), vals = distinct(m, -3, 9), counts = shuffle(range(1, m)); return { nums: shuffle(vals.flatMap((v, i) => Array(counts[i]).fill(v))), k: ri(1, m - 1) }; },
  solve: ({ nums, k }) => { const c = new Map(); nums.forEach(x => c.set(x, (c.get(x) || 0) + 1)); return [...c].sort((a, b) => b[1] - a[1]).slice(0, k).map(e => e[0]); },
  cons: N => [`1 <= ${N("nums")}.length <= 10<sup>5</sup>`, `-10<sup>4</sup> <= ${N("nums")}[i] <= 10<sup>4</sup>`, `k is in the range [1, the number of unique elements in the array].`, `It is guaranteed that the answer is unique.`],
  follow: "Your algorithm's time complexity must be better than O(n log n), where n is the array's size.",
  why: "Count with a hash map, then select the k highest counts with a size-k heap (or bucket sort by frequency).",
  needs: ["Frequency map", "Size-k min-heap keyed on count", "Bucket sort for O(n)"] });

T({ id: "tk-closest", p: "top_k", diff: "Medium",
  stories: [{ title: "K Closest Points to Origin", text: () => [`Given an array of ${C("points")} where ${C("points[i] = [x<sub>i</sub>, y<sub>i</sub>]")} represents a point on the <strong>X-Y</strong> plane and an integer ${C("k")}, return the ${C("k")} closest points to the origin ${C("(0, 0)")}.`, `The distance between two points on the <strong>X-Y</strong> plane is the Euclidean distance (i.e., ${C("√(x<sub>1</sub> - x<sub>2</sub>)<sup>2</sup> + (y<sub>1</sub> - y<sub>2</sub>)<sup>2</sup>")}).`, `You may return the answer in <strong>any order</strong>. The answer is <strong>guaranteed</strong> to be <strong>unique</strong> (except for the order that it is in).`] }],
  gen: () => { for (;;) { const m = ri(3, 6), pts = Array.from({ length: m }, () => [ri(-5, 5), ri(-5, 5)]), k = ri(1, m - 1); const d = pts.map(([x, y]) => x * x + y * y).sort((a, b) => a - b); if (d[k - 1] !== d[k]) return { points: pts, k }; } },
  solve: ({ points, k }) => points.slice().sort((a, b) => a[0] ** 2 + a[1] ** 2 - b[0] ** 2 - b[1] ** 2).slice(0, k),
  cons: () => [`1 <= k <= points.length <= 10<sup>4</sup>`, `-10<sup>4</sup> <= x<sub>i</sub>, y<sub>i</sub> <= 10<sup>4</sup>`],
  why: "k nearest of many: keep a size-k max-heap on squared distance instead of sorting all points.",
  needs: ["Squared distance, no sqrt", "Max-heap of size k, evict the farthest", "O(n log k)"] });

T({ id: "tk-stones", p: "top_k", diff: "Easy",
  stories: [{ title: "Last Stone Weight", text: () => [`You are given an array of integers ${C("stones")} where ${C("stones[i]")} is the weight of the ${C("i<sup>th</sup>")} stone.`, `We are playing a game with the stones. On each turn, we choose the <strong>heaviest two stones</strong> and smash them together. Suppose the heaviest two stones have weights ${C("x")} and ${C("y")} with ${C("x <= y")}. If ${C("x == y")}, both stones are destroyed; if ${C("x != y")}, the stone of weight ${C("x")} is destroyed and the stone of weight ${C("y")} has new weight ${C("y - x")}.`, `At the end of the game, there is <strong>at most one</strong> stone left. Return <em>the weight of the last remaining stone</em>. If there are no stones left, return ${C("0")}.`] }],
  gen: i => ({ stones: arr(ri(2, 4 + i * 2), 1, 10) }),
  solve: ({ stones }) => { const s = stones.slice(); while (s.length > 1) { s.sort((a, b) => b - a); const y = s.shift(), x = s.shift(); if (y !== x) s.push(y - x); } return s[0] || 0; },
  cons: () => [`1 <= stones.length <= 30`, `1 <= stones[i] <= 1000`],
  why: "Repeatedly taking the two largest items is a max-heap's job.",
  needs: ["Max-heap (negate values for a min-heap library)", "Pop two, push the difference", "Loop until at most one remains"] });

T({ id: "tk-sticks", p: "top_k", diff: "Medium",
  stories: [
    { title: "Minimum Cost to Connect Sticks", text: () => [`You have some number of sticks with positive integer lengths. These lengths are given as an array ${C("sticks")}, where ${C("sticks[i]")} is the length of the ${C("i<sup>th</sup>")} stick.`, `You can connect any two sticks of lengths ${C("x")} and ${C("y")} into one stick by paying a cost of ${C("x + y")}. You must connect all the sticks until there is only one stick remaining.`, `Return <em>the minimum cost of connecting all the given sticks into one stick in this way</em>.`] },
    { title: "Merge Log Files", names: { sticks: "sizes" }, text: () => [`You have log files with ${C("sizes[i]")} megabytes each. Merging two files of sizes ${C("x")} and ${C("y")} takes ${C("x + y")} seconds and produces one file of size ${C("x + y")}.`, `Return <em>the minimum total time to merge all files into one</em>.`] }],
  gen: i => ({ sticks: arr(ri(2, 4 + i), 1, 10) }),
  solve: ({ sticks }) => { const s = sticks.slice(); let c = 0; while (s.length > 1) { s.sort((a, b) => a - b); const x = s.shift() + s.shift(); c += x; s.push(x); } return c; },
  cons: N => [`1 <= ${N("sticks")}.length <= 10<sup>4</sup>`, `1 <= ${N("sticks")}[i] <= 10<sup>4</sup>`],
  why: "Always merge the two smallest; a min-heap gives you them in O(log n).",
  needs: ["Min-heap of lengths", "Greedy: combine the two smallest each time", "Push the merged length back"] });

T({ id: "tk-weakrows", p: "top_k", diff: "Easy",
  stories: [{ title: "The K Weakest Rows in a Matrix", text: () => [`You are given an ${C("m x n")} binary matrix ${C("mat")} of ${C("1")}'s (representing soldiers) and ${C("0")}'s (representing civilians). The soldiers are positioned <strong>in front</strong> of the civilians. That is, all the ${C("1")}'s will appear to the <strong>left</strong> of all the ${C("0")}'s in each row.`, `A row ${C("i")} is <strong>weaker</strong> than a row ${C("j")} if the number of soldiers in row ${C("i")} is less than in row ${C("j")}, or both rows have the same number of soldiers and ${C("i < j")}.`, `Return <em>the indices of the</em> ${C("k")} <em><strong>weakest</strong> rows in the matrix ordered from weakest to strongest</em>.`] }],
  gen: () => { const m = ri(3, 5), n = ri(3, 5); return { mat: Array.from({ length: m }, () => { const s = ri(0, n); return Array.from({ length: n }, (_, c) => (c < s ? 1 : 0)); }), k: ri(1, m) }; },
  solve: ({ mat, k }) => mat.map((r, i) => [r.reduce((a, b) => a + b, 0), i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, k).map(x => x[1]),
  cons: () => [`m == mat.length`, `n == mat[i].length`, `2 <= n, m <= 100`, `1 <= k <= m`, `mat[i][j] is either 0 or 1.`],
  why: "Select k smallest by a (count, index) key; a size-k heap or a sort over m rows.",
  needs: ["Count soldiers per row (binary search works since 1s come first)", "Heap keyed on (count, index)", "Tie-break by index"] });

T({ id: "tk-stream", p: "top_k", diff: "Easy",
  stories: [{ title: "Kth Largest Element in a Stream", text: () => [`You are part of a university admissions office and need to keep track of the ${C("k<sup>th</sup>")} highest test score from applicants in real-time.`, `Implement the ${C("KthLargest")} class:`, `<ul><li>${C("KthLargest(int k, int[] nums)")} Initializes the object with the integer ${C("k")} and the stream of test scores ${C("nums")}.</li><li>${C("int add(int val)")} Adds a new test score ${C("val")} to the stream and returns the element representing the ${C("k<sup>th</sup>")} largest element in the pool of test scores so far.</li></ul>`] }],
  gen: () => { const k = ri(1, 3), nums = arr(ri(Math.max(0, k - 1), k + 2), 1, 10), adds = arr(ri(3, 5), 1, 12); return { _in: `["KthLargest"${',"add"'.repeat(adds.length)}]\n[[${k},${J(nums)}]${adds.map(a => ",[" + a + "]").join("")}]`, k, nums, adds }; },
  solve: ({ k, nums, adds }) => { const pool = nums.slice(), out = [null]; for (const a of adds) { pool.push(a); out.push(pool.slice().sort((x, y) => y - x)[k - 1]); } return out; },
  cons: () => [`0 <= nums.length <= 10<sup>4</sup>`, `1 <= k <= nums.length + 1`, `-10<sup>4</sup> <= nums[i], val <= 10<sup>4</sup>`, `At most 10<sup>4</sup> calls will be made to add.`],
  why: "A running kth-largest over a stream is a min-heap capped at size k; its top is always the answer.",
  needs: ["Min-heap of size k", "Push then pop if size > k on every add", "Top of heap is the kth largest"] });

// ================= BINARY TREE DFS =================
const tdText = (extra) => [`Given the <code>root</code> of a binary tree, ${extra}`];
T({ id: "td-depth", p: "binary_tree_dfs", diff: "Easy",
  stories: [{ title: "Maximum Depth of Binary Tree", text: () => [...tdText("return <em>its maximum depth</em>."), `A binary tree's <strong>maximum depth</strong> is the number of nodes along the longest path from the root node down to the farthest leaf node.`] }],
  gen: i => ({ root: toLevel(randTree(ri(i === 0 ? 3 : 1, 9), 1, 20)) }),
  solve: ({ root }) => { const d = n => (n ? 1 + Math.max(d(n.l), d(n.r)) : 0); return d(fromLevel(root)); },
  cons: () => [`The number of nodes in the tree is in the range [0, 10<sup>4</sup>].`, `-100 <= Node.val <= 100`],
  why: "Depth of a node combines its children's depths: a post-order recursion returning height.",
  needs: ["Base case: null → 0", "Return 1 + max(left, right)"] });

T({ id: "td-pathsum", p: "binary_tree_dfs", diff: "Easy",
  stories: [{ title: "Path Sum", text: () => [`Given the <code>root</code> of a binary tree and an integer ${C("targetSum")}, return ${C("true")} if the tree has a <strong>root-to-leaf</strong> path such that adding up all the values along the path equals ${C("targetSum")}.`, `A <strong>leaf</strong> is a node with no children.`] }],
  gen: () => { const root = randTree(ri(3, 9), -3, 9); const paths = []; const go = (n, s) => { s += n.v; if (!n.l && !n.r) paths.push(s); if (n.l) go(n.l, s); if (n.r) go(n.r, s); }; go(root, 0); return { root: toLevel(root), targetSum: Math.random() < 0.6 ? pick(paths) : ri(-3, 25) }; },
  solve: ({ root, targetSum }) => { const go = (n, s) => { if (!n) return false; s -= n.v; if (!n.l && !n.r) return s === 0; return go(n.l, s) || go(n.r, s); }; return go(fromLevel(root), targetSum); },
  cons: () => [`The number of nodes in the tree is in the range [0, 5000].`, `-1000 <= Node.val <= 1000`, `-1000 <= targetSum <= 1000`],
  why: "Carry the remaining sum down each root-to-leaf path and check it at the leaves (pre-order DFS).",
  needs: ["Pass remaining sum down", "Check only at leaves", "Combine children with OR"] });

T({ id: "td-diameter", p: "binary_tree_dfs", diff: "Easy",
  stories: [{ title: "Diameter of Binary Tree", text: () => [...tdText("return <em>the length of the <strong>diameter</strong> of the tree</em>."), `The <strong>diameter</strong> of a binary tree is the <strong>length</strong> of the longest path between any two nodes in a tree. This path may or may not pass through the <code>root</code>.`, `The <strong>length</strong> of a path between two nodes is represented by the number of edges between them.`] }],
  gen: treeGen(2, 10, 1, 9),
  solve: ({ root }) => { let b = 0; const h = n => { if (!n) return 0; const L = h(n.l), R = h(n.r); b = Math.max(b, L + R); return 1 + Math.max(L, R); }; h(fromLevel(root)); return b; },
  cons: () => [`The number of nodes in the tree is in the range [1, 10<sup>4</sup>].`, `-100 <= Node.val <= 100`],
  why: "Each node's longest path through it is left height + right height. Return height upward and keep a global best.",
  needs: ["Return height, update a global answer", "Count edges, not nodes", "The best path may skip the root"] });

T({ id: "td-balanced", p: "binary_tree_dfs", diff: "Easy",
  stories: [{ title: "Balanced Binary Tree", text: () => [`Given a binary tree, determine if it is <strong>height-balanced</strong>.`, `A <strong>height-balanced</strong> binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than one.`] }],
  gen: () => { const n = ri(3, 9); if (Math.random() < 0.45) { const s = sorted(distinct(n, 1, 20)); const mk = (lo, hi) => { if (lo > hi) return null; const m = (lo + hi + ri(0, 1)) >> 1; const x = node(s[m]); x.l = mk(lo, m - 1); x.r = mk(m + 1, hi); return x; }; return { root: toLevel(mk(0, s.length - 1)) }; } return { root: toLevel(randTree(n, 1, 20)) }; },
  solve: ({ root }) => { const h = n => { if (!n) return 0; const L = h(n.l), R = h(n.r); if (L < 0 || R < 0 || Math.abs(L - R) > 1) return -1; return 1 + Math.max(L, R); }; return h(fromLevel(root)) >= 0; },
  cons: () => [`The number of nodes in the tree is in the range [0, 5000].`, `-10<sup>4</sup> <= Node.val <= 10<sup>4</sup>`],
  why: "Balance at every node depends on both subtree heights: post-order DFS returning height, with a sentinel for 'unbalanced'.",
  needs: ["Return height or -1 for unbalanced", "Check |left − right| <= 1 at every node", "Single O(n) pass, not height() per node"] });

T({ id: "td-good", p: "binary_tree_dfs", diff: "Medium",
  stories: [{ title: "Count Good Nodes in Binary Tree", text: () => [`Given a binary tree <code>root</code>, a node <em>X</em> in the tree is named <strong>good</strong> if in the path from root to <em>X</em> there are no nodes with a value <em>greater than</em> X.`, `Return the number of <strong>good</strong> nodes in the binary tree.`] }],
  gen: treeGen(3, 9, 1, 9),
  solve: ({ root }) => { const go = (n, m) => (n ? (n.v >= m ? 1 : 0) + go(n.l, Math.max(m, n.v)) + go(n.r, Math.max(m, n.v)) : 0); return go(fromLevel(root), -Infinity); },
  cons: () => [`The number of nodes in the binary tree is in the range [1, 10^5].`, `Each node's value is between [-10^4, 10^4].`],
  why: "Carry the max value seen so far down the path; a node is good if it is at least that max.",
  needs: ["Pass the path maximum down (pre-order)", "Compare with >=", "Sum counts from both children"] });

T({ id: "td-invert", p: "binary_tree_dfs", diff: "Easy",
  stories: [{ title: "Invert Binary Tree", text: () => tdText("invert the tree, and return <em>its root</em>.") }],
  gen: treeGen(1, 8, 1, 9),
  solve: ({ root }) => { const inv = n => { if (!n) return null; [n.l, n.r] = [inv(n.r), inv(n.l)]; return n; }; return toLevel(inv(fromLevel(root))); },
  cons: () => [`The number of nodes in the tree is in the range [0, 100].`, `-100 <= Node.val <= 100`],
  why: "Each subtree is inverted independently and then swapped: a simple recursive DFS.",
  needs: ["Recurse on both children", "Swap left and right", "Return the node"] });

T({ id: "td-maxpath", p: "binary_tree_dfs", diff: "Hard",
  stories: [{ title: "Binary Tree Maximum Path Sum", text: () => [`A <strong>path</strong> in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence <strong>at most once</strong>. Note that the path does not need to pass through the root.`, `The <strong>path sum</strong> of a path is the sum of the node's values in the path.`, `Given the <code>root</code> of a binary tree, return <em>the maximum <strong>path sum</strong> of any <strong>non-empty</strong> path</em>.`] }],
  gen: treeGen(2, 9, -10, 10),
  solve: ({ root }) => { let b = -Infinity; const g = n => { if (!n) return 0; const L = Math.max(0, g(n.l)), R = Math.max(0, g(n.r)); b = Math.max(b, n.v + L + R); return n.v + Math.max(L, R); }; g(fromLevel(root)); return b; },
  cons: () => [`The number of nodes in the tree is in the range [1, 3 * 10<sup>4</sup>].`, `-1000 <= Node.val <= 1000`],
  why: "Like diameter, but with weights: return the best single branch upward, clamp negative gains to 0, and update a global with both branches.",
  needs: ["Clamp child gains with max(0, …)", "Global = node + left + right", "Return node + max(left, right)"] });

T({ id: "td-validbst", p: "binary_tree_dfs", diff: "Medium",
  stories: [{ title: "Validate Binary Search Tree", text: () => [...tdText("<em>determine if it is a valid binary search tree (BST)</em>."), `A <strong>valid BST</strong> is defined as follows:`, `<ul><li>The left subtree of a node contains only nodes with keys <strong>less than</strong> the node's key.</li><li>The right subtree of a node contains only nodes with keys <strong>greater than</strong> the node's key.</li><li>Both the left and right subtrees must also be binary search trees.</li></ul>`] }],
  gen: () => { const vals = distinct(ri(3, 8), 1, 20); const root = bstFrom(vals); if (Math.random() < 0.5) { const lv = toLevel(root), idx = lv.map((v, i) => (v !== null ? i : -1)).filter(i => i >= 0); const a = pick(idx), b = pick(idx); [lv[a], lv[b]] = [lv[b], lv[a]]; return { root: lv }; } return { root: toLevel(root) }; },
  solve: ({ root }) => { const ok = (n, lo, hi) => !n || (n.v > lo && n.v < hi && ok(n.l, lo, n.v) && ok(n.r, n.v, hi)); return ok(fromLevel(root), -Infinity, Infinity); },
  cons: () => [`The number of nodes in the tree is in the range [1, 10<sup>4</sup>].`, `-2<sup>31</sup> <= Node.val <= 2<sup>31</sup> - 1`],
  why: "Each node must fit within bounds inherited from all its ancestors, not just its parent, so pass (low, high) down the recursion.",
  needs: ["Pass (lo, hi) bounds down", "Strict inequalities", "Alternative: in-order traversal must be strictly increasing"] });

T({ id: "td-same", p: "binary_tree_dfs", diff: "Easy",
  stories: [{ title: "Same Tree", text: () => [`Given the roots of two binary trees ${C("p")} and ${C("q")}, write a function to check if they are the same or not.`, `Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.`] }],
  gen: () => { const a = toLevel(randTree(ri(1, 6), 1, 5)); let b = a.slice(); const r = Math.random(); if (r < 0.3) { const idx = b.map((v, i) => (v !== null ? i : -1)).filter(i => i >= 0); b[pick(idx)] = ri(1, 5); } else if (r < 0.5) b = toLevel(randTree(ri(1, 6), 1, 5)); return { p: a, q: b }; },
  solve: ({ p, q }) => { const s = (a, b) => (!a && !b) || (!!a && !!b && a.v === b.v && s(a.l, b.l) && s(a.r, b.r)); return s(fromLevel(p), fromLevel(q)); },
  cons: () => [`The number of nodes in both trees is in the range [0, 100].`, `-10<sup>4</sup> <= Node.val <= 10<sup>4</sup>`],
  why: "Compare two trees node by node in lockstep with one recursion.",
  needs: ["Both null → true; one null → false", "Values equal and both subtrees equal"] });

T({ id: "td-sumnums", p: "binary_tree_dfs", diff: "Medium",
  stories: [{ title: "Sum Root to Leaf Numbers", text: () => [`You are given the <code>root</code> of a binary tree containing digits from ${C("0")} to ${C("9")} only.`, `Each root-to-leaf path in the tree represents a number. For example, the root-to-leaf path ${C("1 -> 2 -> 3")} represents the number ${C("123")}.`, `Return <em>the total sum of all root-to-leaf numbers</em>. A <strong>leaf</strong> node is a node with no children.`] }],
  gen: treeGen(2, 7, 0, 9),
  solve: ({ root }) => { const g = (n, v) => { if (!n) return 0; v = v * 10 + n.v; if (!n.l && !n.r) return v; return g(n.l, v) + g(n.r, v); }; return g(fromLevel(root), 0); },
  cons: () => [`The number of nodes in the tree is in the range [1, 1000].`, `0 <= Node.val <= 9`, `The depth of the tree will not exceed 10.`],
  why: "Build the number as you go down (value × 10 + digit) and add it at each leaf.",
  needs: ["Pass the partial number down", "Sum only at leaves"] });

T({ id: "td-lca", p: "binary_tree_dfs", diff: "Medium",
  stories: [{ title: "Lowest Common Ancestor of a Binary Tree", text: () => [`Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.`, `According to the definition of LCA: "The lowest common ancestor is defined between two nodes ${C("p")} and ${C("q")} as the lowest node in ${C("T")} that has both ${C("p")} and ${C("q")} as descendants (where we allow <strong>a node to be a descendant of itself</strong>)."`] }],
  gen: () => { const n = ri(4, 10), vals = distinct(n, 0, 15); const root = randTree(n, 0, 0, vals.slice()); const lv = toLevel(root), present = lv.filter(v => v !== null); const [p, q] = shuffle(present).slice(0, 2); return { root: lv, p, q }; },
  solve: ({ root, p, q }) => { const f = n => { if (!n || n.v === p || n.v === q) return n; const L = f(n.l), R = f(n.r); return L && R ? n : L || R; }; return f(fromLevel(root)).v; },
  cons: () => [`The number of nodes in the tree is in the range [2, 10<sup>5</sup>].`, `-10<sup>9</sup> <= Node.val <= 10<sup>9</sup>`, `All Node.val are unique.`, `p != q`, `p and q will exist in the tree.`],
  why: "Post-order: if p and q are found in different subtrees of a node, that node is the LCA.",
  needs: ["Return the found node upward", "Both sides non-null → current node is the answer", "A node can be its own ancestor"] });

// ================= BINARY TREE BFS =================
const bfsTree = treeGen(3, 10, 1, 20);
T({ id: "tb-level", p: "binary_tree_bfs", diff: "Medium",
  stories: [{ title: "Binary Tree Level Order Traversal", text: () => tdText("return <em>the level order traversal of its nodes' values</em>. (i.e., from left to right, level by level).") }],
  gen: bfsTree, solve: ({ root }) => levels(fromLevel(root)),
  cons: () => [`The number of nodes in the tree is in the range [0, 2000].`, `-1000 <= Node.val <= 1000`],
  why: "Output grouped by level: process the queue one level at a time.",
  needs: ["Queue with a per-level size snapshot", "Append children while draining a level"] });
T({ id: "tb-right", p: "binary_tree_bfs", diff: "Medium",
  stories: [{ title: "Binary Tree Right Side View", text: () => tdText("imagine yourself standing on the <strong>right side</strong> of it, return <em>the values of the nodes you can see ordered from top to bottom</em>.") }],
  gen: bfsTree, solve: ({ root }) => levels(fromLevel(root)).map(l => l[l.length - 1]),
  cons: () => [`The number of nodes in the tree is in the range [0, 100].`, `-100 <= Node.val <= 100`],
  why: "The visible node is the last node of each level, so it's level order keeping one value per level.",
  needs: ["Level-size loop", "Keep the last node of each level"] });
T({ id: "tb-avg", p: "binary_tree_bfs", diff: "Easy",
  stories: [{ title: "Average of Levels in Binary Tree", text: () => tdText(`return <em>the average value of the nodes on each level in the form of an array</em>. Answers within ${C("10<sup>-5</sup>")} of the actual answer will be accepted.`) }],
  gen: bfsTree, solve: ({ root }) => raw("[" + levels(fromLevel(root)).map(l => (l.reduce((a, b) => a + b, 0) / l.length).toFixed(5)).join(",") + "]"),
  cons: () => [`The number of nodes in the tree is in the range [1, 10<sup>4</sup>].`, `-2<sup>31</sup> <= Node.val <= 2<sup>31</sup> - 1`],
  why: "Per-level aggregate: BFS with a level-size loop, summing each level.",
  needs: ["Level-size snapshot", "Sum and divide per level"] });
T({ id: "tb-zigzag", p: "binary_tree_bfs", diff: "Medium",
  stories: [{ title: "Binary Tree Zigzag Level Order Traversal", text: () => tdText("return <em>the zigzag level order traversal of its nodes' values</em>. (i.e., from left to right, then right to left for the next level and alternate between).") }],
  gen: bfsTree, solve: ({ root }) => levels(fromLevel(root)).map((l, i) => (i % 2 ? l.slice().reverse() : l)),
  cons: () => [`The number of nodes in the tree is in the range [0, 2000].`, `-100 <= Node.val <= 100`],
  why: "Level order with direction flipping each level.",
  needs: ["Level-size loop", "Reverse (or insert at front) on odd levels"] });
T({ id: "tb-mindepth", p: "binary_tree_bfs", diff: "Easy",
  stories: [{ title: "Minimum Depth of Binary Tree", text: () => [`Given a binary tree, find its minimum depth.`, `The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node.`, `<strong>Note:</strong> A leaf is a node with no children.`] }],
  gen: bfsTree, solve: ({ root }) => { let d = 0, q = [fromLevel(root)]; while (q.length) { d++; for (const n of q) if (!n.l && !n.r) return d; q = q.flatMap(n => [n.l, n.r].filter(Boolean)); } return 0; },
  cons: () => [`The number of nodes in the tree is in the range [0, 10<sup>5</sup>].`, `-1000 <= Node.val <= 1000`],
  why: "Nearest leaf = shortest distance; BFS stops at the first leaf it reaches.",
  needs: ["Level counter", "Stop at the first leaf", "A node with one child is not a leaf"] });
T({ id: "tb-rowmax", p: "binary_tree_bfs", diff: "Medium",
  stories: [{ title: "Find Largest Value in Each Tree Row", text: () => tdText("return <em>an array of the largest value in each row</em> of the tree <strong>(0-indexed)</strong>.") }],
  gen: bfsTree, solve: ({ root }) => levels(fromLevel(root)).map(l => Math.max(...l)),
  cons: () => [`The number of nodes in the tree will be in the range [0, 10<sup>4</sup>].`, `-2<sup>31</sup> <= Node.val <= 2<sup>31</sup> - 1`],
  why: "Per-row aggregate: BFS level by level, keeping the max.",
  needs: ["Level-size loop", "Track the max per level"] });
T({ id: "tb-deepsum", p: "binary_tree_bfs", diff: "Medium",
  stories: [{ title: "Deepest Leaves Sum", text: () => tdText("return <em>the sum of values of its deepest leaves</em>.") }],
  gen: bfsTree, solve: ({ root }) => { const L = levels(fromLevel(root)); return L[L.length - 1].reduce((a, b) => a + b, 0); },
  cons: () => [`The number of nodes in the tree is in the range [1, 10<sup>4</sup>].`, `1 <= Node.val <= 100`],
  why: "The deepest leaves are exactly the last level; BFS and sum the final level.",
  needs: ["Level-size loop", "Reset the sum each level; the last one wins"] });

// ================= TOPOLOGICAL SORT =================
const courseGen = () => { const n = ri(2, 6), cyc = Math.random() < 0.35; const e = dagEdges(n, ri(1, n + 1), cyc); return { numCourses: n, prerequisites: e.map(([u, v]) => [v, u]) }; };
const courseOrder = ({ numCourses: n, prerequisites: p }) => kahn(n, p.map(([a, b]) => [b, a]));
T({ id: "tt-canfinish", p: "topological_sort", diff: "Medium",
  stories: [{ title: "Course Schedule", text: () => [`There are a total of ${C("numCourses")} courses you have to take, labeled from ${C("0")} to ${C("numCourses - 1")}. You are given an array ${C("prerequisites")} where ${C("prerequisites[i] = [a<sub>i</sub>, b<sub>i</sub>]")} indicates that you <strong>must</strong> take course ${C("b<sub>i</sub>")} first if you want to take course ${C("a<sub>i</sub>")}.`, `Return ${C("true")} if you can finish all courses. Otherwise, return ${C("false")}.`] }],
  gen: courseGen, solve: x => courseOrder(x).length === x.numCourses,
  cons: () => [`1 <= numCourses <= 2000`, `0 <= prerequisites.length <= 5000`, `prerequisites[i].length == 2`, `0 <= a<sub>i</sub>, b<sub>i</sub> < numCourses`, `All the pairs prerequisites[i] are unique.`],
  why: "Prerequisites form a directed graph; you can finish exactly when there is no cycle, which Kahn's algorithm detects.",
  needs: ["Adjacency list and in-degree array", "Queue all in-degree-0 nodes", "Processed count < n means a cycle"] });
T({ id: "tt-order", p: "topological_sort", diff: "Medium",
  stories: [
    { title: "Course Schedule II", text: () => [`There are a total of ${C("numCourses")} courses you have to take, labeled from ${C("0")} to ${C("numCourses - 1")}. You are given an array ${C("prerequisites")} where ${C("prerequisites[i] = [a<sub>i</sub>, b<sub>i</sub>]")} indicates that you <strong>must</strong> take course ${C("b<sub>i</sub>")} first if you want to take course ${C("a<sub>i</sub>")}.`, `Return <em>the ordering of courses you should take to finish all courses</em>. If there are many valid answers, return <strong>any</strong> of them. If it is impossible to finish all courses, return <strong>an empty array</strong>.`] },
    { title: "Build Order", names: { numCourses: "n", prerequisites: "deps" }, text: () => [`A build system has ${C("n")} modules labeled ${C("0")} to ${C("n - 1")}. ${C("deps[i] = [a<sub>i</sub>, b<sub>i</sub>]")} means module ${C("a<sub>i</sub>")} imports module ${C("b<sub>i</sub>")}, so ${C("b<sub>i</sub>")} must be built before ${C("a<sub>i</sub>")}.`, `Return <em>an order in which every module can be built</em>. If several orders exist, return any of them. If the imports are circular, return an empty array.`] }],
  gen: courseGen, solve: x => { const o = courseOrder(x); return o.length === x.numCourses ? o : []; },
  cons: N => [`1 <= ${N("numCourses")} <= 2000`, `0 <= ${N("prerequisites")}.length <= ${N("numCourses")} * (${N("numCourses")} - 1)`, `All the pairs [a<sub>i</sub>, b<sub>i</sub>] are distinct.`],
  why: "An order that respects before/after dependencies is a topological order; an empty result means a cycle.",
  needs: ["Edge from prerequisite to dependent", "Kahn's queue produces the order", "Return [] if not all nodes were processed"] });
T({ id: "tt-semesters", p: "topological_sort", diff: "Medium",
  stories: [{ title: "Parallel Courses", text: () => [`You are given an integer ${C("n")}, which indicates that there are ${C("n")} courses labeled from ${C("1")} to ${C("n")}. You are also given an array ${C("relations")} where ${C("relations[i] = [prevCourse<sub>i</sub>, nextCourse<sub>i</sub>]")}, representing a prerequisite relationship between course ${C("prevCourse<sub>i</sub>")} and course ${C("nextCourse<sub>i</sub>")}: course ${C("prevCourse<sub>i</sub>")} has to be taken before course ${C("nextCourse<sub>i</sub>")}.`, `In one semester, you can take <strong>any number</strong> of courses as long as you have taken all the prerequisites in the <strong>previous</strong> semester for the courses you are taking.`, `Return <em>the <strong>minimum</strong> number of semesters needed to take all courses</em>. If there is no way to take all the courses, return ${C("-1")}.`] }],
  gen: () => { const n = ri(3, 7), e = dagEdges(n, ri(2, n + 2), Math.random() < 0.25); return { n, relations: e.map(([u, v]) => [u + 1, v + 1]) }; },
  solve: ({ n, relations }) => { const indeg = Array(n + 1).fill(0), g = Array.from({ length: n + 1 }, () => []); for (const [a, b] of relations) { g[a].push(b); indeg[b]++; } let q = range(1, n).filter(i => !indeg[i]), sem = 0, done = 0; while (q.length) { sem++; done += q.length; const nq = []; for (const u of q) for (const v of g[u]) if (--indeg[v] === 0) nq.push(v); q = nq; } return done === n ? sem : -1; },
  cons: () => [`1 <= n <= 5000`, `1 <= relations.length <= 5000`, `relations[i].length == 2`, `1 <= prevCourse<sub>i</sub>, nextCourse<sub>i</sub> <= n`, `prevCourse<sub>i</sub> != nextCourse<sub>i</sub>`, `All the pairs [prevCourse<sub>i</sub>, nextCourse<sub>i</sub>] are unique.`],
  why: "Kahn's algorithm processed in layers: each layer is a semester, and leftover nodes mean a cycle.",
  needs: ["Kahn's algorithm by levels", "Count layers", "-1 when a cycle remains"] });
T({ id: "tt-safe", p: "topological_sort", diff: "Medium",
  stories: [{ title: "Find Eventual Safe States", text: () => [`There is a directed graph of ${C("n")} nodes with each node labeled from ${C("0")} to ${C("n - 1")}. The graph is represented by a <strong>0-indexed</strong> 2D integer array ${C("graph")} where ${C("graph[i]")} is an integer array of nodes adjacent to node ${C("i")}, meaning there is an edge from node ${C("i")} to each node in ${C("graph[i]")}.`, `A node is a <strong>terminal node</strong> if there are no outgoing edges. A node is a <strong>safe node</strong> if every possible path starting from that node leads to a <strong>terminal node</strong> (or another safe node).`, `Return <em>an array containing all the <strong>safe nodes</strong> of the graph</em>. The answer should be sorted in <strong>ascending</strong> order.`] }],
  gen: () => { const n = ri(4, 7); return { graph: Array.from({ length: n }, () => sorted([...new Set(arr(ri(0, 2), 0, n - 1))])) }; },
  solve: ({ graph }) => { const n = graph.length, out = graph.map(g => g.length), rev = Array.from({ length: n }, () => []); graph.forEach((g, u) => g.forEach(v => rev[v].push(u))); const q = range(0, n - 1).filter(i => !out[i]), safe = Array(n).fill(false); while (q.length) { const v = q.shift(); safe[v] = true; for (const u of rev[v]) if (--out[u] === 0) q.push(u); } return range(0, n - 1).filter(i => safe[i]); },
  cons: () => [`n == graph.length`, `1 <= n <= 10<sup>4</sup>`, `0 <= graph[i].length <= n`, `0 <= graph[i][j] <= n - 1`, `graph[i] is sorted in a strictly increasing order.`, `The graph may contain self-loops.`],
  why: "Reverse the edges and run Kahn's algorithm from terminal nodes; whatever never joins the queue is stuck in or leads to a cycle.",
  needs: ["Reverse graph", "Out-degree instead of in-degree", "Peel from terminals inward"] });
T({ id: "tt-alien", p: "topological_sort", diff: "Hard",
  stories: [{ title: "Alien Dictionary", text: () => [`There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you.`, `You are given a list of strings ${C("words")} from the alien language's dictionary. Now it is claimed that the strings in ${C("words")} are <strong>sorted lexicographically</strong> by the rules of this new language.`, `Return <em>a string of the unique letters in the new alien language sorted in <strong>lexicographically increasing order</strong> by the new language's rules</em>. If there are multiple solutions, return <strong>any of them</strong>.`] }],
  gen: () => { const letters = shuffle([..."abcdefg"]).slice(0, ri(3, 5)), rank = Object.fromEntries(letters.map((c, i) => [c, i])); const ws = [...new Set(Array.from({ length: ri(3, 5) }, () => word(ri(1, 3), letters)))]; ws.sort((a, b) => { for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return rank[a[i]] - rank[b[i]]; return a.length - b.length; }); return { words: ws }; },
  solve: ({ words }) => { const L = [...new Set(words.join(""))].sort(), id = Object.fromEntries(L.map((c, i) => [c, i])), e = []; for (let i = 0; i + 1 < words.length; i++) { const a = words[i], b = words[i + 1]; for (let j = 0; j < Math.min(a.length, b.length); j++) if (a[j] !== b[j]) { e.push([id[a[j]], id[b[j]]]); break; } } return kahn(L.length, e).map(i => L[i]).join(""); },
  cons: () => [`1 <= words.length <= 100`, `1 <= words[i].length <= 100`, `words[i] consists of only lowercase English letters.`],
  why: "Adjacent words reveal 'letter X comes before letter Y' edges; ordering letters by those edges is a topological sort.",
  needs: ["Compare adjacent words at the first differing letter", "Build the letter graph", "Detect cycles and the invalid-prefix case"] });

// ================= SUBSETS / BACKTRACKING =================
T({ id: "bt-subsets", p: "subsets", diff: "Medium",
  stories: [{ title: "Subsets", text: () => [`Given an integer array ${C("nums")} of <strong>unique</strong> elements, return <em>all possible subsets (the power set)</em>.`, `The solution set <strong>must not</strong> contain duplicate subsets. Return the solution in <strong>any order</strong>.`] }],
  gen: i => ({ nums: distinct(i === 0 ? 1 : ri(2, 3), 0, 9) }),
  solve: ({ nums }) => { let r = [[]]; for (const x of nums) r = r.concat(r.map(s => s.concat(x))); return r; },
  cons: () => [`1 <= nums.length <= 10`, `-10 <= nums[i] <= 10`, `All the numbers of nums are unique.`],
  why: "Every element is in or out: enumerate choices with backtracking (or iterative doubling).",
  needs: ["Choose / recurse / undo", "Start index to avoid reordering", "Record every node, not only leaves"] });
T({ id: "bt-subsets2", p: "subsets", diff: "Medium",
  stories: [{ title: "Subsets II", text: () => [`Given an integer array ${C("nums")} that may contain duplicates, return <em>all possible subsets (the power set)</em>.`, `The solution set <strong>must not</strong> contain duplicate subsets. Return the solution in <strong>any order</strong>.`] }],
  gen: () => ({ nums: arr(ri(2, 3), 1, 3) }),
  solve: ({ nums }) => { const a = sorted(nums), out = []; const bt = (s, p) => { out.push(p.slice()); for (let i = s; i < a.length; i++) { if (i > s && a[i] === a[i - 1]) continue; p.push(a[i]); bt(i + 1, p); p.pop(); } }; bt(0, []); return out; },
  cons: () => [`1 <= nums.length <= 10`, `-10 <= nums[i] <= 10`],
  why: "Power set with duplicates: sort, then backtrack while skipping equal siblings at the same depth.",
  needs: ["Sort first", "Skip nums[i] == nums[i-1] when i > start", "Record at every node"] });
T({ id: "bt-perms", p: "subsets", diff: "Medium",
  stories: [{ title: "Permutations", text: () => [`Given an array ${C("nums")} of distinct integers, return <em>all the possible permutations</em>. You can return the answer in <strong>any order</strong>.`] }],
  gen: i => ({ nums: distinct(i === 0 ? ri(1, 2) : 3, 0, 9) }),
  solve: ({ nums }) => { const out = [], used = Array(nums.length).fill(false); const bt = p => { if (p.length === nums.length) { out.push(p.slice()); return; } nums.forEach((x, i) => { if (used[i]) return; used[i] = true; p.push(x); bt(p); p.pop(); used[i] = false; }); }; bt([]); return out; },
  cons: () => [`1 <= nums.length <= 6`, `-10 <= nums[i] <= 10`, `All the integers of nums are unique.`],
  why: "Every ordering: each position picks any unused element, recorded only at full length.",
  needs: ["Used array (order matters, no start index)", "Record at leaves", "Undo both path and used flag"] });
T({ id: "bt-combsum", p: "subsets", diff: "Medium",
  stories: [{ title: "Combination Sum", text: () => [`Given an array of <strong>distinct</strong> integers ${C("candidates")} and a target integer ${C("target")}, return <em>a list of all <strong>unique combinations</strong> of</em> ${C("candidates")} <em>where the chosen numbers sum to</em> ${C("target")}<em>.</em> You may return the combinations in <strong>any order</strong>.`, `The <strong>same</strong> number may be chosen from ${C("candidates")} an <strong>unlimited number of times</strong>. Two combinations are unique if the frequency of at least one of the chosen numbers is different.`] }],
  gen: () => { for (;;) { const c = sorted(distinct(ri(2, 4), 2, 8)), t = ri(3, 10); const out = combSum(c, t); if (out.length <= 6) return { candidates: c, target: t }; } },
  solve: ({ candidates, target }) => combSum(candidates, target),
  cons: () => [`1 <= candidates.length <= 30`, `2 <= candidates[i] <= 40`, `All elements of candidates are distinct.`, `1 <= target <= 40`],
  why: "Enumerate combinations that hit a target with reuse: backtrack, recurse with the same index, prune when the sum overshoots.",
  needs: ["Recurse with i (reuse allowed)", "Prune when remaining < 0", "Start index prevents permutations of the same combo"] });
function combSum(c, t) { const out = []; const bt = (s, rem, p) => { if (rem === 0) { out.push(p.slice()); return; } for (let i = s; i < c.length; i++) { if (c[i] > rem) break; p.push(c[i]); bt(i, rem - c[i], p); p.pop(); } }; bt(0, t, []); return out; }
T({ id: "bt-combine", p: "subsets", diff: "Medium",
  stories: [{ title: "Combinations", text: () => [`Given two integers ${C("n")} and ${C("k")}, return <em>all possible combinations of</em> ${C("k")} <em>numbers chosen from the range</em> ${C("[1, n]")}.`, `You may return the answer in <strong>any order</strong>.`] }],
  gen: () => { const n = ri(1, 4); return { n, k: ri(1, n) }; },
  solve: ({ n, k }) => { const out = []; const bt = (s, p) => { if (p.length === k) { out.push(p.slice()); return; } for (let i = s; i <= n; i++) { p.push(i); bt(i + 1, p); p.pop(); } }; bt(1, []); return out; },
  cons: () => [`1 <= n <= 20`, `1 <= k <= n`],
  why: "Choose k of n: backtrack with a start index and record at size k.",
  needs: ["Start index", "Stop at length k", "Pruning: not enough numbers left"] });
T({ id: "bt-parens", p: "subsets", diff: "Medium",
  stories: [{ title: "Generate Parentheses", text: () => [`Given ${C("n")} pairs of parentheses, write a function to <em>generate all combinations of well-formed parentheses</em>.`] }],
  gen: i => ({ n: i === 0 ? ri(1, 2) : 3 }),
  solve: ({ n }) => { const out = []; const bt = (s, o, c) => { if (s.length === 2 * n) { out.push(s); return; } if (o < n) bt(s + "(", o + 1, c); if (c < o) bt(s + ")", o, c + 1); }; bt("", 0, 0); return out; },
  cons: () => [`1 <= n <= 8`],
  why: "Generate every valid string by choosing '(' or ')' at each step, with rules that keep the prefix valid.",
  needs: ["Add '(' while open < n", "Add ')' while close < open", "Record at length 2n"] });
T({ id: "bt-phone", p: "subsets", diff: "Medium",
  stories: [{ title: "Letter Combinations of a Phone Number", text: () => [`Given a string containing digits from ${C("2-9")} inclusive, return all possible letter combinations that the number could represent. Return the answer in <strong>any order</strong>.`, `A mapping of digits to letters (just like on the telephone buttons) is given: ${C('2 → "abc", 3 → "def", 4 → "ghi", 5 → "jkl", 6 → "mno", 7 → "pqrs", 8 → "tuv", 9 → "wxyz"')}. Note that 1 does not map to any letters.`] }],
  gen: i => ({ digits: word(i === 0 ? ri(0, 1) : 2, "23456789") }),
  solve: ({ digits }) => { if (!digits) return []; const m = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" }; let r = [""]; for (const d of digits) r = r.flatMap(p => [...m[d]].map(c => p + c)); return r; },
  cons: () => [`0 <= digits.length <= 4`, `digits[i] is a digit in the range ['2', '9'].`],
  why: "Every combination of one choice per position: backtracking depth = number of digits.",
  needs: ["One recursion level per digit", "Loop over that digit's letters", "Empty input → empty list"] });
T({ id: "bt-palpart", p: "subsets", diff: "Medium",
  stories: [{ title: "Palindrome Partitioning", text: () => [`Given a string ${C("s")}, partition ${C("s")} such that every substring of the partition is a <strong>palindrome</strong>. Return <em>all possible palindrome partitioning of</em> ${C("s")}.`] }],
  gen: () => ({ s: word(ri(1, 4), "aab") }),
  solve: ({ s }) => { const out = [], pal = t => t === [...t].reverse().join(""); const bt = (i, p) => { if (i === s.length) { out.push(p.slice()); return; } for (let j = i + 1; j <= s.length; j++) { const t = s.slice(i, j); if (pal(t)) { p.push(t); bt(j, p); p.pop(); } } }; bt(0, []); return out; },
  cons: () => [`1 <= s.length <= 16`, `s contains only lowercase English letters.`],
  why: "All ways to cut a string: at each position choose the next cut, recurse only when the piece is a palindrome.",
  needs: ["Choose the end of the next piece", "Recurse only on palindromic pieces", "Record when the whole string is consumed"] });
T({ id: "bt-combsum3", p: "subsets", diff: "Medium",
  stories: [{ title: "Combination Sum III", text: () => [`Find all valid combinations of ${C("k")} numbers that sum up to ${C("n")} such that the following conditions are true:`, `<ul><li>Only numbers ${C("1")} through ${C("9")} are used.</li><li>Each number is used <strong>at most once</strong>.</li></ul>`, `Return <em>a list of all possible valid combinations</em>. The list must not contain the same combination twice, and the combinations may be returned in any order.`] }],
  gen: () => { for (;;) { const k = ri(2, 3), n = ri(3, 15); const o = cs3(k, n); if (o.length <= 6) return { k, n }; } },
  solve: ({ k, n }) => cs3(k, n),
  cons: () => [`2 <= k <= 9`, `1 <= n <= 60`],
  why: "Choose k distinct digits with a target sum: backtracking with a start index and pruning.",
  needs: ["Start index (each number at most once)", "Stop at length k", "Prune when the sum exceeds n"] });
function cs3(k, n) { const out = []; const bt = (s, rem, p) => { if (p.length === k) { if (rem === 0) out.push(p.slice()); return; } for (let i = s; i <= 9 && i <= rem; i++) { p.push(i); bt(i + 1, rem - i, p); p.pop(); } }; bt(1, n, []); return out; }

// ================= ARRAYS & HASHING =================
T({ id: "ah-2sum", p: "arrays_hashing", diff: "Easy",
  stories: [{ title: "Two Sum", text: () => [`Given an array of integers ${C("nums")} and an integer ${C("target")}, return <em>indices of the two numbers such that they add up to</em> ${C("target")}.`, `You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.`, `You can return the answer in any order.`] }],
  gen: () => { for (;;) { const n = ri(3, 7), a = arr(n, -5, 15), x = ri(0, n - 2), y = ri(x + 1, n - 1), t = a[x] + a[y]; let c = 0; for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) if (a[p] + a[q] === t) c++; if (c === 1) return { nums: a, target: t }; } },
  solve: ({ nums: a, target: t }) => { for (let p = 0; p < a.length; p++) for (let q = p + 1; q < a.length; q++) if (a[p] + a[q] === t) return [p, q]; },
  cons: () => [`2 <= nums.length <= 10<sup>4</sup>`, `-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup>`, `-10<sup>9</sup> <= target <= 10<sup>9</sup>`, `Only one valid answer exists.`],
  follow: "Can you come up with an algorithm that is less than O(n<sup>2</sup>) time complexity?",
  why: "Unsorted, and indices must be returned, so sorting breaks them. A map from value to index finds each complement in O(1).",
  needs: ["Map value → index", "Check the complement before inserting the current value", "One pass"] });
T({ id: "ah-dup", p: "arrays_hashing", diff: "Easy",
  stories: [{ title: "Contains Duplicate", text: () => [`Given an integer array ${C("nums")}, return ${C("true")} if any value appears <strong>at least twice</strong> in the array, and return ${C("false")} if every element is distinct.`] }],
  gen: i => ({ nums: Math.random() < 0.5 ? distinct(ri(3, 6 + i), 1, 20) : arr(ri(4, 6 + i), 1, 8) }),
  solve: ({ nums }) => new Set(nums).size !== nums.length,
  cons: () => [`1 <= nums.length <= 10<sup>5</sup>`, `-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup>`],
  why: "Membership test while scanning: a hash set.",
  needs: ["Hash set", "Early return on the first repeat"] });
T({ id: "ah-anagram", p: "arrays_hashing", diff: "Easy",
  stories: [{ title: "Valid Anagram", text: () => [`Given two strings ${C("s")} and ${C("t")}, return ${C("true")} if ${C("t")} is an <strong>anagram</strong> of ${C("s")}, and ${C("false")} otherwise.`] }],
  gen: () => { const s = word(ri(3, 8), "abcdenr"); let t = shuffle([...s]).join(""); if (Math.random() < 0.45) t = t.slice(0, -1) + pick("abcdenr"); return { s, t }; },
  solve: ({ s, t }) => [...s].sort().join("") === [...t].sort().join(""),
  cons: () => [`1 <= s.length, t.length <= 5 * 10<sup>4</sup>`, `s and t consist of lowercase English letters.`],
  follow: "What if the inputs contain Unicode characters? How would you adapt your solution to such a case?",
  why: "Same letters with the same counts: compare frequency maps.",
  needs: ["Count array of size 26 or a hash map", "Length check first"] });
T({ id: "ah-group", p: "arrays_hashing", diff: "Medium",
  stories: [{ title: "Group Anagrams", text: () => [`Given an array of strings ${C("strs")}, group the <strong>anagrams</strong> together. You can return the answer in <strong>any order</strong>.`] }],
  gen: () => { const bases = shuffle(["eat", "tan", "bat", "ate", "abc", "cab", "dog", "god", "rat", "art", "listen", "silent", "pots", "stop"]).slice(0, ri(2, 4)); const out = []; for (const b of bases) for (let i = 0; i < ri(1, 3); i++) out.push(shuffle([...b]).join("")); return { strs: shuffle([...new Set(out)]) }; },
  solve: ({ strs }) => { const m = new Map(); for (const s of strs) { const k = [...s].sort().join(""); if (!m.has(k)) m.set(k, []); m.get(k).push(s); } return [...m.values()].sort((a, b) => a.length - b.length); },
  cons: () => [`1 <= strs.length <= 10<sup>4</sup>`, `0 <= strs[i].length <= 100`, `strs[i] consists of lowercase English letters.`],
  why: "Anagrams share a canonical key (sorted letters or a count tuple); group by key in a map.",
  needs: ["Canonical key per string", "Map key → list", "Count-tuple key avoids sorting each word"] });
T({ id: "ah-longcons", p: "arrays_hashing", diff: "Medium",
  stories: [{ title: "Longest Consecutive Sequence", text: () => [`Given an unsorted array of integers ${C("nums")}, return <em>the length of the longest consecutive elements sequence.</em>`, `You must write an algorithm that runs in ${C("O(n)")} time.`] }],
  gen: i => ({ nums: arr(ri(5, 7 + i * 2), 0, 15) }),
  solve: ({ nums }) => { const s = new Set(nums); let b = 0; for (const x of s) if (!s.has(x - 1)) { let y = x; while (s.has(y + 1)) y++; b = Math.max(b, y - x + 1); } return b; },
  cons: () => [`0 <= nums.length <= 10<sup>5</sup>`, `-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup>`],
  why: "O(n) rules out sorting. Put everything in a set and only start counting from numbers with no predecessor.",
  needs: ["Hash set of all values", "Start a run only where x − 1 is absent", "Each value is visited O(1) times"] });
T({ id: "ah-subk", p: "arrays_hashing", diff: "Medium",
  stories: [{ title: "Subarray Sum Equals K", text: () => [`Given an array of integers ${C("nums")} and an integer ${C("k")}, return <em>the total number of subarrays whose sum equals to</em> ${C("k")}.`, `A subarray is a contiguous <strong>non-empty</strong> sequence of elements within an array.`] }],
  gen: i => ({ nums: arr(ri(3, 6 + i * 2), -2, 4), k: ri(-1, 5) }),
  solve: ({ nums, k }) => { let c = 0; for (let i = 0; i < nums.length; i++) { let s = 0; for (let j = i; j < nums.length; j++) { s += nums[j]; if (s === k) c++; } } return c; },
  cons: () => [`1 <= nums.length <= 2 * 10<sup>4</sup>`, `-1000 <= nums[i] <= 1000`, `-10<sup>7</sup> <= k <= 10<sup>7</sup>`],
  why: "Negative values break the sliding window. Count prefix sums in a map instead: subarrays ending here = count of (prefix − k).",
  needs: ["Prefix sums", "Map prefix → count, seeded with {0: 1}", "Why a sliding window fails with negatives"] });
T({ id: "ah-product", p: "arrays_hashing", diff: "Medium",
  stories: [{ title: "Product of Array Except Self", text: () => [`Given an integer array ${C("nums")}, return <em>an array</em> ${C("answer")} <em>such that</em> ${C("answer[i]")} <em>is equal to the product of all the elements of</em> ${C("nums")} <em>except</em> ${C("nums[i]")}.`, `You must write an algorithm that runs in ${C("O(n)")} time and without using the division operation.`] }],
  gen: i => ({ nums: arr(ri(3, 5 + i), -3, 4) }),
  solve: ({ nums }) => nums.map((_, i) => nums.reduce((a, x, j) => (j === i ? a : a * x), 1) || 0),
  cons: () => [`2 <= nums.length <= 10<sup>5</sup>`, `-30 <= nums[i] <= 30`, `The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.`],
  follow: "Can you solve the problem in O(1) extra space complexity? (The output array does not count as extra space.)",
  why: "Each answer = product of everything to the left × everything to the right; build prefix and suffix products in two passes.",
  needs: ["Prefix products left to right", "Suffix products right to left", "Reuse the output array for O(1) extra space"] });
T({ id: "ah-firstuniq", p: "arrays_hashing", diff: "Easy",
  stories: [{ title: "First Unique Character in a String", text: () => [`Given a string ${C("s")}, find the <strong>first</strong> non-repeating character in it and return its index. If it does not exist, return ${C("-1")}.`] }],
  gen: i => ({ s: word(ri(4, 7 + i * 2), "abcdel") }),
  solve: ({ s }) => { for (let i = 0; i < s.length; i++) if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return i; return -1; },
  cons: () => [`1 <= s.length <= 10<sup>5</sup>`, `s consists of only lowercase English letters.`],
  why: "Two passes: count every character, then return the first with count 1.",
  needs: ["Frequency map", "Second pass in original order"] });

// ================= STACK =================
T({ id: "st-parens", p: "stack", diff: "Easy",
  stories: [{ title: "Valid Parentheses", text: () => [`Given a string ${C("s")} containing just the characters ${C("'('")}, ${C("')'")}, ${C("'{'")}, ${C("'}'")}, ${C("'['")} and ${C("']'")}, determine if the input string is valid.`, `An input string is valid if:`, `<ol><li>Open brackets must be closed by the same type of brackets.</li><li>Open brackets must be closed in the correct order.</li><li>Every close bracket has a corresponding open bracket of the same type.</li></ol>`] }],
  gen: () => { const P = ["()", "[]", "{}"]; const mk = d => { if (d <= 0) return ""; let s = ""; while (s.length < 2 * d) { const p = pick(P); s += Math.random() < 0.5 ? p : p[0] + mk(ri(0, 1)) + p[1]; } return s; }; let s = mk(ri(1, 3)); if (Math.random() < 0.5) { const a = [...s], i = ri(0, a.length - 1); a[i] = pick([..."()[]{}"]); s = Math.random() < 0.5 ? a.join("") : shuffle(a).join(""); } return { s }; },
  solve: ({ s }) => { const st = [], m = { ")": "(", "]": "[", "}": "{" }; for (const c of s) { if ("([{".includes(c)) st.push(c); else if (st.pop() !== m[c]) return false; } return !st.length; },
  cons: () => [`1 <= s.length <= 10<sup>4</sup>`, `s consists of parentheses only '()[]{}'.`],
  why: "The most recent unmatched opener must close first: last in, first out.",
  needs: ["Push openers, pop on closers", "Check the popped type", "Stack must be empty at the end"] });
T({ id: "st-temps", p: "stack", diff: "Medium",
  stories: [
    { title: "Daily Temperatures", text: () => [`Given an array of integers ${C("temperatures")} represents the daily temperatures, return <em>an array</em> ${C("answer")} <em>such that</em> ${C("answer[i]")} <em>is the number of days you have to wait after the</em> ${C("i<sup>th</sup>")} <em>day to get a warmer temperature</em>. If there is no future day for which this is possible, keep ${C("answer[i] == 0")} instead.`] },
    { title: "Days Until a Higher Price", names: { temperatures: "prices" }, text: () => [`${C("prices[i]")} is a stock's closing price on day ${C("i")}. For each day, return how many days you must wait for a strictly higher closing price, or ${C("0")} if it never comes.`] }],
  gen: i => ({ temperatures: arr(ri(4, 6 + i * 2), 30, 80) }),
  solve: ({ temperatures: t }) => t.map((x, i) => { for (let j = i + 1; j < t.length; j++) if (t[j] > x) return j - i; return 0; }),
  cons: N => [`1 <= ${N("temperatures")}.length <= 10<sup>5</sup>`, `30 <= ${N("temperatures")}[i] <= 100`],
  why: "'Next greater element to the right': a monotonic stack of unresolved indices, popped when a larger value arrives.",
  needs: ["Stack of indices with decreasing values", "On pop, answer = i − popped index", "Each index pushed and popped once"] });
const rpnEval = toks => { const st = []; for (const t of toks) { if ("+-*/".includes(t) && t.length === 1) { const b = st.pop(), a = st.pop(); if (t === "/" && b === 0) throw 0; st.push(t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : Math.trunc(a / b)); } else st.push(+t); } return st[0]; };
T({ id: "st-rpn", p: "stack", diff: "Medium",
  stories: [{ title: "Evaluate Reverse Polish Notation", text: () => [`You are given an array of strings ${C("tokens")} that represents an arithmetic expression in a Reverse Polish Notation.`, `Evaluate the expression. Return <em>an integer that represents the value of the expression</em>.`, `<strong>Note</strong> that the valid operators are ${C("'+'")}, ${C("'-'")}, ${C("'*'")}, and ${C("'/'")}. The division between two integers always <strong>truncates toward zero</strong>. There will not be any division by zero.`] }],
  gen: () => { for (;;) { const toks = []; const b = d => { if (d === 0 || Math.random() < 0.3) { toks.push(String(ri(-3, 13))); return; } b(d - 1); b(d - 1); toks.push(pick(["+", "-", "*", "/"])); }; b(ri(2, 3)); if (toks.length < 3 || toks.length > 9) continue; try { const v = rpnEval(toks); if (Number.isFinite(v) && Math.abs(v) < 1e6) return { tokens: toks }; } catch (e) {} } },
  solve: ({ tokens }) => rpnEval(tokens),
  cons: () => [`1 <= tokens.length <= 10<sup>4</sup>`, `tokens[i] is either an operator: "+", "-", "*", or "/", or an integer in the range [-200, 200].`],
  why: "Operands wait until an operator consumes the two most recent ones: a stack.",
  needs: ["Push numbers", "Pop b then a for an operator", "Truncate division toward zero"] });
T({ id: "st-nge", p: "stack", diff: "Medium",
  stories: [{ title: "Next Greater Element to the Right", text: () => [`Given an integer array ${C("nums")}, return an array ${C("answer")} where ${C("answer[i]")} is the first element to the right of index ${C("i")} that is <strong>strictly greater</strong> than ${C("nums[i]")}. If no such element exists, ${C("answer[i] = -1")}.`] }],
  gen: i => ({ nums: arr(ri(4, 6 + i * 2), 1, 9) }),
  solve: ({ nums }) => nums.map((x, i) => { for (let j = i + 1; j < nums.length; j++) if (nums[j] > x) return nums[j]; return -1; }),
  cons: () => [`1 <= nums.length <= 10<sup>5</sup>`, `-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup>`],
  follow: "Can you do it in O(n) time?",
  why: "Classic monotonic stack: pending indices wait until a larger value resolves them.",
  needs: ["Decreasing stack of indices", "Pop while the top is smaller than the current value", "Unresolved indices stay -1"] });
T({ id: "st-histogram", p: "stack", diff: "Hard",
  stories: [{ title: "Largest Rectangle in Histogram", text: () => [`Given an array of integers ${C("heights")} representing the histogram's bar height where the width of each bar is ${C("1")}, return <em>the area of the largest rectangle in the histogram</em>.`] }],
  gen: i => ({ heights: arr(ri(3, 6 + i * 2), 0, 6) }),
  solve: ({ heights: h }) => { let b = 0; for (let i = 0; i < h.length; i++) { let m = Infinity; for (let j = i; j < h.length; j++) { m = Math.min(m, h[j]); b = Math.max(b, m * (j - i + 1)); } } return b; },
  cons: () => [`1 <= heights.length <= 10<sup>5</sup>`, `0 <= heights[i] <= 10<sup>4</sup>`],
  why: "Each bar extends until a shorter bar on each side; a monotonic increasing stack finds both boundaries in one pass.",
  needs: ["Increasing stack of indices", "On pop, width spans from the new top + 1 to i − 1", "Sentinel 0 at the end flushes the stack"] });
T({ id: "st-adjdup", p: "stack", diff: "Easy",
  stories: [{ title: "Remove All Adjacent Duplicates In String", text: () => [`You are given a string ${C("s")} consisting of lowercase English letters. A <strong>duplicate removal</strong> consists of choosing two <strong>adjacent</strong> and <strong>equal</strong> letters and removing them.`, `We repeatedly make <strong>duplicate removals</strong> on ${C("s")} until we no longer can.`, `Return <em>the final string after all such duplicate removals have been made</em>. It can be proven that the answer is <strong>unique</strong>.`] }],
  gen: i => ({ s: word(ri(4, 7 + i * 2), "abc") }),
  solve: ({ s }) => { const st = []; for (const c of s) { if (st[st.length - 1] === c) st.pop(); else st.push(c); } return st.join(""); },
  cons: () => [`1 <= s.length <= 10<sup>5</sup>`, `s consists of lowercase English letters.`],
  why: "A removal can expose a new adjacent pair, which matches the top of a stack.",
  needs: ["Compare with the stack top", "Pop on match, push otherwise", "Join the stack for the result"] });
T({ id: "st-asteroids", p: "stack", diff: "Medium",
  stories: [{ title: "Asteroid Collision", text: () => [`We are given an array ${C("asteroids")} of integers representing asteroids in a row. The indices of the asteroid in the array represent their relative position in space.`, `For each asteroid, the absolute value represents its size, and the sign represents its direction (positive meaning right, negative meaning left). Each asteroid moves at the same speed.`, `Find out the state of the asteroids after all collisions. If two asteroids meet, the smaller one will explode. If both are the same size, both will explode. Two asteroids moving in the same direction will never meet.`] }],
  gen: i => ({ asteroids: arr(ri(3, 5 + i), 1, 10).map(x => (Math.random() < 0.5 ? -x : x)) }),
  solve: ({ asteroids }) => { const st = []; for (let a of asteroids) { let alive = true; while (alive && a < 0 && st.length && st[st.length - 1] > 0) { const t = st[st.length - 1]; if (t < -a) st.pop(); else { if (t === -a) st.pop(); alive = false; } } if (alive) st.push(a); } return st; },
  cons: () => [`2 <= asteroids.length <= 10<sup>4</sup>`, `-1000 <= asteroids[i] <= 1000`, `asteroids[i] != 0`],
  why: "A left-moving asteroid collides with the most recent right-moving survivors, so survivors live on a stack.",
  needs: ["Collisions only when top > 0 and current < 0", "Loop: pop smaller tops", "Handle equal sizes"] });

// ================= LINKED LIST =================
const listGen = (lo, hi, vlo, vhi) => i => ({ head: arr(ri(lo, hi + i), vlo, vhi) });
T({ id: "ll-reverse", p: "linked_list", diff: "Easy",
  stories: [{ title: "Reverse Linked List", text: () => [`Given the ${C("head")} of a singly linked list, reverse the list, and return <em>the reversed list</em>.`] }],
  gen: listGen(0, 5, 1, 9), solve: ({ head }) => head.slice().reverse(),
  cons: () => [`The number of nodes in the list is the range [0, 5000].`, `-5000 <= Node.val <= 5000`],
  follow: "A linked list can be reversed either iteratively or recursively. Could you implement both?",
  why: "Rewire each next pointer backwards while holding onto the rest of the list.",
  needs: ["prev / curr / next trio", "Save next before overwriting", "Return prev"] });
T({ id: "ll-merge", p: "linked_list", diff: "Easy",
  stories: [{ title: "Merge Two Sorted Lists", text: () => [`You are given the heads of two sorted linked lists ${C("list1")} and ${C("list2")}.`, `Merge the two lists into one <strong>sorted</strong> list. The list should be made by splicing together the nodes of the first two lists.`, `Return <em>the head of the merged linked list</em>.`] }],
  gen: () => ({ list1: sorted(arr(ri(0, 4), 1, 9)), list2: sorted(arr(ri(0, 4), 1, 9)) }),
  solve: ({ list1, list2 }) => sorted(list1.concat(list2)),
  cons: () => [`The number of nodes in both lists is in the range [0, 50].`, `-100 <= Node.val <= 100`, `Both list1 and list2 are sorted in non-decreasing order.`],
  why: "Splice nodes from two lists by always attaching the smaller head; a dummy node removes the empty-start special case.",
  needs: ["Dummy head", "Attach smaller node and advance", "Attach the leftover list"] });
T({ id: "ll-nth", p: "linked_list", diff: "Medium",
  stories: [{ title: "Remove Nth Node From End of List", text: () => [`Given the ${C("head")} of a linked list, remove the ${C("n<sup>th</sup>")} node from the end of the list and return its head.`] }],
  gen: i => { const head = arr(ri(1, 5 + i), 1, 9); return { head, n: ri(1, head.length) }; },
  solve: ({ head, n }) => { const a = head.slice(); a.splice(a.length - n, 1); return a; },
  cons: () => [`The number of nodes in the list is sz.`, `1 <= sz <= 30`, `0 <= Node.val <= 100`, `1 <= n <= sz`],
  follow: "Could you do this in one pass?",
  why: "One pass from the end: keep two pointers n apart so the trailing one stops just before the target.",
  needs: ["Gap of n between fast and slow", "Dummy head so removing the first node works", "slow.next = slow.next.next"] });
T({ id: "ll-middle", p: "linked_list", diff: "Easy",
  stories: [{ title: "Middle of the Linked List", text: () => [`Given the ${C("head")} of a singly linked list, return <em>the middle node of the linked list</em>.`, `If there are two middle nodes, return <strong>the second middle</strong> node.`] }],
  gen: listGen(1, 6, 1, 9), solve: ({ head }) => head.slice(Math.floor(head.length / 2)),
  cons: () => [`The number of nodes in the list is in the range [1, 100].`, `1 <= Node.val <= 100`],
  why: "Fast pointer moves two steps per slow step; when fast reaches the end, slow is in the middle.",
  needs: ["Fast and slow pointers", "Loop while fast and fast.next", "Second middle for even length"] });
T({ id: "ll-cycle", p: "linked_list", diff: "Easy",
  stories: [{ title: "Linked List Cycle", text: () => [`Given ${C("head")}, the head of a linked list, determine if the linked list has a cycle in it.`, `There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the ${C("next")} pointer. Internally, ${C("pos")} is used to denote the index of the node that tail's ${C("next")} pointer is connected to. <strong>Note that</strong> ${C("pos")} <strong>is not passed as a parameter</strong>.`, `Return ${C("true")} <em>if there is a cycle in the linked list</em>. Otherwise, return ${C("false")}.`] }],
  gen: () => { const head = arr(ri(1, 6), -4, 9); return { head, pos: Math.random() < 0.5 ? -1 : ri(0, head.length - 1) }; },
  solve: ({ pos }) => pos !== -1,
  cons: () => [`The number of the nodes in the list is in the range [0, 10<sup>4</sup>].`, `-10<sup>5</sup> <= Node.val <= 10<sup>5</sup>`, `pos is -1 or a valid index in the linked-list.`],
  follow: "Can you solve it using O(1) (i.e. constant) memory?",
  why: "With O(1) memory, a fast pointer that laps a slow pointer proves a cycle (Floyd's algorithm).",
  needs: ["Fast and slow pointers", "Meet → cycle; fast hits null → no cycle"] });
T({ id: "ll-revbetween", p: "linked_list", diff: "Medium",
  stories: [{ title: "Reverse Linked List II", text: () => [`Given the ${C("head")} of a singly linked list and two integers ${C("left")} and ${C("right")} where ${C("left <= right")}, reverse the nodes of the list from position ${C("left")} to position ${C("right")}, and return <em>the reversed list</em>.`] }],
  gen: i => { const head = arr(ri(1, 5 + i), 1, 9), l = ri(1, head.length); return { head, left: l, right: ri(l, head.length) }; },
  solve: ({ head, left, right }) => head.slice(0, left - 1).concat(head.slice(left - 1, right).reverse(), head.slice(right)),
  cons: () => [`The number of nodes in the list is n.`, `1 <= n <= 500`, `-500 <= Node.val <= 500`, `1 <= left <= right <= n`],
  follow: "Could you do it in one pass?",
  why: "Walk to the node before 'left', reverse the sublist in place, then reconnect both ends.",
  needs: ["Dummy head", "Stop at the node before left", "Reverse right − left + 1 nodes and reconnect"] });
T({ id: "ll-add", p: "linked_list", diff: "Medium",
  stories: [{ title: "Add Two Numbers", text: () => [`You are given two <strong>non-empty</strong> linked lists representing two non-negative integers. The digits are stored in <strong>reverse order</strong>, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.`, `You may assume the two numbers do not contain any leading zero, except the number 0 itself.`] }],
  gen: () => { const num = () => { const d = arr(ri(1, 4), 0, 9); if (d.length > 1 && d[d.length - 1] === 0) d[d.length - 1] = ri(1, 9); return d; }; return { l1: num(), l2: num() }; },
  solve: ({ l1, l2 }) => { const out = []; let c = 0; for (let i = 0; i < Math.max(l1.length, l2.length) || c; i++) { const s = (l1[i] || 0) + (l2[i] || 0) + c; out.push(s % 10); c = Math.floor(s / 10); } return out; },
  cons: () => [`The number of nodes in each linked list is in the range [1, 100].`, `0 <= Node.val <= 9`, `It is guaranteed that the list represents a number that does not have leading zeros.`],
  why: "Walk both lists in step building a new list, carrying between digits; a dummy head simplifies building.",
  needs: ["Dummy head for the result", "Carry handling", "Continue while either list or the carry remains"] });
T({ id: "ll-reorder", p: "linked_list", diff: "Medium",
  stories: [{ title: "Reorder List", text: () => [`You are given the head of a singly linked-list. The list can be represented as: ${C("L<sub>0</sub> → L<sub>1</sub> → … → L<sub>n - 1</sub> → L<sub>n</sub>")}`, `<em>Reorder the list to be on the following form:</em> ${C("L<sub>0</sub> → L<sub>n</sub> → L<sub>1</sub> → L<sub>n - 1</sub> → L<sub>2</sub> → L<sub>n - 2</sub> → …")}`, `You may not modify the values in the list's nodes. Only nodes themselves may be changed.`] }],
  gen: listGen(1, 6, 1, 9), solve: ({ head }) => { const out = []; let i = 0, j = head.length - 1; while (i <= j) { out.push(head[i++]); if (i <= j) out.push(head[j--]); } return out; },
  cons: () => [`The number of nodes in the list is in the range [1, 5 * 10<sup>4</sup>].`, `1 <= Node.val <= 1000`],
  why: "Three list moves: find the middle, reverse the second half, then interleave the two halves.",
  needs: ["Fast/slow to find the middle", "Reverse the second half", "Merge alternately"] });
T({ id: "ll-removeval", p: "linked_list", diff: "Easy",
  stories: [{ title: "Remove Linked List Elements", text: () => [`Given the ${C("head")} of a linked list and an integer ${C("val")}, remove all the nodes of the linked list that has ${C("Node.val == val")}, and return <em>the new head</em>.`] }],
  gen: i => { const head = arr(ri(0, 6 + i), 1, 5); return { head, val: ri(1, 5) }; },
  solve: ({ head, val }) => head.filter(x => x !== val),
  cons: () => [`The number of nodes in the list is in the range [0, 10<sup>4</sup>].`, `1 <= Node.val <= 50`, `0 <= val <= 50`],
  why: "Skip nodes by rewiring prev.next; a dummy head handles removals at the front.",
  needs: ["Dummy head", "Skip by prev.next = curr.next", "Only advance prev when keeping a node"] });

// ================= GRAPHS =================
const islandGrid = () => grid(ri(3, 5), ri(3, 6), () => (Math.random() < 0.45 ? "1" : "0"));
const flood = (g, r, c, ok, mark) => { if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || !ok(g[r][c])) return 0; mark(r, c); let s = 1; for (const [dr, dc] of DIR4) s += flood(g, r + dr, c + dc, ok, mark); return s; };
T({ id: "gr-islands", p: "graphs", diff: "Medium",
  stories: [{ title: "Number of Islands", text: () => [`Given an ${C("m x n")} 2D binary grid ${C("grid")} which represents a map of ${C("'1'")}s (land) and ${C("'0'")}s (water), return <em>the number of islands</em>.`, `An <strong>island</strong> is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`] }],
  gen: () => ({ grid: islandGrid() }),
  solve: ({ grid: g0 }) => { const g = g0.map(r => r.slice()); let n = 0; g.forEach((row, r) => row.forEach((v, c) => { if (g[r][c] === "1") { n++; flood(g, r, c, x => x === "1", (a, b) => (g[a][b] = "0")); } })); return n; },
  cons: () => [`m == grid.length`, `n == grid[i].length`, `1 <= m, n <= 300`, `grid[i][j] is '0' or '1'.`],
  why: "Counting connected regions: every unvisited land cell starts a DFS/BFS that marks the whole island.",
  needs: ["4-direction neighbors with bounds checks", "Mark visited (sink the cell)", "Count traversal starts"] });
T({ id: "gr-maxarea", p: "graphs", diff: "Medium",
  stories: [{ title: "Max Area of Island", text: () => [`You are given an ${C("m x n")} binary matrix ${C("grid")}. An island is a group of ${C("1")}'s (representing land) connected <strong>4-directionally</strong> (horizontal or vertical.) You may assume all four edges of the grid are surrounded by water.`, `The <strong>area</strong> of an island is the number of cells with a value ${C("1")} in the island.`, `Return <em>the maximum <strong>area</strong> of an island in</em> ${C("grid")}. If there is no island, return ${C("0")}.`] }],
  gen: () => ({ grid: grid(ri(3, 5), ri(3, 6), () => (Math.random() < 0.45 ? 1 : 0)) }),
  solve: ({ grid: g0 }) => { const g = g0.map(r => r.slice()); let b = 0; g.forEach((row, r) => row.forEach((v, c) => { if (g[r][c] === 1) b = Math.max(b, flood(g, r, c, x => x === 1, (a, d) => (g[a][d] = 0))); })); return b; },
  cons: () => [`m == grid.length`, `n == grid[i].length`, `1 <= m, n <= 50`, `grid[i][j] is either 0 or 1.`],
  why: "Connected components on a grid, returning each component's size from the DFS.",
  needs: ["DFS returns the area", "Mark visited", "Track the maximum"] });
T({ id: "gr-rotting", p: "graphs", diff: "Medium",
  stories: [{ title: "Rotting Oranges", text: () => [`You are given an ${C("m x n")} ${C("grid")} where each cell can have one of three values:`, `<ul><li>${C("0")} representing an empty cell,</li><li>${C("1")} representing a fresh orange, or</li><li>${C("2")} representing a rotten orange.</li></ul>`, `Every minute, any fresh orange that is <strong>4-directionally adjacent</strong> to a rotten orange becomes rotten.`, `Return <em>the minimum number of minutes that must elapse until no cell has a fresh orange</em>. If <em>this is impossible, return</em> ${C("-1")}.`] }],
  gen: () => ({ grid: grid(ri(2, 4), ri(3, 4), () => pick([0, 1, 1, 1, 2])) }),
  solve: ({ grid: g0 }) => { const g = g0.map(r => r.slice()); let q = [], fresh = 0, t = 0; g.forEach((row, r) => row.forEach((v, c) => { if (v === 2) q.push([r, c]); if (v === 1) fresh++; })); while (q.length && fresh) { const nq = []; for (const [r, c] of q) for (const [dr, dc] of DIR4) { const a = r + dr, b = c + dc; if (g[a] && g[a][b] === 1) { g[a][b] = 2; fresh--; nq.push([a, b]); } } q = nq; t++; } return fresh ? -1 : t; },
  cons: () => [`m == grid.length`, `n == grid[i].length`, `1 <= m, n <= 10`, `grid[i][j] is 0, 1, or 2.`],
  why: "Spreading one step per minute from many sources is multi-source BFS on a grid; minutes = BFS layers.",
  needs: ["Seed the queue with every rotten orange", "Process layer by layer", "Count fresh to detect -1"] });
T({ id: "gr-components", p: "graphs", diff: "Medium",
  stories: [{ title: "Number of Connected Components in an Undirected Graph", text: () => [`You have a graph of ${C("n")} nodes. You are given an integer ${C("n")} and an array ${C("edges")} where ${C("edges[i] = [a<sub>i</sub>, b<sub>i</sub>]")} indicates that there is an edge between ${C("a<sub>i</sub>")} and ${C("b<sub>i</sub>")} in the graph.`, `Return <em>the number of connected components in the graph</em>.`] }],
  gen: () => { const n = ri(3, 7), s = new Set(), e = []; for (let k = 0; k < ri(1, n); k++) { const a = ri(0, n - 1), b = ri(0, n - 1); if (a === b || s.has(Math.min(a, b) + "," + Math.max(a, b))) continue; s.add(Math.min(a, b) + "," + Math.max(a, b)); e.push([a, b]); } return { n, edges: e }; },
  solve: ({ n, edges }) => { const p = range(0, n - 1), f = x => (p[x] === x ? x : (p[x] = f(p[x]))); let c = n; for (const [a, b] of edges) { const x = f(a), y = f(b); if (x !== y) { p[x] = y; c--; } } return c; },
  cons: () => [`1 <= n <= 2000`, `1 <= edges.length <= 5000`, `edges[i].length == 2`, `0 <= a<sub>i</sub> <= b<sub>i</sub> < n`, `a<sub>i</sub> != b<sub>i</sub>`, `There are no repeated edges.`],
  why: "Counting connected pieces: DFS from each unvisited node (or union-find merges).",
  needs: ["Adjacency list from edges", "Visited set, one traversal per component", "Union-find as an alternative"] });
T({ id: "gr-flood", p: "graphs", diff: "Easy",
  stories: [{ title: "Flood Fill", text: () => [`You are given an image represented by an ${C("m x n")} grid of integers ${C("image")}, where ${C("image[i][j]")} represents the pixel value of the image. You are also given three integers ${C("sr")}, ${C("sc")}, and ${C("color")}. Your task is to perform a <strong>flood fill</strong> on the image starting from the pixel ${C("image[sr][sc]")}.`, `Change the color of the starting pixel and every pixel connected 4-directionally to it that has the same original color, repeatedly. Return <em>the modified image after performing the flood fill</em>.`] }],
  gen: () => { const im = grid(ri(2, 4), ri(2, 4), () => ri(0, 2)); return { image: im, sr: ri(0, im.length - 1), sc: ri(0, im[0].length - 1), color: ri(0, 3) }; },
  solve: ({ image, sr, sc, color }) => { const g = image.map(r => r.slice()), o = g[sr][sc]; if (o === color) return g; flood(g, sr, sc, x => x === o, (a, b) => (g[a][b] = color)); return g; },
  cons: () => [`m == image.length`, `n == image[i].length`, `1 <= m, n <= 50`, `0 <= image[i][j], color < 2<sup>16</sup>`, `0 <= sr < m`, `0 <= sc < n`],
  why: "Recolor one connected region of equal pixels: DFS/BFS from the start cell.",
  needs: ["DFS over same-colored neighbors", "Early return if the color is unchanged (avoids infinite loop)"] });
T({ id: "gr-shortest", p: "graphs", diff: "Medium",
  stories: [{ title: "Shortest Path in Binary Matrix", text: () => [`Given an ${C("n x n")} binary matrix ${C("grid")}, return <em>the length of the shortest <strong>clear path</strong> in the matrix</em>. If there is no clear path, return ${C("-1")}.`, `A <strong>clear path</strong> in a binary matrix is a path from the <strong>top-left</strong> cell (i.e., ${C("(0, 0)")}) to the <strong>bottom-right</strong> cell (i.e., ${C("(n - 1, n - 1)")}) such that all the visited cells of the path are ${C("0")}, and all the adjacent cells of the path are <strong>8-directionally</strong> connected.`, `The <strong>length of a clear path</strong> is the number of visited cells of this path.`] }],
  gen: () => { const n = ri(2, 4); return { grid: grid(n, n, () => (Math.random() < 0.3 ? 1 : 0)) }; },
  solve: ({ grid: g }) => { const n = g.length; if (g[0][0] || g[n - 1][n - 1]) return -1; const d = grid(n, n, () => 0); d[0][0] = 1; const q = [[0, 0]]; while (q.length) { const [r, c] = q.shift(); if (r === n - 1 && c === n - 1) return d[r][c]; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const a = r + dr, b = c + dc; if (a >= 0 && b >= 0 && a < n && b < n && !g[a][b] && !d[a][b]) { d[a][b] = d[r][c] + 1; q.push([a, b]); } } } return -1; },
  cons: () => [`n == grid.length`, `n == grid[i].length`, `1 <= n <= 100`, `grid[i][j] is 0 or 1`],
  why: "Fewest steps on an unweighted grid is BFS from the start; the first time you reach the target is the shortest.",
  needs: ["BFS with distances", "8 directions", "Blocked start or end → -1"] });
T({ id: "gr-validpath", p: "graphs", diff: "Easy",
  stories: [{ title: "Find if Path Exists in Graph", text: () => [`There is a <strong>bi-directional</strong> graph with ${C("n")} vertices, where each vertex is labeled from ${C("0")} to ${C("n - 1")} (<strong>inclusive</strong>). The edges in the graph are represented as a 2D integer array ${C("edges")}, where each ${C("edges[i] = [u<sub>i</sub>, v<sub>i</sub>]")} denotes a bi-directional edge between vertex ${C("u<sub>i</sub>")} and vertex ${C("v<sub>i</sub>")}.`, `Given ${C("edges")} and the integers ${C("n")}, ${C("source")}, and ${C("destination")}, return ${C("true")} <em>if there is a <strong>valid path</strong> from</em> ${C("source")} <em>to</em> ${C("destination")}<em>, or</em> ${C("false")} <em>otherwise</em>.`] }],
  gen: () => { const n = ri(3, 7), s = new Set(), e = []; for (let k = 0; k < ri(1, n); k++) { const a = ri(0, n - 1), b = ri(0, n - 1); if (a === b || s.has(Math.min(a, b) + "," + Math.max(a, b))) continue; s.add(Math.min(a, b) + "," + Math.max(a, b)); e.push([a, b]); } return { n, edges: e, source: ri(0, n - 1), destination: ri(0, n - 1) }; },
  solve: ({ n, edges, source, destination }) => { const g = Array.from({ length: n }, () => []); edges.forEach(([a, b]) => { g[a].push(b); g[b].push(a); }); const seen = new Set([source]), st = [source]; while (st.length) { const u = st.pop(); if (u === destination) return true; for (const v of g[u]) if (!seen.has(v)) { seen.add(v); st.push(v); } } return false; },
  cons: () => [`1 <= n <= 2 * 10<sup>5</sup>`, `0 <= edges.length <= 2 * 10<sup>5</sup>`, `edges[i].length == 2`, `0 <= u<sub>i</sub>, v<sub>i</sub> <= n - 1`, `u<sub>i</sub> != v<sub>i</sub>`, `0 <= source, destination <= n - 1`, `There are no duplicate edges.`, `There are no self edges.`],
  why: "Reachability between two nodes: a DFS/BFS from the source over an adjacency list.",
  needs: ["Build adjacency list (both directions)", "Visited set", "Stop when the destination is reached"] });

// ---- build one problem ----
function fmtIn(v) { return J(v); }
function fmtOut(v) { return v && typeof v === "object" && "raw" in v ? v.raw : J(v); }
function buildProblem(t) {
  const st = pick(t.stories);
  const N = k => (st.names && st.names[k]) || k;
  const gen = st.gen || t.gen, examples = [];
  for (let g = 0; examples.length < 3 && g < 80; g++) {
    const inp = gen(examples.length);
    const input = inp._in || Object.keys(inp).filter(k => k[0] !== "_" && !(inp._in)).map(k => `${N(k)} = ${fmtIn(inp[k])}`).join(", ");
    if (examples.some(e => e.input === input)) continue;
    examples.push({ input, output: fmtOut(t.solve(inp)) });
  }
  return { tid: t.id, p: t.p, diff: t.diff, title: st.title, body: st.text(N), examples, cons: t.cons(N), follow: t.follow, why: t.why, needs: t.needs };
}
if (typeof module !== "undefined") module.exports = { TEMPLATES, buildProblem };
