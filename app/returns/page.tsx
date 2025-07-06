export default function Returns() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-12">İade Koşulları</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-serif font-semibold mb-6">İade ve Değişim Şartları</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-semibold mb-3">İade Süresi</h3>
                <p className="text-gray-600">
                  Ürünlerinizi teslim aldıktan sonra 14 gün içinde iade edebilirsiniz.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-serif font-semibold mb-3">İade Şartları</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Ürün orijinal ambalajında ve kullanılmamış olmalıdır</li>
                  <li>Ürün üzerinde herhangi bir hasar bulunmamalıdır</li>
                  <li>Ürün faturası ile birlikte gönderilmelidir</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-serif font-semibold mb-3">İade Süreci</h3>
                <ol className="list-decimal list-inside text-gray-600 space-y-2">
                  <li>İade talebinizi info@mumdeco.com adresine bildirin</li>
                  <li>İade kargo kodunuz tarafınıza iletilecektir</li>
                  <li>Ürünü kargo ile gönderin</li>
                  <li>Ürün kontrolünden sonra iade işlemi gerçekleştirilir</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-xl font-serif font-semibold mb-3">İade Edilen Ürünler</h3>
                <p className="text-gray-600">
                  Hijyen nedeniyle kullanılmış mumlar iade edilmez. Sadece hasarlı veya yanlış gönderim durumunda iade kabul edilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 