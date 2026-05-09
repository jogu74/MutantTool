import bcrypt from "bcryptjs";

import { PrismaClient } from "../generated/prisma";

import {
  calculateCarryingCapacity,
  calculateDamageBonus,
  calculateInitiativeBonus,
  calculateReactionValue,
  calculateTraumaThreshold,
  calculateSkillFinalValue
} from "../lib/rules";

const prisma = new PrismaClient();

const NATURAL_SKILLS = [
  "Akrobatik",
  "Båge",
  "Första hjälpen",
  "Gevär",
  "Iakttagelseförmåga",
  "Kasta",
  "Köpslå",
  "Närstrid",
  "Pistol",
  "Smyga/Gömma sig"
];

async function main() {
  const passwordHash = await bcrypt.hash("mutant123", 10);

  await prisma.backupSnapshot.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.armorItem.deleteMany();
  await prisma.equipmentItem.deleteMany();
  await prisma.weapon.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.characterStats.deleteMany();
  await prisma.character.deleteMany();
  await prisma.user.deleteMany();
  await prisma.campaign.deleteMany();

  const campaign = await prisma.campaign.create({
    data: {
      name: "Undergångens arvtagare"
    }
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@mutant.local",
        name: "Spelledare",
        passwordHash,
        role: "ADMIN"
      }
    }),
    prisma.user.create({
      data: {
        email: "alva@mutant.local",
        name: "Alva",
        passwordHash,
        role: "PLAYER"
      }
    }),
    prisma.user.create({
      data: {
        email: "bo@mutant.local",
        name: "Bo",
        passwordHash,
        role: "PLAYER"
      }
    }),
    prisma.user.create({
      data: {
        email: "cian@mutant.local",
        name: "Cian",
        passwordHash,
        role: "PLAYER"
      }
    }),
    prisma.user.create({
      data: {
        email: "disa@mutant.local",
        name: "Disa",
        passwordHash,
        role: "PLAYER"
      }
    })
  ]);

  const playerSeeds = [
    {
      user: users[1],
      name: "Rost",
      className: "Fixare",
      formerOccupation: "Skrotsamlare",
      home: "Sektor 9",
      age: "31",
      gender: "Kvinna",
      length: "172 cm",
      weight: "68 kg",
      appearance: "Fläckig läderrock, lugn blick",
      reputation: "Pålitlig",
      status: "Oskadd",
      bodyPoints: 12,
      stats: {
        strength: 12,
        physique: 13,
        size: 11,
        agility: 14,
        intelligence: 15,
        willpower: 12,
        personality: 10
      }
    },
    {
      user: users[2],
      name: "Kåda",
      className: "Väktare",
      formerOccupation: "Tunnelvakt",
      home: "Torrvik",
      age: "43",
      gender: "Man",
      length: "184 cm",
      weight: "89 kg",
      appearance: "Ärrad, rak hållning",
      reputation: "Respekterad",
      status: "Trött",
      bodyPoints: 14,
      stats: {
        strength: 15,
        physique: 14,
        size: 13,
        agility: 11,
        intelligence: 10,
        willpower: 13,
        personality: 9
      }
    },
    {
      user: users[3],
      name: "Sot",
      className: "Spejare",
      formerOccupation: "Budbärare",
      home: "Granruinen",
      age: "24",
      gender: "Icke-binär",
      length: "166 cm",
      weight: "59 kg",
      appearance: "Snabba händer, väderbiten scarf",
      reputation: "Undflyende",
      status: "Orolig",
      bodyPoints: 11,
      stats: {
        strength: 9,
        physique: 10,
        size: 9,
        agility: 16,
        intelligence: 13,
        willpower: 11,
        personality: 12
      }
    },
    {
      user: users[4],
      name: "Myr",
      className: "Lärd",
      formerOccupation: "Apotekare",
      home: "Rörverket",
      age: "38",
      gender: "Kvinna",
      length: "169 cm",
      weight: "65 kg",
      appearance: "Noggranna anteckningar, sotiga glasögon",
      reputation: "Besynnerlig",
      status: "Fokuserad",
      bodyPoints: 10,
      stats: {
        strength: 8,
        physique: 9,
        size: 10,
        agility: 12,
        intelligence: 17,
        willpower: 15,
        personality: 13
      }
    }
  ];

  for (const seed of playerSeeds) {
    const damageBonus = calculateDamageBonus(seed.stats.strength, seed.stats.size);
    const initiativeBonus = calculateInitiativeBonus(seed.stats.agility, seed.stats.intelligence);
    const carryingCapacity = calculateCarryingCapacity(seed.stats.strength, seed.stats.physique);
    const reactionValue = calculateReactionValue(seed.stats.agility, seed.stats.intelligence);
    const traumaThreshold = calculateTraumaThreshold(seed.stats.physique, seed.stats.willpower);

    const character = await prisma.character.create({
      data: {
        campaignId: campaign.id,
        userId: seed.user.id,
        name: seed.name,
        playerName: seed.user.name,
        className: seed.className,
        formerOccupation: seed.formerOccupation,
        home: seed.home,
        age: seed.age,
        gender: seed.gender,
        length: seed.length,
        weight: seed.weight,
        appearance: seed.appearance,
        reputation: seed.reputation,
        status: seed.status,
        bodyPoints: seed.bodyPoints,
        traumaThreshold,
        notes: "Exempelkaraktär för första versionen.",
        kroncreditsOnHand: 3,
        kroncreditsStash: 7,
        creditsOnHand: 12,
        creditsStash: 25,
        jacksOnHand: 1,
        jacksStash: 2,
        stats: {
          create: {
            ...seed.stats,
            damageBonus,
            initiativeBonus,
            carryingCapacity,
            reactionValue
          }
        }
      }
    });

    await prisma.skill.createMany({
      data: NATURAL_SKILLS.map((name, index) => ({
        characterId: character.id,
        name,
        type: "NATURAL",
        skillValue: 10 + index,
        modifier: index % 2,
        finalValue: calculateSkillFinalValue(10 + index, index % 2)
      }))
    });

    await prisma.skill.createMany({
      data: Array.from({ length: 4 }).map((_, index) => ({
        characterId: character.id,
        name: `Tränad färdighet ${index + 1}`,
        type: "TRAINED",
        skillValue: 0,
        modifier: 0,
        finalValue: 0
      }))
    });

    await prisma.weapon.createMany({
      data: [
        {
          characterId: character.id,
          name: "Pistol",
          hitChance: 48,
          initiative: 2,
          damage: "1T10+1",
          penetration: 0,
          range: "20 m",
          rateOfFire: "1",
          minStrength: 0,
          ammoCurrent: 9,
          ammoMax: 12,
          weight: 1.2
        },
        {
          characterId: character.id,
          name: "Kniv",
          hitChance: 55,
          initiative: 4,
          damage: "1T6",
          penetration: 0,
          range: "Närstrid",
          rateOfFire: "1",
          minStrength: 0,
          ammoCurrent: 0,
          ammoMax: 0,
          weight: 0.4
        }
      ]
    });

    await prisma.equipmentItem.createMany({
      data: [
        {
          characterId: character.id,
          name: "Rep",
          weight: 1.5,
          quantity: 1,
          notes: "15 meter",
          equipped: true
        },
        {
          characterId: character.id,
          name: "Vattenflaska",
          weight: 0.8,
          quantity: 2,
          notes: null,
          equipped: false
        }
      ]
    });

    await prisma.armorItem.createMany({
      data: [
        {
          characterId: character.id,
          name: "Skinnjacka",
          armorValue: 1,
          protection: "Lätt",
          weight: 2.1,
          location: "Torso"
        }
      ]
    });
  }

  await prisma.journalEntry.create({
    data: {
      campaignId: campaign.id,
      authorId: users[0].id,
      title: "Välkomna till kampanjen",
      content: "Första exempelanteckningen. Här kan gruppen skriva minnesanteckningar efter spelmötet."
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
