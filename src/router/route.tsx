import { BrowserRouter as Router, Route, Routes } from 'react-router';

import {
  ChangeResultPage,
  ChatPage,
  EventCouponPage,
  EventPage,
  EventStorePage,
  PlanChangePage,
  PlanDetailPage,
  PlanPage,
} from '@/features/pages';
import { Layout } from '@/layout';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ChatPage />} />

          <Route path="/plan" element={<PlanPage />} />
          <Route path="/plan/:id" element={<PlanDetailPage />} />
          <Route path="/plan/:id/change" element={<PlanChangePage />} />
          <Route
            path="/plan/:id/change/result"
            element={<ChangeResultPage />}
          />

          <Route path="/event" element={<EventPage />} />
          <Route path="/event/store" element={<EventStorePage />} />
          <Route path="/event/coupon" element={<EventCouponPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
