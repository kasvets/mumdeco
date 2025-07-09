export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-48">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center">
              Gizlilik Politikası
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Bu İnternet sitesini kullanarak kişisel verilerinizin işlenmesini kabul etmiş olursunuz. 
                Güvenliğiniz bizim için önemli. Bu sebeple, bizimle paylaşacağınız kişisel verileriniz 
                hassasiyetle korunmaktadır.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Veri Sorumlusu
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ben, Miray Özet, veri sorumlusu olarak, bu gizlilik ve kişisel verilerin korunması 
                politikası ile ziyaret etmekte olduğunuz İnternet sitesi kapsamında hangi kişisel 
                verilerinizin hangi amaçlarla işleneceği, işlenen verilerin kimlerle ve hangi 
                sebeplerle paylaşılabileceği, veri işleme yöntemimiz ve hukuki sebepleri ile; 
                işlenen verilerinize ilişkin haklarınızın neler olduğu hususunda siz kullanıcılarımızı 
                aydınlatmayı amaçlıyorum.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Toplanan Kişisel Veriler
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Bu İnternet sitesi tarafından toplanan kişisel verileriniz:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6 ml-4">
                <li>Adres bilgileri</li>
                <li>E-posta adresi</li>
                <li>IP adresi</li>
                <li>Ad ve soyad</li>
                <li>Telefon numarası</li>
              </ul>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Kullanılan Servisler
              </h2>
              
              <h3 className="text-xl font-serif font-semibold text-gray-700 mt-8 mb-4">
                Analitik ve izleme
              </h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li>
                  <strong>Google Analytics</strong>: Google Analytics, ziyaretçi davranışlarını ve 
                  site kullanımını analiz etmek için kullanılmaktadır. Bu hizmet, ziyaretçi trafiği, 
                  etkileşimler ve kullanıcı davranışları hakkında detaylı raporlar sağlar.
                </li>
              </ul>

              <h3 className="text-xl font-serif font-semibold text-gray-700 mt-8 mb-4">
                Ödeme sistemleri
              </h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li>
                  <strong>PayTR</strong>: PayTR, ödeme altyapısı sunar.
                </li>
              </ul>

              <h3 className="text-xl font-serif font-semibold text-gray-700 mt-8 mb-4">
                Sosyal medya
              </h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li>
                  <strong>Google ile giriş</strong>: Google ile Giriş özelliği, güvenli kimlik 
                  doğrulama için kullanılmaktadır. E-posta ve temel profil bilgileriniz alınır.
                </li>
              </ul>

              <h3 className="text-xl font-serif font-semibold text-gray-700 mt-8 mb-4">
                Yayıncılık hizmetleri
              </h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li>
                  <strong>Google AdSense</strong>: Google AdSense, İnternet sitelerinde reklam 
                  göstermek için kullanılan bir araçtır. Google dahil üçüncü taraflar, 
                  kullanıcıların bu veya başka bir web sitesine daha önce yapmış olduğu 
                  ziyaretlere dayalı olarak reklam sunabilmek için çerezleri kullanır. 
                  Kişiselleştirilmiş reklamları, {" "}
                  <a 
                    href="https://www.google.com/settings/ads" 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.google.com/settings/ads
                  </a>{" "}
                  adresinden devre dışı bırakabilirsiniz.
                </li>
              </ul>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Verilerin İşlenme Amaçları
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Kişisel verileriniz, bu İnternet sitesi tarafından amacına uygun hizmet sunulabilmesi, 
                yasal yükümlülüklerin yerine getirilmesi, hizmet kalitesinin artırılması, iletişim, 
                güvenlik ve gerektiğinde yasal merciler ile bilgi paylaşılabilmesi amaçları ile 
                işlenmektedir. Kişisel verileriniz, bu sayılan amaçlar dışında kullanılmayacaktır.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Verilerin Aktarılması
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Bu İnternet sitesi tarafından toplanan kişisel verileriniz, yasal zorunluluklar 
                haricinde, açık rızanız olmadan üçüncü kişiler ile paylaşılmaz. Ancak hizmet 
                sağlayıcılarımız, iş ortaklarımız ve yasal merciler ile, hizmetin sağlanması ve 
                yasal yükümlülüklerin yerine getirilmesi amaçlarıyla gerekli olduğu ölçüde 
                paylaşılabilir.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Çerez Kullanımı
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Bu İnternet sitesi çerez kullanmaktadır. Çerezler, bir İnternet sayfası ziyaret 
                edildiğinde kullanıcılara ilişkin birtakım bilgilerin kullanıcıların terminal 
                cihazlarında depolanmasına izin veren düşük boyutlu zengin metin biçimli text 
                formatlarıdır. Çerezler, bir İnternet sitesini ilk ziyaretiniz sırasında tarayıcınız 
                aracılığıyla cihazınıza depolanabilir ve aynı siteyi aynı cihazla tekrar ziyaret 
                ettiğinizde, tarayıcınız cihazınızda site adına kayıtlı bir çerez olup olmadığını 
                kontrol eder. Eğer kayıt var ise, kaydın içindeki veriyi ziyaret etmekte olduğunuz 
                İnternet sitesine iletir. Bu sayede İnternet sitesi, sizin daha önceki ziyaretinizi 
                tespit eder ve size iletilecek içeriği ona göre belirler.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Yasal Haklarınız
              </h2>
              
              <h3 className="text-xl font-serif font-semibold text-gray-700 mt-8 mb-4">
                KVKK Kapsamında Haklarınız
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                6698 sayılı KVKK madde 11 uyarınca herkes, veri sorumlusuna başvurarak kendisiyle 
                ilgili aşağıda yer alan taleplerde bulunma hakkına sahiptir:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6 ml-4">
                <li>Kişisel verilerinin işlenip işlenmediğini öğrenme.</li>
                <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme.</li>
                <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme.</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme.</li>
                <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme.</li>
                <li>KVKK madde 7 ile öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme.</li>
                <li>Düzeltme, silme ve yok edilme talepleri neticesinde yapılan işlemlerin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme.</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme.</li>
                <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme.</li>
              </ol>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                İletişim
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Kişisel verilerinizle ilgili haklarınızı kullanmak veya Gizlilik Politika'mız 
                hakkında daha fazla bilgi almak için{" "}
                <a 
                  href="mailto:info@mumdeco.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  info@mumdeco.com
                </a>{" "}
                adresinden bizimle iletişime geçebilirsiniz.
              </p>

              <h2 className="text-2xl font-serif font-bold text-gray-800 mt-10 mb-6">
                Onay ve Yürürlük
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                İnternet sitemiz ile kişisel verilerinizi paylaşmak, tamamen sizin tercihinizdir. 
                İnternet sitemizi kullanmaya devam ettiğiniz takdirde, bu Gizlilik Politikası'nı 
                kabul ettiğiniz varsayılacaktır. Bu politika, <strong>1 Temmuz 2025</strong> tarihinde 
                yürürlüğe girmiş olup, gerektiğinde güncellenir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 