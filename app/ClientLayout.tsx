'use client';

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { ToastProvider } from '@/components/Toast'

interface ClientLayoutProps {
  children: React.ReactNode
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')
  
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          {!isAdminPage && <Navbar />}
          <main>{children}</main>
          {!isAdminPage && <Footer />}
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default ClientLayout 