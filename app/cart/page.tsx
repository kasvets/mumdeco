export default function Cart() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-12">Sepetim</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-serif font-semibold mb-6">Sepetiniz Boş</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Henüz sepetinizde ürün bulunmamaktadır. Alışverişe başlamak için ürünlerimizi inceleyebilirsiniz.
            </p>
            <a 
              href="/products" 
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ürünleri İncele
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 