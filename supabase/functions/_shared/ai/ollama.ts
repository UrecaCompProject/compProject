// Ollama LLM 클라이언트 설정.
// Supabase Edge Functions에서 로컬 Ollama에 접근하려면 Cloudflare Tunnel 등으로 노출된 외부 URL을 사용합니다.
import { Ollama } from 'npm:@langchain/ollama';

const baseUrl = Deno.env.get('OLLAMA_TUNNEL_URL') || 'http://localhost:11434';
const model = Deno.env.get('OLLAMA_MODEL') || 'exaone3.5:2.4b';

export const ollama = new Ollama({
  baseUrl,
  model,
  temperature: 0.3,
});
