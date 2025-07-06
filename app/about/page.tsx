export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-12">Hakkımızda</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-serif font-semibold mb-6">Mumdeco Hikayesi</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Mumdeco, özel tasarım aromaterapi mumlarla yaşam alanlarınızı büyüleyici bir atmosfere dönüştürme misyonu ile kurulmuştur. 
              Her bir mumumuz, kaliteli doğal malzemeler kullanılarak özenle üretilir ve sizlere benzersiz bir deneyim sunar.
            </p>
            
            <h3 className="text-xl font-serif font-semibold mb-4">Misyonumuz</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Yaşam alanlarınızı kişiselleştirmenize yardımcı olmak ve günlük yaşamınıza huzur katmak için 
              en kaliteli ve estetik mumları üretmektir.
            </p>
            
            <h3 className="text-xl font-serif font-semibold mb-4">Vizyonumuz</h3>
            <p className="text-gray-600 leading-relaxed">
              Türkiye'nin önde gelen dekoratif mum markası olarak, sürdürülebilir ve çevre dostu üretim anlayışı ile 
              sektöre öncülük etmektir.
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
            <div className="flex justify-center space-x-8">
              <a href="mailto:info@mumdeco.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                info@mumdeco.com
              </a>
              <a href="tel:+905555555555" className="text-blue-600 hover:text-blue-800 transition-colors">
                +90 555 555 55 55
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 