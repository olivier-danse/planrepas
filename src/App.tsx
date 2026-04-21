import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { PlanningPage } from '@/pages/PlanningPage';
import { ShoppingListPage } from '@/pages/ShoppingListPage';
import { SynthesisPage } from '@/pages/SynthesisPage';

export function App() {
  return (
    <BrowserRouter basename="/planrepas">
      <AppHeader />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<PlanningPage />} />
          <Route path="/synthese" element={<SynthesisPage />} />
          <Route path="/courses" element={<ShoppingListPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
