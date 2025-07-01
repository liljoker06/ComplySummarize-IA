import { Route } from 'react-router-dom';
import Conversation from '../pages/Conversation';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';

const PrivateRoutes = (
  <>
    <Route path="/conversation" element={<Conversation />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/profile" element={<Profile />} />
  </>
);

export default PrivateRoutes;