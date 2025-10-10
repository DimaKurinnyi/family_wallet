import { About, Components, HomeTitle } from '@/components/shared';

export default function Home() {
  return (
    <div
        className="min-h-screen w-full"
        style={{
          minHeight: '100vh',
          background: "linear-gradient(135deg, #4FACFE 0%, #A770EF 40%, #FF7EB6 65%, #FFB86B 100%)",
        
        }}
      >
    <Components >
      <HomeTitle/>
     
    </Components>

    </div>
  );
}
