// @ts-nocheck
// Ollama LLM 클라이언트 설정.
// Supabase Edge Functions에서 로컬 Ollama에 접근하려면 Cloudflare Tunnel 등으로 노출된 외부 URL을 사용합니다.
import { ChatOllama } from 'npm:@langchain/ollama';

const baseUrl = Deno.env.get('OLLAMA_TUNNEL_URL') || 'http://localhost:11434';
const model = Deno.env.get('OLLAMA_MODEL') || 'qwen2.5:3b-instruct-q4_K_M';

export const ollama = new ChatOllama({
  baseUrl,
  model,
  temperature: 0.1,
  format: 'json',
  numPredict: 200,
});

const embedModel = Deno.env.get('OLLAMA_EMBED_MODEL') || 'nomic-embed-text:latest';

// Ollama /api/embed를 이용해 텍스트 임베딩을 가져옵니다.
export async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(`${baseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: embedModel,
      input: [text],
    }),
  });
  if (!res.ok) {
    throw new Error(`Ollama embed failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json() as { embeddings: number[][] };
  return json.embeddings[0];
}
