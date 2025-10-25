import MeasurementsLive from './pages/MeasurementsLive';
import Devices from './pages/Devices';
import Measurements from './pages/Measurements';
import Requests from './pages/Requests';
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
    primary: {
      main: '#2986FF'
    },
    customred: {
      main: '#D24F5E'
    },
    customgreen: {
      main: '#00A58C',
      light: '#00B89C'
    },
    customorange: {
      main: '#F0A242'
    },
    customgray: {
      light: '#4E6A81'
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
        tooltip: {
          // backgroundColor: '#10151b',
          // color: '#fff',
          fontSize: '0.875rem',
        },
        arrow: {
          //color: '#10151b',
        },
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
      styleOverrides:{
        root:{
          //disableRipple: true,
          textTransform: 'none',
          //fontSize: 15,
          width: 90
        }
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

        {/* Measurements Live */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/measurementslive">
            <ListItemIcon>
              <InsightsIcon />
            </ListItemIcon>
            <ListItemText primary="Live Measurements" />
          </ListItemButton>
        </ListItem>

        {/* Measurements */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/measurements">
            <ListItemIcon>
              <EqualizerIcon />
            </ListItemIcon>
            <ListItemText primary="Measurements" />
          </ListItemButton>
        </ListItem>

        <Divider />

        {/* Requests */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/requests">
            <ListItemIcon>
              <QueueIcon />
            </ListItemIcon>
            <ListItemText primary="Requests" />
          </ListItemButton>
        </ListItem>

        {/* Raports */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/raports">
            <ListItemIcon>
              <InsertDriveFileIcon />
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
        margin: 2,
        flexGrow: 1, 
        overflow: 'auto',
        minHeight: 0,
        maxHeight: 'calc(100vh - 64px - 2*16px - 25px)' // subtract AppBar height, margins, and footer height
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
      <Box sx={{ backgroundColor: '#080B0E' }}>
        <Typography sx={{ color: "white" }}>
          This is going to be footer in future - x Devices running Context menu - shutdown / start /
        </Typography>
      </Box>
     </Box>
   </ThemeProvider>
 );
}

export default App;

