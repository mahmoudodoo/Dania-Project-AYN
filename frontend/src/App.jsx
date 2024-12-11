import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VerifyCode from "./pages/VerifyCode";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import CrimePredict from "./pages/CrimePredict";
import CrimeRates from "./pages/CrimeRates";
import News from "./pages/News";
import Main from "./pages/Main";
import SavedNews from "./pages/SavedNews";
import History from "./pages/History";
import NewsPage from "./pages/newsPage";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import VerifyEmail from "./pages/VerifyEmail";
function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-news"
          element={
            <ProtectedRoute>
              <SavedNews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rates"
          element={
            <ProtectedRoute>
              <CrimeRates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/predict"
          element={
            <ProtectedRoute>
              <CrimePredict />
            </ProtectedRoute>
          }
        />
        {/* Dynamic route */}
        <Route
          path="/news/:newsId"
          element={
              <NewsPage />
          }
        />{" "}
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/verify-reset" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<NewPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
