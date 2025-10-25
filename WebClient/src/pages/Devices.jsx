import { useState, useEffect } from 'react';
import * as SignalR from '@microsoft/signalr';
import { Typography, IconButton, TextField, Button, Box, Grow, CircularProgress } from '@mui/material'
import cronstrue from 'cronstrue';
import Device from '../components/Device/Device';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import RefreshIcon from '@mui/icons-material/Refresh';
import Divider from '@mui/material/Divider';
import DevicesIcon from '@mui/icons-material/Devices';
import LinearProgress from '@mui/material/LinearProgress';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));


function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
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
        }, 1200);
      })
      .catch(err => {
        setLoading(false);
        setError(err.message);
      });
  };

  useEffect(() => {
    fetchDevices();

    const connection = new SignalR.HubConnectionBuilder()
      .withUrl('https://localhost:6061/devicehub')
      .configureLogging(SignalR.LogLevel.None)
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('DeviceCreated', () => {
          fetchDevices();
        });
        connection.on('DeviceDeleted', () => {
          fetchDevices();
        });
        connection.on('DeviceUpdated', (deviceData) => {
          console.log('DEVICE UPDATED');
        });
      })
      .catch(() => {});

    return () => {
      connection.stop();
    };
  }, []);

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

  const filteredDevices = devicesWithCronText.filter(device =>
    filter === '' ||
    (device.name && device.name.toLowerCase().includes(filter.toLowerCase())) ||
    (device.deviceNumber && device.deviceNumber.toLowerCase().includes(filter.toLowerCase())) ||
    (device.location?.name && device.location.name.toLowerCase().includes(filter.toLowerCase())) ||
    (device.status?.type && device.status.type.toLowerCase().includes(filter.toLowerCase())) ||
    (device.cronText && device.cronText.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{alignItems: 'center', justifyContent:'center', display: 'flex', gap: 1, mb: 3, mt: 1 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={filter}
          size="small"
          onChange={e => setFilter(e.target.value)}
          sx={{ width: '33%' }}
        />
            <IconButton onClick={fetchDevices} sx={{ ml: 1 }} >
                <RefreshIcon />
            </IconButton>
      </Box>

      <Divider />

      {loading ? (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '33%' }}>
            <Typography variant="h6" align="center" gutterBottom>
              Loading devices...
            </Typography>
            <LinearProgress />
          </Box>
        </Box>
      ) : (
      <Box
        sx={{
          height: '100%',
          mt: 2,
          overflowX: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'left',
          alignContent: 'left',
          p: 2,
        }}
      >
        {filteredDevices.length === 0 && !loading ? (
        <Box
          sx={{
            width: '33%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              backgroundColor: "#303235",
              color: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 100,
              height: 100,
              mb: 2,
            }}
          >
            <DevicesIcon sx={{ fontSize: 50 }} />
          </Box>

          <Typography variant="h6" gutterBottom>
            No devices found.
          </Typography>
        </Box>
        ) : 
        filteredDevices.map(device => (
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
      )}
    </Box>
  );
}

export default Devices