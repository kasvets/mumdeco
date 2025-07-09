import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section with Logo */}
        <div className="py-8 border-b border-gray-200">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center justify-center">
              <Image
                src="/mumdeco_logo.png"
                alt="MUMDECO Logo"
                width={200}
                height={70}
                className="w-36 h-auto sm:w-40 md:w-44"
                priority
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              Doğal el yapımı mumlarla yaşam alanlarınızı sıcaklığa ve huzura kavuşturun. Özel anlarınızı daha da özel kılacak, kaliteli ve estetik mum koleksiyonumuzla tanışın.
            </p>
          </div>
        </div>

        {/* Security & Payment Section */}
        <div className="py-8">
          <div className="flex flex-col items-center text-center space-y-8">
            <h3 className="text-xl font-semibold text-gray-800">Güvenli Alışveriş</h3>
            
            {/* SSL Certificate */}
            <div className="flex items-center space-x-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm max-w-md">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-medium text-gray-800">%100 Güvenli Alışveriş</p>
                <p className="text-sm text-gray-600">256-bit SSL sertifikası ile güvenli ödeme altyapısı</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="w-full max-w-2xl">
              <p className="text-lg font-medium text-gray-800 mb-6">Ödeme Yöntemleri</p>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm flex justify-center">
                <Image
                  src="/bankalar-tek-parca.webp"
                  alt="Kabul edilen ödeme yöntemleri - Kredi kartları ve bankalar"
                  width={400}
                  height={150}
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="/about" className="text-gray-600 hover:text-gray-800 transition-colors">Hakkımızda</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-800 transition-colors">İletişim</a>
              <a href="/blog" className="text-gray-600 hover:text-gray-800 transition-colors">Blog</a>
              <a href="/terms" className="text-gray-600 hover:text-gray-800 transition-colors">Kullanım Koşulları</a>
              <a href="/privacy" className="text-gray-600 hover:text-gray-800 transition-colors">Gizlilik Politikası</a>
              <a href="/cookies" className="text-gray-600 hover:text-gray-800 transition-colors">Çerez Politikası</a>
              <a href="/mesafeli-satis-sozlesmesi" className="text-gray-600 hover:text-gray-800 transition-colors">Mesafeli Satış Sözleşmesi</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col items-center space-y-4 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Mumdeco. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Created with</span>
              <span className="text-red-500 animate-pulse text-lg">❤️</span>
              <span className="text-sm text-gray-500">by</span>
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium">Agartha.Ai</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
