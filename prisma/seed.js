const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('changeme123', 12);

  // Create Nishanth (Admin)
  const nishanth = await prisma.user.upsert({
    where: { email: 'nishanth@jobhunt.app' },
    update: {},
    create: {
      name: 'Nishanth',
      email: 'nishanth@jobhunt.app',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create Indhu (User)
  const indhu = await prisma.user.upsert({
    where: { email: 'indhu@jobhunt.app' },
    update: {},
    create: {
      name: 'Indhu',
      email: 'indhu@jobhunt.app',
      password: hashedPassword,
      role: 'USER',
    },
  });

  // Create default preferences for both
  await prisma.preference.upsert({
    where: { userId: nishanth.id },
    update: {},
    create: {
      userId: nishanth.id,
      jobRoles: JSON.stringify([]),
      locations: JSON.stringify([]),
      industries: JSON.stringify([]),
      jobType: 'any',
    },
  });

  await prisma.preference.upsert({
    where: { userId: indhu.id },
    update: {},
    create: {
      userId: indhu.id,
      jobRoles: JSON.stringify([]),
      locations: JSON.stringify([]),
      industries: JSON.stringify([]),
      jobType: 'any',
    },
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('👤 Login credentials:');
  console.log('   Nishanth → nishanth@jobhunt.app / changeme123');
  console.log('   Indhu    → indhu@jobhunt.app    / changeme123');
  console.log('');
  console.log('⚠️  Please change your passwords after first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
