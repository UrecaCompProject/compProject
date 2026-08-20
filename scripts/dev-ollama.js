import { spawn } from 'node:child_process';
import process from 'node:process';

const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function isOllamaUp() {
  try {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 3000);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: ac.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  if (await isOllamaUp()) {
    console.log(`Ollama is already running at ${baseUrl}`);
    process.exit(0);
  }

  console.log(`Starting Ollama server at ${baseUrl}...`);
  const child = spawn('ollama', ['serve'], {
    shell: true,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.warn(`Failed to start Ollama: ${err.message}`);
    console.warn('Please start Ollama manually and run npm run dev again.');
    process.exit(0);
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main();
