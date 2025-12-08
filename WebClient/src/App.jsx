import MeasurementsLive from './pages/MeasurementsLive';
import Devices from './pages/Devices';
import Measurements from './pages/Measurements';
import Requests from './pages/Raports';
import Raports from './pages/Raports';
import Home from './pages/Home';
import './App.css'
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import { Container, CssBaseline } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import Zoom from '@mui/material/Zoom';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import BlockIcon from '@mui/icons-material/Block';
import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from 'react-router-dom';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DevicesIcon from '@mui/icons-material/Devices';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import InsightsIcon from '@mui/icons-material/Insights';
import HomeIcon from '@mui/icons-material/Home';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import QueueIcon from '@mui/icons-material/Queue';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0b0f14', paper: '#10151b' },
    customred: {
      main: '#D24F5E',
      dark: '#D1334C'
    },
    customgreen: {
      main: '#00A58C',
      light: '#00B89C'
    },
    customorange: {
      main: '#F0A242'
    },
    customyellow:{
      main: '#F3E871'
    },
    custompalette:{
      night: '#080B0E',
      richblack: '#10151B',
      jet: '#303235',
      paynesgray: '#4E6A81',
      powderblue: '#ADBECB',
      airsuperiorityblue: '#7794AB',
      royalblue: '#1D63ED',
      charcoal: '#2D404E',
      azure: '#2986FF',
      maize: '#F3E871',
      teagreen: '#C6EBBE',
      persiangreen: '#00A58C',
      indianred: '#D24F5E',
      rustyred: '#D1334C'
    },
    customgray: {
      lightest: '#303235',
      light: '#4E6A81',
      dark: '#0b0f14'
    },
    primary: {
      main: '#1D63ED',
      light: '#2986FF'
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#080B0E', // <-- global drawer background
          color: '#fff'
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
         /* override CssBaseline background here */
         backgroundColor: '#10151b', // choose desired background
         color: '#e6eef8',           // optional text color
          /* For Chrome, Edge, and Safari */
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#0a0f14',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#333a45',
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#4a5568',
          },

          /* For Firefox */
          scrollbarWidth: 'thin',
          scrollbarColor: '#333a45 #0a0f14',
        },
      },
    },
    MuiAppBar:{
      styleOverrides:{
        root:{
          backgroundColor: '#041D58',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#10151b',
          backgroundImage: 'none',
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiTooltip: {
      defaultProps: {
        placement: 'top',
        arrow: true,
        TransitionComponent: Zoom,
      },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.custompalette.charcoal,
          color: '#fff',
          fontSize: '0.8rem',
          borderRadius: '6px',
        }),
        arrow: ({ theme }) => ({
          color: theme.palette.custompalette.charcoal,
        }),
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#10151b',
        },
      },
    },
    MuiTableHead:{
      styleOverrides: {
        root: {
          backgroundColor: '#10151b',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '10px',
          // remove hard background here, or keep initial background color only
          backgroundColor: '#10151b',
          borderBottom: 'none',

          '&.MuiTableCell-head': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)', // subtle header line
            fontWeight: 600,
            color: '#fff',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          // when row is hovered, change all td/th inside it
          '&:hover td, &:hover th': {
            backgroundColor: '#1A222A',
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          backgroundColor: '#10151b',
        },
      },
    },
    MuiIconButton:{
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        // use theme.primary for icon color and a subtle filled background on hover
        root: ({ theme }) => ({
          backgroundColor: 'transparent',
          color: theme.palette.primary.main,
          transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
          },
          '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.18),
          },
        }),
      },
    },
    MuiTextField:{
      styleOverrides: {
        root: {
          backgroundColor: '#10151b',
          '& .MuiInputBase-root': {
            size: 'small',
            backgroundColor: '#10151b',
          },
        },
      },
    },
    MuiButton:{
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides:{
        root: ({ theme }) => ({
          backgroundColor: theme.palette.custompalette.royalblue,
          textTransform: 'none',
          width: 90,
          color: 'white',
          transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
          '&:hover': {
            backgroundColor: alpha(theme.palette.custompalette.azure, 0.90),
            //color: theme.palette.custompalette.royalblue,
          },
          '&:active': {
            backgroundColor: alpha(theme.palette.custompalette.azure, 1),
          },
        }),
      },
    },
    MuiMenuItem:{
      defaultProps: {
        //disableRipple: true,
      },
    },
    MuiSwitch:{
      defaultProps: {
        //disableRipple: true,
      },
    },
    MuiTypography:{
      styleOverrides:{
        root:{
          userSelect: 'none',
          fontSize: '0.875rem',
        },
        h1: {
          fontSize: '2.5rem',
        },
        h2: {
          fontSize: '2rem',
        },
        h3: {
          fontSize: '1.75rem',
        },
        h4: {
          fontSize: '1.5rem',
        },
        h5: {
          fontSize: '1.25rem',
        },
        h6: {
          fontSize: '1.125rem',
        },
        body1: {
          fontSize: '1rem',
        },
        body2: {
          fontSize: '0.875rem',
        },
        caption: {
          fontSize: '0.75rem',
        },
        subtitle1: {
          fontSize: '1rem',
        },
        subtitle2: {
          fontSize: '0.875rem',
        },
        button: {
          fontSize: '0.875rem',
        },
        overline: {
          fontSize: '0.75rem',
        }
      }
    },
    MuiTab:{
      styleOverrides:{
        root:{
          textTransform: 'none',
        }
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          backgroundColor: '#10151b',
        },
      },
    },
    MuiDateTimePicker: {
      styleOverrides: {
        root: {
          backgroundColor: '#10151b',
        },
      },
    },
  },
});


function App() {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [serviceStatus, setServiceStatus] = React.useState({
    devices: false,
    raports: false,
    measurements: false,
    emulators: false
  });
  const [locationsMonitored, setLocationsMonitored] = React.useState(0);
  const [devicesOnline, setDevicesOnline] = React.useState(0);
  const [totalDevices, setTotalDevices] = React.useState(0);
  const [allDevices, setAllDevices] = React.useState([]);
  const [statuses, setStatuses] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuOpen = Boolean(anchorEl);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePowerOn = async () => {
    handleMenuClose();
    try {
      // Find the "Online" status ID
      const onlineStatus = statuses.find(s => s.type === 'Online');
      if (!onlineStatus) {
        console.error('Online status not found');
        return;
      }

      // Get all offline devices
      const offlineDevices = allDevices.filter(d => d.status?.type !== 'Online');
      
      // Update each offline device to online
      const promises = offlineDevices.map(device =>
        fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/device/status/?DeviceID=${device.id}&StatusID=${onlineStatus.id}`, {
          method: 'PUT',
          signal: AbortSignal.timeout(5000)
        })
      );

      await Promise.all(promises);
      console.log('Powered on all devices');
      
      // Refresh device list
      fetchDevicesOnline();
    } catch (error) {
      console.error('Failed to power on devices:', error);
    }
  };

  const handlePowerOff = async () => {
    handleMenuClose();
    try {
      // Find the "Offline" status ID
      const offlineStatus = statuses.find(s => s.type === 'Offline');
      if (!offlineStatus) {
        console.error('Offline status not found');
        return;
      }

      // Get all online devices
      const onlineDevices = allDevices.filter(d => d.status?.type === 'Online');
      
      // Update each online device to offline
      const promises = onlineDevices.map(device =>
        fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/device/status/?DeviceID=${device.id}&StatusID=${offlineStatus.id}`, {
          method: 'PUT',
          signal: AbortSignal.timeout(5000)
        })
      );

      await Promise.all(promises);
      console.log('Powered off all devices');
      
      // Refresh device list
      fetchDevicesOnline();
    } catch (error) {
      console.error('Failed to power off devices:', error);
    }
  };

  const handleDisable = async () => {
    handleMenuClose();
    try {
      // Find the "Disabled" status ID
      const disabledStatus = statuses.find(s => s.type === 'Disabled');
      if (!disabledStatus) {
        console.error('Disabled status not found');
        return;
      }

      // Get all non-disabled devices
      const activeDevices = allDevices.filter(d => d.status?.type !== 'Disabled');
      
      // Update each active device to disabled
      const promises = activeDevices.map(device =>
        fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/device/status/?DeviceID=${device.id}&StatusID=${disabledStatus.id}`, {
          method: 'PUT',
          signal: AbortSignal.timeout(5000)
        })
      );

      await Promise.all(promises);
      console.log('Disabled all devices');
      
      // Refresh device list
      fetchDevicesOnline();
    } catch (error) {
      console.error('Failed to disable devices:', error);
    }
  };

  // Check service health
  React.useEffect(() => {
    const checkServices = async () => {
      const services = [
        { name: 'devices', url: import.meta.env.VITE_DEVICES_URL },
        { name: 'measurements', url: import.meta.env.VITE_MEASUREMENTS_URL },
        { name: 'raports', url: import.meta.env.VITE_RAPORTS_URL },
        { name: 'emulators', url: import.meta.env.VITE_EMULATORS_URL }
      ];
      const newStatus = {};
      
      for (const service of services) {
        try {
          const response = await fetch(`${service.url}/${service.name}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
          });
          newStatus[service.name] = response.ok;
        } catch (error) {
          newStatus[service.name] = false;
        }
      }
      
      setServiceStatus(newStatus);
      setIsLoading(false);
    };

    checkServices();
    const interval = setInterval(checkServices, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch locations monitored count
  React.useEffect(() => {
    const fetchLocationsMonitored = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/locations/monitored`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          const data = await response.json();
          // If data is an array, get its length; otherwise, try to get a count property
          const count = Array.isArray(data) ? data.length : (data.count || 0);
          setLocationsMonitored(count);
        }
      } catch (error) {
        console.error('Failed to fetch locations monitored:', error);
      }
    };

    fetchLocationsMonitored();
    const interval = setInterval(fetchLocationsMonitored, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch devices online count
  const fetchDevicesOnline = React.useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/devices/all`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) {
        const data = await response.json();
        // Filter devices with status type "Online"
        const onlineCount = Array.isArray(data) 
          ? data.filter(device => device.status?.type === 'Online').length 
          : 0;
        const total = Array.isArray(data) ? data.length : 0;
        setAllDevices(Array.isArray(data) ? data : []);
        setDevicesOnline(onlineCount);
        setTotalDevices(total);
      }
    } catch (error) {
      console.error('Failed to fetch devices online:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchDevicesOnline();
    const interval = setInterval(fetchDevicesOnline, 5000);
    
    return () => clearInterval(interval);
  }, [fetchDevicesOnline]);

  // Fetch available statuses
  React.useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/statuses/all`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          const data = await response.json();
          setStatuses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch statuses:', error);
      }
    };

    fetchStatuses();
  }, []);

  // Calculate overall system status
  const getSystemStatus = () => {
    if (isLoading) {
      return { status: 'Loading', icon: CloudOutlinedIcon, color: '#7794AB' };
    }
    
    const servicesArray = Object.values(serviceStatus);
    const healthyCount = servicesArray.filter(s => s).length;
    
    if (healthyCount === servicesArray.length) {
      return { status: 'Healthy', icon: CloudDoneOutlinedIcon, color: '#00A58C' };
    } else if (healthyCount === 0) {
      return { status: 'Fatal', icon: ErrorOutlineIcon, color: '#D24F5E' };
    } else {
      return { status: 'Warning', icon: WarningAmberIcon, color: '#F0A242' };
    }
  };

  const systemStatus = getSystemStatus();
  const StatusIcon = systemStatus.icon;

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {/* Home */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon>
              <CottageOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>

        <Divider />

        {/* Devices */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/devices">
            <ListItemIcon>
              <DevicesIcon />
            </ListItemIcon>
            <ListItemText primary="Devices"/>
          </ListItemButton>
        </ListItem>

        <Divider />

        {/* Measurements */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/measurements">
            <ListItemIcon>
              <CloudOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Measurements" />
          </ListItemButton>
        </ListItem>

        {/* Measurements Live */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/measurementslive">
            <ListItemIcon>
              <CloudSyncOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Live Measurements" />
          </ListItemButton>
        </ListItem>

        <Divider />

        {/* Raports */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/raports">
            <ListItemIcon>
              <DescriptionOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Raports" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignContent: 'stretch', height: '100vh', padding: 0, margin: 0}}>
       {/* AppBar (fixed) */}
       <AppBar position="static">
         <Toolbar>
           <IconButton
             size="large"
             edge="start"
             onClick={toggleDrawer(true)}
             color="inherit"
             aria-label="menu"
             sx={{ mr: 0, color: 'white' }}
           >
             <MenuIcon />
           </IconButton>
           
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
             <Box
               sx={{
                 width: 48,
                 height: 48,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <CottageOutlinedIcon sx={{ fontSize: 32, color: 'white' }} />
             </Box>
             <Typography variant="h6" component="div" sx={{ fontWeight: 500, letterSpacing: 0.3, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
               Homee System
             </Typography>
           </Box>

           <Box sx={{ 
             backgroundColor: '#080B0E',
             padding: '8px 16px',
             mt: 1,
             mb: 1,
             borderRadius: 1,
             display: 'flex',
             alignItems: 'center',
             gap: 3,
           }}>
             {/* System Status */}
             <Tooltip title={
               <Box>
                 <Typography variant="caption" sx={{ fontWeight: 600 }}>System Status: {systemStatus.status}</Typography>
                 <Box sx={{ mt: 0 }}>
                   <Typography variant="caption" sx={{ display: 'block' }}>Devices: {serviceStatus.devices ? '✓' : '✗'}</Typography>
                   <Typography variant="caption" sx={{ display: 'block' }}>Raports: {serviceStatus.raports ? '✓' : '✗'}</Typography>
                   <Typography variant="caption" sx={{ display: 'block' }}>Measurements: {serviceStatus.measurements ? '✓' : '✗'}</Typography>
                   <Typography variant="caption" sx={{ display: 'block' }}>Emulators: {serviceStatus.emulators ? '✓' : '✗'}</Typography>
                 </Box>
               </Box>
             }>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, cursor: 'pointer' }}>
                 <StatusIcon sx={{ fontSize: 20, color: systemStatus.color }} />
                 <Typography variant="body2" sx={{ color: 'white' }}>{systemStatus.status}</Typography>
               </Box>
             </Tooltip>

             <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

             {/* Devices Running Count */}
             <Tooltip title="Devices Running">
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1 }}>
                 <DevicesIcon sx={{ fontSize: 20, color: 'white' }} />
                 {isLoading ? (
                   <Skeleton variant="text" width={20} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                 ) : (
                   <Typography variant="body2" sx={{ color: 'white' }}>{devicesOnline}</Typography>
                 )}
               </Box>
             </Tooltip>

             <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

             {/* Locations Monitored Count */}
             <Tooltip title="Locations Monitored">
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1 }}>
                 <QueryStatsOutlinedIcon sx={{ fontSize: 20, color: 'white' }} />
                 {isLoading ? (
                   <Skeleton variant="text" width={20} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                 ) : (
                   <Typography variant="body2" sx={{ color: 'white' }}>{locationsMonitored}</Typography>
                 )}
               </Box>
             </Tooltip>

             <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

             {/* Menu Button */}
             <Tooltip title="Options">
               <IconButton 
                 size="small" 
                 sx={{ color: 'white' }}
                 onClick={handleMenuClick}
               >
                 <MoreVertIcon />
               </IconButton>
             </Tooltip>

             {/* Menu */}
             <Menu
               anchorEl={anchorEl}
               open={menuOpen}
               onClose={handleMenuClose}
               anchorOrigin={{
                 vertical: 'bottom',
                 horizontal: 'right',
               }}
               transformOrigin={{
                 vertical: 'top',
                 horizontal: 'right',
               }}
             >
               <MenuItem onClick={handlePowerOn} disabled={devicesOnline === totalDevices || totalDevices === 0}>
                 <ListItemIcon>
                   <PowerSettingsNewIcon fontSize="small" sx={{ color: '#00A58C' }} />
                 </ListItemIcon>
                 <ListItemText>Power On Devices</ListItemText>
               </MenuItem>
               <MenuItem onClick={handlePowerOff} disabled={devicesOnline === 0 || totalDevices === 0}>
                 <ListItemIcon>
                   <PowerOffIcon fontSize="small" sx={{ color: '#D24F5E' }} />
                 </ListItemIcon>
                 <ListItemText>Power Off Devices</ListItemText>
               </MenuItem>
               <MenuItem onClick={handleDisable} disabled={totalDevices === 0}>
                 <ListItemIcon>
                   <BlockIcon fontSize="small" sx={{ color: '#F0A242' }} />
                 </ListItemIcon>
                 <ListItemText>Disable Devices</ListItemText>
               </MenuItem>
             </Menu>
           </Box>
         </Toolbar>
       </AppBar>

       {/* Drawer (if any) */}
       <Drawer open={open} onClose={toggleDrawer(false)}>
         {DrawerList}
       </Drawer>

       {/* main content: fills available space between top toolbar and footer */}
       <Box sx={{ 
        //margin: 2,
        padding: 0,
        flexGrow: 1, 
        overflow: 'auto',
        //minHeight: 0,
        //maxHeight: 'calc(100vh - 64px - 2*16px - 25px)' // subtract AppBar height, margins, and footer height
      }}>
         <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/devices" element={<Devices />} />
           <Route path="/measurementslive" element={<MeasurementsLive />} />
           <Route path="/measurements" element={<Measurements />} />
           <Route path="/requests" element={<Requests />} />
           <Route path="/raports" element={<Raports />} />
         </Routes>
       </Box>
     </Box>
   </ThemeProvider>
 );
}

export default App;

