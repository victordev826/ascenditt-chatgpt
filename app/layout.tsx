import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
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
            {/* <SignedOut>
            <SignInButton />
          </SignedOut> */}
            {/* <SignedIn>
            <UserButton />
          </SignedIn> */}
            {children}
          </body>
        </html>
      </MyRuntimeProvider>
    </ClerkProvider>
  )
}