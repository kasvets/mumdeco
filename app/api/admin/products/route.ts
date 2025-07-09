import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

// Create a new product
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();
    const supabase = getServerSupabaseClient();
    
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({
        error: 'Ürün oluşturulurken hata oluştu'
      }, { status: 500 });
    }

    // Yeni ürün oluşturulduktan sonra storage'daki product-new- dosyalarını yeniden adlandır
    let updatedImageUrl = newProduct.image_url;
    if (newProduct?.id) {
      try {
        const renamedImages = await renameNewProductImages(newProduct.id);
        
        // Eğer ana görsel yeniden adlandırıldıysa, güncellenen URL'i al
        if (renamedImages.length > 0 && newProduct.image_url) {
          const oldImageName = newProduct.image_url.split('/').pop();
          const renamedImage = renamedImages.find(img => img.oldUrl.includes(oldImageName || ''));
          if (renamedImage) {
            updatedImageUrl = renamedImage.newUrl;
            
            // Veritabanındaki image_url'i güncelle
            const { error: updateError } = await supabase
              .from('products')
              .update({ image_url: updatedImageUrl })
              .eq('id', newProduct.id);
              
            if (updateError) {
              console.error('Error updating product image_url:', updateError);
            } else {
              newProduct.image_url = updatedImageUrl;
            }
          }
        }
      } catch (renameError) {
        console.error('Error renaming product images:', renameError);
        // Görsel yeniden adlandırma hatası olsa da ürün oluşturuldu, sadece log'la
      }
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Ürün başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// Storage'daki product-new- dosyalarını gerçek product ID'si ile yeniden adlandır
async function renameNewProductImages(productId: number): Promise<{oldUrl: string, newUrl: string}[]> {
  const supabase = getServerSupabaseClient();
  const renamedImages: {oldUrl: string, newUrl: string}[] = [];
  
  // Storage'dan product-new- ile başlayan dosyaları listele
  const { data: files, error: listError } = await supabase.storage
    .from('products')
    .list('', {
      limit: 100,
      offset: 0,
    });

  if (listError) {
    console.error('Error listing files:', listError);
    return renamedImages;
  }

  // product-new- ile başlayan dosyaları filtrele
  const newProductFiles = files?.filter(file => 
    file.name.startsWith('product-new-')
  ) || [];

  console.log(`Found ${newProductFiles.length} files to rename for product ${productId}`);

  // Her dosyayı yeniden adlandır
  for (const file of newProductFiles) {
    try {
      // Yeni dosya adı oluştur (product-new- yerine product-{id}-)
      const newFileName = file.name.replace('product-new-', `product-${productId}-`);
      
      // Eski URL'i al
      const { data: oldUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(file.name);
      
      // Dosyayı download et
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('products')
        .download(file.name);

      if (downloadError) {
        console.error(`Error downloading file ${file.name}:`, downloadError);
        continue;
      }

      // Yeni isimle upload et
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(newFileName, downloadData, {
          cacheControl: '3600',
          upsert: true,
          contentType: downloadData.type
        });

      if (uploadError) {
        console.error(`Error uploading file ${newFileName}:`, uploadError);
        continue;
      }

      // Yeni URL'i al
      const { data: newUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(newFileName);

      // Eski dosyayı sil
      const { error: deleteError } = await supabase.storage
        .from('products')
        .remove([file.name]);

      if (deleteError) {
        console.error(`Error deleting old file ${file.name}:`, deleteError);
      }

      renamedImages.push({
        oldUrl: oldUrlData.publicUrl,
        newUrl: newUrlData.publicUrl
      });

      console.log(`Successfully renamed ${file.name} to ${newFileName}`);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }
  
  return renamedImages;
}

// Get all products
export async function GET() {
  try {
    const supabase = getServerSupabaseClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({
        error: 'Ürünler yüklenirken hata oluştu'
      }, { status: 500 });
    }

    // Sort products by numerical value in name (No.1, No.2, Model-1, Model-2, etc.)
    const sortedProducts = (products || []).sort((a, b) => {
      // Extract number from product name
      const extractNumber = (name: string): number => {
        // Look for patterns like "No.1", "No.2", "Model-1", "Model-2", etc.
        const match = name.match(/(?:No\.?|Model-?)(\d+)/i);
        return match ? parseInt(match[1], 10) : 999999; // Put items without numbers at the end
      };
      
      const numA = extractNumber(a.name);
      const numB = extractNumber(b.name);
      
      return numA - numB; // Sort in ascending order (1, 2, 3, ...)
    });

    return NextResponse.json({
      success: true,
      products: sortedProducts
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'Ürün ID gereklidir'
      }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({
        error: 'Ürün silinirken hata oluştu'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// Update a product
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'Ürün ID gereklidir'
      }, { status: 400 });
    }

    const updates = await request.json();
    const supabase = getServerSupabaseClient();
    
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({
        error: 'Ürün güncellenirken hata oluştu'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Ürün başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
} 