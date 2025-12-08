import React from 'react';
import Bulb from '../components/Bulb'
import { Box, IconButton, Typography, Button, Stack, ButtonGroup, Grid, Divider, Snackbar, Alert, CircularProgress, LinearProgress, SpeedDial, SpeedDialAction, MenuItem, Select, FormControl, InputLabel, Collapse, Tabs, Tab, ListItemText, Menu, Icon, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from "@mui/material";
import { alpha } from '@mui/material/styles';
import EastIcon from '@mui/icons-material/East';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import * as SignalR from '@microsoft/signalr';
import MemoryIcon from '@mui/icons-material/Memory';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import { DatePicker, DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/en-gb'; // or any locale that starts weeks on Monday

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

function Request(
    {
        id = '',
        raportCreationDate,
        raportCompletedDate,
        startDate,
        endDate,
        message,
        status = {
            id: '',
            name: '',
            description: ''
        },
        period = {
            id: '',
            name: '',
            hours: 0
        },
        requestedMeasurements,
        requestedLocations,
        onSuspend,
        onDelete // Callback for delete action
    }
) {
    // Option 1: Store all props in state
    const [requestData, setRequestData] = React.useState({
        id,
        raportCreationDate,
        raportCompletedDate,
        startDate,
        endDate,
        message,
        period,
        status,
        requestedMeasurements,
        requestedLocations
    });

    const [editName, setEditName] = React.useState(status.name);
    const [editPeriodId, setEditPeriodId] = React.useState(period.id || '');

    // Date picker states
    const [editStartDate, setEditStartDate] = React.useState(new Date(startDate));
    const [editEndDate, setEditEndDate] = React.useState(new Date(endDate));
    const [editStartTime, setEditStartTime] = React.useState(new Date(startDate).getHours());
    const [editEndTime, setEditEndTime] = React.useState(new Date(endDate).getHours());
    const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);

    //  Settings edit values
    const [settingsDailyDate, setSettingsDailyDate] = React.useState(dayjs());
    const [settingsSelectedWeek, setSettingsSelectedWeek] = React.useState(dayjs());
    const [settingsSelectedMonth, setSettingsSelectedMonth] = React.useState(dayjs());
    const [settingsStartDate, setSettingsStartDate] = React.useState(dayjs());
    const [settingsEndDate, setSettingsEndDate] = React.useState(dayjs().add(1, 'hour'));
    const [settingsSelectedPeriod, setSettingsSelectedPeriod] = React.useState(null);
    const [settingsPossiblePeriods, setSettingsPossiblePeriods] = React.useState([]);

    //  Delete
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [deleteSuccess, setDeleteSuccess] = React.useState(null); // null = no delete, true = success, false = failed

    //  Suspend
    const [isSuspending, setIsSuspending] = React.useState(false);
    const [suspendSuccess, setSuspendSuccess] = React.useState(null); // null = no suspend, true = success, false = failed

    //  Pending
    const [isPending, setIsPending] = React.useState(false);
    const [pendingSuccess, setPendingSuccess] = React.useState(null); // null = no pending, true = success, false = failed

    //  Processing
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [processingSuccess, setProcessingSuccess] = React.useState(null); // null = no processing, true = success, false = failed

    //  Completed
    const [isCompleting, setIsCompleting] = React.useState(false);
    const [completedSuccess, setCompletedSuccess] = React.useState(null); // null = no completing, true = success, false = failed

    //  Failed
    const [isFailing, setIsFailing] = React.useState(false);
    const [failedSuccess, setFailedSuccess] = React.useState(null); // null = no failing, true = success, false = failed

    // Option 2: Update requestData when props change
    React.useEffect(() => {
        setRequestData({
            id,
            raportCreationDate,
            raportCompletedDate,
            startDate,
            endDate,
            message,
            period,
            status,
            requestedMeasurements,
            requestedLocations
        });
    }, [id, raportCreationDate, raportCompletedDate, startDate, endDate, message, period, status, requestedMeasurements, requestedLocations]);

    React.useEffect(() => {
        if (settingsDialogOpen) {
            fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/periods/all`)
                .then(res => res.json())
                .then(data => {
                    setSettingsPossiblePeriods(data);
                    // Set default selected period to current request's period
                    const currentPeriod = data.find(p => p.id === requestData.period.id);
                    if (currentPeriod) {
                        setSettingsSelectedPeriod(currentPeriod);
                        // Also set appropriate default dates based on current request
                        setSettingsStartDate(dayjs(requestData.startDate));
                        setSettingsEndDate(dayjs(requestData.endDate));

                        // Set other date states based on period type
                        if (currentPeriod.name === 'Daily') {
                            setSettingsDailyDate(dayjs(requestData.startDate));
                        } else if (currentPeriod.name === 'Weekly') {
                            setSettingsSelectedWeek(dayjs(requestData.startDate));
                        } else if (currentPeriod.name === 'Monthly') {
                            setSettingsSelectedMonth(dayjs(requestData.startDate));
                        }
                    }
                })
                .catch(() => setSettingsPossiblePeriods([]));
        }
        else {
            // Reset when dialog closes
            setSettingsSelectedPeriod(null);
        }
    }, [settingsDialogOpen, requestData.period.id]);

    React.useEffect(() => {
        try {

            const connection = new SignalR.HubConnectionBuilder()
                .withUrl(`${import.meta.env.VITE_RAPORTS_URL}/raportshub`)
                .configureLogging(SignalR.LogLevel.None)
                .withAutomaticReconnect()
                .build();

            connection.start()
                .then(() => {
                    connection.on('RaportStatusChanged', (dto) => {
                        if (dto.id === requestData.id) {
                            if (dto.status.name !== 'Suspended' || dto.status.name !== 'Deleted') {
                                //  If settings dialog is open we have to remove changes and close it.
                                CancelRequestSettings_ButtonClick();
                            }

                            RequestStateChange_Handler(dto.status.name, dto);
                        }
                    });
                    connection.on('RaportUpdated', (dto) => {
                        if (dto.id === id) {
                            console.log(`[RAPORT UPDATED] - ${JSON.stringify(dto, null, 2)}`);
                            // Parent component will re-render with updated props
                        }
                    });
                    connection.on('RaportDeleted', (dto) => {

                        if (dto.id === id) {
                            CancelRequestSettings_ButtonClick();
                            RequestStateChange_Handler(dto.status.name, dto);

                            if (onDelete) {
                                onDelete(dto);
                            }
                        }
                    });
                })
                .catch((exception) => {
                    console.log(exception)
                });

            return () => {
                connection.stop();
            };
        }
        catch (exception) {
            console.log(exception);
        }
    }, [requestData.id]); // Use id from props instead of requestData.id

    // Helper function to format UTC date to Warsaw timezone
    const formatDateInWarsaw = (utcDateString, options) => {
        // Ensure the date string is treated as UTC by appending 'Z' if not present
        let dateStr = utcDateString;
        if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('Z')) {
            dateStr = dateStr + 'Z';
        }
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            ...options,
            timeZone: 'Europe/Warsaw'
        });
    };

    //  Render status bulb
    const RenderButtons = () => {
        switch (requestData.status.name) {
            case 'Pending':
                return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                    sx={{}}>
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                    {RenderSuspendButton()}
                    {RenderDeleteButton()}
                </Stack>
            case 'Completed':
                return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                    sx={{}}>
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                    {RenderDownloadButton()}
                    {RenderDeleteButton()}
                </Stack>
            case 'Failed':
                return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                    sx={{}}>
                    {RenderDumyButton()}
                    {RenderRefreshButton()}
                    {RenderInfoButton()}
                    {RenderDeleteButton()}
                </Stack>
            case 'Processing':
                return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                    sx={{}}>
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                </Stack>
            case 'Deleted':
                return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                    sx={{}}>
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                </Stack>
            case 'Suspended':
                return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                    sx={{}}>
                    {RenderDumyButton()}
                    {RenderDumyButton()}
                    {RenderPlayButton()}
                    {RenderDeleteButton()}
                </Stack>
            default:
                return <Typography>UNDEFINED</Typography>
        }
    }

    const RenderDumyButton = () => {
        return <IconButton size="small" sx={{ visibility: 'hidden' }}>
            <InfoOutlinedIcon />
        </IconButton>
    }

    const RenderSuspendButton = () => {
        return <IconButton size="small"
            onClick={SuspendRequest_ButtonClick}
            sx={(theme) => ({
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
            })}>
            <PauseOutlinedIcon />
        </IconButton>
    }

    const RenderPlayButton = () => {
        return <IconButton size="small"
            onClick={PendRequest_ButtonClick}
            sx={(theme) => ({
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
            })}>
            <PlayCircleOutlinedIcon />
        </IconButton>
    }

    const RenderInfoButton = () => {
        return <Tooltip title={`${requestData.message}`}>
            <IconButton size="small"
                sx={(theme) => ({
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
                })}>
                <InfoOutlinedIcon />
            </IconButton>
        </Tooltip>
    }

    const RenderRefreshButton = () => {
        return <IconButton size="small"
            onClick={RetryRaport_ButtonClick}
            sx={(theme) => ({
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
            })}>
            <RefreshOutlinedIcon />
        </IconButton>
    }

    const RenderDownloadButton = () => {
        return <IconButton size="small"
            onClick={DownloadRaport_ButtonClick}
            sx={(theme) => ({
                backgroundColor: 'transparent',
                color: theme.palette.customgreen.main,
                transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                '&:hover': {
                    backgroundColor: alpha(theme.palette.customgreen.main, 0.12),
                    color: theme.palette.customgreen.main,
                },
                '&:active': {
                    backgroundColor: alpha(theme.palette.customgreen.main, 0.18),
                },
            })}>
            <DownloadIcon />
        </IconButton>
    }

    const RenderSettingsButton = () => {
        return <IconButton size="small"
            onClick={() => { setSettingsDialogOpen(true) }}
            sx={(theme) => ({
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
            })}>
            <SettingsIcon />
        </IconButton>
    }

    const RenderDeleteButton = () => {
        return <IconButton size="small"
            onClick={DeleteRequest_ButtonClick}
            sx={(theme) => ({
                backgroundColor: 'transparent',
                color: theme.palette.customred.main,
                transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                '&:hover': {
                    backgroundColor: alpha(theme.palette.customred.main, 0.12),
                    color: theme.palette.customred.main,
                },
                '&:active': {
                    backgroundColor: alpha(theme.palette.customred.main, 0.18),
                },
            })}>
            <DeleteOutlineOutlinedIcon />
        </IconButton>
    }



    //  ---------- Request state change handlers
    const RequestStateChange_Handler = (newState, updatedData = null) => {
        console.log(updatedData);
        switch (newState) {
            case 'Suspended':
                setIsSuspending(true);
                setSuspendSuccess(true);
                setTimeout(() => {
                    if (updatedData) {
                        setRequestData(prevData => ({
                            ...prevData,
                            ...updatedData
                        }));
                    }
                    setIsSuspending(false);
                    setSuspendSuccess(null);
                }, 1500);
                break;
            case 'Deleted':
                setIsDeleting(true);
                setDeleteSuccess(true);
                setTimeout(() => {
                    console.log('asd');
                    if (updatedData) {
                        setRequestData(prevData => ({
                            ...prevData,
                            ...updatedData
                        }));
                    }
                    setIsDeleting(false);
                    setDeleteSuccess(null);
                }, 1500);
                break;
            case 'Pending':
                setIsPending(true);
                setPendingSuccess(true);
                setTimeout(() => {
                    if (updatedData) {
                        setRequestData(prevData => ({
                            ...prevData,
                            ...updatedData
                        }));
                    }
                    setIsPending(false);
                    setPendingSuccess(null);
                }, 1500);
                break;
            case 'Processing':
                setIsProcessing(true);
                setProcessingSuccess(true);
                setTimeout(() => {
                    if (updatedData) {
                        setRequestData(prevData => ({
                            ...prevData,
                            ...updatedData
                        }));
                    }
                    setIsProcessing(false);
                    setProcessingSuccess(null);
                }, 1500);
                break;
            case 'Completed':
                setIsCompleting(true);
                setCompletedSuccess(true);
                setTimeout(() => {
                    if (updatedData) {
                        setRequestData(prevData => ({
                            ...prevData,
                            ...updatedData
                        }));
                    }
                    setIsCompleting(false);
                    setCompletedSuccess(null);
                }, 1500);
                break;
            case 'Failed':
                setIsFailing(true);
                setFailedSuccess(true);
                setTimeout(() => {
                    if (updatedData) {
                        setRequestData(prevData => ({
                            ...prevData,
                            ...updatedData
                        }));
                    }
                    setIsFailing(false);
                    setFailedSuccess(null);
                }, 1500);
                break;
            default:
                console.log("UNDEFINED")
                break;
        }
    }



    //  ---------- Delete request
    const RequestDeleted_Handler = (requestDto) => {


    };
    const FailedToDeleteRequest_Handler = () => {
        setIsDeleting(false);
        setDeleteSuccess(null);
    };



    //  ---------- Pending request
    const RequestPending_Handler = () => {
        //  Execute callback for request delete operation.
        if (onDelete) {
            onDelete(requestData.id);
        }

        //requestData.status.name = 'Pending';

        setIsPending(false);
        setPendingSuccess(null);
    };
    const FailedToPendRequest_Handler = () => {
        setIsPending(false);
        setPendingSuccess(null);
    };



    //  ---------- Suspend request
    const RequestSuspended_Handler = () => {
        //  Execute callback for request delete operation.
        if (onSuspend) {
            onSuspend(requestData.id);
        }

        //requestData.status.name = 'Suspended';

        setIsSuspending(false);
        setSuspendSuccess(null);
    };
    const FailedToSuspendRequest_Handler = () => {
        setIsSuspending(false);
        setSuspendSuccess(null);
    };

    //  ---------- Retry raport
    const RetryRaport_ButtonClick = async () => {
        try {
            const params = new URLSearchParams({
                RaportID: requestData.id.toString()
            });

            const response = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/raport/retry?${params.toString()}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Failed to retry raport');
            }

            const responseData = await response.json();
            console.log('[RAPORT RETRY] Success:', responseData);
        } catch (error) {
            console.error('[RAPORT RETRY] Error:', error);
        }
    };

    //  ---------- Download raport
    const DownloadRaport_ButtonClick = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/raports/download/${requestData.id}`);

            if (!response.ok) {
                throw new Error('Failed to download raport');
            }

            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `Raport-${requestData.startDate}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Get the blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('[DOWNLOAD RAPORT] Error:', error);
        }
    };



    //  ---------- Button Clicks
    const PendRequest_ButtonClick = async () => {
        setIsPending(true);
        setPendingSuccess(null);

        try {
            // First, fetch all statuses to get the Pending status ID
            const statusesResponse = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/statuses/all`);
            if (!statusesResponse.ok) throw new Error('Failed to fetch statuses');
            const statuses = await statusesResponse.json();
            const pendingStatus = statuses.find(s => s.name === 'Pending');
            if (!pendingStatus) throw new Error('Pending status not found');

            const params = new URLSearchParams({
                RaportID: requestData.id.toString(),
                StatusID: pendingStatus.id.toString()
            });

            const response = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/raport/status?${params.toString()}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();

            setPendingSuccess(true);
        }
        catch (error) {
            console.log(`[REQUEST STATUS CHANGE FAILED] - ${error}`);
            setPendingSuccess(false);
            setTimeout(() => {
                FailedToPendRequest_Handler();
            }, 1500);
        }
    };

    const SuspendRequest_ButtonClick = async () => {
        setIsSuspending(true);
        setSuspendSuccess(null);

        try {
            // First, fetch all statuses to get the Suspended status ID
            const statusesResponse = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/statuses/all`);
            if (!statusesResponse.ok) throw new Error('Failed to fetch statuses');
            const statuses = await statusesResponse.json();
            const suspendedStatus = statuses.find(s => s.name === 'Suspended');
            if (!suspendedStatus) throw new Error('Suspended status not found');

            const params = new URLSearchParams({
                RaportID: requestData.id.toString(),
                StatusID: suspendedStatus.id.toString()
            });

            const response = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/raport/status?${params.toString()}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setSuspendSuccess(true);
        }
        catch (error) {
            console.log(`[REQUEST STATUS CHANGE FAILED] - ${error}`);
            setSuspendSuccess(false);
            setTimeout(() => {
                FailedToSuspendRequest_Handler();
            }, 1500);
        }
    };

    const ConfirmDelete_ButtonClick = async () => {
        setDeleteDialogOpen(false);
        setIsDeleting(true);
        setDeleteSuccess(null);

        // Delete by changing status to Deleted
        try {
            // First, fetch all statuses to get the Deleted status ID
            const statusesResponse = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/statuses/all`);
            if (!statusesResponse.ok) throw new Error('Failed to fetch statuses');
            const statuses = await statusesResponse.json();
            const deletedStatus = statuses.find(s => s.name === 'Deleted' || s.name === 'Cancelled');
            if (!deletedStatus) throw new Error('Deleted status not found');

            const params = new URLSearchParams({
                RaportID: requestData.id.toString(),
                StatusID: deletedStatus.id.toString()
            });

            const response = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/raport/status?${params.toString()}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setDeleteSuccess(true);
        }
        catch (error) {
            setDeleteSuccess(false);
            setTimeout(() => {
                FailedToDeleteRequest_Handler();
            }, 1500);
        }
    };

    const DeleteRequest_ButtonClick = () => {
        setDeleteDialogOpen(true);
    };

    const CancelDelete_ButtonClick = () => {
        setDeleteDialogOpen(false);
    };

    const SaveRequsetSettings_ButtonClick = async () => {
        //setIsPending(true);
        //setPendingSuccess(null);

        let startingDate;
        let endingDate;

        if (settingsSelectedPeriod.name === 'Hourly') {
            startingDate = new Date(settingsStartDate);
            endingDate = new Date(settingsEndDate);
        }
        else if (settingsSelectedPeriod.name === 'Daily') {
            const date = new Date(settingsDailyDate);
            startingDate = new Date(date.setHours(0, 0, 0, 0)); // first hour of day
            endingDate = new Date(date.setHours(23, 59, 59, 999)); // last hour of day
        }
        else if (settingsSelectedPeriod.name === 'Weekly') {
            const date = new Date(settingsSelectedWeek);
            const firstDay = new Date(date);
            firstDay.setDate(date.getDate() - date.getDay()); // Sunday (start of week)
            firstDay.setHours(0, 0, 0, 0);

            const lastDay = new Date(firstDay);
            lastDay.setDate(firstDay.getDate() + 6); // Saturday (end of week)
            lastDay.setHours(23, 59, 59, 999);

            startingDate = firstDay;
            endingDate = lastDay;
        }
        else if (settingsSelectedPeriod.name === 'Monthly') {
            const date = new Date(settingsSelectedMonth);
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            firstDay.setHours(0, 0, 0, 0);
            lastDay.setHours(23, 59, 59, 999);

            startingDate = firstDay;
            endingDate = lastDay;
        }
        else {
            return;
        }

        if (startingDate !== requestData.startDate) {
            console.log('OG Start:', requestData.startDate);
            console.log('   Start:', startingDate);
        }
        if (endingDate !== requestData.endDate) {
            console.log('OG End  :', requestData.endDate);
            console.log('   End  :', endingDate);
        }

        return;

        try {
            const params = new URLSearchParams({
                RaportID: requestData.id.toString(),
                StartDate: startingDate.toISOString(),
                EndDate: endingDate.toISOString(),
                PeriodID: settingsSelectedPeriod.id.toString()
            });

            const response = await fetch(`${import.meta.env.VITE_RAPORTS_URL}/raports/raport?${params.toString()}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();

            setPendingSuccess(true);
        }
        catch (error) {
            console.log(`[REQUEST STATUS CHANGE FAILED] - ${error}`);
            setPendingSuccess(false);
            setTimeout(() => {
                FailedToPendRequest_Handler();
            }, 1500);
        }

        setSettingsDialogOpen(true);
    };

    const CancelRequestSettings_ButtonClick = () => {
        //  Clear all new applied changes.
        setSettingsSelectedPeriod(null);
        setSettingsStartDate(dayjs());
        setSettingsEndDate(dayjs().add(1, 'hour'));
        setSettingsDailyDate(dayjs());
        setSettingsSelectedWeek(dayjs());
        setSettingsSelectedMonth(dayjs());

        //  Close dialog
        setSettingsDialogOpen(false);
    };
    const MENU_ITEM_HEIGHT = 40;
    const MENU_ITEM_PADDING_TOP = 8;
    const selectMenuProps = {
        PaperProps: {
            style: {
                maxHeight: MENU_ITEM_HEIGHT * 5 + MENU_ITEM_PADDING_TOP,
            },
        },
    };

    const RenderDatePickers = () => {
        if (!settingsSelectedPeriod) return null;

        switch (settingsSelectedPeriod.name) {
            case 'Hourly':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <DateTimePicker
                            label="Start"
                            value={settingsStartDate}
                            ampm={false}
                            views={['year', 'month', 'day', 'hours']}
                            onChange={(newValue) => setSettingsStartDate(newValue)}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    helperText: settingsStartDate ? `From: ${settingsStartDate.format('DD MMMM YYYY - HH:mm')}` : '',
                                }
                            }}
                        />
                        <DateTimePicker
                            label="End"
                            value={settingsEndDate}
                            ampm={false}
                            views={['year', 'month', 'day', 'hours']}
                            onChange={(newValue) => setSettingsEndDate(newValue)}
                            minDateTime={settingsStartDate}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    helperText: settingsEndDate ? `To: ${settingsEndDate.format('DD MMMM YYYY - HH:mm')}` : '',
                                }
                            }}
                        />
                    </Box>
                );

            case 'Daily':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <DatePicker
                            label="Day"
                            value={settingsDailyDate}
                            onChange={(newValue) => setSettingsDailyDate(newValue)}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    helperText: settingsDailyDate ? `${settingsDailyDate.format('DD MMMM YYYY')}` : '',
                                }
                            }}
                        />
                    </Box>
                );

            case 'Weekly':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <DatePicker
                            label="Week"
                            value={settingsSelectedWeek}
                            onChange={(newValue) => {
                                setSettingsSelectedWeek(newValue);
                            }}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    helperText: settingsSelectedWeek ? `${settingsSelectedWeek.startOf('isoWeek').format('DD MMMM')} - ${settingsSelectedWeek.endOf('isoWeek').format('DD MMMM, YYYY')}` : '',
                                }
                            }}
                        />
                    </Box>
                );

            case 'Monthly':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <DatePicker
                            label="Select Month"
                            value={settingsSelectedMonth}
                            onChange={(newValue) => {
                                setSettingsSelectedMonth(newValue);
                            }}
                            views={['year', 'month']}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    helperText: settingsSelectedMonth ? `${settingsSelectedMonth.format('MMMM YYYY')}` : '',
                                }
                            }}
                        />
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Box sx={{
                minWidth: 1000,
                maxHeight: 100,
                borderRadius: 2,
                //border: '1px solid',
                //borderColor: (theme) => theme.palette.customgray?.light,
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                alignContent: 'center',
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
                {/* Suspend overlay */}
                <Collapse in={isSuspending || suspendSuccess !== null} timeout={300} unmountOnExit>
                    <Box
                        sx={(theme) => ({
                            position: 'absolute',
                            inset: 0,
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            bgcolor: alpha(theme.palette.customgray.dark, 0.96),
                            borderRadius: 2,
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(8px)',
                        })}
                    >
                        {isSuspending && suspendSuccess === null ? (
                            <>
                                <CircularProgress
                                    size={32}
                                    sx={{
                                        color: (theme) => theme.palette.customgray?.main ?? theme.palette.warning.main,
                                        mr: 1
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'slideToCenter 2s ease-out',
                                        '@keyframes slideToCenter': {
                                            '0%': {
                                                transform: 'translateX(-100vw)',
                                                opacity: 0,
                                            },
                                            '70%': {
                                                transform: 'translateX(0)',
                                                opacity: 1,
                                            },
                                            '100%': {
                                                transform: 'translateX(0)',
                                                opacity: 1,
                                            }
                                        }
                                    }}
                                >
                                    Suspending request...
                                </Typography>
                            </>
                        ) : suspendSuccess === true ? (
                            <>
                                <PauseOutlinedIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.customgray.light,
                                        animation: 'bounceIn 0.6s ease-out',
                                        '@keyframes bounceIn': {
                                            '0%': { transform: 'scale(0)', opacity: 0 },
                                            '50%': { transform: 'scale(1.3)' },
                                            '70%': { transform: 'scale(0.9)' },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'fadeIn 0.3s ease-out 0.3s both',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    Suspended!
                                </Typography>
                            </>
                        ) : suspendSuccess === false ? (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                animation: 'slideLeftToRight 3s ease-in-out',
                                '@keyframes slideLeftToRight': {
                                    '0%': {
                                        transform: 'translateX(-100vw)',
                                        opacity: 0,
                                    },
                                    '30%': {
                                        transform: 'translateX(0)',
                                        opacity: 1,
                                    },
                                    '70%': {
                                        transform: 'translateX(0)',
                                        opacity: 1,
                                    },
                                    '100%': {
                                        transform: 'translateX(100vw)',
                                        opacity: 0,
                                    }
                                }
                            }}>
                                <CloseIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.customred?.main ?? theme.palette.error.main,
                                        mr: 1
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                    }}
                                >
                                    Failed to suspend request
                                </Typography>
                            </Box>
                        ) : null}
                    </Box>
                </Collapse>

                {/* Delete overlay */}
                <Collapse in={isDeleting || deleteSuccess !== null} timeout={300} unmountOnExit>
                    <Box
                        sx={(theme) => ({
                            position: 'absolute',
                            inset: 0,
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            bgcolor: alpha(theme.palette.customgray.dark, 0.96),
                            borderRadius: 2,
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(8px)',
                        })}
                    >
                        {isDeleting && deleteSuccess === null ? (
                            <>
                                <CircularProgress
                                    size={32}
                                    sx={{
                                        color: (theme) => theme.palette.customred?.main ?? theme.palette.error.main,
                                        mr: 1
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'slideToCenter 2s ease-out',
                                        '@keyframes slideToCenter': {
                                            '0%': {
                                                transform: 'translateX(-100vw)',
                                                opacity: 0,
                                            },
                                            '70%': {
                                                transform: 'translateX(0)',
                                                opacity: 1,
                                            },
                                            '100%': {
                                                transform: 'translateX(0)',
                                                opacity: 1,
                                            }
                                        }
                                    }}
                                >
                                    Deleting request...
                                </Typography>
                            </>
                        ) : deleteSuccess === true ? (
                            <>
                                <DeleteOutlineOutlinedIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.customred.main,
                                        animation: 'bounceIn 0.6s ease-out',
                                        '@keyframes bounceIn': {
                                            '0%': { transform: 'scale(0)', opacity: 0 },
                                            '50%': { transform: 'scale(1.3)' },
                                            '70%': { transform: 'scale(0.9)' },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'fadeIn 0.3s ease-out 0.3s both',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    Deleted!
                                </Typography>
                            </>
                        ) : deleteSuccess === false ? (
                            <>
                                <CloseIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.customred.main,
                                        animation: 'bounceIn 0.6s ease-out',
                                        '@keyframes bounceIn': {
                                            '0%': { transform: 'scale(0)', opacity: 0 },
                                            '50%': { transform: 'scale(1.3)' },
                                            '70%': { transform: 'scale(0.9)' },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'fadeIn 0.3s ease-out 0.3s both',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    Failed to delete!
                                </Typography>
                            </>
                        ) : null}
                    </Box>
                </Collapse>

                {/* Pending overlay */}
                <Collapse in={isPending || pendingSuccess !== null} timeout={300} unmountOnExit>
                    <Box
                        sx={(theme) => ({
                            position: 'absolute',
                            inset: 0,
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            bgcolor: alpha(theme.palette.customgray.dark, 0.96),
                            borderRadius: 2,
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(8px)',
                        })}
                    >
                        {isPending && pendingSuccess === null ? (
                            <>
                                <CircularProgress
                                    size={32}
                                    sx={{
                                        color: (theme) => theme.palette.primary.main,
                                        mr: 1
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'slideToCenter 2s ease-out',
                                        '@keyframes slideToCenter': {
                                            '0%': {
                                                transform: 'translateX(-100vw)',
                                                opacity: 0,
                                            },
                                            '70%': {
                                                transform: 'translateX(0)',
                                                opacity: 1,
                                            },
                                            '100%': {
                                                transform: 'translateX(0)',
                                                opacity: 1,
                                            }
                                        }
                                    }}
                                >
                                    Appending to queue...
                                </Typography>
                            </>
                        ) : pendingSuccess === true ? (
                            <>
                                <PlayCircleOutlinedIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.primary.light,
                                        animation: 'bounceIn 0.6s ease-out',
                                        '@keyframes bounceIn': {
                                            '0%': { transform: 'scale(0)', opacity: 0 },
                                            '50%': { transform: 'scale(1.3)' },
                                            '70%': { transform: 'scale(0.9)' },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'fadeIn 0.3s ease-out 0.3s both',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    Reinstated!
                                </Typography>
                            </>
                        ) : pendingSuccess === false ? (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                animation: 'slideLeftToRight 3s ease-in-out',
                                '@keyframes slideLeftToRight': {
                                    '0%': {
                                        transform: 'translateX(-100vw)',
                                        opacity: 0,
                                    },
                                    '30%': {
                                        transform: 'translateX(0)',
                                        opacity: 1,
                                    },
                                    '70%': {
                                        transform: 'translateX(0)',
                                        opacity: 1,
                                    },
                                    '100%': {
                                        transform: 'translateX(100vw)',
                                        opacity: 0,
                                    }
                                }
                            }}>
                                <CloseIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.customred?.main ?? theme.palette.error.main,
                                        mr: 1
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'white',
                                    }}
                                >
                                    Failed to append request
                                </Typography>
                            </Box>
                        ) : null}
                    </Box>
                </Collapse>

                {/* Processing overlay */}
                <Collapse in={isProcessing || processingSuccess !== null} timeout={300} unmountOnExit>
                    <Box
                        sx={(theme) => ({
                            position: 'absolute',
                            inset: 0,
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            bgcolor: alpha(theme.palette.customgray.dark, 0.96),
                            borderRadius: 2,
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(8px)',
                        })}
                    >
                        {isProcessing && processingSuccess === null ? (
                            <>
                                <CircularProgress
                                    size={32}
                                    sx={{
                                        color: (theme) => theme.palette.customyellow?.main ?? theme.palette.warning.main,
                                        mb: 1
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'white'
                                    }}
                                >
                                    Starting processing...
                                </Typography>
                            </>
                        ) : processingSuccess === true ? (
                            <>
                                <MemoryIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.customyellow.main,
                                        animation: 'bounceIn 0.6s ease-out',
                                        '@keyframes bounceIn': {
                                            '0%': { transform: 'scale(0)', opacity: 0 },
                                            '50%': { transform: 'scale(1.3)' },
                                            '70%': { transform: 'scale(0.9)' },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'fadeIn 0.3s ease-out 0.3s both',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    In Progress!
                                </Typography>
                            </>
                        ) : null}
                    </Box>
                </Collapse>

                {/* Completed overlay */}
                <Collapse in={isCompleting || completedSuccess !== null} timeout={300} unmountOnExit>
                    <Box
                        sx={(theme) => ({
                            position: 'absolute',
                            inset: 0,
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            bgcolor: alpha(theme.palette.customgray.dark, 0.96),
                            borderRadius: 2,
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(8px)',
                        })}
                    >
                        {isCompleting && completedSuccess === null ? (
                            <>
                                <CircularProgress
                                    size={32}
                                    sx={{
                                        color: (theme) => theme.palette.customgreen?.main ?? theme.palette.success.main,
                                        mb: 1
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'white'
                                    }}
                                >
                                    Finalizing...
                                </Typography>
                            </>
                        ) : completedSuccess === true ? (
                            <>
                                <CheckCircleIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.customgreen?.main ?? theme.palette.success.main,
                                        animation: 'bounceIn 0.6s ease-out',
                                        '@keyframes bounceIn': {
                                            '0%': { transform: 'scale(0)', opacity: 0 },
                                            '50%': { transform: 'scale(1.3)' },
                                            '70%': { transform: 'scale(0.9)' },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'fadeIn 0.3s ease-out 0.3s both',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    Request completed successfully
                                </Typography>
                            </>
                        ) : null}
                    </Box>
                </Collapse>

                {/* Failed overlay */}
                <Collapse in={isFailing || failedSuccess !== null} timeout={300} unmountOnExit>
                    <Box
                        sx={(theme) => ({
                            position: 'absolute',
                            inset: 0,
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            bgcolor: alpha(theme.palette.customgray.dark, 0.96),
                            borderRadius: 2,
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(8px)',
                        })}
                    >
                        {isFailing && failedSuccess === null ? (
                            <>
                                <CircularProgress
                                    size={32}
                                    sx={{
                                        color: (theme) => theme.palette.customred?.main ?? theme.palette.error.main,
                                        mb: 1
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'white'
                                    }}
                                >
                                    Processing failed...
                                </Typography>
                            </>
                        ) : failedSuccess === true ? (
                            <>
                                <CloseIcon
                                    sx={(theme) => ({
                                        fontSize: 40,
                                        color: theme.palette.customred.main,
                                        animation: 'bounceIn 0.6s ease-out',
                                        '@keyframes bounceIn': {
                                            '0%': { transform: 'scale(0)', opacity: 0 },
                                            '50%': { transform: 'scale(1.3)' },
                                            '70%': { transform: 'scale(0.9)' },
                                            '100%': { transform: 'scale(1)', opacity: 1 }
                                        }
                                    })}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        fontWeight: 600,
                                        color: 'white',
                                        animation: 'fadeIn 0.3s ease-out 0.3s both',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    Failed!
                                </Typography>
                            </>
                        ) : null}
                    </Box>
                </Collapse>

                {/* Status bulb*/}
                <Box width='30%'>
                    {Bulb(requestData.status.name)}
                    <Box>
                        {requestData.status.name === 'Deleted' ? (<Typography sx={{ textDecoration: "line-through" }}>
                            {formatDateInWarsaw(requestData.raportCreationDate, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </Typography>) : (<Typography>
                            {formatDateInWarsaw(requestData.raportCreationDate, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </Typography>)}
                    </Box>
                </Box>

                {/* Period */}
                <Box component="span"
                    sx={(theme) => ({
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1.2,
                        py: 0.4,
                        borderRadius: '999px',
                        bgcolor: (theme) => {
                            return ` ${alpha(theme.palette.primary.light, 1)}`;
                        },
                        color: theme.palette.text.primary,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    })}>
                    {requestData.status.name === 'Deleted' ? (<Typography sx={{ textDecoration: "line-through" }}>{requestData.period.name}</Typography>) : (<Typography>{requestData.period.name}</Typography>)}
                </Box>

                {/* Date */}
                <Box
                    sx={{
                        display: 'flex',
                        flexFlow: 'row nowrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        alignContent: 'center',
                    }}>
                    <Box>
                        {requestData.status.name === 'Deleted' ? (<Typography sx={{ textDecoration: "line-through" }}>
                            {formatDateInWarsaw(requestData.startDate, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>) : (<Typography>
                            {formatDateInWarsaw(requestData.startDate, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>)}


                        {requestData.status.name === 'Deleted' ? (<Typography sx={{ textDecoration: "line-through" }}>
                            {formatDateInWarsaw(requestData.startDate, {
                                weekday: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </Typography>) : (<Typography>
                            {formatDateInWarsaw(requestData.startDate, {
                                weekday: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </Typography>)}
                    </Box>

                    <EastIcon sx={{ mr: 2, ml: 2 }} />

                    <Box>
                        {requestData.status.name === 'Deleted' ? (<Typography sx={{ textDecoration: "line-through" }}>
                            {formatDateInWarsaw(requestData.endDate, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>) : (<Typography>
                            {formatDateInWarsaw(requestData.endDate, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>)}


                        {requestData.status.name === 'Deleted' ? (<Typography sx={{ textDecoration: "line-through" }}>
                            {formatDateInWarsaw(requestData.endDate, {
                                weekday: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </Typography>) : (<Typography>
                            {formatDateInWarsaw(requestData.endDate, {
                                weekday: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </Typography>)}
                    </Box>
                </Box>

                {/* Action buttons */}
                <Box>
                    {RenderButtons()}
                </Box>
            </Box>

            {/* Modify request dialog */}
            <Dialog
                open={settingsDialogOpen}
                onClose={CancelRequestSettings_ButtonClick}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', padding: 1, paddingLeft: 1.5, paddingRight: 1.5 }}>
                    <Typography sx={{}}>Settings</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={CancelRequestSettings_ButtonClick}
                        //disabled={settingsLoading}
                        sx={(theme) => ({ ml: 'auto' })}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', padding: 2, width: 400, height: 400, minHeight: 0, position: 'relative' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                        <FormControl fullWidth size="small">
                            <InputLabel>Period</InputLabel>
                            <Select
                                value={settingsSelectedPeriod?.id ?? ''}
                                label="Period"
                                onChange={(e) => {
                                    const period = settingsPossiblePeriods.find(p => p.id === e.target.value);
                                    setSettingsSelectedPeriod(period);
                                }}
                            >
                                {settingsPossiblePeriods.map((period) => (
                                    <MenuItem key={period.id} value={period.id}>
                                        {period.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {RenderDatePickers()}
                    </LocalizationProvider>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ padding: 1.5, paddingRight: 2 }}>
                    <Button
                        onClick={CancelRequestSettings_ButtonClick}
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
                    //disabled={settingsLoading}
                    >Cancel</Button>

                    <Button
                        variant="outlined"
                        onClick={SaveRequsetSettings_ButtonClick}
                        // disabled={
                        //     requestData.period.name === settingsSelectedPeriod?.name  
                        //     //editTimestampConfigId === DBTimestampConfigurationId && 
                        //     //editLocationId === DBLocationId && 
                        //     //JSON.stringify(editMeasurementConfig) === JSON.stringify(DBMeasurementConfiguration)
                        // }
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
                        {'Apply'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={CancelDelete_ButtonClick}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
                slotProps={{
                    paper: {
                        sx: {
                            border: '1px solid',
                            borderColor: (theme) => theme.palette.customgray?.light,
                            borderRadius: 2,
                        }
                    }
                }}
            >
                <DialogTitle sx={{ margin: 0, padding: 2 }} id="delete-dialog-title" variant='h6'>Delete Request</DialogTitle>
                <DialogContent sx={{
                    margin: 0,
                    padding: 2
                }}>
                    <Typography variant='subtitle2'
                        sx={(theme) => ({
                            color: theme.palette.customgray?.light,
                        })}
                    >Are you sure you want to delete this request? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{
                    mr: 1,
                    mb: 1
                }}>
                    <Button
                        variant='outlined'
                        onClick={CancelDelete_ButtonClick}
                        sx={(theme) => ({
                            color: theme.palette.primary.main,
                        })}
                    >Cancel</Button>
                    <Button
                        onClick={ConfirmDelete_ButtonClick}
                        variant="contained"
                        sx={(theme) => ({
                            bgcolor: theme.palette.customred?.dark ?? theme.palette.error.dark,
                            '&:hover': {
                                bgcolor: theme.palette.customred?.main ?? theme.palette.error.main,
                            },
                        })}
                    >Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default Request;