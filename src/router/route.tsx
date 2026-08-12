import { BrowserRouter as Router, Link, Route, Routes } from 'react-router';

function HomePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Home</h1>
      <p>메인 페이지입니다.</p>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>About</h1>
      <p>소개 페이지입니다.</p>
    </div>
  );
}

function ContactPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Contact</h1>
      <p>문의 페이지입니다.</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>404</h1>
      <p>페이지를 찾을 수 없습니다.</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <nav
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem 2rem',
          borderBottom: '1px solid #ddd',
        }}
      >
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
        <Link to='/contact'>Contact</Link>
      </nav>

      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
