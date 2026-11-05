// ===== ML Reflex content: bank questions + generators =====
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const f2 = x => x.toFixed(2);
const nf = n => n.toLocaleString("en-US");
const tup = a => "(" + a.join(", ") + ")";

const CATS = {
  why: { name: "Interview Why", target: 7000, blurb: "Classic interview questions about why things work." },
  name: { name: "Name It", target: 5000, blurb: "Formula or definition → its name." },
  tool: { name: "Pick the Tool", target: 7000, blurb: "Scenario → loss, metric, method or fix." },
  diagnose: { name: "Diagnose", target: 9000, blurb: "Training symptoms → root cause." },
  compute: { name: "Compute", target: 12000, blurb: "Fast mental math: softmax, losses, metrics, parameter counts." },
  shapes: { name: "Shapes", target: 9000, blurb: "Tensor shapes through layers and attention." }
};

const ITEMS = [];
const B = (id, cat, q, a, d, x) => ITEMS.push({ id, cat, q, a, d, x });
const G = (id, cat, label, gen) => ITEMS.push({ id, cat, label, gen });

// ---------------- INTERVIEW WHY ----------------
const W = (id, q, a, d, x) => B("w-" + id, "why", q, a, d, x);
W("maxsub", "Why subtract max(z) from the logits before computing softmax?", "Numerical stability: it prevents exp overflow without changing the output", ["It makes the outputs sum to 1", "It sharpens the distribution", "It removes the bias term"], "softmax(z) = softmax(z − c) for any constant c, and the largest exponent becomes e⁰ = 1.");
W("logits", "What are logits?", "Unnormalized scores fed into a softmax or sigmoid", ["Probabilities after softmax", "The log of the labels", "Gradients of the loss w.r.t. the output"], "Logits are raw model outputs; softmax/sigmoid turns them into probabilities.");
W("smce", "Why pair softmax with cross-entropy rather than MSE for classification?", "The gradient is p − y, so it doesn't vanish when the model is confidently wrong", ["MSE can't be computed on probabilities", "Cross-entropy is always smaller than MSE", "Softmax only works with log losses"], "With MSE the softmax derivative multiplies in and saturates; CE's log cancels it.");
W("sqrtdk", "Why divide QKᵀ by √dₖ in attention?", "Dot products grow with dimension; scaling keeps softmax out of its saturated region", ["So each row sums to 1", "To make attention symmetric", "To halve memory use"], "Variance of q·k grows like dₖ; dividing by √dₖ brings it back to ~1.");
W("lnbn", "Why do Transformers use LayerNorm instead of BatchNorm?", "It normalizes each token independently of batch size and padding", ["It has fewer parameters", "BatchNorm can't follow ReLU", "LayerNorm removes the need for residuals"], "Batch statistics are noisy with variable-length sequences and small batches.");
W("dropinf", "With inverted dropout, what happens at inference?", "Dropout is off and no rescaling is needed", ["The same random mask is reused", "Activations are multiplied by the keep probability", "The drop rate doubles"], "Training already scaled kept units by 1/(1−p), so expectations match.");
W("l1sparse", "Why does L1 regularization give sparse weights but L2 doesn't?", "Its gradient has constant magnitude, pushing small weights all the way to zero", ["L1 penalizes large weights more than L2", "L2 is non-convex", "L1 adds noise to the gradient"], "L2's pull shrinks with the weight, so weights get small but rarely exactly 0.");
W("highvar", "A high-variance model typically shows…", "Low training error and much higher validation error", ["High training and validation error", "Validation error below training error", "Loss that diverges to NaN"], "High variance = overfitting: it fits noise in the training set.");
W("resid", "Main reason residual connections help very deep networks train?", "They give gradients an identity path, easing vanishing gradients", ["They reduce the parameter count", "They replace normalization", "They make the network linear"], "∂(x + F(x))/∂x = I + ∂F/∂x, so the gradient never has to pass only through F.");
W("deadrelu", "What is a dead ReLU?", "A unit whose input is always negative, so it outputs 0 and gets no gradient", ["A ReLU that saturates at 1", "A unit removed by pruning", "A ReLU with a negative slope"], "Often caused by a large learning rate knocking biases negative; Leaky ReLU avoids it.");
W("adam", "What does Adam store per parameter?", "Running averages of the gradient and the squared gradient", ["Only the last gradient", "The exact Hessian diagonal", "A learning rate found by grid search"], "m (first moment) and v (second moment), bias-corrected.");
W("adamw", "How is AdamW different from Adam + L2 penalty?", "Weight decay is applied directly to the weights, decoupled from adaptive scaling", ["AdamW has no momentum", "AdamW uses a larger epsilon", "They are identical"], "In Adam, an L2 term gets divided by √v, so decay is uneven across parameters.");
W("klasym", "Is KL divergence symmetric?", "No: KL(P‖Q) ≠ KL(Q‖P) in general", ["Yes, always", "Only for Gaussians", "Only when P is uniform"], "Forward KL is mean-seeking; reverse KL is mode-seeking.");
W("cekl", "Cross-entropy H(p, q) equals…", "H(p) + KL(p‖q)", ["KL(q‖p) − H(q)", "H(p) + H(q)", "−KL(p‖q)"], "So minimizing CE over q is the same as minimizing KL(p‖q).");
W("labelsmooth", "What does label smoothing do?", "Puts 1−ε on the true class and spreads ε over the others to curb overconfidence", ["Adds Gaussian noise to the inputs", "Averages labels across the batch", "Deletes noisy labels"], "It also tends to improve calibration.");
W("temp", "Softmax temperature T > 1 makes the distribution…", "Flatter (higher entropy)", ["Sharper", "Unchanged", "Sum to T"], "softmax(z/T): bigger T shrinks differences between logits.");
W("causal", "Why does a decoder use a causal mask?", "So position t can't attend to future tokens", ["To save memory on padding", "To make attention symmetric", "To skip the first token"], "It lets one forward pass train on every next-token prediction at once.");
W("posenc", "Why do Transformers need positional information?", "Self-attention is permutation-invariant, so it can't see token order on its own", ["To normalize the embeddings", "To shrink the vocabulary", "Softmax requires positions"], "Without it, shuffling tokens gives the same set of outputs.");
W("kvcache", "What does a KV cache speed up?", "Autoregressive decoding: past keys and values aren't recomputed per new token", ["Training backpropagation", "Tokenization", "BatchNorm statistics"], "Each step only computes K/V for the new token.");
W("ppl", "Perplexity of a language model is…", "exp(average cross-entropy per token)", ["1 / accuracy", "The average logit", "log of the vocabulary size"], "Perplexity k ≈ choosing uniformly among k tokens.");
W("teacher", "Teacher forcing means…", "Feeding the ground-truth previous token as input during training", ["Distilling from a larger model", "Forcing logits to sum to one", "Fine-tuning with RL"], "It causes exposure bias: at inference the model sees its own outputs.");
W("clip", "Gradient clipping mainly prevents…", "Exploding gradients causing huge, unstable updates", ["Vanishing gradients", "Overfitting", "Dead ReLUs"], "Clip by global norm, common in RNNs and Transformers.");
W("earlystop", "Early stopping acts as…", "Regularization: stop when validation loss stops improving", ["A learning-rate schedule", "Data augmentation", "An inference speed-up"], "It limits how far weights move from initialization.");
W("leaknorm", "Normalizing with mean/std from the full dataset before splitting causes…", "Data leakage from test into training", ["Underfitting", "Class imbalance", "Vanishing gradients"], "Fit preprocessing on the training split only.");
W("calib", "A model says 90% confidence but is right 60% of the time. It is…", "Poorly calibrated (overconfident)", ["Underfitting", "High recall", "Well calibrated"], "Fix with temperature scaling on a held-out set.");
W("cosine", "Why use cosine similarity for embeddings?", "It compares direction and ignores vector length", ["It's always positive", "It's faster than a dot product", "It only works on sparse vectors"], "On normalized vectors, cosine = dot product.");
W("lora", "LoRA fine-tunes a model by…", "Learning low-rank update matrices while freezing the original weights", ["Pruning half the layers", "Quantizing weights to 4 bits", "Retraining only the embeddings"], "W' = W + BA with rank r ≪ d, so few trainable parameters.");
W("bpe", "Byte-pair encoding builds its vocabulary by…", "Repeatedly merging the most frequent adjacent symbol pair", ["Splitting on whitespace only", "Hashing words into buckets", "Sampling random substrings"], "Common words become one token, rare words split into pieces.");
W("init", "Xavier/He initialization aims to…", "Keep activation variance roughly constant across layers", ["Make all weights equal", "Zero the bias gradients", "Maximize sparsity"], "He uses Var = 2/fan_in for ReLU; Xavier 2/(fan_in + fan_out).");
W("sigvanish", "Why do deep sigmoid networks suffer vanishing gradients?", "σ′(x) ≤ 0.25, so chained derivatives shrink layer by layer", ["Sigmoid outputs negative values", "Sigmoid isn't differentiable at 0", "Sigmoid has no bias"], "0.25ⁿ shrinks fast; ReLU's derivative is 1 on its active side.");
W("bigbatch", "Moving to a much larger batch size usually needs…", "A larger learning rate with warmup, and it may generalize slightly worse", ["Nothing; it always generalizes better", "No normalization", "Noisier gradients"], "Linear scaling rule: scale LR with batch size, warm up first.");
W("warmup", "Why use learning-rate warmup?", "Early updates are unstable (Adam's estimates are noisy); ramping LR avoids divergence", ["To overfit the first batch", "To freeze the embeddings", "To reduce memory"], "Especially important for Transformers and large batches.");
W("beam", "Beam search differs from greedy decoding because it…", "Keeps the k best partial sequences instead of only the single best token", ["Samples randomly by temperature", "Always finds the true most likely sequence", "Ignores model scores"], "It's still approximate; it can miss the global optimum.");
W("topp", "Top-p (nucleus) sampling chooses from…", "The smallest set of tokens whose cumulative probability ≥ p", ["The p most likely tokens", "Tokens with probability exactly p", "All tokens uniformly"], "The candidate set adapts to how peaked the distribution is.");
W("lstm", "LSTMs ease vanishing gradients through…", "An additive cell state controlled by gates", ["Using ReLU everywhere", "Larger batch sizes", "Weight tying"], "The forget gate lets gradient flow through c_t almost unchanged.");
W("infonce", "In contrastive learning (InfoNCE), the loss…", "Pulls positive pairs together and pushes negatives apart via a softmax over similarities", ["Pulls all embeddings toward zero", "Makes all logits equal", "Smooths the labels"], "It's cross-entropy where the positive is the 'correct class'.");
W("kfold", "Why use k-fold cross-validation?", "A lower-variance estimate of generalization when data is limited", ["It speeds up training", "It prevents leakage automatically", "It increases model capacity"], "Every example is used for validation exactly once.");
W("threshold", "Raising the classification threshold usually…", "Increases precision and lowers recall", ["Increases both", "Lowers precision and raises recall", "Changes neither"], "You predict positive less often, so fewer false positives but more misses.");
W("gradsm", "Gradient of softmax cross-entropy w.r.t. the logits z is…", "p − y", ["y − p²", "log p", "p(1 − p)"], "This clean form is why the pair is fused in frameworks.");
W("sigderiv", "σ′(x) equals…", "σ(x)(1 − σ(x))", ["1 − σ(x)²", "σ(x)²", "e^(−x)"], "Maximum 0.25 at x = 0.");
W("tanhderiv", "tanh′(x) equals…", "1 − tanh²(x)", ["tanh(x)(1 − tanh(x))", "1 + tanh²(x)", "sech(x)"], "Maximum 1 at x = 0.");
W("lse", "log Σ exp(zᵢ) is computed stably as…", "m + log Σ exp(zᵢ − m), with m = max z", ["Σ zᵢ", "log(max z)", "max z − log n"], "The same max trick as stable softmax.");
W("tying", "Weight tying in language models shares…", "The input embedding matrix and the output projection", ["Query and key projections", "All LayerNorm parameters", "Encoder and decoder biases"], "Cuts parameters by V × d and often helps.");
W("rlhf", "In RLHF, the reward model is trained on…", "Human preference comparisons between responses", ["Next-token prediction only", "Random rewards", "Gradient norms"], "Typically a Bradley–Terry loss on chosen vs rejected.");
W("fp16", "Why use loss scaling in fp16 training?", "Small gradients underflow to zero in fp16 without it", ["To make the loss positive", "To speed up the optimizer", "To regularize the model"], "bf16 has fp32's range, so it usually doesn't need it.");
W("bninfer", "At inference, BatchNorm uses…", "Running mean and variance collected during training", ["The current batch's statistics", "Zero mean and unit variance", "Per-sample statistics"], "Forgetting model.eval() keeps using batch stats.");
W("vanexp", "Why do plain RNNs struggle with long-range dependencies?", "Gradients are multiplied by the recurrent Jacobian at every step, so they vanish or explode", ["They have no hidden state", "They can't use embeddings", "Softmax limits sequence length"], "Repeated multiplication by W makes ‖grad‖ scale like λᵗ.");
W("ensemble", "Why does ensembling usually improve accuracy?", "Averaging models with different errors reduces variance", ["It increases bias", "It makes each model smaller", "It removes the need for validation"], "Works best when members' errors are not correlated.");
W("dpo", "DPO differs from PPO-based RLHF by…", "Optimizing the policy directly on preference pairs, without a separate reward model or RL loop", ["Using no human data", "Training only the embeddings", "Requiring a larger KV cache"], "It turns the RLHF objective into a classification-style loss.");

// ---------------- NAME IT ----------------
const NAMES = [
  ["act", "eᶻⁱ / Σⱼ eᶻʲ", "Softmax"], ["act", "1 / (1 + e⁻ˣ)", "Sigmoid"], ["act", "max(0, x)", "ReLU"], ["act", "x · Φ(x)", "GELU"],
  ["act", "max(αx, x), small α > 0", "Leaky ReLU"], ["act", "(eˣ − e⁻ˣ) / (eˣ + e⁻ˣ)", "tanh"],
  ["loss", "−Σᵢ yᵢ log pᵢ", "Cross-entropy loss"], ["loss", "−[y log p + (1 − y) log(1 − p)]", "Binary cross-entropy"], ["loss", "Σ p(x) log(p(x) / q(x))", "KL divergence"],
  ["loss", "(1/n) Σ (yᵢ − ŷᵢ)²", "Mean squared error"], ["loss", "(1/n) Σ |yᵢ − ŷᵢ|", "Mean absolute error"], ["loss", "max(0, 1 − y · f(x))", "Hinge loss"],
  ["loss", "−αₜ (1 − pₜ)ᵞ log pₜ", "Focal loss"], ["loss", "−log( e^(sim(a,p)/τ) / Σₖ e^(sim(a,k)/τ) )", "InfoNCE loss"], ["loss", "½e² if |e| ≤ δ, else δ(|e| − ½δ)", "Huber loss"],
  ["metric", "TP / (TP + FP)", "Precision"], ["metric", "TP / (TP + FN)", "Recall"], ["metric", "2PR / (P + R)", "F1 score"], ["metric", "TN / (TN + FP)", "Specificity"],
  ["metric", "exp(−(1/N) Σ log p(xᵢ))", "Perplexity"], ["metric", "a · b / (‖a‖ ‖b‖)", "Cosine similarity"],
  ["opt", "θ ← θ − η ∇L", "Gradient descent"], ["opt", "v ← βv + ∇L;  θ ← θ − ηv", "Momentum"], ["opt", "θ ← θ − η m̂ / (√v̂ + ε)", "Adam"],
  ["opt", "θ ← θ − η(∇L + λθ), decay outside the adaptive step", "AdamW"], ["opt", "λ ‖w‖²", "L2 regularization"], ["opt", "λ ‖w‖₁", "L1 regularization"],
  ["arch", "softmax(QKᵀ / √dₖ) V", "Scaled dot-product attention"], ["arch", "γ (x − μ) / √(σ² + ε) + β, stats over features of one token", "Layer normalization"],
  ["arch", "γ (x − μ) / √(σ² + ε) + β, stats over the batch", "Batch normalization"], ["arch", "y = x + F(x)", "Residual connection"],
  ["arch", "W + BA, with rank r ≪ d", "LoRA"], ["arch", "PE(pos, 2i) = sin(pos / 10000^(2i/d))", "Sinusoidal positional encoding"], ["arch", "log Σ exp(zᵢ)", "LogSumExp"],
  ["arch", "p(y | x) ∝ p(x | y) p(y)", "Bayes' rule"]
];
NAMES.forEach(([grp, f, n], i) => {
  const same = NAMES.filter(x => x[0] === grp && x[2] !== n).map(x => x[2]);
  const other = NAMES.filter(x => x[0] !== grp).map(x => x[2]);
  ITEMS.push({ id: "n-" + n.toLowerCase().replace(/[^a-z0-9]+/g, "-"), cat: "name", grp, q: `<span class="formula">${f}</span>`, a: n, pool: same.concat(other), x: `${f} is ${n}.` });
});

// ---------------- PICK THE TOOL ----------------
const P = (id, q, a, d, x) => B("t-" + id, "tool", q, a, d, x);
P("multilabel", "Each image can have several tags at once (beach, sunset, dog).", "Sigmoid per label + binary cross-entropy", ["Softmax + cross-entropy", "Linear output + MSE", "Argmax over one softmax"], "Labels aren't mutually exclusive, so each gets its own probability.");
P("multiclass", "Predict exactly one of 1,000 mutually exclusive classes.", "Softmax + cross-entropy", ["Sigmoid + BCE per class", "ReLU + MSE", "Hinge loss on one score"], "Mutually exclusive classes → one distribution over classes.");
P("outliers", "Predict house prices; a few listings have absurd outlier prices.", "Huber or MAE loss", ["MSE", "Cross-entropy", "Hinge loss"], "MSE squares big errors so outliers dominate the gradient.");
P("fraudmetric", "Fraud is 0.1% of transactions. Pick the evaluation metric.", "PR-AUC or recall at a fixed precision", ["Accuracy", "ROC-AUC alone", "MSE"], "Accuracy is 99.9% for always saying 'not fraud'.");
P("focal", "Dense object detection where easy background examples swamp the loss.", "Focal loss", ["MSE", "Unweighted cross-entropy", "Hinge loss"], "(1 − pₜ)ᵞ down-weights easy, well-classified examples.");
P("recall", "Cancer screening where missing a sick patient is very costly.", "Prioritize recall (lower the threshold)", ["Prioritize precision", "Optimize accuracy", "Raise the threshold"], "False negatives are the expensive error.");
P("precision", "Spam filter where hiding a real email is very costly.", "Prioritize precision (raise the threshold)", ["Prioritize recall", "Lower the threshold", "Accuracy only"], "False positives are the expensive error.");
P("contrastive", "Learn image embeddings with no labels so augmented views of one image match.", "Contrastive loss (InfoNCE / SimCLR)", ["Cross-entropy on class labels", "MSE on pixels", "Hinge loss on classes"], "The other images in the batch act as negatives.");
P("ranking", "Rank search results for a query.", "Pairwise or listwise ranking loss (e.g., LambdaRank)", ["MSE on relevance labels only", "Softmax over every document ever", "BCE on the query text"], "Ranking cares about relative order; NDCG is the usual metric.");
P("lora", "Fine-tune a 7B model on a single GPU with limited memory.", "LoRA / QLoRA adapters", ["Full fine-tuning in fp32", "Train from scratch", "Increase the batch size"], "Only small adapter matrices get gradients and optimizer state.");
P("rnnnan", "Loss jumps to NaN when training an RNN on long sequences.", "Gradient clipping", ["More dropout", "A larger learning rate", "Remove the biases"], "Exploding gradients; clip by global norm.");
P("tabular", "Small tabular dataset with mixed numeric and categorical columns.", "Gradient-boosted trees (XGBoost / LightGBM)", ["A large Transformer", "A CNN", "k-means"], "Trees are still the strong default for tabular data.");
P("small", "Only 500 labeled examples; you need a reliable estimate of performance.", "k-fold cross-validation", ["A single 50/50 split", "No validation set", "Evaluate on the training data"], "Averages over k splits to reduce variance.");
P("retrieval", "Retrieve semantically similar documents for a query at scale.", "Embeddings + approximate nearest-neighbor search", ["Exact string matching", "Softmax over all documents", "A decision tree on raw text"], "Vector search (FAISS, HNSW) scales to millions.");
P("diverse", "Generate varied text but avoid rare, incoherent tokens.", "Top-p (nucleus) sampling", ["Greedy decoding", "Uniform sampling over the vocabulary", "Temperature 0"], "It truncates the long tail while keeping variety.");
P("deterministic", "Need a deterministic, high-likelihood translation.", "Beam search", ["High-temperature sampling", "Top-k with k = 1000", "Random sampling"], "Beam search approximates the most likely sequence.");
P("macro", "Classes differ heavily in frequency; you want every class to count equally.", "Macro-averaged F1", ["Micro-averaged accuracy", "Training loss", "MSE"], "Macro averages per-class scores, so rare classes matter.");
P("calib", "Predicted probabilities feed a downstream cost calculation.", "Calibrate (temperature or Platt scaling) and check ECE", ["Maximize accuracy only", "Use argmax outputs", "Add more dropout"], "Decisions need probabilities that mean what they say.");
P("aug", "An image model is overfitting a small dataset.", "Data augmentation + regularization", ["Train for longer", "Remove dropout", "A bigger model with no other change"], "More effective data and constraints reduce variance.");
P("mobile", "Deploy a model on a phone with a tight latency budget.", "Distillation and/or quantization", ["An ensemble of 10 models", "A larger model", "Beam width 50"], "Smaller, lower-precision models run faster.");
P("ln", "Normalize activations in a Transformer with variable sequence lengths.", "LayerNorm", ["BatchNorm", "Dropout", "Max pooling"], "Per-token statistics don't depend on the batch.");
P("timeseries", "Evaluate a time-series forecaster fairly.", "Time-based (walk-forward) split", ["Random shuffle split", "Random leave-one-out", "Test on the training data"], "Shuffling leaks the future into training.");
P("active", "Labels are expensive; choose which examples to label next.", "Active learning (uncertainty sampling)", ["Random oversampling", "Label smoothing", "Early stopping"], "Label where the model is least sure.");
P("prefs", "Make a model's responses match human preferences between pairs.", "Preference optimization (RLHF / DPO)", ["Plain MSE regression", "k-means", "More pretraining only"], "Learn from 'response A is better than B' data.");
P("cluster", "Group customers when you have no labels.", "Clustering (k-means / GMM)", ["Logistic regression", "A softmax classifier", "Linear regression"], "Unsupervised grouping.");
P("lasso", "Hundreds of features; you want a few interpretable ones.", "L1 regularization (Lasso)", ["L2 regularization", "A higher learning rate", "Dropout"], "L1 drives unhelpful weights to exactly zero.");
P("drift", "Offline metrics are great but production accuracy drops month after month.", "Monitor drift and retrain on recent data", ["More epochs on the old data", "Lower dropout", "Larger batch size"], "The input distribution moved away from training data.");
P("longseq", "Very long sequences make attention memory blow up.", "Efficient attention (FlashAttention, sparse or windowed)", ["A bigger vocabulary", "More heads", "A larger batch"], "Standard attention is O(T²) in memory.");
P("decode", "Speed up autoregressive LLM inference.", "KV caching (plus batching)", ["Recompute all keys each step", "Increase beam width", "Disable the causal mask"], "Avoids recomputing past keys and values.");
P("overconf", "A classifier is overconfident; you want softer training targets.", "Label smoothing", ["A higher learning rate", "Remove regularization", "Hard-negative mining"], "Targets of 1 − ε stop logits growing without bound.");
P("imbalanceloss", "Train a classifier where the positive class is 2% of the data.", "Class-weighted loss or resampling", ["Drop the minority class", "Use accuracy as the loss", "Lower the learning rate"], "Rebalances how much each class contributes to the gradient.");
P("regression", "Predict a continuous value with roughly Gaussian noise.", "MSE loss with a linear output", ["Softmax + cross-entropy", "Sigmoid + BCE", "Hinge loss"], "MSE is the maximum-likelihood loss under Gaussian noise.");

// ---------------- DIAGNOSE (generated wording) ----------------
const CAUSES = {
  overfit: ["Overfitting", () => `Training loss falls to ${f2(Math.random() * 0.05 + 0.01)} while validation loss bottoms out at epoch ${ri(4, 12)} and then climbs every epoch after.`, "Regularize: more data or augmentation, dropout, weight decay, early stopping."],
  underfit: ["Underfitting", () => `Train and validation accuracy both sit around ${ri(55, 68)}% and stay flat for ${ri(20, 60)} epochs. The model has ${ri(2, 4)} small layers.`, "Increase capacity, train longer, add features, reduce regularization."],
  lrhigh: ["Learning rate too high", () => `Loss swings between ${f2(1 + Math.random())} and ${ri(8, 40)} within the first ${ri(50, 300)} steps, then becomes NaN.`, "Lower the LR, add warmup."],
  lrlow: ["Learning rate too low", () => `After ${ri(20, 50)} epochs, loss has gone from ${f2(2.3)} to ${f2(2.3 - Math.random() * 0.08)}, falling in a slow straight line.`, "Raise the LR or use a finder/schedule."],
  vanish: ["Vanishing gradients", () => `In a ${ri(20, 50)}-layer sigmoid network, gradient norms in the first layers are ~1e-${ri(7, 10)} while the last layers train normally.`, "ReLU-family activations, residuals, normalization, better init."],
  explode: ["Exploding gradients", () => `An RNN's gradient norm jumps from ~${ri(1, 5)} to ${nf(ri(2, 9) * 10000)} on long sequences and the loss turns NaN.`, "Gradient clipping, gated cells (LSTM/GRU), lower LR."],
  leak: ["Data leakage", () => `Validation accuracy is ${(99 + Math.random() * 0.9).toFixed(1)}%, far above any baseline, but production accuracy is ${ri(60, 72)}%. One feature is 'days_until_churn'.`, "Remove features built from the target or the future; split before preprocessing."],
  imbalance: ["Class imbalance", () => `Accuracy is ${(97 + Math.random() * 2.5).toFixed(1)}%, but recall on the positive class is ${f2(Math.random() * 0.08)}. Positives are ${ri(1, 3)}% of the data.`, "Class weights or resampling; judge with PR-AUC or recall."],
  shift: ["Distribution shift", () => `Offline AUC is ${f2(0.9 + Math.random() * 0.06)}. After launching in a new country, live AUC drops to ${f2(0.62 + Math.random() * 0.08)} with no code changes.`, "Monitor input drift, collect new data, retrain or adapt."],
  deadrelu: ["Dying ReLUs", () => `After a learning-rate spike, ${ri(40, 80)}% of hidden units output exactly 0 on every input and never recover.`, "Lower LR, Leaky ReLU/GELU, better init."],
  noise: ["Noisy labels", () => `Even a very large model plateaus at ${ri(80, 88)}% training accuracy. A spot check finds ~${ri(10, 20)}% of the training labels are wrong.`, "Clean labels, robust losses, label smoothing."],
  badinit: ["Bad init or logits scale bug", () => `A ${pick([10, 100, 1000])}-class classifier starts training with loss ${ri(30, 90)}. You'd expect about ln(C).`, "Check init scale and that logits aren't multiplied or pre-softmaxed twice."],
  bnsmall: ["BatchNorm with tiny batches", () => `With batch size ${ri(1, 2)} per GPU, training is erratic and eval accuracy is much worse than training accuracy. The model uses BatchNorm.`, "Larger batches, SyncBN, or switch to GroupNorm/LayerNorm."],
  trainmode: ["Model left in train mode at inference", () => `The same input gives different predictions on every call at inference, and accuracy is ${ri(3, 9)} points below validation.`, "Call model.eval(): disables dropout, uses BN running stats."]
};
const NEAR = { lrhigh: ["explode", "deadrelu"], explode: ["lrhigh"], deadrelu: ["lrhigh"], noise: ["underfit"], underfit: ["noise", "lrlow"], lrlow: ["underfit"], bnsmall: ["trainmode"], trainmode: ["bnsmall"], badinit: ["lrhigh"], leak: ["shift"], shift: ["leak"] };
Object.entries(CAUSES).forEach(([k, [name, sym, fix]]) => G("d-" + k, "diagnose", name, () => {
  const others = shuffle(Object.keys(CAUSES).filter(x => x !== k && !(NEAR[k] || []).includes(x))).slice(0, 3).map(x => CAUSES[x][0]);
  return { q: sym(), a: name, d: others, x: fix };
}));

// ---------------- COMPUTE ----------------
function numOpts(correct, cands, fmt, gap, lo = -Infinity, hi = Infinity) {
  const a = fmt(correct), seen = new Set([a]), d = [];
  const ok = v => Number.isFinite(v) && v >= lo && v <= hi && Math.abs(v - correct) >= gap;
  for (const v of shuffle(cands)) { if (d.length >= 3) break; if (!ok(v)) continue; const s = fmt(v); if (seen.has(s)) continue; seen.add(s); d.push(s); }
  for (let k = 1; d.length < 3 && k < 60; k++) { const v = correct + (k % 2 ? 1 : -1) * gap * Math.ceil(k / 2) * (1 + Math.random()); if (!ok(v)) continue; const s = fmt(v); if (seen.has(s)) continue; seen.add(s); d.push(s); }
  return { a, d };
}
const sig = x => 1 / (1 + Math.exp(-x));
G("c-softmax", "compute", "Softmax of logits", () => {
  const z = [ri(-1, 3), ri(-1, 3), ri(-1, 3)], e = z.map(Math.exp), s = e.reduce((a, b) => a + b), i = ri(0, 2), p = e[i] / s;
  const pos = z.map(v => Math.max(v, 0)), ps = pos.reduce((a, b) => a + b) || 1;
  const o = numOpts(p, [1 / 3, sig(z[i]), pos[i] / ps, 1 - p, p * p], f2, 0.05, 0.01, 0.99);
  return { q: `Logits z = [${z.join(", ")}]. What is softmax(z)<sub>${i}</sub>?`, ...o, x: `e^${z[i]} / (${z.map(v => "e^" + v).join(" + ")}) = ${f2(e[i])} / ${f2(s)} ≈ ${f2(p)}.` };
});
G("c-shift", "compute", "Softmax invariances", () => {
  const z = [ri(0, 3), ri(0, 3), ri(-1, 2)], op = pick(["add", "mul", "temp"]);
  if (op === "add") { const c = ri(3, 50); return { q: `Logits [${z.join(", ")}] become [${z.map(v => v + c).join(", ")}] (each +${c}). The softmax output…`, a: "Doesn't change", d: ["Gets sharper", "Gets flatter", "Shifts toward class 0"], x: "Softmax is invariant to adding a constant to every logit." }; }
  if (op === "mul") return { q: `Logits [${z.join(", ")}] are multiplied by ${ri(2, 5)}. The softmax output…`, a: "Gets sharper (more peaked)", d: ["Doesn't change", "Gets flatter", "Becomes uniform"], x: "Scaling up logits is like a temperature below 1." };
  return { q: `Logits [${z.join(", ")}] are divided by temperature T = ${ri(2, 5)}. The softmax output…`, a: "Gets flatter (closer to uniform)", d: ["Doesn't change", "Gets sharper", "Puts all mass on the argmax"], x: "T > 1 shrinks logit gaps, raising entropy." };
});
const SIG = [["0", 0], ["2", 2], ["−2", -2], ["4", 4], ["−4", -4], ["ln 3", Math.log(3)], ["−ln 3", -Math.log(3)], ["1", 1], ["−1", -1], ["ln 9", Math.log(9)]];
G("c-sigmoid", "compute", "Sigmoid values", () => { const [s, x] = pick(SIG); const o = numOpts(sig(x), SIG.map(v => sig(v[1])).concat([0.5, 1 - sig(x)]), f2, 0.04, 0, 1); return { q: `σ(${s}) ≈ ?`, ...o, x: `1 / (1 + e^(−${s})) ≈ ${f2(sig(x))}.` }; });
const PS = [0.5, 0.9, 0.1, 0.01, 0.25, 0.99, 0.75, 0.05];
G("c-ce", "compute", "Cross-entropy for one example", () => { const p = pick(PS), c = -Math.log(p); const o = numOpts(c, PS.map(v => -Math.log(v)).concat([1 - p, -Math.log10(p), p]), f2, 0.08, 0); return { q: `The model gives the true class probability ${p}. Cross-entropy loss (natural log) ≈ ?`, ...o, x: `−ln(${p}) ≈ ${f2(c)}.` }; });
G("c-initloss", "compute", "Expected loss at initialization", () => { const C = pick([2, 10, 100, 1000, 32000]), v = Math.log(C); const o = numOpts(v, [Math.log10(C), 1 / C, Math.log2(C), v / 2, Math.sqrt(C)], f2, 0.2, 0); return { q: `A ${nf(C)}-class classifier at init predicts roughly uniform probabilities. Starting cross-entropy ≈ ?`, ...o, x: `−ln(1/${nf(C)}) = ln ${nf(C)} ≈ ${f2(v)}. A much higher start points to an init bug.` }; });
G("c-ppl", "compute", "Perplexity from cross-entropy", () => { const k = pick([2, 4, 10, 20, 100]), ce = Math.log(k); const o = numOpts(k, [ce, Math.exp(ce / 2), ce * ce, k * 2, k / 2, Math.log2(k)], v => (v >= 10 ? Math.round(v) + "" : v.toFixed(1)), 0.6, 0); return { q: `Average cross-entropy is ${f2(ce)} nats per token. Perplexity ≈ ?`, ...o, x: `exp(${f2(ce)}) ≈ ${k}.` }; });
G("c-metrics", "compute", "Precision / recall / F1 from counts", () => {
  for (;;) {
    const TP = ri(10, 90), FP = ri(5, 60), FN = ri(5, 60), TN = ri(50, 400);
    const m = { precision: TP / (TP + FP), recall: TP / (TP + FN), accuracy: (TP + TN) / (TP + FP + FN + TN), specificity: TN / (TN + FP) }; m.F1 = (2 * m.precision * m.recall) / (m.precision + m.recall);
    const key = pick(Object.keys(m)), v = m[key];
    const o = numOpts(v, Object.values(m).concat([TP / (TP + FP + FN), FP / (FP + TN)]), f2, 0.03, 0, 1);
    if (o.d.length === 3) return { q: `TP = ${TP}, FP = ${FP}, FN = ${FN}, TN = ${TN}. What is the <strong>${key}</strong>?`, ...o, x: { precision: `TP/(TP+FP) = ${TP}/${TP + FP}`, recall: `TP/(TP+FN) = ${TP}/${TP + FN}`, accuracy: `(TP+TN)/total = ${TP + TN}/${TP + FP + FN + TN}`, specificity: `TN/(TN+FP) = ${TN}/${TN + FP}`, F1: `2PR/(P+R) with P = ${f2(m.precision)}, R = ${f2(m.recall)}` }[key] + ` ≈ ${f2(v)}.` };
  }
});
G("c-convout", "compute", "Conv output size", () => {
  for (;;) {
    const W = pick([28, 32, 64, 112, 224, 227]), K = pick([1, 3, 5, 7, 11]), S = pick([1, 2, 4]), Pd = pick([0, 1, 2, 3]);
    if ((W - K + 2 * Pd) % S || W - K + 2 * Pd < 0) continue;
    const v = (W - K + 2 * Pd) / S + 1;
    const o = numOpts(v, [Math.floor((W - K) / S) + 1, (W - K + 2 * Pd) / S, Math.floor(W / S), W - K + 1, v + 2 * Pd], x => String(Math.round(x)), 1, 1);
    return { q: `Input width ${W}, kernel ${K}, stride ${S}, padding ${Pd}. Output width?`, ...o, x: `(W − K + 2P)/S + 1 = (${W} − ${K} + ${2 * Pd})/${S} + 1 = ${v}.` };
  }
});
const DIMS = [10, 64, 128, 256, 512, 768, 784, 1024];
G("c-linear", "compute", "Linear layer parameters", () => { const i = pick(DIMS), o2 = pick(DIMS), v = i * o2 + o2; const o = numOpts(v, [i * o2, (i + 1) * (o2 + 1), i * o2 + i, i + o2, 2 * i * o2], nf, 1, 1); return { q: `nn.Linear(${i}, ${o2}) with bias. How many parameters?`, ...o, x: `in × out + out = ${nf(i * o2)} + ${o2} = ${nf(v)}.` }; });
G("c-conv", "compute", "Conv2d parameters", () => { const ci = pick([1, 3, 16, 32, 64]), co = pick([8, 16, 32, 64, 128]), k = pick([1, 3, 5]), v = ci * co * k * k + co; const o = numOpts(v, [ci * co * k * k, ci * co * k + co, co * k * k + co, (ci + co) * k * k], nf, 1, 1); return { q: `Conv2d(in=${ci}, out=${co}, kernel=${k}×${k}) with bias. Parameters?`, ...o, x: `Cin·Cout·K² + Cout = ${ci}·${co}·${k * k} + ${co} = ${nf(v)}.` }; });
G("c-attnscale", "compute", "Attention cost scaling", () => { const k = pick([2, 3, 4, 8]); const o = numOpts(k * k, [k, 2 * k, k ** 3, k * Math.log2(k) || 1.5], v => "×" + Math.round(v), 0.5, 1); return { q: `Sequence length grows ${k}× (same model). Roughly how much more compute for the attention score matrix QKᵀ?`, ...o, x: `QKᵀ is T × T, so cost scales with T²: ${k}² = ${k * k}.` }; });
G("c-dropout", "compute", "Inverted dropout scale", () => { const p = pick([0.1, 0.2, 0.25, 0.5]), v = 1 / (1 - p); const o = numOpts(v, [1 - p, p, 1 / p, 1 + p], f2, 0.05, 0); return { q: `Inverted dropout with drop rate p = ${p}. During training, kept activations are multiplied by…`, ...o, x: `1/(1 − p) = 1/${1 - p} ≈ ${f2(v)}, so the expected value matches inference.` }; });
G("c-mha", "compute", "Multi-head attention parameters", () => { const d = pick([256, 512, 768, 1024]), v = 4 * d * d + 4 * d; const o = numOpts(v, [4 * d * d, 3 * d * d + 3 * d, d * d + d, 4 * d * d * 8], nf, 1, 1); return { q: `Multi-head self-attention with d_model = ${d} (Q, K, V, output projections, with bias). Parameters?`, ...o, x: `Four d×d matrices plus biases: 4·${d}² + 4·${d} = ${nf(v)}. The head count doesn't change it.` }; });
G("c-embed", "compute", "Embedding table size", () => { const V = pick([30522, 32000, 50257, 100000]), d = pick([512, 768, 1024, 4096]), v = V * d; const o = numOpts(v, [V + d, V * d * 2, V * d / 2, V * 4 * d], nf, 1, 1); return { q: `Embedding table with vocab ${nf(V)} and d = ${d}. Parameters?`, ...o, x: `V × d = ${nf(v)}.` }; });
G("c-steps", "compute", "Steps per epoch", () => { const N = pick([50000, 60000, 100000, 1280000]), Bs = pick([32, 64, 128, 256]), v = Math.ceil(N / Bs); const o = numOpts(v, [N * Bs, Math.ceil(N / (2 * Bs)), Math.ceil(N / Bs) * 2, Bs], nf, 1, 1); return { q: `${nf(N)} training examples, batch size ${Bs}. Optimizer steps per epoch?`, ...o, x: `⌈${nf(N)} / ${Bs}⌉ = ${nf(v)}.` }; });

// ---------------- SHAPES ----------------
const SB = () => pick([2, 4, 8, 16, 32]), ST = () => pick([16, 100, 256, 512, 1024]), SH = () => pick([4, 8, 12, 16]), SD = () => pick([32, 64, 128]);
const shapeOpts = (a, ds, ansStr) => {
  const A = ansStr || tup(a), s = new Set([A]), d = [];
  const add = t => { if (!s.has(t) && d.length < 3) { s.add(t); d.push(t); } };
  for (const x of shuffle(ds)) add(typeof x === "string" ? x : tup(x));
  for (let g = 0; d.length < 3 && g < 40; g++) { const base = Array.isArray(a) ? a.slice() : [2, 3]; const i = ri(0, base.length - 1); base[i] = base[i] * pick([2, 4]) || 2; if (Math.random() < 0.3) base.reverse(); add(tup(base)); }
  return { a: A, d };
};
G("s-scores", "shapes", "Attention scores QKᵀ", () => { const b = SB(), h = SH(), t = ST(), d = SD(); return { q: `Q and K have shape ${tup([b, h, t, d])} (batch, heads, seq, head_dim). Shape of Q @ Kᵀ?`, ...shapeOpts([b, h, t, t], [[b, h, t, d], [b, t, t], [b, h, d, d], [b, h, d, t]]), x: `Contract over head_dim: (…, T, d) @ (…, d, T) → (…, T, T).` }; });
G("s-attnout", "shapes", "Attention output", () => { const b = SB(), h = SH(), t = ST(), d = SD(); return { q: `Attention weights are ${tup([b, h, t, t])} and V is ${tup([b, h, t, d])}. Shape of weights @ V?`, ...shapeOpts([b, h, t, d], [[b, h, t, t], [b, h, d, t], [b, t, d], [b, h, d, d]]), x: `(…, T, T) @ (…, T, d) → (…, T, d).` }; });
G("s-matmul", "shapes", "Matmul shapes", () => { const a = ri(2, 9), b2 = ri(2, 9), c = ri(2, 9); const bad = Math.random() < 0.25; const b3 = bad ? b2 + ri(1, 3) : b2; const err = "Error: inner dimensions differ"; if (bad) return { q: `A is ${tup([a, b2])}, B is ${tup([b3, c])}. Shape of A @ B?`, ...shapeOpts([a, c], [[a, c], [b2, b3], [a, b3], [b3, b2]], err), x: `Inner dims ${b2} and ${b3} must match.` }; return { q: `A is ${tup([a, b2])}, B is ${tup([b2, c])}. Shape of A @ B?`, ...shapeOpts([a, c], [[b2, b2], [a, b2], [c, a], err]), x: `(m, k) @ (k, n) → (m, n).` }; });
G("s-linear", "shapes", "Linear on 3-D input", () => { const b = SB(), t = ST(), i = pick(DIMS), o = pick(DIMS.filter(x => x !== i)); return { q: `x has shape ${tup([b, t, i])}. Shape of nn.Linear(${i}, ${o})(x)?`, ...shapeOpts([b, t, o], [[b, o], [b, t, i], [o, t], [b, i, o]]), x: `Linear acts on the last dimension only.` }; });
G("s-conv", "shapes", "Conv2d output (NCHW)", () => { for (;;) { const n = SB(), ci = pick([3, 16, 64]), co = pick([16, 32, 128]), H = pick([32, 64, 224]), k = pick([3, 5, 7]), s = pick([1, 2]), p = pick([0, 1, 2, 3]); if ((H - k + 2 * p) % s) continue; const o = (H - k + 2 * p) / s + 1; return { q: `Input ${tup([n, ci, H, H])} (N, C, H, W). Conv2d(${ci}, ${co}, kernel ${k}, stride ${s}, padding ${p}). Output shape?`, ...shapeOpts([n, co, o, o], [[n, ci, o, o], [n, co, H, H], [n, co, H / s, H / s], [co, n, o, o]]), x: `Out = (${H} − ${k} + ${2 * p})/${s} + 1 = ${o}; channels become ${co}.` }; } });
G("s-embed", "shapes", "Embedding lookup", () => { const b = SB(), t = ST(), V = pick([32000, 50257]), d = pick([512, 768, 1024]); return { q: `Token ids have shape ${tup([b, t])}. Shape after nn.Embedding(${nf(V)}, ${d})?`, ...shapeOpts([b, t, d], [[b, t, V], [V, d], [b, d], [b, t]]), x: `Each id becomes a ${d}-dim vector.` }; });
G("s-logits", "shapes", "LM logits", () => { const b = SB(), t = ST(), d = pick([512, 768]), V = pick([32000, 50257]); return { q: `Final hidden states are ${tup([b, t, d])}, vocab is ${nf(V)}. Shape of the LM logits?`, ...shapeOpts([b, t, V], [[b, V], [b, t, d], [t, V], [b, d, V]]), x: `One distribution over the vocab per position.` }; });
G("s-heads", "shapes", "Split into heads", () => { const b = SB(), t = ST(), h = SH(), d = h * SD(); return { q: `x is ${tup([b, t, d])} with ${h} heads. After x.view(${b}, ${t}, ${h}, ${d / h}).transpose(1, 2), the shape is…`, ...shapeOpts([b, h, t, d / h], [[b, t, h, d / h], [b, h, d / h, t], [b, h, t, d], [h, b, t, d / h]]), x: `view gives (B, T, H, d/H); transpose(1, 2) swaps T and H.` }; });
G("s-flatten", "shapes", "Flatten", () => { const b = SB(), c = pick([16, 32, 64]), h = pick([4, 7, 8]); return { q: `x is ${tup([b, c, h, h])}. Shape of torch.flatten(x, 1)?`, ...shapeOpts([b, c * h * h], [[b * c * h * h], [b, c, h * h], [b * c, h * h], [c * h * h]]), x: `Flatten from dim 1: ${c}·${h}·${h} = ${c * h * h}.` }; });
G("s-pool", "shapes", "Max pooling", () => { const n = SB(), c = pick([16, 64]), H = pick([32, 56, 112]); return { q: `x is ${tup([n, c, H, H])}. Shape after MaxPool2d(kernel 2, stride 2)?`, ...shapeOpts([n, c, H / 2, H / 2], [[n, c / 2, H, H], [n, c, H, H], [n, c / 2, H / 2, H / 2], [n, c, H / 4, H / 4]]), x: `Halves H and W, keeps channels.` }; });
G("s-broadcast", "shapes", "Broadcasting", () => { const a = ri(2, 6), b = ri(2, 6), c = ri(2, 6); return { q: `A is ${tup([a, 1, c])}, B is ${tup([b, 1])}. Shape of A + B?`, ...shapeOpts([a, b, c], [[a, 1, c], [a, b], "Error: not broadcastable", [b, a, c]]), x: `Align from the right: (${a}, 1, ${c}) vs (1, ${b}, 1) → (${a}, ${b}, ${c}).` }; });
G("s-ce", "shapes", "Cross-entropy targets", () => { const b = SB(), t = ST(), V = pick([32000, 50257]); return { q: `For F.cross_entropy, logits are reshaped to ${tup([b * t, V])}. What shape must the targets be?`, ...shapeOpts([b * t], [[b * t, V], [b, t, V], [V], [b, t]]), x: `One class index per row of logits.` }; });

// ---------------- build one card ----------------
function makeCard(item) {
  let q, a, d, x;
  if (item.gen) ({ q, a, d, x } = item.gen());
  else if (item.pool) { q = item.q; a = item.a; d = shuffle(item.pool.slice(0, Math.max(3, item.pool.length))).slice(0, 3); x = item.x; const same = item.pool.filter(n => NAMES.find(z => z[2] === n)[0] === item.grp); d = shuffle(same).slice(0, 2).concat(shuffle(item.pool.filter(n => !same.includes(n))).slice(0, 1)); }
  else ({ q, a, d, x } = item);
  const opts = shuffle([a, ...d.slice(0, 3)]);
  return { id: item.id, cat: item.cat, q, opts, ans: opts.indexOf(a), x };
}
if (typeof module !== "undefined") module.exports = { ITEMS, CATS, makeCard };
