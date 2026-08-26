/// <reference types="vite/client" />

// 프로젝트에서 사용하는 Vite 환경변수 타입 선언.
// .env.local 에 정의한 키와 일치해야 한다.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PERSIST_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  daum?: {
    Postcode: new (options: {
      oncomplete: (data: {
        roadAddress: string;
        jibunAddress: string;
        address: string;
        zonecode: string;
        buildingName?: string;
        apartment?: string;
      }) => void;
    }) => { open: () => void };
  };
}
