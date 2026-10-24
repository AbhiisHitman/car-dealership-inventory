import { Route, Routes } from 'react-router';
import { AppShell } from './components/AppShell';
import { RequireAuth, RequireGuest } from './components/RouteGuards';
import { InventoryPage } from './pages/InventoryPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route element={<RequireGuest />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="garage" element={<PurchasesPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
