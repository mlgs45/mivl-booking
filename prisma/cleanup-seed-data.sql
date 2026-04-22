BEGIN;

CREATE TEMP TABLE fake_emails (email text PRIMARY KEY);
INSERT INTO fake_emails (email) VALUES
  ('gestionnaire@cci-centre.fr'),
  ('contact@thalesmecanique.fr'),
  ('rh@cosmetique-loire.fr'),
  ('emploi@plastiloire.fr'),
  ('recrutement@metallurgie-bourges.fr'),
  ('dev@numeric-tours.fr'),
  ('profhistoire@college-jean-rostand.fr'),
  ('profsvt@lycee-benjamin-franklin.fr'),
  ('lea.martin@example.fr'),
  ('mathis.petit@example.fr'),
  ('emma.durand@example.fr'),
  ('yanis.bernard@example.fr'),
  ('chloe.thomas@example.fr'),
  ('noah.robert@example.fr'),
  ('sara.richard@example.fr'),
  ('lucas.michel@example.fr'),
  ('jade.laurent@example.fr'),
  ('hugo.simon@example.fr'),
  ('sophie.gauthier@example.fr'),
  ('karim.benali@example.fr');

SELECT u.role, COUNT(*) AS nb
FROM "User" u
JOIN fake_emails f ON f.email = u.email
GROUP BY u.role
ORDER BY u.role;

DELETE FROM "User"
WHERE email IN (SELECT email FROM fake_emails);

DELETE FROM "EmailLog"
WHERE destinataire IN (SELECT email FROM fake_emails);

DELETE FROM "OtpCode"
WHERE email IN (SELECT email FROM fake_emails);

SELECT 'User' AS table_name, COUNT(*) FROM "User"
UNION ALL SELECT 'Exposant', COUNT(*) FROM "Exposant"
UNION ALL SELECT 'Enseignant', COUNT(*) FROM "Enseignant"
UNION ALL SELECT 'Groupe', COUNT(*) FROM "Groupe"
UNION ALL SELECT 'Jeune', COUNT(*) FROM "Jeune"
UNION ALL SELECT 'DemandeurEmploi', COUNT(*) FROM "DemandeurEmploi"
UNION ALL SELECT 'Creneau', COUNT(*) FROM "Creneau"
UNION ALL SELECT 'RendezVous', COUNT(*) FROM "RendezVous"
UNION ALL SELECT 'MembreStand', COUNT(*) FROM "MembreStand"
UNION ALL SELECT 'ScanEntreeStand', COUNT(*) FROM "ScanEntreeStand";

SELECT email, role, "createdAt" FROM "User" ORDER BY "createdAt";
