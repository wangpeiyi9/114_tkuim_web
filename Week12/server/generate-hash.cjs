// Week12/server/generate-hash.cjs
const bcrypt = require('bcrypt');

async function main() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('================================');
  console.log('密碼:', password);
  console.log('雜湊:', hash);
  console.log('================================');
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('驗證結果:', isValid ? '✓ 有效' : '✗ 無效');
  
  return hash;
}

main().catch(console.error);