import { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Typography, TextField, Button, Box, Grow, CircularProgress } from '@mui/material'
import cronstrue from 'cronstrue';
import Device from '../components/Device/Device';

function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false); // use this for refresh
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const RefreshDevice_WebSocket_Handler = (refreshedDevice) => {
    setDevices(prevDevices => {
      const index = prevDevices.findIndex(d => d.id === refreshedDevice.id);
      if (index !== -1) {
        const newDevices = [...prevDevices];
        newDevices[index] = refreshedDevice;
        return newDevices;
      } else {
        return [...prevDevices, refreshedDevice];
      }
    });
  };

  // Pobieranie urządzeń
  const fetchDevices = () => {
    setLoading(true);
    setError(null);

    fetch('https://localhost:6061/devices/all')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setTimeout(() => {
          setDevices(data);
          setLoading(false);
        }, 1200); // spinner stays for at least 1.2s
      })
      .catch(err => {
        setLoading(false);
        setError(err.message);
      });
  };

  useEffect(() => {
    fetchDevices(); // fetch on page load

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:6061/devicehub')
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('DeviceCreated', () => {
          fetchDevices(); // refresh devices when added
        });
        connection.on('DeviceDeleted', () => {
          fetchDevices(); // refresh devices when deleted
        });
        connection.on('DeviceUpdated', (deviceData) => {
          // You can use RefreshDevice_WebSocket_Handler(deviceData) or fetchDevices();
        });
      })
      .catch(() => {});

    return () => {
      connection.stop();
    };
  }, []);

  // Dodaj tłumaczenie CRON do każdego urządzenia
  const devicesWithCronText = devices.map(device => ({
    ...device,
    cronText: device.timestampConfiguration?.cron
      ? (() => {
          try {
            return cronstrue.toString(device.timestampConfiguration.cron);
          } catch {
            return '';
          }
        })()
      : ''
  }));

  // Filtrowanie urządzeń po właściwościach + tłumaczony CRON
  const filteredDevices = devicesWithCronText.filter(device =>
    filter === '' ||
    (device.name && device.name.toLowerCase().includes(filter.toLowerCase())) ||
    (device.deviceNumber && device.deviceNumber.toLowerCase().includes(filter.toLowerCase())) ||
    (device.location?.name && device.location.name.toLowerCase().includes(filter.toLowerCase())) ||
    (device.status?.type && device.status.type.toLowerCase().includes(filter.toLowerCase())) ||
    (device.cronText && device.cronText.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 3 }}>
        <TextField
          label="Filtruj urządzenia (nazwa, numer, lokalizacja, status)"
          variant="outlined"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={fetchDevices}>
          Odśwież
        </Button>
      </Box>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 60, // below filter bar
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
            bgcolor: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size={64} />
        </Box>
      )}
      {error && <div>Błąd: {error}</div>}
      <Box
        sx={{
          width: '100%',
          height: 2 * 420 + 3 * 32,
          maxWidth: 1400,
          margin: '0 auto',
          background: '#f5f7fa',
          borderRadius: 2,
          boxShadow: 2,
          padding: 3,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gridAutoRows: '420px',
          gap: 6
        }}
      >
        {filteredDevices.length === 0 && !loading && (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', fontSize: 22, py: 8 }}>
            Brak urządzeń do wyświetlenia.
          </Box>
        )}
        {filteredDevices.map(device => (
          <Grow
            key={device.id}
            in={true}
            timeout={400}
            style={{ transformOrigin: '50% 50%' }}
          >
            <div style={{ margin: '16px' }}>
              <Device
                key={device.id}
                id={device.id}
                deviceNumber={device.deviceNumber}
                name={device.name}
                location={device.location}
                timestampConfiguration={device.timestampConfiguration}
                status={device.status}
                measurementConfiguration={device.measurementConfiguration}
                onUpdate={fetchDevices}
              />
            </div>
          </Grow>
        ))}
      </Box>
    </Box>
  );
}

export default Devices
