// TELECOM_KEYWORDS 동기화 스크립트
// 프론트엔드(src/features/ai-consult/constants/telecomKeywords.ts)를 단일 소스로 사용하고,
// Edge Function(supabase/functions/_shared/ai/recommend.ts)의 키워드 배열을 자동으로 교체한다.
// 프론트엔드와 Edge Function이 서로 다른 런타임(Vite vs Deno)이므로 직접 import가 불가능해
// 빌드 타임에 이 스크립트로 동기화한다.
//
// 사용: node scripts/sync-telecom-keywords.mjs
// package.json의 build 스크립트에 자동으로 포함된다.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const sourcePath = join(
  projectRoot,
  'src/features/ai-consult/constants/telecomKeywords.ts',
);
const targetPath = join(
  projectRoot,
  'supabase/functions/_shared/ai/recommend.ts',
);

// 1. 프론트엔드 소스에서 키워드 배열 추출
const sourceContent = readFileSync(sourcePath, 'utf-8');
const keywordMatch = sourceContent.match(
  /export const TELECOM_KEYWORDS[^[]*\[([\s\S]*?)\] as const;/,
);
if (!keywordMatch) {
  console.error('[sync-telecom-keywords] 소스 파일에서 TELECOM_KEYWORDS 배열을 찾을 수 없습니다.');
  process.exit(1);
}

// 배열 항목 추출 — 작은따옴표로 감싸진 문자열만 매칭
const keywords = [...keywordMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
if (keywords.length === 0) {
  console.error('[sync-telecom-keywords] 추출된 키워드가 없습니다.');
  process.exit(1);
}

// 2. Edge Function 파일에서 기존 TELECOM_KEYWORDS 배열 교체
const targetContent = readFileSync(targetPath, 'utf-8');

// 기존 배열 블록 매칭 — const TELECOM_KEYWORDS = [ ... ];
const arrayBlockPattern =
  /\/\/ 통신 요금제 상담과 관련된 키워드 목록[\s\S]*?const TELECOM_KEYWORDS = \[[\s\S]*?\];/;
const newBlock = `// 통신 요금제 상담과 관련된 키워드 목록 — 상담 외 입력 감지에 사용
// 주의: 이 배열은 src/features/ai-consult/constants/telecomKeywords.ts에서 자동 생성됩니다.
// 직접 수정하지 말고 프론트엔드 소스를 수정 후 npm run sync:keywords를 실행하세요.
const TELECOM_KEYWORDS = [
${keywords.map((kw) => `  '${kw}',`).join('\n')}
];`;

if (!arrayBlockPattern.test(targetContent)) {
  console.error('[sync-telecom-keywords] 대상 파일에서 TELECOM_KEYWORDS 블록을 찾을 수 없습니다.');
  process.exit(1);
}

const updatedContent = targetContent.replace(arrayBlockPattern, newBlock);
writeFileSync(targetPath, updatedContent, 'utf-8');

console.log(
  `[sync-telecom-keywords] ${keywords.length}개 키워드 동기화 완료: ${sourcePath} → ${targetPath}`,
);
