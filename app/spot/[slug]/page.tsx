export default function SpotPage({ params }: any) {
  return (
    <div style={{ padding: 40 }}>
      <h1>ROUTE FUNKTIONIERT</h1>
      <p>Slug: {params.slug}</p>
    </div>
  );
}