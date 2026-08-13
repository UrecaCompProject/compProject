import { BrowserRouter as Router, Link, Route, Routes } from 'react-router';

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
          Home
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          메인 페이지입니다.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Tailwind가 적용된 기본 페이지 예시입니다.
        </p>
        <button className="mt-6 rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition hover:bg-violet-700">
          시작하기
        </button>
      </div>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">About</h1>
        <p className="mt-4 text-slate-600">소개 페이지입니다.</p>
      </div>
    </main>
  );
}

function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">Contact</h1>
        <p className="mt-4 text-slate-600">문의 페이지입니다.</p>
      </div>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-5xl font-bold text-slate-800">404</h1>
        <p className="mt-4 text-slate-600">페이지를 찾을 수 없습니다.</p>
      </div>
    </main>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <nav className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <Link
          className="font-medium text-slate-700 hover:text-violet-600"
          to="/"
        >
          Home
        </Link>
        <Link
          className="font-medium text-slate-700 hover:text-violet-600"
          to="/about"
        >
          About
        </Link>
        <Link
          className="font-medium text-slate-700 hover:text-violet-600"
          to="/contact"
        >
          Contact
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
