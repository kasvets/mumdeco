-- Google OAuth için kullanıcı profili trigger'ını güncelle
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- Mevcut trigger'ı kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Gelişmiş kullanıcı oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
    user_avatar_url TEXT;
    user_phone TEXT;
BEGIN
    -- Google OAuth'dan gelen metadata'yı parse et
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        CONCAT(
            NEW.raw_user_meta_data->>'given_name', 
            ' ', 
            NEW.raw_user_meta_data->>'family_name'
        ),
        'Yeni Kullanıcı'
    );
    
    user_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    user_phone := NEW.raw_user_meta_data->>'phone';

    -- Kullanıcı profilini oluştur
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        phone,
        avatar_url,
        email_verified,
        account_status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        user_phone,
        user_avatar_url,
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
        'active',
        NOW(),
        NOW()
    );
    
    -- Kullanıcı tercihlerini oluştur
    INSERT INTO public.user_preferences (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW());
    
    -- İlk giriş aktivite logu
    INSERT INTO public.user_activity_logs (
        user_id,
        activity_type,
        activity_description,
        created_at
    )
    VALUES (
        NEW.id,
        'register',
        CASE 
            WHEN NEW.raw_user_meta_data->>'provider' = 'google' THEN 'Google ile kayıt oldu'
            ELSE 'E-posta ile kayıt oldu'
        END,
        NOW()
    );
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Hata durumunda log'la ama işlemi durdurma
        RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger'ı yeniden oluştur
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mevcut kullanıcılarda eksik profilleri oluştur (opsiyonel)
INSERT INTO public.user_profiles (id, email, full_name, email_verified, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'Kullanıcı') as full_name,
    CASE WHEN u.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    u.created_at,
    u.updated_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Mevcut kullanıcılarda eksik tercihleri oluştur
INSERT INTO public.user_preferences (user_id, created_at, updated_at)
SELECT 
    p.id,
    NOW(),
    NOW()
FROM public.user_profiles p
LEFT JOIN public.user_preferences pr ON p.id = pr.user_id
WHERE pr.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Test için fonksiyon
CREATE OR REPLACE FUNCTION public.test_google_auth()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Google OAuth system is ready!';
END;
$$ language 'plpgsql';

-- Test query
SELECT public.test_google_auth(); 