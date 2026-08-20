// Ollama /api/chat 직접 호출 유틸리티.
const baseUrl = Deno.env.get('OLLAMA_TUNNEL_URL') || 'http://localhost:11434';
const model = Deno.env.get('OLLAMA_MODEL') || 'qwen2.5:3b-instruct-q4_K_M';

export async function chatOllama(
  system: string,
  user: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: false,
      format: 'json',
      options: { temperature: 0.1, num_predict: 150 },
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ollama chat failed: ${res.status} ${text}`);
  }

  return (JSON.parse(text) as { message: { content: string } }).message.content;
}
