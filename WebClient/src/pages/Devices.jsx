import * as React from 'react';
import { useState, useEffect } from 'react';

// DayJS
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";

// Material UI
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, Divider, Snackbar, Fade, LinearProgress, TableRow, Box, Typography, IconButton, Badge, TextField, Button, Menu, MenuItem, ListItemText, Tooltip, Switch, Autocomplete, Grow } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

// Date Pickers
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// SignalR
import * as SignalR from '@microsoft/signalr';

//  Icons
import { FilterList as FilterListIcon, WifiOffOutlined as WifiOffOutlinedIcon, Campaign as CampaignIcon, CloudOutlined as CloudOutlinedIcon, DeleteSweepOutlined as DeleteSweepOutlinedIcon, CachedOutlined as CachedOutlinedIcon, ViewWeekOutlined as ViewWeekOutlinedIcon, CloudOffOutlined as CloudOffOutlinedIcon, Close as CloseIcon, Sort as SortIcon, Devices as DevicesIcon } from '@mui/icons-material';
import CopyAllIcon from '@mui/icons-material/CopyAll';
//  Components
import InfoLabel from '../components/InfoLabel';
import LoadingLabel from '../components/LoadingLabel';
import Device from '../components/Device/Device';

dayjs.extend(utc);

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
  const [serverResponding, setServerResponding] = React.useState(false);
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

    fetch('https://localhost:6061/devices/devices/all')
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
      .catch(() => { });

    return () => {
      connection.stop();
    };
  }, []);

  const devicesWithCronText = devices.map(device => ({
    ...device,
    cronText: device.timestamp?.cron
      ? (() => {
        try {
          return cronstrue.toString(device.timestamp.cron);
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

  //  ---------- SignalR - WebSockets ----------
  React.useEffect(() => {
    let connection = null;

    connection = new SignalR.HubConnectionBuilder()
      .withUrl('https://localhost:6062/measurementhub')
      .configureLogging(SignalR.LogLevel.None)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          return 5000;
        }
      })
      .build();

    connection.onclose((error) => {
      if (error) {
        //console.log('[SIGNALR] Connection closed with error:', error);
      } else {
        //console.log('[SIGNALR] Connection closed gracefully');
      }
    });

    connection.onreconnecting((error) => {
      //console.log('[SIGNALR] Attempting to reconnect...');
      setServerResponding(false);
    });

    connection.onreconnected((connectionId) => {
      //console.log('[SIGNALR] Reconnected successfully with connection ID:', connectionId);
      setServerResponding(true);
    });

    connection.start()
      .then(() => {
        //console.log('[SIGNALR] Connected to ReportsHub successfully');
        setServerResponding(true);
        // connection.on('MeasurementCreated', (dto) => {
        //   CreateSnackAlert_Handler('Measurement captured', `Device captured new measurement. To apply latest changes refresh collection!`);
        // });
      })
      .catch((error) => {
        //console.log('[SIGNALR] Failed to connect to ReportsHub:', error);
        setServerResponding(false);
      });

    return () => {
      if (connection) {
        //console.log('[SIGNALR] Disconnecting from ReportsHub...');
        setServerResponding(false);
        connection.stop().catch((error) => {
          //console.log('[SIGNALR] Error while disconnecting:', error);
        });
      }
      // if (SnackIntervalRef.current) {
      //   clearInterval(SnackIntervalRef.current);
      // }
    };
  }, []);

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Filter controls at top */}
      <Paper sx={{ display: 'flex', m: 1, justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'column' }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap', flexDirection: 'row' }}>
          <Box sx={{ gap: 0, m: 1 }}>
            <Typography fontWeight='bold' variant='h5'>Devices</Typography>
            <Typography variant='subtitle2' sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>Browse and modify devices present in system!</Typography>
          </Box>
        </Box>

        <Paper sx={{ display: 'flex', m: 1, justifyContent: 'start', flexWrap: 'wrap' }}>

          <TextField
            label="Search"
            variant="outlined"
            value={filter}
            size="small"
            onChange={e => setFilter(e.target.value)}
            sx={{ width: 300 }}
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip title={"Refresh devices"}>
              <span>
                <IconButton
                  onClick={fetchDevices} sx={{ ml: 1 }}
                  size='medium'
                >
                  <CachedOutlinedIcon fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

        </Paper>
      </Paper>

      <Box sx={{
        flexGrow: 1,
        overflow: 'auto',
        ml: 2,
        mr: 2,
        minHeight: 0,
        display: 'flex',
        position: 'relative',
        mb: 2
      }}>

        {/* Server not reponding! */}
        <Fade
          in={!serverResponding}
          timeout={{ enter: 600, exit: 300 }}
          unmountOnExit
        >
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
            height: '100%'
          }}>
            <InfoLabel
              mainlabel="Server not responding"
              icon={WifiOffOutlinedIcon}
              description={"Devices service is not responding right now, try again later."}
            />
          </Box>
        </Fade>

        {/* System responding but no measurements in the system! */}
        <Fade
          in={serverResponding && !loading && filteredDevices.length === 0 && devices.length === 0}
          timeout={{ enter: 600, exit: 300 }}
          unmountOnExit
        >
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
            height: '100%'
          }}>
            <InfoLabel
              mainlabel="No devices available!"
              icon={DevicesIcon}
              description={"No devices data found."}
            />
          </Box>
        </Fade>

        {/* System responding but no measurements for this filters! */}
        <Fade
          in={serverResponding && !loading && filteredDevices.length === 0 && devices.length > 0}
          timeout={{ enter: 600, exit: 300 }}
          unmountOnExit
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              width: '100%',
              height: '100%'
            }}
          >
            <InfoLabel
              mainlabel="No devices found!"
              icon={DevicesIcon}
              description={"No devices match your current filters. Try modifying the search criteria or clearing filters to see more results."}
            />
          </Box>
        </Fade>

        {/* System responding and loading measurements! */}
        <Fade
          in={serverResponding && loading}
          timeout={{ enter: 600, exit: 300 }}
          unmountOnExit
        >
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
            height: '100%'
          }}>
            <LoadingLabel
              mainlabel="Loading devices..."
              icon={DevicesIcon}
              description={"Homee system is retrieveing devices from database"}
            />
          </Box>
        </Fade>

        {/* System responding and displaying measurements list */}
        <Fade
          in={serverResponding && !loading && filteredDevices.length > 0}
          timeout={{ enter: 600, exit: 300 }}
          unmountOnExit
        >
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 2,
            alignContent: 'flex-start'
          }}>
            {filteredDevices.map(device => (
              <Grow
                key={device.id}
                in={true}
                timeout={400}
                style={{ transformOrigin: '50% 50%' }}
              >
                <Box>
                  <Device
                    key={device.id}
                    id={device.id}
                    deviceNumber={device.deviceNumber}
                    name={device.name}
                    location={device.location}
                    timestamp={device.timestamp}
                    status={device.status}
                    measurementTypes={device.measurementTypes}
                    onUpdate={fetchDevices}
                  />
                </Box>
              </Grow>
            ))}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}

export default Devices