import { AuthProvider } from './hooks/useAuth.jsx';
import Router from './routes';

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
