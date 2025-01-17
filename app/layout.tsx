import {
  ClerkProvider,
} from '@clerk/nextjs'
import { MyRuntimeProvider } from "@/components/runtime/MyRuntimeProvider";
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <MyRuntimeProvider>
        <html lang="en" className="dark">
          <body className='bg-black'>
            {children}
          </body>
        </html>
      </MyRuntimeProvider>
    </ClerkProvider>
  )
}