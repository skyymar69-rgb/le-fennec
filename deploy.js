#!/usr/bin/env node
/**
 * 🦊 Le Fennec — Script de déploiement automatique
 * GitHub + Railway en une seule commande
 * 
 * Usage: node deploy.js
 */

const { execSync, spawn } = require('child_process');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');
const readline = require('readline');

// ── Colors ────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
};

const ok  = (msg) => console.log(`${C.green}  ✓ ${C.reset}${msg}`);
const err = (msg) => console.log(`${C.red}  ✗ ${C.reset}${msg}`);
const info= (msg) => console.log(`${C.blue}  → ${C.reset}${msg}`);
const warn= (msg) => console.log(`${C.yellow}  ⚠ ${C.reset}${msg}`);
const hr  = ()    => console.log(`${C.gray}${'─'.repeat(60)}${C.reset}`);

// ── Helpers ───────────────────────────────────────────────────
const run = (cmd, opts = {}) => {
  try {
    return execSync(cmd, { stdio: opts.silent ? 'pipe' : 'inherit', encoding: 'utf8', ...opts });
  } catch(e) {
    if (opts.canFail) return null;
    err(`Commande échouée: ${cmd}`);
    console.error(e.message);
    process.exit(1);
  }
};

const ask = (rl, question) => new Promise(resolve => rl.question(question, resolve));

const apiRequest = (options, body = null) => new Promise((resolve, reject) => {
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
      catch { resolve({ status: res.statusCode, body: data }); }
    });
  });
  req.on('error', reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.clear();
  console.log(`\n${C.bold}${C.cyan}🦊 Le Fennec — Déploiement automatique${C.reset}\n`);
  console.log(`   Ce script va :`);
  console.log(`   ${C.green}1.${C.reset} Créer un dépôt GitHub`);
  console.log(`   ${C.green}2.${C.reset} Pousser le code`);
  console.log(`   ${C.green}3.${C.reset} Déployer sur Railway`);
  console.log(`   ${C.green}4.${C.reset} Configurer la clé IA\n`);
  hr();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // ── Check prerequisites ──────────────────────────────────
  console.log(`\n${C.bold}Vérification de l'environnement...${C.reset}\n`);
  
  const hasGit  = run('git --version', { silent: true, canFail: true });
  const hasNode = run('node --version', { silent: true, canFail: true });
  const hasNpm  = run('npm --version',  { silent: true, canFail: true });
  
  if (!hasGit)  { err('Git non installé → https://git-scm.com/downloads'); process.exit(1); }
  if (!hasNode) { err('Node non installé → https://nodejs.org'); process.exit(1); }
  ok(`Git ${hasGit.trim()}`);
  ok(`Node ${hasNode.trim()}`);
  ok(`npm ${hasNpm.trim()}`);

  // ── Check Railway CLI ─────────────────────────────────────
  let hasRailway = run('railway --version', { silent: true, canFail: true });
  if (!hasRailway) {
    info('Installation de Railway CLI...');
    run('npm install -g @railway/cli', { silent: true });
    hasRailway = run('railway --version', { silent: true, canFail: true });
    if (!hasRailway) {
      err('Impossible d\'installer Railway CLI.');
      err('Installe manuellement: npm install -g @railway/cli');
      process.exit(1);
    }
  }
  ok(`Railway CLI ${hasRailway.trim()}`);

  hr();

  // ── Collect GitHub token ───────────────────────────────────
  console.log(`\n${C.bold}📦 ÉTAPE 1 — GitHub${C.reset}\n`);
  console.log(`   Tu as besoin d'un token GitHub (Personal Access Token).`);
  console.log(`   ${C.cyan}→ Ouvre ce lien dans ton navigateur :${C.reset}`);
  console.log(`   ${C.blue}https://github.com/settings/tokens/new?scopes=repo,delete_repo&description=LeFennecDeploy${C.reset}\n`);
  console.log(`   ${C.gray}Coche "repo" → Clique "Generate token" → Copie le token${C.reset}\n`);

  const ghToken = (await ask(rl, `   Colle ton token GitHub ici : `)).trim();
  if (!ghToken.startsWith('ghp_') && !ghToken.startsWith('github_pat_')) {
    warn('Token GitHub invalide (doit commencer par ghp_ ou github_pat_)');
  }

  // Get GitHub username
  info('Vérification du token...');
  const ghUser = await apiRequest({
    hostname: 'api.github.com',
    path:     '/user',
    method:   'GET',
    headers:  { 'Authorization': `Bearer ${ghToken}`, 'User-Agent': 'LeFennecDeploy/1.0', 'Accept': 'application/vnd.github+json' },
  });

  if (ghUser.status !== 200) {
    err(`Token GitHub invalide (status ${ghUser.status})`);
    rl.close();
    process.exit(1);
  }

  const username = ghUser.body.login;
  ok(`Connecté en tant que ${C.bold}${username}${C.reset} sur GitHub`);

  // Repo name
  const repoName = (await ask(rl, `\n   Nom du dépôt [le-fennec] : `)).trim() || 'le-fennec';
  const repoPrivate = (await ask(rl, `   Dépôt privé ? [o/N] : `)).trim().toLowerCase();
  const isPrivate = repoPrivate === 'o' || repoPrivate === 'oui' || repoPrivate === 'y' || repoPrivate === 'yes';

  // Create GitHub repo
  info(`Création du dépôt ${username}/${repoName}...`);
  const createRepo = await apiRequest(
    {
      hostname: 'api.github.com',
      path:     '/user/repos',
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${ghToken}`,
        'User-Agent':    'LeFennecDeploy/1.0',
        'Accept':        'application/vnd.github+json',
        'Content-Type':  'application/json',
      },
    },
    { name: repoName, description: '🦊 Le Fennec — Petites annonces gratuites en Algérie', private: isPrivate, auto_init: false }
  );

  if (createRepo.status === 422) {
    warn(`Le dépôt ${repoName} existe déjà — on continue`);
  } else if (createRepo.status !== 201) {
    err(`Erreur création dépôt: ${createRepo.body.message || createRepo.status}`);
    rl.close();
    process.exit(1);
  } else {
    ok(`Dépôt créé: ${C.blue}https://github.com/${username}/${repoName}${C.reset}`);
  }

  // Git init + push
  console.log(`\n   Push du code...`);
  const remoteUrl = `https://${ghToken}@github.com/${username}/${repoName}.git`;

  const hasGitDir = fs.existsSync(path.join(process.cwd(), '.git'));
  if (!hasGitDir) {
    run('git init -b main', { silent: true });
    ok('Git initialisé');
  }

  // Configure git
  run('git config user.email "deploy@le-fennec.dz"', { silent: true });
  run('git config user.name "Le Fennec Deploy"', { silent: true });

  // Remove existing remote if any
  run('git remote remove origin', { silent: true, canFail: true });
  run(`git remote add origin ${remoteUrl}`, { silent: true });

  run('git add -A', { silent: true });
  run('git commit -m "feat: Le Fennec v1.0 — déploiement initial 🦊" --allow-empty', { silent: true });
  run('git push -u origin main --force', { silent: true });
  ok(`Code poussé sur GitHub ✓`);

  hr();

  // ── Railway ───────────────────────────────────────────────
  console.log(`\n${C.bold}🚄 ÉTAPE 2 — Railway${C.reset}\n`);
  console.log(`   Tu as besoin d'un compte Railway (gratuit).`);
  console.log(`   ${C.cyan}→ Ouvre ce lien pour te connecter / créer ton compte :${C.reset}`);
  console.log(`   ${C.blue}https://railway.app/login${C.reset}\n`);

  await ask(rl, `   Appuie sur Entrée une fois connecté sur railway.app...`);

  // Railway login via CLI
  info('Connexion à Railway...');
  console.log(`\n   ${C.yellow}→ Un navigateur va s'ouvrir pour autoriser Railway CLI${C.reset}\n`);

  try {
    execSync('railway login --browserless', { stdio: 'inherit' });
    ok('Connecté à Railway');
  } catch {
    warn('Si la connexion a échoué, essaie: railway login');
  }

  // Create Railway project
  info('Création du projet Railway...');
  try {
    execSync('railway init --name le-fennec', { stdio: 'pipe' });
    ok('Projet "le-fennec" créé sur Railway');
  } catch(e) {
    warn('Si le projet existe déjà, on continue...');
  }

  // Link to GitHub repo
  info('Connexion du repo GitHub à Railway...');
  try {
    execSync(`railway link github ${username}/${repoName}`, { stdio: 'pipe', canFail: true });
  } catch {}

  // Deploy
  info('Premier déploiement en cours...');
  console.log(`   ${C.gray}(peut prendre 2-3 minutes)${C.reset}\n`);
  run('railway up --detach', { canFail: true });

  // Generate domain
  info('Génération du domaine public...');
  let railwayUrl = '';
  try {
    const domainOut = execSync('railway domain', { encoding: 'utf8', stdio: 'pipe' });
    railwayUrl = domainOut.trim().split('\n').find(l => l.includes('railway.app')) || '';
  } catch {}

  hr();

  // ── Anthropic API Key ────────────────────────────────────
  console.log(`\n${C.bold}🤖 ÉTAPE 3 — Clé IA (optionnel mais recommandé)${C.reset}\n`);
  console.log(`   La clé Anthropic active les fonctionnalités IA :`);
  console.log(`   recherche intelligente, amélioration d'annonces, estimation prix.\n`);
  console.log(`   ${C.cyan}→ Obtenir une clé (gratuit au départ) :${C.reset}`);
  console.log(`   ${C.blue}https://console.anthropic.com/settings/keys${C.reset}\n`);

  const anthropicKey = (await ask(rl, `   Colle ta clé Anthropic (ou Entrée pour passer) : `)).trim();

  if (anthropicKey && anthropicKey.startsWith('sk-ant-')) {
    info('Ajout de la clé IA à Railway...');
    try {
      execSync(`railway variables set VITE_ANTHROPIC_API_KEY="${anthropicKey}"`, { stdio: 'pipe' });
      ok('Clé IA configurée sur Railway');

      info('Redéploiement avec la clé IA...');
      run('railway up --detach', { canFail: true });
    } catch(e) {
      warn('Configure la variable manuellement dans Railway Settings → Variables');
      warn(`Nom: VITE_ANTHROPIC_API_KEY | Valeur: ${anthropicKey.slice(0,20)}...`);
    }
  } else if (anthropicKey) {
    warn('Clé Anthropic invalide (doit commencer par sk-ant-)');
  } else {
    info('Clé IA ignorée — tu pourras l\'ajouter plus tard dans Railway Settings → Variables');
  }

  rl.close();

  // ── Summary ───────────────────────────────────────────────
  hr();
  console.log(`\n${C.bold}${C.green}🎉 Le Fennec est déployé !${C.reset}\n`);
  console.log(`   ${C.bold}GitHub :${C.reset}  ${C.blue}https://github.com/${username}/${repoName}${C.reset}`);
  if (railwayUrl) {
    console.log(`   ${C.bold}Railway :${C.reset} ${C.green}https://${railwayUrl}${C.reset}`);
  } else {
    console.log(`   ${C.bold}Railway :${C.reset} ${C.yellow}Vérifie le dashboard → https://railway.app${C.reset}`);
  }
  console.log(`\n   ${C.gray}Pour les prochains déploiements :${C.reset}`);
  console.log(`   ${C.cyan}git add . && git commit -m "update" && git push${C.reset}`);
  console.log(`   ${C.gray}(Railway redéploie automatiquement à chaque push)${C.reset}\n`);
  hr();
}

main().catch(e => {
  console.error('\n❌ Erreur inattendue:', e.message);
  process.exit(1);
});
