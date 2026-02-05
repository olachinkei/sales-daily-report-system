import { PrismaClient, ReportStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 上長（田中課長）を作成
  const manager = await prisma.sales.upsert({
    where: { email: 'tanaka@example.com' },
    update: {},
    create: {
      name: '田中課長',
      email: 'tanaka@example.com',
      password: hashedPassword,
      department: '営業部',
      managerId: null,
    },
  });

  console.log(`Created manager: ${manager.name}`);

  // 営業担当者を作成（部下）
  const yamada = await prisma.sales.upsert({
    where: { email: 'yamada@example.com' },
    update: {},
    create: {
      name: '山田太郎',
      email: 'yamada@example.com',
      password: hashedPassword,
      department: '営業1課',
      managerId: manager.id,
    },
  });

  const sato = await prisma.sales.upsert({
    where: { email: 'sato@example.com' },
    update: {},
    create: {
      name: '佐藤花子',
      email: 'sato@example.com',
      password: hashedPassword,
      department: '営業1課',
      managerId: manager.id,
    },
  });

  const suzuki = await prisma.sales.upsert({
    where: { email: 'suzuki@example.com' },
    update: {},
    create: {
      name: '鈴木一郎',
      email: 'suzuki@example.com',
      password: hashedPassword,
      department: '営業1課',
      managerId: manager.id,
    },
  });

  console.log(`Created sales: ${yamada.name}, ${sato.name}, ${suzuki.name}`);

  // 管理者を作成
  const admin = await prisma.sales.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: '管理者',
      email: 'admin@example.com',
      password: hashedPassword,
      department: '管理部',
      managerId: null,
    },
  });

  console.log(`Created admin: ${admin.name}`);

  // 顧客を作成
  const customer1 = await prisma.customer.create({
    data: {
      name: 'ABC商事',
      address: '東京都千代田区1-1-1',
      phone: '03-1234-5678',
      industry: '製造業',
      salesId: yamada.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'XYZ株式会社',
      address: '東京都港区2-2-2',
      phone: '03-5678-9012',
      industry: 'IT業',
      salesId: yamada.id,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'DEF物産',
      address: '東京都新宿区3-3-3',
      phone: '03-9012-3456',
      industry: '商社',
      salesId: sato.id,
    },
  });

  console.log(`Created customers: ${customer1.name}, ${customer2.name}, ${customer3.name}`);

  // 日報を作成
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const report1 = await prisma.dailyReport.create({
    data: {
      salesId: yamada.id,
      reportDate: today,
      problem: 'ABC商事の予算が厳しいため、値引き交渉が必要。',
      plan: 'ABC商事に見積もり再提出\nDEF株式会社にアポイント電話',
      status: ReportStatus.SUBMITTED,
    },
  });

  console.log(`Created daily report for ${yamada.name}`);

  // 訪問記録を作成
  await prisma.visitRecord.createMany({
    data: [
      {
        reportId: report1.id,
        customerId: customer1.id,
        visitTime: new Date('1970-01-01T10:00:00Z'),
        visitContent: '新商品の提案を実施。好感触を得た。',
      },
      {
        reportId: report1.id,
        customerId: customer2.id,
        visitTime: new Date('1970-01-01T14:00:00Z'),
        visitContent: '契約更新について相談。価格交渉中。',
      },
    ],
  });

  console.log(`Created visit records`);

  // コメントを作成
  await prisma.comment.create({
    data: {
      reportId: report1.id,
      commenterId: manager.id,
      commentContent: 'ABC商事の値引きは10%までOKです。頑張って！',
    },
  });

  console.log(`Created comment by ${manager.name}`);

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
