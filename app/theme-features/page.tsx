export default function ThemeFeatures() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-12">Özellikler</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-serif font-semibold mb-4">Kaliteli Malzeme</h3>
              <p className="text-gray-600">
                Tüm mumlarımız %100 doğal soya mumu ile üretilmektedir.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-serif font-semibold mb-4">Uzun Yanma Süresi</h3>
              <p className="text-gray-600">
                Mumlarımız 40-50 saat yanma süresine sahiptir.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-serif font-semibold mb-4">Özel Tasarım</h3>
              <p className="text-gray-600">
                Her mum, estetik ve fonksiyonel olarak özenle tasarlanmıştır.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-serif font-semibold mb-4">Doğal Kokular</h3>
              <p className="text-gray-600">
                Aromaterapi etkisi için doğal esanslar kullanılmaktadır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 