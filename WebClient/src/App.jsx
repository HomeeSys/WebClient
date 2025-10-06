import NavigationBar from './components/NavigationBar';
import MeasurementsLive from './pages/MeasurementsLive';
import Devices from './pages/Devices';
import Measurements from './pages/Measurements';
import Requests from './pages/Requests';
import Raports from './pages/Raports';
import './App.css'
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <NavigationBar/>
      <Routes>
        <Route path="/devices" element={<Devices />} />
        <Route path="/measurementslive" element={<MeasurementsLive />} />
        <Route path="/measurements" element={<Measurements />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/raports" element={<Raports />} />
      </Routes>
    </div>
  );
}

export default App;