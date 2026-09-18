import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="aurora absolute inset-0 -z-10" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5 self-start">
          <span className="grid size-8 place-items-center rounded-lg bg-brand font-bold text-white">
            J
          </span>
          <span className="font-semibold tracking-tight">JABB Networks</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
