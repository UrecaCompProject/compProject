import type { RecommendedPlanGroup } from '@/shared/lib/aiConsult';

// "예산을 조금 더 늘려서 추천받기" 같은 quick reply 문구 끝의 "추천받기"/"보기"를
// 떼어 라운드 라벨로 쓴다.
function cleanRoundLabel(detail: string): string {
  return detail.replace(/\s*(추천받기|보기)\s*$/, '').trim();
}

// 마침표/물음표/느낌표 뒤 공백을 문장 경계로 보고 나눠, 문장마다 줄바꿈해서 보여준다.
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

// 라운드별로 무엇이 바뀌었는지 보여줄 라벨. 첫 라운드는 항상 "입력한 조건 그대로".
export function buildRoundLabel(
  groups: RecommendedPlanGroup[],
  idx: number,
): string {
  if (idx === 0) return '입력한 조건 그대로';

  return cleanRoundLabel(groups[idx].detail) || '조건을 변경해서';
}

// groupId(같은 정보 입력 세션)별로 순서를 보존하며 묶는다 — 서로 다른 groupId는
// 완전히 무관한 조건의 재질의라 하나의 진행으로 섞으면 안 된다.
export function clusterByGroupId(
  groups: RecommendedPlanGroup[],
): RecommendedPlanGroup[][] {
  const clusters: RecommendedPlanGroup[][] = [];
  const clusterMap = new Map<string, RecommendedPlanGroup[]>();
  for (const group of groups) {
    let cluster = clusterMap.get(group.groupId);
    if (!cluster) {
      cluster = [];
      clusterMap.set(group.groupId, cluster);
      clusters.push(cluster);
    }
    cluster.push(group);
  }
  return clusters;
}
