#!/usr/bin/env node
/**
 * Internet Control Panel — Healthcheck Script
 * Verifies that the extension baseline is intact and loadable.
 * No external packages required.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXT = path.join(ROOT, 'extension');

let passed = 0;
let failed = 0;
const warnings = [];

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.log(`  ✗  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function warn(msg) {
  warnings.push(msg);
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function walkFiles(dir, allowExts) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, allowExts));
      return;
    }
    if (!allowExts || allowExts.has(path.extname(entry.name))) out.push(full);
  });
  return out;
}

console.log('\n=== Internet Control Panel — Healthcheck ===\n');

// ── Required root docs ──────────────────────────────────────────────────────
console.log('Root governance docs:');
const rootDocs = [
  'README.md',
  'PROJECT_BRIEF.md',
  'ARCHITECTURE.md',
  'ROADMAP.md',
  'CURRENT_STATE.md',
  'DECISIONS.md',
  'AGENT_PROTOCOL.md',
  'IDEA_PARKING_LOT.md',
  'SECURITY_PRIVACY.md',
  'TEST_PLAN.md',
  'CHANGELOG.md',
  'package.json',
];
rootDocs.forEach(f => check(f, fileExists(f)));

// ── Extension files ─────────────────────────────────────────────────────────
console.log('\nExtension files:');
const extFiles = [
  'extension/manifest.json',
  'extension/background.js',
  'extension/content.js',
  'extension/content.css',
  'extension/overlay.css',
  'extension/popup.html',
  'extension/popup.js',
  'extension/options.html',
  'extension/options.js',
];
extFiles.forEach(f => check(f, fileExists(f)));

// ── Core modules ─────────────────────────────────────────────────────────────
console.log('\nCore modules:');
const coreFiles = [
  'extension/core/constants.js',
  'extension/core/storage.js',
  'extension/core/ledger.js',
  'extension/core/diagnostics.js',
  'extension/core/adapters.js',
  'extension/core/commands.js',
  'extension/core/messaging.js',
];
coreFiles.forEach(f => check(f, fileExists(f)));

// ── Scripts ──────────────────────────────────────────────────────────────────
console.log('\nScripts:');
check('scripts/healthcheck.js', fileExists('scripts/healthcheck.js'));

// ── Manifest validation ──────────────────────────────────────────────────────
console.log('\nManifest validation:');
const manifestPath = path.join(EXT, 'manifest.json');
let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  check('manifest.json parses as valid JSON', true);
} catch (e) {
  check('manifest.json parses as valid JSON', false, e.message);
}

if (manifest) {
  check('manifest_version is 3', manifest.manifest_version === 3);
  check('name is set', typeof manifest.name === 'string' && manifest.name.length > 0);
  check('version is set', typeof manifest.version === 'string' && manifest.version.length > 0);
  check('background.service_worker is set', !!(manifest.background && manifest.background.service_worker));
  check('action.default_popup is set', !!(manifest.action && manifest.action.default_popup));
  check('content_scripts defined', Array.isArray(manifest.content_scripts) && manifest.content_scripts.length > 0);

  // Verify every file referenced in content_scripts exists
  if (Array.isArray(manifest.content_scripts)) {
    manifest.content_scripts.forEach(cs => {
      (cs.js || []).forEach(jsFile => {
        check(
          `content_script JS exists: ${jsFile}`,
          fs.existsSync(path.join(EXT, jsFile)),
        );
      });
      (cs.css || []).forEach(cssFile => {
        check(
          `content_script CSS exists: ${cssFile}`,
          fs.existsSync(path.join(EXT, cssFile)),
        );
      });
    });
  }

  // Warn about icon references to missing files
  if (manifest.icons) {
    Object.entries(manifest.icons).forEach(([size, iconPath]) => {
      if (!fs.existsSync(path.join(EXT, iconPath))) {
        warn(`Icon ${size}px references missing file: ${iconPath}`);
      }
    });
  }
}

// ── package.json healthcheck script ─────────────────────────────────────────
console.log('\npackage.json:');
const pkgPath = path.join(ROOT, 'package.json');
let pkg = null;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  check('package.json parses as valid JSON', true);
} catch (e) {
  check('package.json parses as valid JSON', false, e.message);
}
if (pkg) {
  check('healthcheck script defined', !!(pkg.scripts && pkg.scripts.healthcheck));
}

// ── Security scans (extension source only) ───────────────────────────────────
console.log('\nSecurity scans (extension source):');
const extensionSourceFiles = walkFiles(EXT, new Set(['.js', '.html', '.css']));
let evalHits = 0;
let remoteScriptHits = 0;
let remoteFetchHits = 0;

extensionSourceFiles.forEach((filePath) => {
  const rel = path.relative(ROOT, filePath);
  const source = fs.readFileSync(filePath, 'utf8');
  if (/\beval\s*\(/.test(source)) {
    evalHits++;
    console.log(`  ✗  eval() usage found: ${rel}`);
  }
  if (/<script[^>]+src=["']https?:\/\//i.test(source)) {
    remoteScriptHits++;
    console.log(`  ✗  remote script tag found: ${rel}`);
  }
  if (/\bfetch\s*\(\s*['"`]https?:\/\//i.test(source)) {
    remoteFetchHits++;
    console.log(`  ✗  direct remote fetch found: ${rel}`);
  }
});

check('No eval() usage in extension source', evalHits === 0);
check('No remote <script src=\"http(s)://...\"> in extension source', remoteScriptHits === 0);
check('No direct fetch(\"http(s)://...\") in extension source', remoteFetchHits === 0);

// ── Version consistency ────────────────────────────────────────────────────────
console.log('\nVersion consistency:');
let constantsVersion = null;
try {
  const constantsPath = path.join(ROOT, 'extension/core/constants.js');
  const constantsSource = fs.readFileSync(constantsPath, 'utf8');
  const match = constantsSource.match(/VERSION:\s*['"]([^'"]+)['"]/);
  constantsVersion = match ? match[1] : null;
  check('constants VERSION found', !!constantsVersion);
} catch (e) {
  check('constants VERSION found', false, e.message);
}

if (manifest && pkg && constantsVersion) {
  check(
    'manifest version matches package version',
    manifest.version === pkg.version,
    `${manifest.version} !== ${pkg.version}`,
  );
  check(
    'constants VERSION matches manifest version',
    constantsVersion === manifest.version,
    `${constantsVersion} !== ${manifest.version}`,
  );
}

// ── Warnings ─────────────────────────────────────────────────────────────────
if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach(w => console.log(`  ⚠  ${w}`));
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(48)}`);
if (failed === 0) {
  console.log(`PASS  ${passed} checks passed, ${warnings.length} warning(s)\n`);
  process.exit(0);
} else {
  console.log(`FAIL  ${passed} passed / ${failed} failed / ${warnings.length} warning(s)\n`);
  process.exit(1);
}
