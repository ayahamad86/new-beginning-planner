const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.bill.deleteMany({});
  await prisma.income.deleteMany({});
  await prisma.reflection.deleteMany({});
  await prisma.emergencyFund.deleteMany({});
  await prisma.user.deleteMany({});

  // Create demo user
  const hashedPassword = await bcrypt.hash('DemoPass123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('Created demo user:', user.email);

  // Create income sources
  const incomes = await prisma.income.createMany({
    data: [
      {
        userId: user.id,
        name: 'Main Salary',
        amount: 4500,
        frequency: 'monthly',
      },
      {
        userId: user.id,
        name: 'Freelance Projects',
        amount: 800,
        frequency: 'bi-weekly',
      },
      {
        userId: user.id,
        name: 'Investment Returns',
        amount: 1200,
        frequency: 'annual',
      },
    ],
  });

  console.log(`Created ${incomes.count} income sources`);

  // Create bills
  const now = new Date();
  const bills = await prisma.bill.createMany({
    data: [
      {
        userId: user.id,
        name: 'Rent',
        amount: 1500,
        dueDate: 1,
        category: 'rent',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      {
        userId: user.id,
        name: 'Electricity Bill',
        amount: 120,
        dueDate: 15,
        category: 'utilities',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      {
        userId: user.id,
        name: 'Internet',
        amount: 50,
        dueDate: 10,
        category: 'utilities',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      {
        userId: user.id,
        name: 'Netflix',
        amount: 15.99,
        dueDate: 22,
        category: 'subscription',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      {
        userId: user.id,
        name: 'Spotify',
        amount: 9.99,
        dueDate: 5,
        category: 'subscription',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        isPaid: true,
      },
      {
        userId: user.id,
        name: 'Car Insurance',
        amount: 150,
        dueDate: 28,
        category: 'insurance',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      {
        userId: user.id,
        name: 'Groceries',
        amount: 300,
        dueDate: 20,
        category: 'groceries',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    ],
  });

  console.log(`Created ${bills.count} bills`);

  // Create emergency fund
  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() + 1);

  const emergencyFund = await prisma.emergencyFund.create({
    data: {
      userId: user.id,
      targetAmount: 15000,
      currentAmount: 4250,
      targetDate: targetDate,
      recommendedMonthly: 892.86,
    },
  });

  console.log('Created emergency fund goal');

  // Create reflections
  const reflections = await prisma.reflection.createMany({
    data: [
      {
        userId: user.id,
        entry:
          'Had a stressful day at work. Bought coffee twice and treated myself to lunch instead of bringing it from home. Need to be more mindful about stress spending.',
        emotionalSpent: 25.5,
        triggers: 'stress, work pressure',
        mood: 'stressed',
      },
      {
        userId: user.id,
        entry:
          'Great day! Completed my project ahead of schedule. Resisted the urge to celebrate with shopping. Stayed within budget.',
        emotionalSpent: 0,
        triggers: 'achievement',
        mood: 'excellent',
      },
      {
        userId: user.id,
        entry:
          'Felt bored in the evening and scrolled through online stores for an hour. Did not make any purchases which is good. Redirected to reading instead.',
        emotionalSpent: 0,
        triggers: 'boredom',
        mood: 'neutral',
      },
      {
        userId: user.id,
        entry:
          'Met friends for lunch and ended up spending more than planned on drinks and dessert. Need to set a budget for social outings.',
        emotionalSpent: 45.75,
        triggers: 'social pressure, FOMO',
        mood: 'good',
      },
    ],
  });

  console.log(`Created ${reflections.count} reflections`);

  console.log('✅ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
