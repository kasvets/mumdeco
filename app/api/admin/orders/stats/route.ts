import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await getServerSupabaseClient();
    
    // Tüm siparişleri getir
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, payment_status');

    if (error) {
      console.error('Error fetching order stats:', error);
      return NextResponse.json({ error: 'İstatistikler alınamadı' }, { status: 500 });
    }

    // İstatistikleri hesapla
    const stats = {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      processing: orders.filter(order => order.status === 'processing').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in order stats API:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 