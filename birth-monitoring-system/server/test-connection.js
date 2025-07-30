require('dotenv').config();
const { sequelize } = require('./models');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection established successfully');
    
    const [result] = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema='public' 
       AND table_type='BASE TABLE'`
    );
    
    console.log('📊 Existing tables:');
    console.table(result.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await sequelize.close();
  }
}

test();
test();