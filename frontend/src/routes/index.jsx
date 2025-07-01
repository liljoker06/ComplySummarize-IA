import { Routes} from 'react-router-dom';
import PublicRoutes from './public';
import PrivateRoutes from './private';

//logique autorisation 


function Router() {
  return (
    <Routes>
      {PublicRoutes}
      {PrivateRoutes}
    </Routes>
  );
}

export default Router;
