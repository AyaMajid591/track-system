import { Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Statistics from "./pages/Statistics";
import Profile from "./pages/Profile";
import AIAssistant from "./pages/AIAssistant";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Notifications from "./pages/Notifications";
import PaymentMethods from "./pages/PaymentMethods";
import ProfileDetails from "./pages/ProfileDetails";
import ScheduledPayments from "./pages/ScheduledPayments";
import GetPro from "./pages/GetPro";
import Settings from "./pages/Settings";
import BudgetDetails from "./pages/BudgetDetails";
import AccountDetails from "./pages/AccountDetails";
import AllTransactions from "./pages/AllTransactions";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/budget/:slug" element={<BudgetDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route path="/profile-details" element={<ProfileDetails />} />
        <Route path="/scheduled-payments" element={<ScheduledPayments />} />
        <Route path="/get-pro" element={<GetPro />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/account/:id" element={<AccountDetails />} />
        <Route path="/all-transactions" element={<AllTransactions />} />
      </Route>
    </Routes>
  );
}

export default App;