import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CalendarPage } from "./pages/CalendarPage";
import { ClientDetail, Clients } from "./pages/Clients";
import { Dashboard } from "./pages/Dashboard";
import { Integrations } from "./pages/Integrations";
import { InvoiceView, Invoices } from "./pages/Invoices";
import { Lawyers } from "./pages/Lawyers";
import { MatterFile } from "./pages/MatterFile";
import { MatterNew } from "./pages/MatterNew";
import { Matters } from "./pages/Matters";
import { StoreProvider } from "./store/StoreContext";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="lawyers" element={<Lawyers />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="matters" element={<Matters />} />
            <Route path="matters/new" element={<MatterNew />} />
            <Route path="matters/:id" element={<MatterFile />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/:id" element={<InvoiceView />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
