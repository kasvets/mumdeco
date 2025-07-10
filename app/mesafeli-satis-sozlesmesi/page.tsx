export default function DistanceSalesContract() {
  return (
    <div className="min-h-screen bg-gray-50 pt-48">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center">
              Mesafeli Satış Sözleşmesi
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Bu sözleşme, www.mumdeco.com üzerinden yapılan alışverişlerde geçerlidir.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                İçindekiler
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-8 ml-4">
                <li>Sözleşmenin Tarafları</li>
                <li>Sipariş Konusu Ürünler</li>
                <li>Sözleşmenin Konusu</li>
                <li>Tarafların Hak ve Yükümlülükleri</li>
                <li>Siparişlere İlişkin Hükümler</li>
                <li>İptal ve İade Koşulları</li>
                <li>Ürünlerin Teslimi ve Teslim Şekli</li>
                <li>Ayıba Karşı Satıcının Sorumluluğu</li>
                <li>Fiyatlara İlişkin Hükümler</li>
                <li>Satıcının Beyanları ve Sorumlu Olmadığı Haller</li>
                <li>Mücbir Sebepler</li>
                <li>Damga Vergisi</li>
                <li>Uygulanacak Hukuk ve Yetkili Yargı Yeri</li>
              </ul>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Sözleşmenin Tarafları
              </h2>
              
              <h3 className="text-xl font-serif font-semibold text-gray-700 mt-8 mb-4">
                SATICI:
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 mb-2"><strong>Ünvanı:</strong> Miray Özet</p>
                <p className="text-gray-700 mb-2"><strong>Adresi:</strong> İstanbul, Türkiye</p>
                <p className="text-gray-700 mb-2"><strong>İnternet Sitesi:</strong> www.mumdeco.com</p>
                <p className="text-gray-700 mb-2"><strong>E-posta:</strong> info@mumdeco.com</p>
                <p className="text-gray-700"><strong>Tel. No:</strong> +90 531 355 22 71</p>
              </div>

              <h3 className="text-xl font-serif font-semibold text-gray-700 mt-8 mb-4">
                ALICI:
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 mb-2"><strong>Adı Soyadı:</strong></p>
                <p className="text-gray-700 mb-2"><strong>Telefon:</strong></p>
                <p className="text-gray-700 mb-2"><strong>Adresi:</strong></p>
                <p className="text-gray-700 mb-2"><strong>E-posta:</strong></p>
                <p className="text-gray-700"><strong>IP Adresi:</strong></p>
              </div>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Sipariş Konusu Ürünler
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                <a 
                  href="https://www.mumdeco.com/products" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  https://www.mumdeco.com/products
                </a>
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Sözleşmenin Konusu
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                İşbu Mesafeli Satış Sözleşmesi'nin (Bundan sonra kısaca 'Sözleşme' olarak anılacaktır.) 
                konusu, Alıcı'nın Satıcı'ya ait www.mumdeco.com alan adlı internet sitesinden 
                (Bundan sonra kısaca 'İnternet Sitesi' olarak anılacaktır.) elektronik ortamda 
                sipariş vererek satın aldığı, İnternet Sitesi'nde yazılı olan nitelikleri haiz ve 
                satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak Tarafların hak 
                ve yükümlülüklerinin saptanmasıdır.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                İşbu Sözleşme kapsamında, Taraflar 6102 sayılı Türk Ticaret Kanunu'nu uyarınca 
                tacir veya esnaf olduğundan ve Sözleşme konusu işin "ticari iş" olduğundan, 
                Sözleşme 6102 sayılı Türk Ticaret Kanunu ve 6098 sayılı Borçlar Kanunu'nun 
                Genel Hükümlerine tâbidir.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Tarafların Hak ve Yükümlülükleri
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Satıcı, ödemesi tam olarak yapıldıktan sonra İnternet Sitesi üzerinden gönderilen 
                tasarım dosyaları her ürünün açıklamasında yer alan baskı seçeneklerindeki fire 
                oranları ve teslim tarihi içerisinde basıp eksiksiz olarak göndermekle yükümlüdür.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Alıcı, İnternet Sitesi'ne üye olurken ve sipariş sırasında isim, soy isim, 
                şirket ünvanı, e-posta adresi, telefon, adres, fatura bilgileri gibi kendisinden 
                talep edilen tüm bilgileri hukuka uygun, güncel, doğru ve eksiksiz olarak 
                bildirmekle yükümlüdür.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Siparişlere İlişkin Hükümler
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                İşbu Sözleşme'nin tarafları Alıcı ile Satıcıdır. Bu kapsamda, işbu Sözleşme'nin 
                yerine getirilmesi ile ilgili tüm yükümlülük ve sorumluluklar Sözleşme'nin 
                taraflarına aittir.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Alıcı, www.mumdeco.com alan adlı internet sitesinde sunulan ürünlerden sipariş 
                edebilmek için İnternet Sitesinde talep edilen bilgileri girmek zorundadır.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                İptal ve İade Koşulları
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                İşbu Sözleşme kapsamında, kural olarak, Alıcı'nın özel istek ve talepleri uyarınca 
                üretilen veya üzerinde değişiklik ya da ilaveler yapılarak Alıcı'ya özel hale 
                getirilen ürün ve hizmetler söz konusu olduğundan bu ürünlerin iptali ve iadesi 
                mümkün değildir.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Alıcı, sipariş uygunluğunu ve tasarımı onaylamadan ve satın alınan ürünler baskıya 
                geçmeden siparişten tamamen vazgeçme hakkına sahiptir.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Ürünlerin Teslimi ve Teslim Şekli
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Sipariş konusu ürünler, aksi Alıcı tarafından ayrıca yazılı olarak belirtilmediği 
                takdirde Alıcı'nın yukarıda belirtmiş olduğu adresinde Alıcı'ya teslim edilecektir.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Kural olarak teslimat masrafları Alıcı'ya aittir. Satıcı, İnternet Sitesinde, 
                sistemde işlemin gerçekleştiği süre zarfında ilan ettiği tutarın üzerinde alışveriş 
                yapanların teslimat ücretinin kendisince karşılanacağını ya da kampanya dahilinde 
                ücretsiz teslimat yapacağını beyan etmişse, teslimat masrafı Satıcı'ya ait olacaktır.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Ayıba Karşı Satıcının Sorumluluğu
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Alıcı, 6102 sayılı Türk Ticaret Kanunu gereği; sipariş etmiş olduğu ürünlerin 
                teslimi sırasında ayıp kontrolü yapmakla sorumludur.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Alıcı, teslim edilen ürünler içerisinde açıkça görülen bir ayıp olması halinde 
                6102 sayılı Türk Ticaret Kanunu 23/c maddesi uyarınca, durumu Satıcı'ya 3 (üç) 
                gün içerisinde ihbar etmekle yükümlüdür.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Fiyatlara İlişkin Hükümler
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Alıcı tarafından İnternet Sitesi'nden sipariş edilen ürünlerin ücreti İnternet 
                Sitesi'nde ve Alıcı'ya gönderilen fatura içeriğinde belirtilmiştir. Aksi ayrıca 
                belirtilmedikçe, fiyatlara KDV dahil değildir.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Alıcı'nın, kredi kartı ile ve taksitle alışveriş yapması durumunda İnternet 
                Sitesi'nden seçmiş olduğu taksit biçimi geçerlidir.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Satıcının Beyanları ve Sorumlu Olmadığı Haller
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Satıcı, İnternet Sitesi'ndeki fiyatlar ve ürün, renk, materyal çeşitleri ile 
                hazır tasarımlar ve de promosyonlar ve kampanyalar üzerinde dilediği zaman, 
                ayrıca herhangi bir bilgilendirme yapma zorunluluğu bulunmaksızın değişiklik 
                yapma ve/veya belirtilen tüm hususları iptal etme, silme, kullanıma kapatma 
                hakkını saklı tutar.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Sipariş oluşturulurken Alıcı'nın göndermiş olduğu tasarımdaki tipografi hataları, 
                imla hataları, yanlış yerleştirme, uygun olmayan çözünürlük, yanlış baskı 
                materyali seçme, ölçü ve renk hataları gibi oluşacak sorunlardan Satıcı sorumlu 
                tutulamaz.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Mücbir Sebepler
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Sözleşme'nin akdedildiği tarihte var olmayan ve Satıcı'nın kontrolü dışında 
                gelişen, ortaya çıkmasıyla Satıcı'nın Sözleşme ile yüklendikleri borç ve 
                sorumluluklarını kısmen ya da tamamen yerine getirmesini ya da bunları zamanında 
                yerine getirmesini imkansızlaştıran haller, mücbir sebep olarak kabul edilir.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Mücbir Sebep durumunda Satıcı, işbu Sözleşme ile yüklenmiş olduğu edimleri tek 
                taraflı olarak yerine getirmekten ödenen bedelin iadesini yaparak tazminatsız 
                olarak kaçınabilir.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Damga Vergisi
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                İşbu Sözleşme, 29.09.2016 tarihli ve 29842 sayılı Resmi Gazete'de yayınlanan 
                Damga Vergisi Kanunu Genel Tebliği'nin (Seri No: 60) 6/4 maddesi gereğince 
                damga vergisine tâbi değildir.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Uygulanacak Hukuk ve Yetkili Yargı Yeri
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Taraflar arasında doğan/doğabilecek her türlü ihtilafta Satıcı'nın ticari defter, 
                kayıt ve belgeleri ile bilgisayar, faks kayıtlarının, mikrofilmlerinin, e-posta 
                yazışmalarının 6100 sayılı Hukuk Muhakemeleri Kanunu m. 193 uyarınca kesin delil 
                hükmünde olacağını Alıcı gayrikabili rücu kabul, beyan ve taahhüt eder.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                İşbu Sözleşme'den doğan her türlü ihtilafın çözümünde İstanbul Anadolu Mahkemeleri 
                ile İcra Daireleri yetkili ve görevli olup her türlü ihtilafın çözümünde Türkiye 
                Cumhuriyeti hukuku uygulanacaktır.
              </p>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Bu mesafeli satış sözleşmesi <strong>1 Temmuz 2025</strong> tarihinde yürürlüğe 
                  girmiştir. Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 
                  ilgili mevzuatlara uygun olarak hazırlanmıştır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 