import { Route } from 'react-router-dom';
import Conversation from '../pages/Conversation';

const PrivateRoutes = (
  <>
    <Route path="/conversation" element={<Conversation />} />
  </>
);

export default PrivateRoutes;