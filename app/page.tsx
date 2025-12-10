import Image from "next/image";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Advertisement from "./components/Advertisement";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Advertisement />
      </main>
      <Footer />
    </>
  );
}
