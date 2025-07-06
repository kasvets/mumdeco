export default function Shipping() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-12">Kargo Bilgileri</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-serif font-semibold mb-6">Kargo ve Teslimat</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-semibold mb-3">Kargo Süreleri</h3>
                <p className="text-gray-600 mb-4">
                  Siparişleriniz 1-2 iş günü içinde kargoya verilir.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>İstanbul: 1-2 iş günü</li>
                  <li>Ankara, İzmir: 2-3 iş günü</li>
                  <li>Diğer iller: 3-5 iş günü</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-serif font-semibold mb-3">Kargo Ücretleri</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>250₺ ve üzeri siparişlerde kargo ücretsizdir</li>
                  <li>250₺ altı siparişlerde kargo ücreti 29₺'dir</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-serif font-semibold mb-3">Teslimat Şartları</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Teslimat sırasında mutlaka evde bulunmanız gerekmektedir</li>
                  <li>Ürünleriniz özel ambalajlanarak kargo hasarlarına karşı korunur</li>
                  <li>Teslimat sırasında ürünlerinizi kontrol etmenizi tavsiye ederiz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 