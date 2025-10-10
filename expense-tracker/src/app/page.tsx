import { About, Components, Footer, HomeTitle } from '@/components/shared';

export default function Home() {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2E6FB1 0%, #6A40B8 40%, #D64A87 65%, #C77A3E 100%)',
      }}>
      <Components>
        <HomeTitle />
        <About />
        <Footer/>
      </Components>
    </div>
  );
}
