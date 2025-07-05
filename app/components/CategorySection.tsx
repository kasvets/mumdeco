'use client';

import { Flower2, Heart, Sparkles, Leaf, Crown } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Rahatlatıcı",
    description: "Stres ve yorgunluğu alan lavanta ve papatya aromaları",
    icon: Flower2,
    bgColor: "bg-[#D4E6E1]"
  },
  {
    id: 2,
    name: "Romantik",
    description: "Özel anlarınız için gül ve yasemin notaları",
    icon: Heart,
    bgColor: "bg-[#FFE2E2]"
  },
  {
    id: 3,
    name: "Enerji",
    description: "Canlandırıcı limon ve portakal esansları",
    icon: Sparkles,
    bgColor: "bg-[#E2F5D3]"
  },
  {
    id: 4,
    name: "Meditasyon",
    description: "Odaklanmayı artıran sandal ağacı ve tütsü notaları",
    icon: Leaf,
    bgColor: "bg-[#E2EEFF]"
  },
  {
    id: 5,
    name: "Lüks",
    description: "Premium amber ve misk karışımları",
    icon: Crown,
    bgColor: "bg-[#FFF3D4]"
  }
];

const CategorySection = () => {
  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-16 bg-white">
      <div className="max-w-[98%] 2xl:max-w-[96rem] mx-auto px-2">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-3">Mum Kategorileri</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Ruh halinize ve ihtiyacınıza göre özel olarak tasarlanmış mum koleksiyonlarımızı keşfedin
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="flex flex-col items-center text-center group cursor-pointer">
                <div className={`w-32 h-32 rounded-full ${category.bgColor} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                  <Icon className="w-14 h-14 text-black stroke-[0.75]" />
                </div>
                <h3 className="text-xl font-serif mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection; 