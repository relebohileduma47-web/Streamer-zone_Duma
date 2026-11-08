import { Link, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/public/Home';
import Browse from './pages/public/Browse';
import ContentDetail from './pages/public/ContentDetail';
import Login from './pages/creator/Login';
import DashboardLayout from './pages/creator/DashboardLayout';
import Overview from './pages/creator/Overview';
import ManageContent from './pages/creator/ManageContent';
import ContentForm from './pages/creator/ContentForm';
import Comments from './pages/creator/Comments';
import Profile from './pages/creator/Profile';

const NotFound = () => (
  <div className="container page center-block">
    <h1>Page not found</h1>
    <p className="muted">That page does not exist or has been moved.</p>
    <Link className="btn" to="/">Go to the home page</Link>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/content/:id" element={<ContentDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="content" element={<ManageContent />} />
        <Route path="content/new" element={<ContentForm />} />
        <Route path="content/:id/edit" element={<ContentForm />} />
        <Route path="comments" element={<Comments />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
