// App Store Release Notes Generator — browser-only, no API.

const TONE_OPENERS = {
  featured: [
    "This update is packed with improvements you've been asking for.",
    "We've been listening — here's what's new in this release.",
    "A big update is here. Here's what changed.",
    "This release focuses on what matters most to you.",
  ],
  direct: [
    "What's new in this version:",
    "Changes in this update:",
    "Here's what changed:",
    "This version includes:",
  ],
  casual: [
    "Hey! Here's what we've been working on —",
    "Thanks for your patience! Here's what's new —",
    "We've been busy. Here's the rundown —",
    "Quick update — here's what changed —",
  ],
};

const BUG_PHRASES = {
  featured: [
    "We've also resolved several issues that some users reported.",
    "A number of stability and performance fixes are included as well.",
    "Under the hood, we've addressed bugs and improved reliability.",
  ],
  direct: [
    "• Bug fixes and stability improvements",
    "• Performance improvements and bug fixes",
    "• Various bug fixes",
  ],
  casual: [
    "Also squashed a few bugs while we were at it.",
    "Fixed some issues along the way too.",
    "Plus the usual round of bug fixes.",
  ],
};

const CATEGORY_CONTEXT = {
  productivity: { adjectives: ["faster", "smoother", "more efficient"], action: "get more done" },
  games: { adjectives: ["more fun", "more challenging", "more immersive"], action: "enjoy more" },
  health: { adjectives: ["more accurate", "more insightful", "easier to use"], action: "reach your goals" },
  finance: { adjectives: ["clearer", "more secure", "more reliable"], action: "stay on top of your finances" },
  social: { adjectives: ["more connected", "more expressive", "faster"], action: "connect with others" },
  education: { adjectives: ["more effective", "more engaging", "clearer"], action: "learn faster" },
  utilities: { adjectives: ["more powerful", "more reliable", "faster"], action: "get the job done" },
  lifestyle: { adjectives: ["more personal", "more intuitive", "more helpful"], action: "live better" },
  other: { adjectives: ["better", "more reliable", "easier to use"], action: "make the most of the app" },
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseChanges(raw) {
  return raw
    .split(/\n|•|·|-(?=\s)/)
    .map(s => s.replace(/^[\s\-•·*]+/, "").trim())
    .filter(s => s.length > 2);
}

function capitalizeFirst(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ensurePeriod(s) {
  if (!s) return s;
  return s.match(/[.!?]$/) ? s : s + ".";
}

function isBugFix(change) {
  return /\b(fix|fixed|fixes|bug|crash|issue|error|resolve|resolv|correct|patch|patch)\b/i.test(change);
}

function buildFeaturedVariant(changes, category, releaseType) {
  const ctx = CATEGORY_CONTEXT[category] || CATEGORY_CONTEXT.other;
  const features = changes.filter(c => !isBugFix(c));
  const bugs = changes.filter(c => isBugFix(c));

  const opener = pick(TONE_OPENERS.featured);

  const featureLines = features.map(f => {
    const c = capitalizeFirst(ensurePeriod(f));
    return c;
  });

  const bugLine = bugs.length ? pick(BUG_PHRASES.featured) : null;

  const parts = [opener];
  if (featureLines.length) {
    parts.push("");
    featureLines.forEach(l => parts.push(l));
  }
  if (bugLine) {
    parts.push("");
    parts.push(bugLine);
  }
  if (releaseType === "major") {
    parts.push("");
    parts.push(`As always, thank you for using the app — your feedback shapes every release.`);
  }

  return parts.join("\n");
}

function buildDirectVariant(changes, category, releaseType) {
  const features = changes.filter(c => !isBugFix(c));
  const bugs = changes.filter(c => isBugFix(c));

  const lines = [];
  if (releaseType === "major") {
    lines.push("NEW IN THIS VERSION");
    lines.push("");
  }

  features.forEach(f => lines.push("• " + capitalizeFirst(ensurePeriod(f))));

  if (bugs.length) {
    if (features.length) lines.push("");
    lines.push("FIXES");
    lines.push("");
    bugs.forEach(b => lines.push("• " + capitalizeFirst(ensurePeriod(b))));
  }

  if (!lines.filter(l => l.trim()).length) {
    lines.push("• Bug fixes and performance improvements");
  }

  return lines.join("\n");
}

function buildCasualVariant(changes, category, releaseType) {
  const ctx = CATEGORY_CONTEXT[category] || CATEGORY_CONTEXT.other;
  const features = changes.filter(c => !isBugFix(c));
  const bugs = changes.filter(c => isBugFix(c));

  const opener = pick(TONE_OPENERS.casual);

  const featureLines = features.map((f, i) => {
    const prefix = i === 0 ? "✦ " : "✦ ";
    return prefix + capitalizeFirst(ensurePeriod(f));
  });

  const bugLine = bugs.length ? pick(BUG_PHRASES.casual) : null;

  const closing = releaseType === "major"
    ? `\nLove the app? Leave us a review — it helps more than you know. 🙏`
    : "";

  const parts = [opener, "", ...featureLines];
  if (bugLine) { parts.push(""); parts.push(bugLine); }
  if (closing) parts.push(closing);

  return parts.join("\n");
}

function generateNotes() {
  const changesRaw = document.getElementById("changes").value.trim();
  const category   = document.getElementById("category").value;
  const releaseType = document.getElementById("releaseType").value;
  const errEl = document.getElementById("changesErr");

  if (!changesRaw) {
    errEl.style.display = "block";
    return;
  }
  errEl.style.display = "none";

  const changes = parseChanges(changesRaw);
  if (!changes.length) {
    errEl.textContent = "Couldn't parse any changes. Try one change per line.";
    errEl.style.display = "block";
    return;
  }

  const variants = [
    { label: "Featured — App Store editorial tone", text: buildFeaturedVariant(changes, category, releaseType) },
    { label: "Direct — Scannable bullets",          text: buildDirectVariant(changes, category, releaseType)  },
    { label: "Casual — Friendly, human",            text: buildCasualVariant(changes, category, releaseType)  },
  ];

  const container = document.getElementById("variantsContainer");
  container.innerHTML = variants.map((v, i) => {
    const chars = v.text.length;
    const pct = Math.min(100, Math.round(chars / 40));
    const barColor = chars > 3500 ? "var(--err)" : chars > 2000 ? "var(--warn)" : "var(--ok)";
    return `
      <div class="variant-card">
        <div class="variant-header">
          <span class="variant-label">${v.label}</span>
          <button class="copy-btn" onclick="copyVariant(${i})">Copy</button>
        </div>
        <div class="char-bar-wrap">
          <div class="char-bar">
            <div class="char-bar-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <span class="char-count ${chars > 3500 ? 'bad' : chars > 2000 ? 'warn' : ''}">${chars} / 4000 chars</span>
        </div>
        <div class="variant-text" id="vtext${i}">${escHtml(v.text)}</div>
      </div>
    `;
  }).join("");

  const output = document.getElementById("output");
  output.classList.add("visible");
  output.scrollIntoView({ behavior: "smooth", block: "start" });
}

function copyVariant(idx) {
  const el = document.getElementById("vtext" + idx);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const btns = document.querySelectorAll(".copy-btn");
    const btn = btns[idx];
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = orig; }, 1800);
  });
}

function escHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}
