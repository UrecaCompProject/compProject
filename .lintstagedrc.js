// lint-staged 설정: 커밋 전 변경된 파일만 포맷/린트 자동 수정.
export default {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,md,yml,yaml}': ['prettier --write'],
};
