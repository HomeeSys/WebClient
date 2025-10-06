import { Link } from 'react-router-dom';

function NavigationBar() {
  return (
    <div>
      <h1>Navigation Bar</h1>
      <ul>
        <Link to="/devices" style={{ textDecoration: 'none', color: 'inherit' }}>
          <li>Devices</li>
        </Link>
        <Link to="/measurementslive" style={{ textDecoration: 'none', color: 'inherit' }}>
          <li>Measurements Live</li>
        </Link>
        <Link to="/measurements" style={{ textDecoration: 'none', color: 'inherit' }}>
          <li>Measurements</li>
        </Link>
        <Link to="/requests" style={{ textDecoration: 'none', color: 'inherit' }}>
          <li>Requests</li>
        </Link>
        <Link to="/raports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <li>Raports</li>
        </Link>
      </ul>
    </div>
  );
}

export default NavigationBar