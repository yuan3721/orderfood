const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createMerchant() {
  // 修改这里的信息来创建不同的商家
  const account = '18012346666';      // 登录账号
  const password = '777777';    // 登录密码
  const name = '测试餐厅';      // 餐厅名称
  
  // SHA256 加密密码（与登录时的加密方式一致）
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  try {
    const merchant = await prisma.merchant.create({
      data: {
        account,
        password: hashedPassword,
        name,
        role: 'admin'
      }
    });
    
    console.log('\n✓ 商家创建成功！\n');
    console.log('账号:', account);
    console.log('密码:', password);
    console.log('ID:', merchant.id);
    console.log('名称:', merchant.name);
    console.log('角色:', merchant.role);
    console.log('\n现在可以使用这个账号登录商家端了。\n');
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('\n✗ 账号已存在，请使用其他账号名\n');
    } else {
      console.error('\n✗ 创建失败:', error.message, '\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createMerchant();
