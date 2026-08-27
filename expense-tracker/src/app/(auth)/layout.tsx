export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #2E6FB1 0%, #6A40B8 40%, #D64A87 65%, #C77A3E 100%)',
      }}>
      {children}
    </main>
  );
}
