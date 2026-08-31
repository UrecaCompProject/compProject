// OpenAI /v1/chat/completions 직접 호출 유틸리티.
const apiKey = Deno.env.get('OPENAI_API_KEY');
const baseUrl = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1';
const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';

export async function chatOpenAI(
  system: string,
  user: string,
  maxTokens = 500,
  jsonMode = false,
): Promise<string> {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
  }

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.1,
    max_tokens: maxTokens,
  };
  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI chat failed: ${res.status} ${text}`);
  }

  const json = JSON.parse(text) as {
    choices: { message: { content: string } }[];
  };
  return json.choices[0].message.content;
}
