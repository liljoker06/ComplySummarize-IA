import { Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';

const PublicRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </>
);

export default PublicRoutes;