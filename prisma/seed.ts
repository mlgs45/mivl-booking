/**
 * Seed de démo pour MIVL Booking.
 * - 1 super admin (depuis SUPER_ADMIN_EMAIL)
 * - 1 gestionnaire CCI
 * - 5 exposants validés (secteurs industriels variés)
 * - 2 enseignants + 3 groupes
 * - 10 jeunes
 * - 2 demandeurs d'emploi
 * - Créneaux + quelques RDV de démonstration
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import { addMinutes } from "date-fns";

const db = new PrismaClient();

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ?? "mathieu.langlois@centre.cci.fr";
const DEV_PASSWORD = "ChangeMe123!";
const DATE_SALON = new Date("2026-10-15T00:00:00.000Z");

/** Helper : YYYY-MM-DD + HH:MM → DateTime local */
const makeDateTime = (date: Date, hhmm: string): Date => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setUTCHours(h ?? 0, m ?? 0, 0, 0);
  return d;
};

async function main() {
  console.log("🌱 MIVL Booking — seed démarré");

  // ─── Nettoyage ─────────────────────────────────────────────────────────
  await db.scanEntreeStand.deleteMany();
  await db.rendezVous.deleteMany();
  await db.creneau.deleteMany();
  await db.exposant.deleteMany();
  await db.groupe.deleteMany();
  await db.enseignant.deleteMany();
  await db.jeune.deleteMany();
  await db.demandeurEmploi.deleteMany();
  await db.auditLog.deleteMany();
  await db.emailLog.deleteMany();
  await db.user.deleteMany();
  await db.configurationSalon.deleteMany();

  // ─── Configuration globale ─────────────────────────────────────────────
  await db.configurationSalon.create({
    data: {
      id: 1,
      dateSalon: DATE_SALON,
      heureDebutMatin: "09:00",
      heureFinMatin: "12:00",
      dureeRdvGroupeMinutes: 20,
      dureeTransitionGroupeMinutes: 10,
      nbRdvParParcoursGroupe: 4,
      creneauxArriveeMatin: ["09:00", "09:15", "09:30"],
      heureDebutApresMidi: "14:00",
      heureFinApresMidi: "18:00",
      dureeSpeedDatingMinutes: 5,
      dureeTransitionSpeedDatingMinutes: 5,
      maxRdvParVisiteur: 6,
      inscriptionsExposantsOuvertes: true,
      inscriptionsVisiteursOuvertes: true,
    },
  });

  // ─── Super admin ───────────────────────────────────────────────────────
  const passwordHash = await hash(DEV_PASSWORD);
  const superAdmin = await db.user.create({
    data: {
      email: SUPER_ADMIN_EMAIL,
      role: "SUPER_ADMIN",
      name: "Mathieu Langlois",
      hashedPassword: passwordHash,
      emailVerifie: new Date(),
    },
  });

  // ─── Gestionnaire CCI ──────────────────────────────────────────────────
  const gestionnaire = await db.user.create({
    data: {
      email: "gestionnaire@cci-centre.fr",
      role: "GESTIONNAIRE",
      name: "Claire Moreau",
      hashedPassword: passwordHash,
      emailVerifie: new Date(),
    },
  });

  // ─── Exposants (5) ─────────────────────────────────────────────────────
  const exposantsData = [
    {
      email: "contact@thalesmecanique.fr",
      raisonSociale: "Thalès Mécanique",
      secteur: "AERONAUTIQUE",
      ville: "Orléans",
      codePostal: "45000",
      description:
        "Équipementier aéronautique spécialisé dans l'usinage de précision pour Airbus et Dassault. Site de 240 salariés à Orléans-la-Source.",
      offres: ["DECOUVERTE_ENTREPRISE", "DECOUVERTE_METIERS", "OPPORTUNITES"] as const,
      typesOpportunites: [
        "STAGE_BTS",
        "APPRENTISSAGE",
        "ALTERNANCE",
        "CDI",
      ] as const,
      metiers: [
        "OPERATEUR_CN",
        "PROGRAMMEUR_CN",
        "TOURNEUR_FRAISEUR",
        "INGENIEUR_METHODES",
      ],
      ressourcesMatin: 2,
      ressourcesApresMidi: 3,
    },
    {
      email: "rh@cosmetique-loire.fr",
      raisonSociale: "Cosmétique Val de Loire",
      secteur: "COSMETIQUE",
      ville: "Chartres",
      codePostal: "28000",
      description:
        "Façonnier cosmétique pour grandes maisons de luxe. Conditionnement, remplissage, assemblage — 350 emplois en Eure-et-Loir.",
      offres: ["DECOUVERTE_ENTREPRISE", "OPPORTUNITES"] as const,
      typesOpportunites: ["STAGE_3E", "APPRENTISSAGE", "CDD", "CDI", "JOB_ETE"] as const,
      metiers: [
        "CONDUCTEUR_LIGNE",
        "OPERATEUR_PROD",
        "TECHNICIEN_QUALITE",
        "RESPONSABLE_PROD",
      ],
      ressourcesMatin: 2,
      ressourcesApresMidi: 2,
    },
    {
      email: "emploi@plastiloire.fr",
      raisonSociale: "Plastiloire Industries",
      secteur: "PLASTURGIE",
      ville: "Blois",
      codePostal: "41000",
      description:
        "Transformateur plastique technique pour l'automobile et le médical. Injection, extrusion, 120 salariés.",
      offres: ["DECOUVERTE_METIERS", "OPPORTUNITES"] as const,
      typesOpportunites: ["STAGE_3E", "STAGE_BTS", "APPRENTISSAGE", "CDI"] as const,
      metiers: [
        "REGLEUR",
        "TECHNICIEN_MAINTENANCE",
        "AUTOMATICIEN",
        "TECHNICIEN_QUALITE",
      ],
      ressourcesMatin: 1,
      ressourcesApresMidi: 2,
    },
    {
      email: "recrutement@metallurgie-bourges.fr",
      raisonSociale: "Métallurgie de Bourges",
      secteur: "METALLURGIE",
      ville: "Bourges",
      codePostal: "18000",
      description:
        "Fonderie d'aluminium et traitement thermique pour industrie ferroviaire et énergie. 180 collaborateurs.",
      offres: ["DECOUVERTE_ENTREPRISE", "DECOUVERTE_METIERS"] as const,
      typesOpportunites: ["STAGE_3E", "STAGE_SECONDE"] as const,
      metiers: [
        "OPERATEUR_PROD",
        "CHAUDRONNIER",
        "SOUDEUR",
        "TECHNICIEN_MAINTENANCE",
      ],
      ressourcesMatin: 1,
      ressourcesApresMidi: 1,
    },
    {
      email: "dev@numeric-tours.fr",
      raisonSociale: "Numeric Tours Industries",
      secteur: "NUMERIQUE",
      ville: "Tours",
      codePostal: "37000",
      description:
        "ESN industrielle : ingénierie logicielle embarquée, automatismes, IoT pour l'industrie 4.0. 95 ingénieurs.",
      offres: ["DECOUVERTE_METIERS", "OPPORTUNITES"] as const,
      typesOpportunites: [
        "STAGE_LICENCE",
        "STAGE_MASTER",
        "APPRENTISSAGE",
        "ALTERNANCE",
        "CDI",
      ] as const,
      metiers: [
        "DEV_LOGICIEL",
        "DEV_WEB",
        "AUTOMATICIEN",
        "INGENIEUR_RD",
        "DATA_ANALYST",
      ],
      ressourcesMatin: 2,
      ressourcesApresMidi: 3,
    },
  ];

  const exposants = [];
  for (const ex of exposantsData) {
    const user = await db.user.create({
      data: {
        email: ex.email,
        role: "EXPOSANT",
        name: ex.raisonSociale,
        emailVerifie: new Date(),
      },
    });
    const exposant = await db.exposant.create({
      data: {
        userId: user.id,
        raisonSociale: ex.raisonSociale,
        secteur: ex.secteur,
        ville: ex.ville,
        codePostal: ex.codePostal,
        description: ex.description,
        offres: [...ex.offres],
        typesOpportunites: [...ex.typesOpportunites],
        metiersProposes: ex.metiers,
        ressourcesMatin: ex.ressourcesMatin,
        ressourcesApresMidi: ex.ressourcesApresMidi,
        quotaGroupesMatinParCreneau: ex.ressourcesMatin,
        quotaGroupesMatinTotal: 8,
        statut: "VALIDE",
        valideParId: superAdmin.id,
        valideA: new Date(),
      },
    });
    exposants.push(exposant);
  }

  // ─── Enseignants + groupes ─────────────────────────────────────────────
  const enseignant1User = await db.user.create({
    data: {
      email: "profhistoire@college-jean-rostand.fr",
      role: "ENSEIGNANT",
      name: "Élise Dupont",
      emailVerifie: new Date(),
    },
  });
  const enseignant1 = await db.enseignant.create({
    data: {
      userId: enseignant1User.id,
      prenom: "Élise",
      nom: "Dupont",
      etablissement: "Collège Jean Rostand",
      ville: "Orléans",
      matiere: "Histoire-géographie",
      niveau: "QUATRIEME",
    },
  });

  const enseignant2User = await db.user.create({
    data: {
      email: "profsvt@lycee-benjamin-franklin.fr",
      role: "ENSEIGNANT",
      name: "Thomas Leroy",
      emailVerifie: new Date(),
    },
  });
  const enseignant2 = await db.enseignant.create({
    data: {
      userId: enseignant2User.id,
      prenom: "Thomas",
      nom: "Leroy",
      etablissement: "Lycée Benjamin Franklin",
      ville: "Orléans",
      matiere: "SVT",
      niveau: "SECONDE",
    },
  });

  const groupe4eB = await db.groupe.create({
    data: {
      enseignantId: enseignant1.id,
      nom: "4eB",
      niveau: "QUATRIEME",
      tailleEffective: 6,
      prenomsEleves: ["Lou", "Mehdi", "Sara", "Noah", "Léa", "Ayoub"],
      creneauArrivee: "09:00",
    },
  });
  const groupe3eA = await db.groupe.create({
    data: {
      enseignantId: enseignant1.id,
      nom: "3eA",
      niveau: "TROISIEME",
      tailleEffective: 5,
      prenomsEleves: ["Alice", "Tom", "Inès", "Hugo", "Jade"],
      creneauArrivee: "09:15",
    },
  });
  const groupe2nde1 = await db.groupe.create({
    data: {
      enseignantId: enseignant2.id,
      nom: "2nde1",
      niveau: "SECONDE",
      tailleEffective: 7,
      prenomsEleves: [
        "Gabriel",
        "Louise",
        "Raphaël",
        "Emma",
        "Jules",
        "Chloé",
        "Adam",
      ],
      creneauArrivee: "09:30",
    },
  });

  // ─── Jeunes (10) ───────────────────────────────────────────────────────
  const jeunesData = [
    {
      email: "lea.martin@example.fr",
      prenom: "Léa",
      nom: "Martin",
      niveauEtudes: "Terminale générale",
      etablissement: "Lycée Pothier, Orléans",
      metiers: ["INGENIEUR_RD", "DEV_LOGICIEL"],
    },
    {
      email: "mathis.petit@example.fr",
      prenom: "Mathis",
      nom: "Petit",
      niveauEtudes: "BTS CRSA 2e année",
      etablissement: "Lycée Durzy, Villemandeur",
      metiers: ["AUTOMATICIEN", "TECHNICIEN_METHODES"],
    },
    {
      email: "emma.durand@example.fr",
      prenom: "Emma",
      nom: "Durand",
      niveauEtudes: "Licence pro Production",
      etablissement: "IUT de Bourges",
      metiers: ["RESPONSABLE_PROD", "INGENIEUR_METHODES"],
    },
    {
      email: "yanis.bernard@example.fr",
      prenom: "Yanis",
      nom: "Bernard",
      niveauEtudes: "Bac pro Maintenance",
      etablissement: "Lycée Gaston Bachelard, Chartres",
      metiers: ["TECHNICIEN_MAINTENANCE", "ELECTROMECANICIEN"],
    },
    {
      email: "chloe.thomas@example.fr",
      prenom: "Chloé",
      nom: "Thomas",
      niveauEtudes: "Master 2 Qualité",
      etablissement: "Université d'Orléans",
      metiers: ["RESPONSABLE_QHSE", "INGENIEUR_INDUSTRIALISATION"],
    },
    {
      email: "noah.robert@example.fr",
      prenom: "Noah",
      nom: "Robert",
      niveauEtudes: "Terminale STI2D",
      etablissement: "Lycée Jean-Zay, Orléans",
      metiers: ["DEV_LOGICIEL", "DATA_ANALYST"],
    },
    {
      email: "sara.richard@example.fr",
      prenom: "Sara",
      nom: "Richard",
      niveauEtudes: "BTS Support à l'action managériale",
      etablissement: "Lycée Voltaire, Orléans",
      metiers: ["ASSISTANT_RH", "CHARGE_RECRUTEMENT"],
    },
    {
      email: "lucas.michel@example.fr",
      prenom: "Lucas",
      nom: "Michel",
      niveauEtudes: "Licence SVT",
      etablissement: "Université de Tours",
      metiers: ["TECHNICIEN_QUALITE", "CONTROLEUR_QUALITE"],
    },
    {
      email: "jade.laurent@example.fr",
      prenom: "Jade",
      nom: "Laurent",
      niveauEtudes: "BTS Conception de produits industriels",
      etablissement: "Lycée Benjamin Franklin, Orléans",
      metiers: ["DESSINATEUR_INDUS", "PROJETEUR", "INGENIEUR_BE"],
    },
    {
      email: "hugo.simon@example.fr",
      prenom: "Hugo",
      nom: "Simon",
      niveauEtudes: "Terminale pro Pilotage de ligne",
      etablissement: "Lycée de l'Hôtellerie et du Tourisme, Blois",
      metiers: ["CONDUCTEUR_LIGNE", "REGLEUR"],
    },
  ];

  const jeunes = [];
  for (const j of jeunesData) {
    const user = await db.user.create({
      data: {
        email: j.email,
        role: "JEUNE",
        name: `${j.prenom} ${j.nom}`,
        emailVerifie: new Date(),
      },
    });
    const jeune = await db.jeune.create({
      data: {
        userId: user.id,
        prenom: j.prenom,
        nom: j.nom,
        dateNaissance: new Date("2006-06-15"),
        niveauEtudes: j.niveauEtudes,
        etablissement: j.etablissement,
        metiersInteret: j.metiers,
        secteurInteret: [],
      },
    });
    jeunes.push(jeune);
  }

  // ─── Demandeurs d'emploi (2) ───────────────────────────────────────────
  const deData = [
    {
      email: "sophie.gauthier@example.fr",
      prenom: "Sophie",
      nom: "Gauthier",
      agence: "France Travail Orléans-Madeleine",
      metiers: ["TECHNICIEN_QUALITE", "ANIMATEUR_QHSE"],
    },
    {
      email: "karim.benali@example.fr",
      prenom: "Karim",
      nom: "Benali",
      agence: "France Travail Tours Nord",
      metiers: ["CHEF_EQUIPE_PROD", "RESPONSABLE_PROD"],
    },
  ];

  const demandeursEmploi = [];
  for (const de of deData) {
    const user = await db.user.create({
      data: {
        email: de.email,
        role: "DEMANDEUR_EMPLOI",
        name: `${de.prenom} ${de.nom}`,
        emailVerifie: new Date(),
      },
    });
    const d = await db.demandeurEmploi.create({
      data: {
        userId: user.id,
        prenom: de.prenom,
        nom: de.nom,
        agencePoleEmploi: de.agence,
        metiersRecherche: de.metiers,
        secteurRecherche: [],
      },
    });
    demandeursEmploi.push(d);
  }

  // ─── Créneaux : matin (groupes) pour chaque exposant × chaque ressource ─
  // Matin : 9h00 à 12h00, RDV 20 min, transition 10 min → créneaux toutes les 30 min
  // (9h00, 9h30, 10h00, 10h30, 11h00, 11h30 → 6 créneaux × ressources)
  const matinHeures = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  for (const exposant of exposants) {
    for (let r = 1; r <= exposant.ressourcesMatin; r++) {
      for (const h of matinHeures) {
        const debut = makeDateTime(DATE_SALON, h);
        const fin = addMinutes(debut, 20);
        await db.creneau.create({
          data: {
            exposantId: exposant.id,
            debut,
            fin,
            type: "GROUPE_MATIN",
            ressourceIndex: r,
            capaciteMax: 10, // sera affiné par groupe
          },
        });
      }
    }
  }

  // ─── Créneaux : après-midi (speed dating) ──────────────────────────────
  // 14h00 à 18h00, 5 min RDV + 5 min transition = 10 min par slot
  // → 24 créneaux × ressources
  const apremHeures: string[] = [];
  for (let h = 14; h < 18; h++) {
    for (let m = 0; m < 60; m += 10) {
      apremHeures.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  for (const exposant of exposants) {
    for (let r = 1; r <= exposant.ressourcesApresMidi; r++) {
      for (const h of apremHeures) {
        const debut = makeDateTime(DATE_SALON, h);
        const fin = addMinutes(debut, 5);
        await db.creneau.create({
          data: {
            exposantId: exposant.id,
            debut,
            fin,
            type: "SPEED_DATING",
            ressourceIndex: r,
            capaciteMax: 1,
          },
        });
      }
    }
  }

  // ─── Quelques RDV de démonstration ─────────────────────────────────────
  // Groupe 4eB fait 2 RDV le matin
  const creneauxGroupe4eB = await db.creneau.findMany({
    where: { type: "GROUPE_MATIN", exposantId: exposants[0]!.id },
    orderBy: { debut: "asc" },
    take: 1,
  });
  if (creneauxGroupe4eB[0]) {
    await db.rendezVous.create({
      data: {
        creneauId: creneauxGroupe4eB[0].id,
        type: "GROUPE",
        groupeId: groupe4eB.id,
        statut: "CONFIRME",
      },
    });
  }

  // Jeune #1 (Léa) réserve 3 speed datings chez Numeric Tours
  const creneauxNumeric = await db.creneau.findMany({
    where: { type: "SPEED_DATING", exposantId: exposants[4]!.id },
    orderBy: { debut: "asc" },
    take: 3,
  });
  for (const c of creneauxNumeric) {
    await db.rendezVous.create({
      data: {
        creneauId: c.id,
        type: "SPEED_DATING",
        jeuneId: jeunes[0]!.id,
        statut: "CONFIRME",
      },
    });
  }

  // DE #1 (Sophie) réserve 2 speed datings chez Thalès et Plastiloire
  const creneauThales = await db.creneau.findFirst({
    where: { type: "SPEED_DATING", exposantId: exposants[0]!.id },
    orderBy: { debut: "asc" },
  });
  const creneauPlasti = await db.creneau.findFirst({
    where: { type: "SPEED_DATING", exposantId: exposants[2]!.id },
    orderBy: { debut: "asc" },
  });
  if (creneauThales) {
    await db.rendezVous.create({
      data: {
        creneauId: creneauThales.id,
        type: "SPEED_DATING",
        demandeurEmploiId: demandeursEmploi[0]!.id,
        statut: "CONFIRME",
      },
    });
  }
  if (creneauPlasti) {
    await db.rendezVous.create({
      data: {
        creneauId: creneauPlasti.id,
        type: "SPEED_DATING",
        demandeurEmploiId: demandeursEmploi[0]!.id,
        statut: "CONFIRME",
      },
    });
  }

  // ─── Récapitulatif ─────────────────────────────────────────────────────
  const counts = {
    users: await db.user.count(),
    exposants: await db.exposant.count(),
    enseignants: await db.enseignant.count(),
    groupes: await db.groupe.count(),
    jeunes: await db.jeune.count(),
    demandeursEmploi: await db.demandeurEmploi.count(),
    creneaux: await db.creneau.count(),
    rendezVous: await db.rendezVous.count(),
  };

  console.log("✅ Seed terminé");
  console.table(counts);
  console.log(`\n🔑 Identifiants dev :`);
  console.log(`   Super admin : ${SUPER_ADMIN_EMAIL} / ${DEV_PASSWORD}`);
  console.log(`   Gestionnaire : gestionnaire@cci-centre.fr / ${DEV_PASSWORD}`);
  console.log(`   Exposants / visiteurs → magic link (à brancher en Phase 5)\n`);
  // Silence unused var warnings
  void gestionnaire;
  void groupe3eA;
  void groupe2nde1;
}

main()
  .catch((err) => {
    console.error("❌ Erreur de seed :", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
