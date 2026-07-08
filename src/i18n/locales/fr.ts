import type { GameStrings } from '../types';

const ARCH = {
  name: 'ARCH',
  fullName: 'Heuristique de récupération et de confinement d\'archive',
  channelLabel: 'ARCH // CANAL CONSEIL',
  runRelayLabel: 'ARCH // RELAIS',
  signalBufferLabel: 'SIGNAL // TAMPON EN COURS...',
  intro:
    'Je suis ARCH, Heuristique de récupération et de confinement d\'archive. Écoute. On n\'a pas beaucoup de temps.',
  role:
    'Heuristique de récupération, piégée dans le même effondrement que toi. Je peux guider. Je ne peux pas exécuter.',
  improvises:
    'Je n\'ai pas de schéma propre et je route des protocoles non testés. On improvise, ou on perd la Graine.',
};

const LORE = {
  pitch: {
    short: 'L\'Archive Zéro s\'effondre sous une vague de processus corrompus.',
    hook: 'Les processus corrompus inondent l\'Archive Zéro. La Brèche monte.',
  },
  world: {
    quarantine:
      'Je t\'ai compilé comme processus enfant, opérant dans un thread en quarantaine, la dernière bulle encore stable dans une archive qui meurt.',
    seed: 'La Graine est le code source originel pur de l\'Archive Zéro. J\'essaie de la sauver. Gagne-nous un maximum de temps.',
  },
  node0: {
    identity:
      'Tu es Node-0. Ton thread actif est tout ce qui sépare la corruption de la Graine.',
    threat:
      'Les processus corrompus martèlent le mur de quarantaine. Chaque purge et chaque seconde rapproche la Brèche de la fusion.',
  },
  combat: {
    purge:
      'Ta zone de purge est la seule arme en quarantaine. Maintiens-la sur les processus corrompus pour les détruire.',
    purgeCost: 'Chaque coup de purge et chaque seconde qui passe alimente la Surcharge.',
    overclock:
      'L\'Overclock booste la purge, mais la Surcharge monte plus vite tant qu\'il est actif. Espace quand tu peux encaisser la pression.',
  },
  breach: {
    overload: 'La Surcharge est le compteur de Brèche en direct sur ton thread. Garde-le sous contrôle.',
    meltdown: 'À 100 % de Surcharge. Fusion. La quarantaine cède.',
    vent: 'Les modules Brèche Vent évacuent la pression à chaque kill, soulagement permanent via l\'arbre de compétences.',
  },
  economy: {
    vaultShardsTooltip:
      'Les Éclats hex sont des fragments stables récupérés sur les processus corrompus. Ton total augmente à chaque kill pendant une run.',
    anchorFragments:
      'Données d\'ancrage arrachées au Breach Anchor, uniquement quand tu détruis le boss.',
  },
  skillTree: {
    intro:
      'Cette grille hex est notre meilleure chance. Elle intègre tes modules permanents entre les runs. Je ne peux pas les installer directement. Sélectionne un nœud pour exécuter le renforcement.',
    betweenRuns:
      'Entre les runs, dépense les Éclats hex sur les nœuds hex. Chaque amélioration renforce la quarantaine avant la prochaine brèche.',
  },
  fluxDrive: {
    name: 'Flux Drive',
    description:
      'Flux Drive double la vitesse de simulation en quarantaine. Combat plus rapide, timers plus rapides, Surcharge plus rapide. Active seulement si tu encaisses la pression.',
  },
  prestige: {
    unlock:
      'Ancre de Brèche neutralisée. J\'ouvre une couche de reconfiguration plus profonde. Prestige. Reconfiguration du noyau, gains permanents. L\'Uplink est encore devant. On y va quand même.',
    banner: 'Système Prestige débloqué',
  },
  loop: {
    mission:
      'Stoppe les processus corrompus avant qu\'ils ne brisent la quarantaine. Lance une run : purge l\'arène et extrais des Éclats hex à chaque kill. Quand le thread se termine, dépense-les sur l\'arbre de compétences. Je conseille. Tu exécutes. Chaque renforcement nous fait gagner du temps pour l\'Uplink.',
  },
  enemies: {
    boss:
      'L\'Ancre de Brèche est un processus corrompu massif, la rupture finale de la vague. Détruis-la pour terminer la run en victoire.',
  },
};

export const FR_STRINGS: GameStrings = {
  title: 'Zero Archive',
  tagline: LORE.pitch.short,
  role: 'Tu es Node-0, un processus enfant en quarantaine.',
  objective: `${LORE.combat.purge} ${LORE.combat.purgeCost} Garde la Brèche sous contrôle jusqu\'à contenir la menace, ou subis une fusion.`,
  arch: ARCH,
  runEnd: {
    victoryTitle: 'Brèche contenue',
    victorySubtitle: 'Menace contenue. Node-0 tient.',
    victoryArch: 'Ancre down. Éclats hex au coffre. On a gagné du temps. Ne le gâche pas.',
    meltdownTitle: 'Fusion',
    meltdownSubtitle: 'Surcharge à 100 %. Le thread actif s\'est effondré. Node-0 en attente.',
    meltdownArchVariants: [
      "Je t'ai rattrapé à temps. La marge était plus fine que la dernière fois. Renforcement en cours.",
      "Encore là. J'ai failli perdre le thread, ça ne se reproduira pas.",
      "Je te tiens. C'était juste, plus juste que je ne voudrais. Renforcement en cours.",
    ],
    prestigeUnlocked: LORE.prestige.banner,
    prestigeArch:
      'Couche plus profonde débloquée. Tu peux réécrire plus de l\'archive que je ne peux l\'atteindre maintenant.',
    anchorFragmentsEarned: 'Fragments d\'ancre',
    firstAnchorArch:
      'Données d\'ancre sécurisées. Les modules capstone sont en ligne. Dépense les fragments sur les nœuds marqués.',
  },
  hub: {
    upgradesTitle: 'Améliorations',
    upgradesSubtitle: LORE.skillTree.betweenRuns,
  },
  skillTree: {
    placeholderTitle: 'Module réservé',
    placeholderBody: 'Emplacement design. Ce nœud sera remplacé dans une mise à jour.',
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
    transferredToVault: 'Gagnés cette run',
    shardsLoreTooltip: LORE.economy.vaultShardsTooltip,
    anchorLoreTooltip: LORE.economy.anchorFragments,
  },
  pause: {
    title: 'ARRÊT SYSTÈME',
    subtitle: 'Exécution de Node-0 suspendue',
    resumeLabel: 'Reprendre',
    abortLabel: 'Abandonner\nla run',
    settingsLabel: 'Réglages',
    confirmPrompt: 'Abandonner cette run ? Tu gardes tes Éclats hex.',
    confirmYes: 'Oui',
    confirmNo: 'Non',
    statBreach: 'Brèche',
    statWave: 'Vague',
    statCycle: 'Cycle',
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
    hexShardsUnified:
      "Les Éclats hex sont des fragments de données stables récupérés sur les processus corrompus pendant une run. Chaque kill augmente ton total. Dépense-les sur l'arbre de compétences pour te renforcer.",
    overclockRisk: LORE.combat.overclock,
    skillTreeLore: LORE.skillTree.betweenRuns,
    prestigeReveal: LORE.prestige.unlock,
    fluxDriveLore: LORE.fluxDrive.description,
  },
  archAmbient: {
    bossIncoming: 'C\'est l\'Ancre de Brèche, le point de rupture. Finis-la.',
    overloadCritical: 'Pression du thread critique. Je perds le canal.',
    firstRun: 'Thread de quarantaine actif. Purge ce qui franchit la barrière.',
    waveMidpoint: 'Mi-parcours confirmé. L\'Archive n\'est pas encore stable, continue la purge.',
    fluxDrive: 'Flux Drive en ligne. Double vitesse, double risque. À toi de voir.',
  },
  tutorialSteps: {
    signalHandshakeTitle: 'SIGNAL ENTRANT',
    node0RoleTitle: 'NODE-0',
    missionLoopTitle: 'Contenir la Brèche',
    skillTreeTitle: 'Arbre de compétences',
    purgeZoneTitle: 'Zone de purge',
    overclockTitle: 'Overclock',
    breachContainedTitle: 'Brèche contenue',
  },
  upgrades: {
    node0Boot: {
      name: 'Amorçage Node-0',
      description: 'Initialise le thread de quarantaine, 5 dégâts de purge de base',
    },
    purgeStrike: {
      name: 'Frappe de purge',
      description: '+3 dégâts de purge par rang',
    },
    purgeCadence: {
      name: 'Cadence de purge',
      description: '+2,5 % de cadence de purge par rang',
    },
    purgeReach: {
      name: 'Portée de purge',
      description: '+2,5 % de zone de purge par rang',
    },
    threadCoolant: {
      name: 'Refroidissement de thread',
      description: '−0,14 de Surcharge passive / s par rang',
    },
    killBreachRelief: {
      name: 'Évacuation de kill',
      description: '−0,1 % de Brèche par kill par rang',
    },
    meltdownThreshold: {
      name: 'Seuil de fusion',
      description: '+8 % de plafond Surcharge par rang (max 180 %)',
    },
  },
  branches: {
    degats: 'Dégâts',
    thermique: 'Thermique',
    flux: 'Flux',
  },
  tooltipStats: {
    purgeHitDamage: 'Dégâts de purge',
    purgeDamageBonus: 'Bonus dégâts purge',
    purgeCadence: 'Cadence de purge',
    purgeReach: 'Rayon zone de purge',
    purgeReachBonus: 'Bonus zone de purge',
    passiveBreachPerSec: 'Brèche passive / sec',
    reduction: 'Réduction',
    breachReliefPerKill: 'Soulagement Brèche / kill',
    meltdownThreshold: 'Seuil de fusion',
    max: 'max',
  },
  playerStats: {
    title: 'NODE-0 // STATS',
    openLabel: 'Stats Node-0',
    cadenceUnit: '/s',
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
    cycleLabel: 'Cycle {n}',
    cycleWaveFormat: 'Cycle {cycle} · Vague {wave}/{max}',
    cycleBossFormat: 'Cycle {cycle} · BOSS',
  },
};
