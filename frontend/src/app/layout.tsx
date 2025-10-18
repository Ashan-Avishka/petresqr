// app/layout.js
import "./globals.css";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";

export const metadata = {
  title: "PetResQR",
  description: "An example app with a Navbar and Footer",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
