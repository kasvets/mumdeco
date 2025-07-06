export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-12">Sıkça Sorulan Sorular</h1>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-serif font-semibold mb-3">Mumlarınız hangi malzemeden üretiliyor?</h3>
              <p className="text-gray-600">
                Tüm mumlarımız %100 doğal soya mumu ile üretilmektedir. Sağlık ve çevre dostu olan soya mumu, 
                paraffin muma göre daha uzun süre yanar ve daha temiz bir yanma sağlar.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-serif font-semibold mb-3">Kargo süresi ne kadar?</h3>
              <p className="text-gray-600">
                Siparişleriniz 1-2 iş günü içinde kargoya verilir. Kargo süreniz bölgenize göre 1-3 iş günü arasında değişmektedir.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-serif font-semibold mb-3">İade koşullarınız nelerdir?</h3>
              <p className="text-gray-600">
                Ürünlerimizi teslim aldıktan sonra 14 gün içinde iade edebilirsiniz. 
                Ürün orijinal ambalajında ve kullanılmamış olmalıdır.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-serif font-semibold mb-3">Mum bakımı nasıl yapılır?</h3>
              <p className="text-gray-600">
                Mumumuzu ilk yakışınızda 3-4 saat yanmasını bekleyin. Fitili 1 cm'den fazla uzatmayın. 
                Yanma süresi 4 saati geçmemelidir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 