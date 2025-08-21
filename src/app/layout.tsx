import NavBar from "@/components/NavBar";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "../hooks/AuthContext";

import './globals.css'



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
      <AuthProvider>
          <DataProvider>
          <NavBar />
          {children}
        </DataProvider>
      </AuthProvider>

      </body>
    </html>
  );
}

