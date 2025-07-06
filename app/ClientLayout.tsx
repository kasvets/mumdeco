'use client';

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/lib/auth-context'

interface ClientLayoutProps {
  children: React.ReactNode
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <AuthProvider>
      {!isAdminPage && <Navbar />}
      <main>{children}</main>
      {!isAdminPage && <Footer />}
    </AuthProvider>
  )
}

export default ClientLayout 