

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="gps-music-app"
    >
      <body className="gps-music-app-body">{children}</body>
    </html>
  );
}