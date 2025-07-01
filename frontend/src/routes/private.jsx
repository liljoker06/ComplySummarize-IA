import { Route } from 'react-router-dom';
import Conversation from '../pages/Conversation';
import Settings from '../pages/Settings';

const PrivateRoutes = (
  <>
    <Route path="/conversation" element={<Conversation />} />
    <Route path="/settings" element={<Settings />} />
  </>
);

export default PrivateRoutes;