import MeasurementsLive from './pages/MeasurementsLive';
import Devices from './pages/Devices';
import Measurements from './pages/Measurements';
import Requests from './pages/Raports';
import Raports from './pages/Raports';
import './App.css'
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import { Container, CssBaseline } from '@mui/material';
import Zoom from '@mui/material/Zoom';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import * as React from 'react';
import Drawer from '@mui/material/Drawer';
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
          backgroundColor: '#080B0E',
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

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {/* Home */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon>
              <HomeIcon />
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
             sx={{ mr: 2 }}
           >
             <MenuIcon />
           </IconButton>
           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
             News
           </Typography>
           <Button color="inherit">Login</Button>
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
           <Route path="/" element={<div>Home (add your component)</div>} />
           <Route path="/devices" element={<Devices />} />
           <Route path="/measurementslive" element={<MeasurementsLive />} />
           <Route path="/measurements" element={<Measurements />} />
           <Route path="/requests" element={<Requests />} />
           <Route path="/raports" element={<Raports />} />
         </Routes>
       </Box>

      {/* fixed footer always visible at bottom */}
      <Box sx={{ 
          margin: 0,
          padding: 0,
          backgroundColor: '#080B0E' }}
        >
        <Typography sx={{ color: "white" }}>
          This is going to be footer in future - x Devices running Context menu - shutdown / start /
        </Typography>
      </Box>
     </Box>
   </ThemeProvider>
 );
}

export default App;

