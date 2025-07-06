const fs = require('fs');
const path = require('path');

console.log('🚀 MumDeco Environment Setup');
console.log('=================================');

const envContent = `# Supabase Configuration
# Bu değerleri Supabase dashboard'unuzdan alın (Project Settings > API)

# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (optional, admin işlemleri için)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development mode
NODE_ENV=development

# =================================
# KURULUM TALİMATLARI:
# =================================
# 1. Supabase'e gidin: https://supabase.com/dashboard
# 2. Projenizi seçin
# 3. Settings > API'ye gidin
# 4. "Project URL" ve "anon public" key'i kopyalayın
# 5. Bu dosyada "your-project-id" ve "your-anon-key" kısımlarını değiştirin
# 6. Dosyayı kaydedin ve sunucuyu yeniden başlatın (npm run dev)
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local dosyası zaten mevcut!');
    console.log('📝 Mevcut dosyanızı kontrol edin:');
    console.log(`   ${envPath}`);
    console.log('');
    console.log('🔍 Gerekli değişkenler:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('');
    console.log('💡 Eğer yeniden oluşturmak istiyorsanız:');
    console.log('   1. Mevcut .env.local dosyasını silin');
    console.log('   2. Bu scripti tekrar çalıştırın');
    return;
  }

  // Create .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env.local dosyası oluşturuldu!');
  console.log('📍 Dosya konumu:', envPath);
  console.log('');
  console.log('🔧 Şimdi yapmanız gerekenler:');
  console.log('   1. .env.local dosyasını açın');
  console.log('   2. Supabase dashboard\'a gidin (https://supabase.com/dashboard)');
  console.log('   3. Project Settings > API\'dan gerekli bilgileri alın');
  console.log('   4. "your-project-id" ve "your-anon-key" kısımlarını gerçek değerlerle değiştirin');
  console.log('   5. Dosyayı kaydedin');
  console.log('   6. Sunucuyu yeniden başlatın: npm run dev');
  console.log('');
  console.log('🎉 Hazır! Admin paneli artık çalışacak.');
  
} catch (error) {
  console.error('❌ Hata:', error.message);
  console.log('');
  console.log('📝 Manuel olarak .env.local dosyası oluşturun:');
  console.log(envContent);
} 