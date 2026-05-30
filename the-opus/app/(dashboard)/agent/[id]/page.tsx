import AgentDetailPageClient from './AgentDetailPageClient';

// Example of how you'll likely use it soon
export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // const data = await fetchAgentFromDb(id); 
  const data = { id }; // Placeholder until we have a real data source
  if (id != 'a') {
    // Simulate a not found case
    return <div className="p-8 text-center text-slate-400">Agent not found.</div>;
  }

  return <AgentDetailPageClient agent_data={data} />;
}