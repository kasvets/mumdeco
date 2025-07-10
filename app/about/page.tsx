export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-48">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-700 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            Mumdeco Hikayesi
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed">
            Bir kadının hayallerinin ışığında doğan, el emeğinin büyüsüyle hayat bulan benzersiz bir yolculuk
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Founder Story */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-6 relative overflow-hidden rounded-full shadow-lg ring-4 ring-white">
                <img 
                  src="/Miray_Ozet.jpeg" 
                  alt="Miray Özet - Kurucu & Tasarımcı" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">Miray Özet</h2>
              <p className="text-gray-600">Kurucu & Tasarımcı</p>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed">
                Mumdeco, Miray Özet'in el sanatlarına olan tutkusundan doğan bir girişimcilik hikayesidir. 
                Evinin sıcaklığından başlayarak, her bir mumu özenle tasarlayan ve üreten Miray Hanım, 
                sadece bir ürün değil, bir yaşam felsefesi sunuyor.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                "Her mumumda bir hikaye var, her kokusuyla bir anı... Ellerimle şekillendirdiğim bu eserler, 
                sizin yaşam alanlarınızda huzur ve sıcaklık kaynağı olsun" diyen Miray Özet, 
                bu vizyonuyla Mumdeco'yu hayata geçirdi.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <p className="text-blue-800 font-medium italic">
                  "Kadın girişimciliğinin gücüne inanıyorum. Evimden başlayan bu yolculuk, 
                  bugün binlerce eve ulaşan bir marka haline geldi."
                </p>
                <p className="text-blue-600 text-sm mt-2">- Miray Özet, Kurucu</p>
              </div>
            </div>
          </div>

          {/* Handmade Process */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-serif font-bold text-center text-gray-800 mb-10">
              El Emeği Üretim Süreci
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-slate-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl">🎨</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-3">Tasarım</h3>
                <p className="text-gray-600 leading-relaxed">
                  Her mum, Miray Hanım'ın yaratıcı vizyonuyla tasarlanır. Renk harmonisi, 
                  form ve fonksiyonun mükemmel birleşimi için saatler harcanır.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl">🕯️</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-3">Üretim</h3>
                <p className="text-gray-600 leading-relaxed">
                  Doğal soya mumu, özenle seçilmiş kokular ve kaliteli fitiller kullanılarak, 
                  her mum elle döküm tekniğiyle üretilir.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-slate-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl">📦</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-3">Paketleme</h3>
                <p className="text-gray-600 leading-relaxed">
                  Çevre dostu malzemelerle özenle paketlenen her mum, 
                  size ulaşmadan önce kalite kontrolünden geçer.
                </p>
              </div>
            </div>
          </div>

          {/* Values & Vision */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">Değerlerimiz</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-slate-500 rounded-full mt-2"></span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Kalite</h4>
                      <p className="text-gray-600">Her üründe en yüksek kalite standartları</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Sürdürülebilirlik</h4>
                      <p className="text-gray-600">Çevre dostu malzemeler ve üretim</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-slate-500 rounded-full mt-2"></span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Özgünlük</h4>
                      <p className="text-gray-600">Benzersiz tasarım ve kişisel dokunuş</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Güven</h4>
                      <p className="text-gray-600">Müşteri memnuniyeti odaklı hizmet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">Misyon & Vizyon</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Misyonumuz</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Her evde sıcaklık, huzur ve estetik bir atmosfer yaratmak için el emeği ile 
                      üretilmiş, kaliteli ve sürdürülebilir mumlar sunmak.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Vizyonumuz</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Türkiye'nin en sevilen handmade mum markası olarak, ev üretiminden başlayan 
                      bu yolculuğu global bir başarı hikayesine dönüştürmek.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-serif font-bold text-center text-gray-800 mb-8">
              Rakamlarla Mumdeco
            </h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-slate-600 mb-2">5000+</div>
                <p className="text-gray-600">Mutlu Müşteri</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <p className="text-gray-600">Benzersiz Tasarım</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-600 mb-2">100%</div>
                <p className="text-gray-600">El Yapımı</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">3+</div>
                <p className="text-gray-600">Yıllık Deneyim</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center bg-white rounded-xl p-10 shadow-lg">
            <h2 className="text-2xl font-serif font-bold mb-4 text-gray-800">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-lg mb-6 text-gray-600">
              Sorularınız, özel tasarım talepleriniz ve önerileriniz için her zaman buradayız.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
              <a href="mailto:info@mumdeco.com" 
                 className="bg-gray-100 hover:bg-gray-200 transition-all duration-300 px-6 py-3 rounded-lg text-gray-800">
                info@mumdeco.com
              </a>
              <a href="tel:+905313552271" 
                 className="bg-gray-100 hover:bg-gray-200 transition-all duration-300 px-6 py-3 rounded-lg text-gray-800">
                +90 531 355 22 71
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 