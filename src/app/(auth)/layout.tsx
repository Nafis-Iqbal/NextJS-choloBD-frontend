export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex flex-col justify-center items-center min-h-screen bg-[#f5f5f4] text-gray-900"
      style={{
        color: "#111827",
        backgroundColor: "#f5f5f4",
      }}
    >
      {children}
    </section>
  );
}
