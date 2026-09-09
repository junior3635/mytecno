import UnsubscribePage from './unsubscribe-client';

export default async function UnsubscribeRoute({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <UnsubscribePage token={token} />;
}