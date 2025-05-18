import "./globals.css";

export const metadata = {
  title: "VisionX",
  description: "Mind Mapping",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
