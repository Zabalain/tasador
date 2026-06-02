export const metadata = {
  title: 'Tasador Autos del Norte',
  description: 'Analiza el mercado de coches de segunda mano',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
