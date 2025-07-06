import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

// Token'dan kullanıcı ID'sini al
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const supabase = getServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Varsayılan adresi güncelle
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const { address_line1, city, district } = await request.json();

    // Veri doğrulaması
    if (!address_line1 || address_line1.trim().length < 10) {
      return NextResponse.json(
        { error: 'Adres en az 10 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    if (!city || city.trim().length < 2) {
      return NextResponse.json(
        { error: 'Şehir bilgisi gereklidir.' },
        { status: 400 }
      );
    }

    if (!district || district.trim().length < 2) {
      return NextResponse.json(
        { error: 'İlçe bilgisi gereklidir.' },
        { status: 400 }
      );
    }

    // Mevcut varsayılan adresi kontrol et
    const { data: existingAddress, error: fetchError } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Address fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Adres bilgileri alınamadı.' },
        { status: 500 }
      );
    }

    if (existingAddress) {
      // Kullanıcı bilgilerini al (eksik alanlar için)
      let fullName = existingAddress.full_name;
      let phone = existingAddress.phone;
      
      if (!fullName || !phone) {
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single();
        
        if (!profileError && userProfile) {
          fullName = fullName || userProfile.full_name || 'Kullanıcı';
          phone = phone || userProfile.phone || '+90 XXX XXX XX XX';
        }
      }

      // Mevcut varsayılan adresi güncelle
      const { data: updatedAddress, error: updateError } = await supabase
        .from('user_addresses')
        .update({
          address_line1: address_line1.trim(),
          city: city.trim(),
          district: district.trim(),
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAddress.id)
        .select()
        .single();

      if (updateError) {
        console.error('Address update error:', updateError);
        return NextResponse.json(
          { error: 'Adres güncellenemedi.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Adres başarıyla güncellendi.',
        address: updatedAddress,
      });
    } else {
      // Kullanıcı bilgilerini al
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return NextResponse.json(
          { error: 'Kullanıcı bilgileri alınamadı.' },
          { status: 500 }
        );
      }

      // Yeni varsayılan adres oluştur
      const { data: newAddress, error: insertError } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          address_title: 'Varsayılan Adres',
          full_name: userProfile.full_name || 'Kullanıcı',
          phone: userProfile.phone || '+90 XXX XXX XX XX',
          address_line1: address_line1.trim(),
          city: city.trim(),
          district: district.trim(),
          country: 'Türkiye',
          is_default: true,
          is_billing_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Address insert error:', insertError);
        return NextResponse.json(
          { error: 'Adres oluşturulamadı.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Adres başarıyla oluşturuldu.',
        address: newAddress,
      });
    }

  } catch (error) {
    console.error('Address PUT error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
} 