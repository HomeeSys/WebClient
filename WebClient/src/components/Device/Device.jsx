import { Box, IconButton, Typography, Button, Stack, ButtonGroup, Grid, Divider, Snackbar, Alert, CircularProgress, SpeedDial, SpeedDialAction, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import RefreshIcon from '@mui/icons-material/Refresh';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { useState, useEffect } from 'react';
import cronstrue from 'cronstrue';
import BlockIcon from '@mui/icons-material/Block';
import { HubConnectionBuilder } from '@microsoft/signalr';
function Device(
    {
        id = '',
        name = '',
        deviceNumber = '',
        location = {},
        status = {},
        timestampConfiguration = {},
        measurementConfiguration = {},
        onUpdate
    }) {
    const [updating, setUpdating] = useState(false);

    // DB Entity properties
    const [DBID, setDBID] = useState(id);
    const [DBName, setDBName] = useState(name);
    const [DBDeviceNumber, setDBDeviceNumber] = useState(deviceNumber);
    const [DBLocationId, setDBLocationId] = useState(location.id);
    const [DBLocationName, setDBLocationName] = useState(location.name);
    const [DBTimestampConfigurationId, setDBTimestampConfigurationId] = useState(timestampConfiguration.id);
    const [DBTimestampConfigurationValue, setDBTimestampConfigurationValue] = useState(timestampConfiguration.cron);
    const [DBTimestampConfigurationValueAsText, setDBTimestampConfigurationValueAsText] = useState(cronstrue.toString(timestampConfiguration.cron));
    const [DBStatusId, setDBStatusId] = useState(status.id);
    const [DBStatusValue, setDBStatusValue] = useState(status.type);

    const [cronAsText, setCronAsText] = useState(timestampConfiguration.cron);
    const [cronError, setCronError] = useState('');
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [editName, setEditName] = useState(name);
    const [editLocationId, setEditLocationId] = useState(Number(DBLocationId));
    const [editTimestampConfigId, setEditTimestampConfigId] = useState(Number(DBTimestampConfigurationId));
    const [editCron, setEditCron] = useState(timestampConfiguration.cron);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const cronText = timestampConfiguration.cron ? cronstrue.toString(timestampConfiguration.cron, { locale: 'en' }) : '';

    const [loadingDisable, setLoadingDisable] = useState(false);
    const [loadingPowerOn, setLoadingPowerOn] = useState(false);
    const [loadingPowerOff, setLoadingPowerOff] = useState(false);

    const [loading, setLoading] = useState(false);
    //const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState(false);
    const [possibleLocations, setPossibleLocations] = useState([]);
    const [possibleTimestampsConfigs, setpossibleTimestampsConfigs] = useState([]);

    useEffect(() => {
        // Fetch possible locations from DB when settings dialog is opened
        if (settingsDialogOpen) {
            fetch('https://localhost:6061/devices/locations/all')
                .then(res => res.json())
                .then(data => setPossibleLocations(data))
                .catch(() => setPossibleLocations([]));

            fetch('https://localhost:6061/devices/timestampconfigurations/all')
                .then(res => res.json())
                .then(data => setpossibleTimestampsConfigs(data))
                .catch(() => setpossibleTimestampsConfigs([]));
        }
    }, [settingsDialogOpen]);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl('https://localhost:6061/devicehub') // Twój endpoint SignalR
            .withAutomaticReconnect()
            .build();

            try{

                connection.start()
                .then(() => {
                    connection.on('DeviceUpdated', (deviceData) => {
                        //console.log('WebSocket: DeviceUpdated event received');
                        if (DBID === deviceData.id) {
                            UpdateDevice(deviceData);
                        }
                    });
                })
                .catch(()=>{});
            }
            catch (error){
                
            }
                
        return () => {
            connection.stop();
        };
    }, []);

    const handleRefresh = async () => {
        setRefreshLoading(true);
        try {
            const response = await fetch(`https://localhost:6061/devices/devicenumber/${DBDeviceNumber}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const responseData = await response.json();

            if (response.ok) {
                //setSnackbar({ open: true, message: 'Device data refreshed!', severity: 'success' });
                UpdateDevice(responseData);
            }
            else {
                //setSnackbar({ open: true, message: 'Refresh failed!', severity: 'error' });    
            }

            setRefreshLoading(false);
        } catch (error) {
            //setSnackbar({ open: true, message: error, severity: 'error' });
        } finally {
            setRefreshLoading(false);
        }
    };

    const ChangeDeviceStatus = async (desiredStateType) => {
        try {
            if (desiredStateType === 'Online') {
                setLoadingPowerOn(true);
            }
            else if (desiredStateType === 'Offline') {
                setLoadingPowerOff(true);
            }
            else if (desiredStateType === 'Disabled') {
                setLoadingDisable(true);
            }
            else {
                throw new Error('Invalid desired state type');
            }

            const response = await fetch(`https://localhost:6061/devices/status/${DBID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ StatusType: desiredStateType }),
            });
            if (!response.ok) throw new Error('Network response was not ok');

            await new Promise(resolve => setTimeout(resolve, 600));

            const responseData = await response.json();
            console.log(responseData);

            setDBStatusId(responseData.statusID);
            setDBStatusValue(responseData.statusType);

            console.log(DBStatusId);
            console.log(DBStatusValue);

            let message = 'Device has beed disabled.';
            if (desiredStateType === 'Online') message = 'Device has been turned on.';
            else if (desiredStateType === 'Offline') message = 'Device has been turned off.';

            //setSnackbar({ open: true, message: message, severity: 'success' });
        } catch (err) {
            //setSnackbar({ open: true, message: 'Operation failed. Please try again.', severity: 'error' });
        } finally {
            if (desiredStateType === 'Online') {
                setLoadingPowerOn(false);
            }
            else if (desiredStateType === 'Offline') {
                setLoadingPowerOff(false);
            }
            else if (desiredStateType === 'Disabled') {
                setLoadingDisable(false);
            }
            else {
                setLoadingDisable(false);
                setLoadingPowerOff(false);
                setLoadingPowerOn(false);
                throw new Error('Invalid desired state type');
            }
        }
    };

    // Kolor żarówki w zależności od statusu
    const getBulbColor = () => {
        if (DBStatusValue === 'Online') return 'green';
        if (DBStatusValue === 'Offline') return 'red';
        return 'gray'; // Disabled
    };

    const handleEnableDevice = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://localhost:6061/devices/status/${DBID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ StatusType: 'Online' }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            await new Promise(resolve => setTimeout(resolve, 600));
            const responseData = await response.json();
            setDBStatusValue(responseData.StatusType);
            //setSnackbar({ open: true, message: 'Device enabled.', severity: 'success' });
        } catch (err) {
            //setSnackbar({ open: true, message: 'Enable failed. Please try again.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    function UpdateDevice(newData) {
        setUpdating(true); // <-- show spinner
        setTimeout(() => setUpdating(false), 1200); // <-- hide spinner after 0.6s
        
        setDBID(newData.id);
        setDBDeviceNumber(newData.deviceNumber);
        setDBName(newData.name);
        setDBLocationId(newData.location.id);
        setDBLocationName(newData.location.name);
        setDBTimestampConfigurationId(newData.timestampConfiguration.id);
        setDBTimestampConfigurationValue(newData.timestampConfiguration.cron);
        setDBTimestampConfigurationValueAsText(cronstrue.toString(newData.timestampConfiguration.cron));
        setDBStatusId(newData.status.id);
        setDBStatusValue(newData.status.type);
    }
    // Updates device settings like: name, location and cron configuration.
    const HandleUpdateDeviceSettings = async () => {
        if (cronError) return;

        if (editName === DBName && editLocationId === DBLocationId && editTimestampConfigId === DBTimestampConfigurationId) {
            //setSnackbar({ open: true, message: 'No changes detected!', severity: 'info' });   
            setSettingsDialogOpen(false);
            return;
        }

        setSettingsLoading(true);

        // Empty dto object.
        const updateDeviceDTO = {};

        // Append properties based on changes.
        if (editName !== DBName) {
            updateDeviceDTO.name = editName;
        }
        if (editLocationId !== DBLocationId) {
            updateDeviceDTO.locationID = editLocationId;
        }
        if (editTimestampConfigId !== DBTimestampConfigurationValue) {
            updateDeviceDTO.TimestampConfigurationID = editTimestampConfigId;
        }

        try {
            const response = await fetch(`https://localhost:6061/devices/${DBDeviceNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateDeviceDTO)
            });

            const responseData = await response.json();

            console.log(updateDeviceDTO);

            if (response.ok) {
                //setSnackbar({ open: true, message: 'Device settings updated.', severity: 'success' });
                UpdateDevice(responseData);
            }
            else {
                //setSnackbar({ open: true, message: 'Update failed.', severity: 'error' });    
            }

            setSettingsDialogOpen(false);
        } catch (error) {
            ///setSnackbar({ open: true, message: error, severity: 'error' });
        } finally {
            setSettingsLoading(false);
        }
    };

    const updateDevice = async (newData) => {
        setUpdating(true);
        try {
            // ...your update logic (e.g. fetch/axios PUT)...
            // await fetch(...);
            if (onUpdate) onUpdate();
        } finally {
            setTimeout(() => setUpdating(false), 1200); // show spinner for 1.2s
        }
    };

    return (
        <Box sx={{
            width: 350,
            minWidth: 350,
            height: 350,
            minHeight: 350,
            borderRadius: 2,
            padding: 2,
            bgcolor: '#141518ff',
            transition: 'box-shadow 0.2s, transform 0.2s, background 0.2s',
            boxShadow: 2,
            position: 'relative',
            '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-6px)',
                bgcolor: '#1e1f21ff',
            }
        }}>
            <Grid container spacing={1} direction='column'>
                <Grid size='grow'>
                    <Grid container spacing={2} alignItems='center'>
                        <Grid size='grow'>
                            <Stack direction='row' spacing={1} alignItems='center'>
                                <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: getBulbColor(),
                                    boxShadow: DBStatusValue === 'Online' ? '0 0 8px 2px #4caf50' : DBStatusValue === 'Offline' ? '0 0 8px 2px #f44336' : '0 0 8px 2px #888'
                                }} />
                                <Typography sx={{ color: '#eaf0fa', fontWeight: 'bold' }}>
                                    {DBStatusValue}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid size='auto'>
                            <Stack spacing={1} direction='row'>
                                {DBStatusValue !== 'Disabled' && (
                                    <IconButton variant='outlined' size='large' sx={{ color: '#888381ff' }} onClick={() => ChangeDeviceStatus('Disabled')} disabled={refreshLoading || loadingPowerOn || loadingPowerOff}>
                                        {loadingDisable ? <CircularProgress size={24} sx={{ color: '#888381ff' }} /> : <BlockIcon />}
                                    </IconButton>
                                )}
                                <IconButton variant='outlined' size='large' color='primary' onClick={() => setSettingsDialogOpen(true)} disabled={refreshLoading || loadingDisable || loadingPowerOff || loadingPowerOn}>
                                    <SettingsIcon />
                                </IconButton>
                                <IconButton variant='outlined' size='large' color='warning' onClick={handleRefresh} disabled={loadingDisable || loadingPowerOn || loadingPowerOff}>
                                    {refreshLoading ? <CircularProgress size={24} color="warning" /> : <RefreshIcon />}
                                </IconButton>
                                {DBStatusValue === 'Disabled' ? (
                                    <IconButton variant='outlined' size='large' color='success' onClick={() => ChangeDeviceStatus('Online')} disabled={refreshLoading || loadingPowerOn || loadingPowerOff}>
                                        {loadingPowerOn ? <CircularProgress size={24} color='success' /> : <ElectricalServicesIcon />}
                                    </IconButton>
                                ) : DBStatusValue === 'Offline' ? (
                                    <IconButton
                                        variant='outlined'
                                        size='large'
                                        color='success'
                                        disabled={refreshLoading || loadingDisable || loadingPowerOff || refreshLoading}
                                        onClick={() => ChangeDeviceStatus('Online')}
                                    >
                                        {loadingPowerOn ? <CircularProgress size={24} color="success" /> : <PowerSettingsNewIcon />}
                                    </IconButton>
                                ) :
                                    (
                                        <IconButton
                                            variant='outlined'
                                            size='large'
                                            color='error'
                                            disabled={refreshLoading || loadingDisable || loadingPowerOn || refreshLoading}
                                            onClick={() => ChangeDeviceStatus('Offline')}
                                        >
                                            {loadingPowerOff ? <CircularProgress size={24} color="error" /> : <PowerSettingsNewIcon />}
                                        </IconButton>
                                    )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid size='grow'>
                    <Divider sx={{
                        bgcolor: '#eaf0fa',
                        height: 1.1,
                        borderRadius: 1,
                    }} />
                </Grid>
                <Grid sx={{ cursor: 'default' }} spacing={2} container direction='column' rowSpacing={1}>
                    <Stack>
                        <Typography variant='subtitle1' fontWeight='bold' sx={{ color: '#fff', letterSpacing: 1 }}>Name</Typography>
                        <Typography variant='body2' sx={{ color: '#90a4ae', fontWeight: 500 }}>{DBName}</Typography>
                    </Stack>
                    <Stack>
                        <Typography variant='subtitle1' fontWeight='bold' sx={{ color: '#fff', letterSpacing: 1 }}>Device Number</Typography>
                        <Typography variant='body2' sx={{ color: '#90a4ae', fontWeight: 500 }}>{DBDeviceNumber}</Typography>
                    </Stack>
                    <Stack>
                        <Typography variant='subtitle1' fontWeight='bold' sx={{ color: '#fff', letterSpacing: 1 }}>Location</Typography>
                        <Typography variant='body2' sx={{ color: '#90a4ae', fontWeight: 500 }}>{DBLocationName}</Typography>
                    </Stack>
                    <Stack>
                        <Typography variant='subtitle1' fontWeight='bold' sx={{ color: '#fff', letterSpacing: 1 }}>Measurements</Typography>
                        <Typography variant='body2' sx={{ color: '#90a4ae', fontWeight: 500 }}>{DBTimestampConfigurationValueAsText}</Typography>
                    </Stack>
                </Grid>
            </Grid>
            <Dialog open={settingsDialogOpen} onClose={() => !settingsLoading && setSettingsDialogOpen(false)}>
                <DialogTitle>Edit Device Settings</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Name" value={editName} onChange={e => setEditName(e.target.value)} fullWidth disabled={settingsLoading} />
                        <FormControl fullWidth disabled={settingsLoading}>
                            <InputLabel id="location-label">Location</InputLabel>
                            <Select
                                labelId="location-label"
                                label="Location"
                                value={editLocationId}
                                onChange={e => setEditLocationId(e.target.value)}
                            >
                                {possibleLocations.map(loc => (
                                    <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth disabled={settingsLoading}>
                            <InputLabel id="Measurement-label">Measurement</InputLabel>
                            <Select
                                labelId="Measurement-label"
                                label="Measurement"
                                value={editTimestampConfigId}
                                onChange={e => setEditTimestampConfigId(e.target.value)}>
                                {possibleTimestampsConfigs.map(loc => (
                                    <MenuItem key={loc.id} value={loc.id}>{cronstrue.toString(loc.cron)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsDialogOpen(false)} disabled={settingsLoading}>Cancel</Button>
                    <Button color="primary" onClick={HandleUpdateDeviceSettings} disabled={settingsLoading || !!cronError}>
                        {settingsLoading ? <CircularProgress size={20} color="primary" /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar> */}
            {updating && (
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(255,255,255,0.6)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size={64} />
        </Box>
      )}
        </Box>
    )
}

export default Device;