import { Box, IconButton, Typography, Button, Stack, ButtonGroup, Grid, Divider, Snackbar, Alert, CircularProgress, SpeedDial, SpeedDialAction, MenuItem, Select, FormControl, InputLabel, Collapse, Tabs, Tab, ListItemText, Menu } from "@mui/material";
import { alpha } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import RefreshIcon from '@mui/icons-material/Refresh';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { useState, useEffect } from 'react';
import cronstrue from 'cronstrue';
import Switch from '@mui/material/Switch';

import BlockIcon from '@mui/icons-material/Block';
import * as SignalR from '@microsoft/signalr';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

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
    const [DBMeasurementConfiguration, setDBMeasurementConfiguration] = useState(measurementConfiguration);
    const [editMeasurementConfig, setEditMeasurementConfig] = useState(measurementConfiguration);

    const [cronAsText, setCronAsText] = useState(timestampConfiguration.cron);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsTab, setSettingsTab] = useState(0);
    const [editName, setEditName] = useState(name);
    const [editLocationId, setEditLocationId] = useState(DBLocationId ?? '');
    const [editTimestampConfigId, setEditTimestampConfigId] = useState(DBTimestampConfigurationId ?? '');
    const [editCron, setEditCron] = useState(timestampConfiguration.cron);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const cronText = timestampConfiguration.cron ? cronstrue.toString(timestampConfiguration.cron, { locale: 'en' }) : '';

    const [loadingDisable, setLoadingDisable] = useState(false);
    const [loadingPowerOn, setLoadingPowerOn] = useState(false);
    const [loadingPowerOff, setLoadingPowerOff] = useState(false);
    const [powerOffAnimating, setPowerOffAnimating] = useState(false);
    const [powerOnAnimating, setPowerOnAnimating] = useState(false);
    const [disableAnimating, setDisableAnimating] = useState(false);
    const [refreshAnimating, setRefreshAnimating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(null);

    const [loading, setLoading] = useState(false);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState(false);
    const [possibleLocations, setPossibleLocations] = useState([]);
    const [possibleTimestampsConfigs, setpossibleTimestampsConfigs] = useState([]);
    const possibleMeasurements = [
        { id: 'temperature', label: 'Temperature' },
        { id: 'humidity', label: 'Humidity' },
        { id: 'carbonDioxide', label: 'Carbon Dioxide (CO₂)' },
        { id: 'volatileOrganicCompounds', label: 'Volatile Organic Compounds (VOC)' },
        { id: 'pM1', label: 'Particulate Matter 1µm (PM1)' },
        { id: 'pM25', label: 'Particulate Matter 2.5µm (PM2.5)' },
        { id: 'pM10', label: 'Particulate Matter 10µm (PM10)' },
        { id: 'formaldehyde', label: 'Formaldehyde' },
        { id: 'carbonMonoxide', label: 'Carbon Monoxide (CO)' },
        { id: 'ozone', label: 'Ozone (O₃)' },
        { id: 'ammonia', label: 'Ammonia (NH₃)' },
        { id: 'airflow', label: 'Airflow' },
        { id: 'airIonizationLevel', label: 'Air Ionization Level' },
        { id: 'oxygen', label: 'Oxygen (O₂)' },
        { id: 'radon', label: 'Radon' },
        { id: 'illuminance', label: 'Illuminance' },
        { id: 'soundLevel', label: 'Sound Level' }
    ];
    const MENU_ITEM_HEIGHT = 40;
    const MENU_ITEM_PADDING_TOP = 8;
    const selectMenuProps = {
      PaperProps: {
        style: {
          maxHeight: MENU_ITEM_HEIGHT * 5 + MENU_ITEM_PADDING_TOP,
        },
      },
    };

    useEffect(() => {
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
        const connection = new SignalR.HubConnectionBuilder()
            .withUrl('https://localhost:6061/devicehub')
            .configureLogging(SignalR.LogLevel.None)
            .withAutomaticReconnect()
            .build();

            try{
                connection.start()
                    .then(() => {
                        connection.on('DeviceUpdated', (deviceData) => {
                            if (DBID === deviceData.id) {
                                UpdateDevice(deviceData);
                            }
                        });
                    })
                    .catch((error)=>{
                        console.log(`[DEVICEHUB] - ${error}`);
                    });
            }
            catch (error){
                console.log(`[DEVICEHUB] - ${error}`);
            }
                
        return () => {
            connection.stop();
        };
    }, []);

    const RefreshDevice_ButtonClick  = async () => {
        setRefreshLoading(true);
        setRefreshAnimating(true);
        try {
            const response = await fetch(`https://localhost:6061/devices/devicenumber/${DBDeviceNumber}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const responseData = await response.json();
            await new Promise(resolve => setTimeout(resolve, 600));

            if (response.ok) {
                UpdateDevice(responseData);
            }
        } 
        catch (error) 
        {
            console.log(`[REFRESH DEVICE] - ${error}`);
        } 
        finally 
        {
            setRefreshLoading(false);
            setTimeout(() => setRefreshAnimating(false), 800);
        }
    };

    const CancelUpdateDeviceSettings_ButtonClick = () => {
        setSettingsDialogOpen(false);
        setEditName(DBName);
        setEditTimestampConfigId(DBTimestampConfigurationId);
        setEditLocationId(DBLocationId);
        setEditMeasurementConfig(DBMeasurementConfiguration);
        setSettingsTab(0);
        setUpdateSuccess(null);
    };

    const ChangeDeviceStatus_ButtonClick = async (desiredStateType) => {
        try 
        {
            if (desiredStateType === 'Online') {
                setLoadingPowerOn(true);
                setPowerOnAnimating(true);
                setPowerOffAnimating(false);
                setDisableAnimating(false);
                setRefreshAnimating(false);
            }
            else if (desiredStateType === 'Offline') {
                setLoadingPowerOff(true);
                setPowerOffAnimating(true);
                setPowerOnAnimating(false);
                setDisableAnimating(false);
                setRefreshAnimating(false);
            }
            else if (desiredStateType === 'Disabled') {
                setLoadingDisable(true);
                setDisableAnimating(true);
                setPowerOnAnimating(false);
                setPowerOffAnimating(false);
                setRefreshAnimating(false);
            }
            else 
            {
                throw new Error('Invalid desired state type');
            }

            const response = await fetch(`https://localhost:6061/devices/status/${DBID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ StatusType: desiredStateType }),
            });
            
            const responseData = await response.json();
            
            await new Promise(resolve => setTimeout(resolve, 600));
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            setDBStatusId(responseData.statusID);
            setDBStatusValue(responseData.statusType);

            let message = 'Device has beed disabled.';
            if (desiredStateType === 'Online') message = 'Device has been turned on.';
            else if (desiredStateType === 'Offline') message = 'Device has been turned off.';
        } 
        catch (err) 
        {
            console.log(`[DEVICE STATUS CHANGED] - ${err}`);
        } 
        finally 
        {
            if (desiredStateType === 'Online') {
                setLoadingPowerOn(false);
                setTimeout(() => setPowerOnAnimating(false), 800);
            }
            else if (desiredStateType === 'Offline') {
                setLoadingPowerOff(false);
                setTimeout(() => setPowerOffAnimating(false), 800);
            }
            else if (desiredStateType === 'Disabled') {
                setLoadingDisable(false);
                setTimeout(() => setDisableAnimating(false), 800);
            }
            else {
                setLoadingDisable(false);
                setLoadingPowerOff(false);
                setLoadingPowerOn(false);
                throw new Error('Invalid desired state type');
            }
         }
     };

    const getBulbColor = () => {
        if (DBStatusValue === 'Online') return 'customgreen.main';
        if (DBStatusValue === 'Offline') return 'customred.main';
        return 'customgray.light';
    };

    function UpdateDevice(newData) {
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
        if (newData.measurementConfiguration) {
            setDBMeasurementConfiguration(newData.measurementConfiguration);
            setEditMeasurementConfig(newData.measurementConfiguration);
        }
     }

    const UpdateDeviceSettings_ButtonClick = async () => {
        const measurementChanged = JSON.stringify(editMeasurementConfig ?? {}) !== JSON.stringify(DBMeasurementConfiguration ?? {});
        if (editName === DBName && editLocationId === DBLocationId && editTimestampConfigId === DBTimestampConfigurationId && !measurementChanged) {
            return;
        }

        setSettingsLoading(true);
        setUpdateSuccess(null);

        const updateDeviceDTO = {};

        if (editName !== DBName) {
            updateDeviceDTO.name = editName;
        }
        if (editLocationId !== DBLocationId) {
            updateDeviceDTO.locationID = editLocationId;
        }
        if (editTimestampConfigId !== DBLocationId) {
            updateDeviceDTO.TimestampConfigurationID = editTimestampConfigId;
        }
        if (measurementChanged) {
            updateDeviceDTO.measurementConfiguration = editMeasurementConfig;
        }

        try 
        {
            const response = await fetch(`https://localhost:6061/devices/${DBDeviceNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateDeviceDTO)
            });
            
            const responseData = await response.json();
            await new Promise(resolve => setTimeout(resolve, 300));

            if (response.ok) {
                UpdateDevice(responseData);
                setUpdateSuccess(true);
                setTimeout(() => {
                    setUpdateSuccess(null);
                }, 900);
            } else {
                setUpdateSuccess(false);
            }
        } 
        catch (error) 
        {
            console.log(`[DEVICE UPDATED] - ${error}`);
            setUpdateSuccess(false);
        } 
        finally 
        {
            setSettingsLoading(false);
        }
    };

    const toggleMeasurement = (measurementId) => {
        setEditMeasurementConfig(prev => ({
            ...prev,
            [measurementId]: !prev?.[measurementId],
        }));
    };

    return (
        <Box sx={{
            width: 350,
            minWidth: 350,
            height: 350,
            minHeight: 350,
            borderRadius: 2,
            padding: 2,
            bgcolor: '#080B0E',
            transition: 'box-shadow 0.2s, transform 0.2s, background 0.2s',
            boxShadow: 2,
            position: 'relative',
            '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-6px)',
                bgcolor: '#0c1014ff',
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
                                    boxShadow: (theme) => {
                                        const onlineColor = theme.palette.customgreen?.main ?? theme.palette.success.main;
                                        const offlineColor = theme.palette.customred?.main ?? theme.palette.error.main;
                                        const neutralColor = theme.palette.customgray?.light ?? '#888';
                                        const color = DBStatusValue === 'Online'
                                            ? onlineColor
                                            : DBStatusValue === 'Offline'
                                                ? offlineColor
                                                : neutralColor;
                                        return `0 0 8px 2px ${alpha(color, 0.65)}`;
                                    }
                                }} />
                                <Typography sx={{ color: '#eaf0fa', fontWeight: 'bold' }}>
                                    {DBStatusValue}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid size='auto'>
                            <Stack spacing={1} direction='row'>
                                {DBStatusValue !== 'Disabled' && (
                                    <IconButton 
                                        variant='outlined' 
                                            sx={(theme) => ({
                                                backgroundColor: 'transparent',
                                                color: theme.palette.customgray?.light ?? theme.palette.error.main,
                                                transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.customgray?.light ?? theme.palette.error.main, 0.12),
                                                    color: theme.palette.customgray?.light ?? theme.palette.error.dark,
                                                },
                                                '&:active': {
                                                    backgroundColor: alpha(theme.palette.customgray?.light ?? theme.palette.error.main, 0.18),
                                                },
                                            })}
                                        color="inherit"
                                        onClick={() => ChangeDeviceStatus_ButtonClick('Disabled')} 
                                        disabled={refreshLoading || loadingPowerOn || loadingPowerOff}>
                                        {loadingDisable ? <CircularProgress size={24} sx={{ color: '#888381ff' }} /> : <BlockIcon />}
                                    </IconButton>
                                )}
                                <IconButton 
                                variant='outlined' 
                                            sx={(theme) => ({
                                                backgroundColor: 'transparent',
                                                color: theme.palette.customgray?.light ?? theme.palette.error.main,
                                                transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.customgray?.light ?? theme.palette.error.main, 0.12),
                                                    color: theme.palette.customgray?.light ?? theme.palette.error.dark,
                                                },
                                                '&:active': {
                                                    backgroundColor: alpha(theme.palette.customgray?.light ?? theme.palette.error.main, 0.18),
                                                },
                                            })}
                                        color="inherit"
                                onClick={() => setSettingsDialogOpen(true)} disabled={refreshLoading || loadingDisable || loadingPowerOff || loadingPowerOn}
                                >
                                    <SettingsIcon />
                                </IconButton>
                                <IconButton 
                                    variant='outlined' 
                                    sx={(theme) => ({
                                        backgroundColor: 'transparent',
                                        color: theme.palette.customorange?.main ?? theme.palette.error.main,
                                        transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.customorange?.main ?? theme.palette.error.main, 0.12),
                                            color: theme.palette.customorange?.main ?? theme.palette.error.dark,
                                            },
                                        '&:active': {
                                            backgroundColor: alpha(theme.palette.customorange?.main ?? theme.palette.error.main, 0.18),
                                            },
                                        })}
                                    color="inherit" 
                                    onClick={RefreshDevice_ButtonClick} disabled={loadingDisable || loadingPowerOn || loadingPowerOff}
                                    >
                                    {refreshLoading ? <CircularProgress size={24} color="warning" /> : <RefreshIcon />}
                                </IconButton>
                                {DBStatusValue === 'Disabled' ? (
                                    <IconButton variant='outlined' color='success' onClick={() => ChangeDeviceStatus_ButtonClick('Online')} disabled={refreshLoading || loadingPowerOn || loadingPowerOff}>
                                        {loadingPowerOn ? <CircularProgress size={24} color='success' /> : <ElectricalServicesIcon />}
                                    </IconButton>
                                ) : DBStatusValue === 'Offline' ? (
                                    <IconButton
                                        variant='outlined'
                                            sx={(theme) => ({
                                                backgroundColor: 'transparent',
                                                color: theme.palette.customgreen?.main ?? theme.palette.error.main,
                                                transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.customgreen?.main ?? theme.palette.error.main, 0.12),
                                                    color: theme.palette.customgreen?.main ?? theme.palette.error.dark,
                                                },
                                                '&:active': {
                                                    backgroundColor: alpha(theme.palette.customgreen?.main ?? theme.palette.error.main, 0.18),
                                                },
                                            })}
                                        color="inherit"
                                        disabled={refreshLoading || loadingDisable || loadingPowerOff || refreshLoading}
                                        onClick={() => ChangeDeviceStatus_ButtonClick('Online')}
                                    >
                                        {loadingPowerOn ? <CircularProgress size={24} color="success" /> : <PowerSettingsNewIcon />}
                                    </IconButton>
                                ) :
                                    (
                                        <IconButton
                                            variant='outlined'
                                            sx={(theme) => ({
                                                backgroundColor: 'transparent',
                                                color: theme.palette.customred?.main ?? theme.palette.error.main,
                                                transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.customred?.main ?? theme.palette.error.main, 0.12),
                                                    color: theme.palette.customred?.main ?? theme.palette.error.dark,
                                                },
                                                '&:active': {
                                                    backgroundColor: alpha(theme.palette.customred?.main ?? theme.palette.error.main, 0.18),
                                                },
                                            })}
                                            color="inherit"
                                            disabled={refreshLoading || loadingDisable || loadingPowerOn || refreshLoading}
                                            onClick={() => ChangeDeviceStatus_ButtonClick('Offline')}
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

            {/* Device modify dialog */}
            <Dialog 
                open={settingsDialogOpen}
                onClose={() => !settingsLoading && setSettingsDialogOpen(false)}>

                <DialogTitle sx={{ display: 'flex', alignItems: 'center', padding: 1, paddingLeft: 1.5, paddingRight: 1.5 }}>
                <Typography sx={{ }}>Settings</Typography>
                <IconButton
                    aria-label="close"
                    onClick={CancelUpdateDeviceSettings_ButtonClick}
                    disabled={settingsLoading}
                    sx={(theme) => ({ ml: 'auto' })}>
                    <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <DialogContent sx={{ display: 'flex', flexDirection: 'column', padding: 0, width: 400, height: 400, minHeight: 0, position: 'relative' }}>

                    {/* Update overlay */}
                    <Collapse in={settingsLoading || updateSuccess !== null} timeout={0} unmountOnExit>
                        <Box
                            sx={(theme) => ({
                                position: 'absolute',
                                inset: 0,
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                bgcolor: alpha(theme.palette.background.paper, 0.95),
                                pointerEvents: 'auto',
                            })}
                        >
                            {settingsLoading ? (
                                <>
                                    <CircularProgress size={48} />
                                    <Typography sx={{ mt: 2 }}>Updating device...</Typography>
                                </>
                            ) : updateSuccess === true ? (
                                <>
                                    <CheckCircleIcon sx={(theme) => ({ fontSize: 48, color: theme.palette.customgreen?.main ?? theme.palette.success.main })} />
                                    <Typography sx={{ mt: 1 }}>Device updated successfully</Typography>
                                </>
                            ) : updateSuccess === false ? (
                                <>
                                    <CloseIcon sx={(theme) => ({ fontSize: 48, color: theme.palette.customred?.main ?? theme.palette.error.main })} />
                                    <Typography sx={{ mt: 1 }}>Device update failed</Typography>
                                </>
                            ) : null}
                        </Box>
                    </Collapse>

                    {/* Tab selection */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
                        <Tabs 
                            value={settingsTab} 
                            onChange={(e, v) => setSettingsTab(v)} 
                            aria-label="Modify tabs"
                            variant="fullWidth">
                            <Tab label="Properties" disableRipple />
                            <Tab label="Measurements" disableRipple/>
                        </Tabs>
                    </Box>

                    {/* Properties Tab */}
                    {settingsTab === 0 && (
                        <Stack spacing={2} padding={2}>
                            <TextField label="Name" value={editName} size="small" onChange={e => setEditName(e.target.value)} fullWidth disabled={settingsLoading} />
                            <FormControl fullWidth disabled={settingsLoading}>
                                <InputLabel id="location-label">Location</InputLabel>
                                <Select labelId="location-label" label="Location" size="small" value={possibleLocations.length ? editLocationId : ''} onChange={e => setEditLocationId(e.target.value)} MenuProps={selectMenuProps}>
                                    {possibleLocations.map(loc => (<MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={settingsLoading}>
                                <InputLabel id="Measurement-label">Measurement</InputLabel>
                                <Select labelId="Measurement-label" label="Measurement" size="small" value={possibleTimestampsConfigs.length ? editTimestampConfigId : ''} onChange={e => setEditTimestampConfigId(e.target.value)} MenuProps={selectMenuProps}>
                                    {possibleTimestampsConfigs.map(loc => (<MenuItem key={loc.id} value={loc.id}>{cronstrue.toString(loc.cron)}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Stack>
                    )}

                    {/* Measurements Tab */}
                    {settingsTab === 1 && (
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 1 }}>
                            {editMeasurementConfig && Object.keys(editMeasurementConfig).length > 0 ? (
                                possibleMeasurements.map(pm => {
                                    const checked = !!editMeasurementConfig[pm.id];
                                    return (
                                        <MenuItem
                                            key={pm.id}
                                            onClick={() => toggleMeasurement(pm.id)}
                                            disableRipple
                                            dense
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}
                                        >
                                            <Switch
                                                size="small"
                                                checked={checked}
                                                disabled={settingsLoading}
                                            />
                                            <ListItemText primary={pm.label} />
                                        </MenuItem>
                                    );
                                })
                            ) : (
                                <Typography sx={{ color: 'text.secondary', p: 2 }}>
                                    No measurement configuration available.
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <Divider />

                <DialogActions sx={{ padding: 1.5, paddingRight: 2 }}>
                    <Button 
                        onClick={CancelUpdateDeviceSettings_ButtonClick} 
                        sx={(theme) => ({
                            backgroundColor: 'transparent',
                            color: theme.palette.customred?.main,
                            border: `1px solid ${theme.palette.customred?.main}`,
                            transition: theme.transitions.create(['background-color', 'color', 'border-color', 'box-shadow'], { duration: 150 }),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.customred?.main, 0.12),
                                color: theme.palette.customred?.main,
                                borderColor: theme.palette.customred?.main,
                            },
                            '&:active': {
                                backgroundColor: alpha(theme.palette.customred?.main, 0.18),
                            },
                            '&.Mui-focusVisible, &:focus': {
                                outline: 'none',
                                boxShadow: `0 0 0 4px ${alpha(theme.palette.customred?.main, 0.16)}`,
                            },
                            '&.Mui-disabled': {
                                borderColor: theme.palette.action.disabledBackground,
                                color: theme.palette.action.disabled,
                            },
                        })}
                        disabled={settingsLoading}
                        >Cancel</Button>
                    
                    <Button
                        variant="outlined"
                        onClick={UpdateDeviceSettings_ButtonClick}
                        disabled={
                            editName === DBName && 
                            editTimestampConfigId === DBTimestampConfigurationId && 
                            editLocationId === DBLocationId && 
                            JSON.stringify(editMeasurementConfig) === JSON.stringify(DBMeasurementConfiguration)
                        }
                        sx={(theme) => ({
                            backgroundColor: 'transparent',
                            color: theme.palette.customgreen?.light ?? theme.palette.success.light,
                            border: `1px solid ${theme.palette.customgreen?.main ?? theme.palette.success.main}`,
                            transition: theme.transitions.create(['background-color', 'color', 'border-color', 'box-shadow'], { duration: 150 }),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.customgreen?.light ?? theme.palette.success.light, 0.12),
                                color: theme.palette.customgreen?.main ?? theme.palette.success.main,
                                borderColor: theme.palette.customgreen?.main ?? theme.palette.success.main,
                            },
                            '&:active': {
                                backgroundColor: alpha(theme.palette.customgreen?.light ?? theme.palette.success.light, 0.18),
                            },
                            '&.Mui-focusVisible, &:focus': {
                                outline: 'none',
                                boxShadow: `0 0 0 4px ${alpha(theme.palette.customgreen?.main ?? theme.palette.success.main, 0.16)}`,
                            },
                            '&.Mui-disabled': {
                                borderColor: theme.palette.action.disabledBackground,
                                color: theme.palette.action.disabled,
                            },
                        })}
                    >
                        {settingsLoading ? <CircularProgress color="customgreen.main" size={26} /> : 'Apply'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Component-local overlay (covers only this card) */}
            <Collapse in={powerOffAnimating || powerOnAnimating || disableAnimating || refreshAnimating} timeout={0} unmountOnExit>
              <Box
                sx={(theme) => ({
                 position: 'absolute',
                  inset: 0,
                  zIndex: theme.zIndex.modal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  bgcolor: alpha(theme.palette.background.default, 1),
                  pointerEvents: 'auto',
                })}
              >
                { (loadingPowerOff || loadingPowerOn || loadingDisable || refreshLoading) ? (
                  <>
                    <CircularProgress color="inherit" size={48}/>
                    <Typography sx={{ mt: 1 }}>
                      {loadingPowerOff ? 'Powering off device…' : loadingPowerOn ? 'Powering on device…' : loadingDisable ? 'Disabling device…' : 'Refreshing device…'}
                    </Typography>
                  </>
                ) : (
                  (() => {
                    if (powerOffAnimating) {
                      return (
                        <>
                          <CheckCircleIcon sx={(theme) => ({ fontSize: 48, color: theme.palette.customred?.main ?? theme.palette.error.main })} />
                          <Typography sx={{ mt: 1 }}>Device powered off</Typography>
                        </>
                      );
                    }
                    if (powerOnAnimating) {
                      return (
                        <>
                          <CheckCircleIcon sx={(theme) => ({ fontSize: 48, color: theme.palette.customgreen?.main ?? theme.palette.success.main })} />
                          <Typography sx={{ mt: 1 }}>Device powered on</Typography>
                        </>
                      );
                    }
                    if (disableAnimating) {
                      return (
                        <>
                          <CheckCircleIcon sx={(theme) => ({ fontSize: 48, color: theme.palette.customgray?.light ?? theme.palette.text.secondary })} />
                          <Typography sx={{ mt: 1 }}>Device disabled</Typography>
                        </>
                      );
                    }
                    if (refreshAnimating) {
                      return (
                        <>
                          <CheckCircleIcon sx={(theme) => ({ fontSize: 48, color: theme.palette.customorange?.main ?? theme.palette.warning.main })} />
                          <Typography sx={{ mt: 1 }}>Device refreshed</Typography>
                        </>
                      );
                    }
                    return null;
                  })()
                )}
              </Box>
            </Collapse>
        </Box>
    )
}

export default Device;