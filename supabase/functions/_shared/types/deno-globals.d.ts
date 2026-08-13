// Supabase Edge Functions(Deno 런타임) 전역 타입 선언.
// Deno 네임스페이스와 EdgeRuntime 전역을 최소한으로 정의한다.
// process 는 @types/node 가 이미 전역 선언하므로 여기서 중복 선언하지 않는다.
// 실제 전체 타입은 jsr:@supabase/functions 또는 deno/ns 패키지로 대체 가능하다.

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void;
}
