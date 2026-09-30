import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Trilhas from "@/components/Trilhas";
import Certificacoes from "@/components/Certificacoes";
import CTF from "@/components/CTF";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Trilhas />
      <Certificacoes />
      <CTF />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
