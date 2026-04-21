import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { PlanningPage } from '@/pages/PlanningPage';
import { ShoppingListPage } from '@/pages/ShoppingListPage';

export function App() {
  return (
    <BrowserRouter basename="/meal-planner">
      <AppHeader />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<PlanningPage />} />
          <Route path="/courses" element={<ShoppingListPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
