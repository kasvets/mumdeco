import React from 'react'
import { Outfit, Marcellus, Anton } from 'next/font/google'
import ClientLayout from './ClientLayout'
import './globals.css'
import './fonts/guyon-gazebo.css'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
})

const marcellus = Marcellus({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marcellus',
})

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
})

export const metadata = {
  title: 'Mumdeco - Light The Way',
  description: 'Özel tasarım, afrodizyak etkili dekoratif mumlar',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="tr" className={`${marcellus.variable} ${outfit.variable} ${anton.variable}`}>
      <body className={outfit.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}

export default RootLayout
