export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-7.5rem)] items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.02_250),transparent_55%),radial-gradient(ellipse_at_bottom,oklch(0.94_0.02_40),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.04_260),transparent_55%),radial-gradient(ellipse_at_bottom,oklch(0.22_0.03_40),transparent_50%)]"
      />
      {children}
    </div>
  );
}
