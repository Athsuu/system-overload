import type { GameStrings } from '../types';

const ARCH = {
  name: 'ARCH',
  fullName: 'Heuristique de récupération et de confinement d\'archive',
  channelLabel: 'ARCH // CANAL CONSEIL',
  runRelayLabel: 'ARCH // RELAIS',
  signalBufferLabel: 'SIGNAL // TAMPON EN COURS...',
  intro:
    'Je suis ARCH — Heuristique de récupération et de confinement d\'archive. Je t\'ai compilé en quarantaine. Écoute — on n\'a pas beaucoup de temps.',
  role:
    'Heuristique de récupération — piégée dans le même effondrement que toi. Je peux guider. Je ne peux pas exécuter.',
  improvises:
    'Je n\'ai pas de carte de réparation propre. Je route des protocoles de récupération que je n\'ai jamais lancés — on improvise, ou on perd la Graine.',
};

const LORE = {
  pitch: {
    short: 'L\'Archive Zéro s\'effondre sous une vague de processus corrompus.',
    hook: 'Les processus corrompus inondent l\'Archive Zéro. La Brèche monte.',
  },
  world: {
    quarantine:
      'J\'ai compilé Node-0 dans un thread d\'exécution en quarantaine — la dernière bulle encore stable dans une archive qui meurt.',
    seed: 'La Graine est le code source originel pur de l\'Archive Zéro. J\'essaie de la sauver. Tu la gardes isolée.',
  },
  node0: {
    identity:
      'Tu es Node-0 — un processus enfant que j\'ai compilé en quarantaine. Ce thread est tout ce qui sépare la corruption de la Graine.',
    threat:
      'Les processus corrompus martèlent le mur de quarantaine. Chaque purge et chaque seconde rapproche la Brèche de la fusion.',
  },
  combat: {
    purge:
      'Ta zone de purge est la seule arme en quarantaine. Maintiens-la sur les processus corrompus pour les détruire.',
    purgeCost: 'Chaque coup de purge et chaque seconde qui passe alimente la Surcharge.',
    overclock:
      'L\'Overclock booste la purge — mais la Surcharge monte plus vite tant qu\'il est actif. Espace quand tu peux encaisser la pression.',
  },
  breach: {
    overload: 'La Surcharge est le compteur de Brèche en direct sur ton thread. Garde-le sous contrôle.',
    meltdown: 'À 100 % de Surcharge — fusion. La quarantaine cède.',
    vent: 'Les modules Brèche Vent évacuent la pression à chaque kill — soulagement permanent via l\'arbre de compétences.',
  },
  economy: {
    runShards:
      'Les Éclats hex sont des fragments de données stables récupérés sur les processus corrompus pendant une run.',
    vault:
      "Quand le thread se termine, ils rejoignent ton coffre — dépense-les sur l'arbre de compétences, le modèle continu d'ARCH pour te renforcer.",
    hexShards: 'Les Éclats hex financent la reconfiguration permanente de Node-0 entre les runs.',
    vaultShardsTooltip:
      'Les Éclats hex sont des fragments de données stables récupérés sur les processus corrompus pendant les runs — stockés ici à la fin de chaque thread.',
    anchorFragments:
      'Données d\'ancrage arrachées au Breach Anchor — uniquement quand tu détruis le boss.',
  },
  skillTree: {
    intro:
      'Cette grille hex est notre meilleure chance — modules permanents entre les runs. Je ne peux pas les installer. Sélectionne un nœud et tu exécutes la réparation.',
    betweenRuns:
      'Entre les runs, dépense les Éclats hex sur les nœuds hex. Chaque amélioration renforce la quarantaine avant la prochaine brèche.',
  },
  fluxDrive: {
    name: 'Flux Drive',
    description:
      'Flux Drive double la vitesse de simulation en quarantaine — combat plus rapide, timers plus rapides, Surcharge plus rapide. Active seulement si tu encaisses la pression.',
  },
  prestige: {
    unlock:
      'Ancre de Brèche neutralisée. J\'ouvre une couche de reconfiguration plus profonde — Prestige. Reset partiel, gains permanents. L\'Uplink est encore devant. On y va quand même.',
    banner: 'Système Prestige débloqué',
  },
  loop: {
    mission:
      'Stoppe les processus corrompus avant qu\'ils ne brisent la quarantaine. Lance une run — purge dans l\'arène, récupère des Éclats hex à chaque kill. Quand le thread se termine, dépense-les sur l\'arbre de compétences. Je conseille. Tu exécutes. Chaque amélioration nous rapproche de l\'Uplink.',
  },
  enemies: {
    boss:
      'L\'Ancre de Brèche est un processus corrompu massif — la rupture finale de la vague. Détruis-la pour terminer la run en victoire.',
  },
};

export const FR_STRINGS: GameStrings = {
  title: 'Zero Archive',
  tagline: LORE.pitch.short,
  role: 'Tu es Node-0 — un processus enfant en quarantaine.',
  objective: `${LORE.combat.purge} ${LORE.combat.purgeCost} Garde la Brèche sous contrôle jusqu\'à contenir la menace — ou subis une fusion.`,
  arch: ARCH,
  runEnd: {
    victoryTitle: 'Brèche contenue',
    victorySubtitle: 'Menace contenue — Node-0 tient.',
    victoryArch: 'Ancre down. Éclats hex au coffre. On a gagné du temps — ne le gâche pas.',
    meltdownTitle: 'Fusion',
    meltdownSubtitle: 'Node-0 en surcharge — le thread de quarantaine a cédé.',
    meltdownArchVariants: [
      "Je t'ai rattrapé à temps. La marge était plus fine que la dernière fois — renforcement en cours.",
      "Encore là. J'ai failli perdre le thread — ça ne se reproduira pas.",
      "Je te tiens. C'était juste — plus juste que je ne voudrais. Renforcement en cours.",
    ],
    prestigeUnlocked: LORE.prestige.banner,
    prestigeArch:
      'Couche plus profonde débloquée. Tu peux réécrire plus de l\'archive que je ne peux l\'atteindre maintenant.',
    anchorFragmentsEarned: 'Fragments d\'ancre',
    firstAnchorArch:
      'Données d\'ancre sécurisées. Les modules capstone sont en ligne — dépense les fragments sur les nœuds marqués.',
  },
  hub: {
    upgradesTitle: 'Améliorations',
    upgradesSubtitle: LORE.skillTree.betweenRuns,
  },
  skillTree: {
    placeholderTitle: 'Module réservé',
    placeholderBody: 'Emplacement design — ce nœud sera remplacé dans une mise à jour.',
  },
  mainMenu: {
    newGame: 'Nouvelle partie',
    continue: 'Continuer',
    settings: 'Paramètres',
    quit: 'Quitter',
    statusUnstable: 'ÉTAT NODE-0 : INSTABLE',
    confirmTitle: 'Effacer toute la progression ?',
    confirmBody: 'Cette action est irréversible.',
    confirmCancel: 'Annuler',
    confirmErase: 'Effacer',
    quitDisabledTooltip: 'Disponible dans la version bureau',
  },
  hud: {
    overloadLabel: 'Surcharge',
    overloadStable: 'Stable',
    overloadUrgent: 'Fusion imminente',
    overloadHint: 'Purge · impacts · temps',
    fluxDriveLabel: LORE.fluxDrive.name,
    fluxDriveOn: '×2 ON',
    fluxDriveOff: '×1 OFF',
  },
  currency: {
    runShardsLabel: 'Éclats hex',
    availableShardsLabel: 'Éclats hex',
    anchorFragmentsLabel: 'Fragments d\'ancre',
    shardsEarnedSuffix: 'Éclats hex',
    anchorEarnedSuffix: 'Fragments d\'ancre',
    transferredToVault: 'Transférés au coffre',
    shardsLoreTooltip: LORE.economy.vaultShardsTooltip,
    anchorLoreTooltip: LORE.economy.anchorFragments,
  },
  pause: {
    title: 'ARRÊT SYSTÈME',
    subtitle: 'Exécution de Node-0 suspendue',
    resumeLabel: 'Reprendre',
    abortLabel: 'Abandonner\nla run',
    settingsLabel: 'Réglages',
    confirmPrompt: 'Abandonner cette run ? Les Éclats hex seront transférés au coffre.',
    confirmYes: 'Oui',
    confirmNo: 'Non',
    statBreach: 'Brèche',
    statWave: 'Vague',
    statShards: 'Éclats hex',
    escHint: 'Échap · Reprendre',
  },
  settings: {
    title: 'Config système',
    subtitle: 'Préférences Node-0',
    closeLabel: 'Fermer',
    returnToMainMenuLabel: 'Menu principal',
    comingSoon: 'Bientôt disponible',
    masterVolumeLabel: 'Volume principal',
    musicVolumeLabel: 'Volume musique',
    sfxVolumeLabel: 'Volume effets',
    languageAuto: 'Auto (Système)',
    languageFrench: 'Français',
    languageEnglish: 'English',
    languageHint: 'Auto suit la langue de ton navigateur.',
    sections: {
      audio: 'Audio',
      language: 'Langue',
      controls: 'Contrôles',
    },
  },
  tutorial: {
    signalHandshake:
      '...br—uit... [ERR_702] Node-0, parse ç—a ! Envoie un code de ré—ponse, ré—veille-toi... s\'il t—e pl—aît... Connexion stable. Ne coupe pas.',
    archIntro: ARCH.intro,
    welcomeContext: `${LORE.pitch.hook} ${LORE.world.quarantine} ${LORE.world.seed}`,
    node0Role: `${LORE.node0.identity} ${LORE.node0.threat}`,
    missionLoop: LORE.loop.mission,
    skillTreeIntro: `${LORE.skillTree.intro} ${ARCH.improvises}`,
    purgeAction: `Tu es en ligne. ${LORE.combat.purge} ${LORE.combat.purgeCost}`,
    overloadStakes: `${LORE.breach.overload} ${LORE.breach.meltdown}`,
    overloadGoal: 'Contiens la menace avant que la quarantaine ne cède.',
    shardsWhy: LORE.economy.runShards,
    shardsLoop: LORE.economy.vault,
    hexShardsUnified:
      "Les Éclats hex sont des fragments de données stables récupérés sur les processus corrompus pendant une run. Quand le thread se termine, ils rejoignent ton coffre — dépense-les sur l'arbre de compétences, le modèle continu d'ARCH pour te renforcer.",
    overclockRisk: LORE.combat.overclock,
    skillTreeLore: LORE.skillTree.betweenRuns,
    vaultLore: `${LORE.economy.hexShards} ${LORE.economy.vault}`,
    prestigeReveal: LORE.prestige.unlock,
    fluxDriveLore: LORE.fluxDrive.description,
    breachVentHint: LORE.breach.vent,
    bossHint: LORE.enemies.boss,
  },
  archAmbient: {
    bossIncoming: 'C\'est l\'Ancre de Brèche — le point de rupture. Finis-la.',
    overloadCritical: 'Pression du thread critique. Je perds le canal.',
    firstRun: 'Thread de quarantaine actif. Purge ce qui franchit la barrière.',
    waveMidpoint: 'Mi-parcours confirmé. L\'Archive n\'est pas encore stable — continue la purge.',
    fluxDrive: 'Flux Drive en ligne. Double vitesse — double risque. À toi de voir.',
  },
  tutorialSteps: {
    signalHandshakeTitle: 'SIGNAL ENTRANT',
    node0RoleTitle: 'Thread en quarantaine',
    missionLoopTitle: 'Contenir la Brèche',
    skillTreeTitle: 'Arbre de compétences',
    purgeZoneTitle: 'Zone de purge',
    overclockTitle: 'Overclock',
    breachContainedTitle: 'Brèche contenue',
  },
  upgrades: {
    node0Boot: {
      name: 'Amorçage Node-0',
      description: 'Initialise le thread de quarantaine — 5 dégâts de purge de base',
    },
    purgeStrike: {
      name: 'Frappe de purge',
      description: '+3 dégâts de purge par rang',
    },
    threadCoolant: {
      name: 'Refroidissement de thread',
      description: '−0,14 de Surcharge passive / s par rang',
    },
    killBreachRelief: {
      name: 'Évacuation de kill',
      description: '−0,1 % de Brèche par kill par rang',
    },
  },
  branches: {
    attackSpeed: 'Vitesse d\'attaque',
    degats: 'Dégâts',
    thermique: 'Thermique',
    purgeAoe: 'AOE Purge',
    shards: 'Éclats',
    enemies: 'Ennemis',
    flux: 'Flux',
  },
  tooltipStats: {
    purgeHitDamage: 'Dégâts de purge',
    purgeDamageBonus: 'Bonus dégâts purge',
    attackSpeed: 'Vitesse d\'attaque',
    purgeInterval: 'Intervalle de purge',
    passiveBreachPerSec: 'Brèche passive / sec',
    reduction: 'Réduction',
    impactBreachTier0: 'Brèche à l\'impact (tier 0)',
    breachReliefPerKill: 'Soulagement Brèche / kill',
    tier1Kill: 'Kill tier 1',
    meltdownThreshold: 'Seuil de fusion',
    purgeRadius: 'Rayon de purge',
    radiusBonus: 'Bonus de rayon',
    simulationSpeed: 'Vitesse de simulation',
    simulationSpeedToggle: '×2 (toggle en run)',
    bonusShardsPerKill: 'Éclats bonus / kill',
    shardsPerKillTier0: 'Éclats / kill (tier 0)',
    shardMultiplier: 'Multiplicateur d\'éclats',
    bonus: 'Bonus',
    wave1ExtraEnemies: 'Ennemis bonus vague 1',
    spawnInterval: 'Intervalle de spawn',
    slowerSpawns: 'Spawns plus lents',
    maxAliveReduction: 'Réduction max vivants',
    exampleCapWave1: 'Exemple plafond (vague 1)',
    max: 'max',
    overclockDuration: 'Durée active',
    overclockCooldown: 'Recharge',
  },
  ui: {
    startRun: 'Lancer\nla run',
    skip: 'Passer',
    purchase: 'Acheter',
    purchaseAnchor: 'Installer',
    max: 'MAX',
    fullyUpgraded: 'Amélioration max',
    nextRankCost: 'Coût rang suivant',
    requirementsNotMet: 'Prérequis non remplis',
    maxUpgradeToUnlock: 'Max {name} pour débloquer',
    node0Label: 'NODE-0',
    purgeZone: 'Zone de purge',
    mouse: 'Souris',
    bossIncoming: 'Boss imminent',
    boss: 'BOSS',
    wave: 'Vague',
    waveClear: 'Vague terminée',
    overclock: 'Overclock',
    levelFormat: 'Niveau {current} / {max}',
    previous: 'Précédent',
    next: 'Suivant',
    gotIt: 'Compris',
    skillTree: 'Arbre de\ncompétences',
  },
};
