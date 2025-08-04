import NavBar from "@/components/NavBar";
import { DataProvider } from "./context/DataContext";


import './globals.css'



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DataProvider>
          <NavBar />
          {children}
        </DataProvider>
      </body>
    </html>
  );
}

