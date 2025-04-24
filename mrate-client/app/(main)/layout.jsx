import Navbar from "@/components/navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="pt-14 supports-[padding-top:env(safe-area-inset-top)]:pt-[calc(3.5rem+env(safe-area-inset-top))]">
        {children}
      </main>
    </>
  );
}
