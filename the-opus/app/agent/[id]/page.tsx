// Next.js 15+ uses async params
export default async function AgentPage({ params }: { params: Promise<{ id: string }>; }) {
  const { id } = await params;

  return (
    <main>
      <h1>Agent Profile</h1>
      <p>Now viewing agent with ID: {id}</p>
    </main>
  );
}