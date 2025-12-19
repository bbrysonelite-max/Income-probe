import Dashboard from './components/Dashboard';
import { AccessGate } from './components/AccessGate';

function App() {
  return (
    <AccessGate>
      <Dashboard />
    </AccessGate>
  );
}

export default App;