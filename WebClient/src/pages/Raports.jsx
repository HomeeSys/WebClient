import React from 'react';

//  MUI Styles
import { alpha } from '@mui/material/styles';

//  Icons
import { LibraryBooksOutlined as LibraryBooksOutlinedIcon, WifiOffOutlined as WifiOffOutlinedIcon, LibraryAddCheckOutlined as LibraryAddCheckOutlinedIcon, CalendarMonthOutlined as CalendarMonthOutlinedIcon, ClearOutlined as ClearOutlinedIcon, Campaign as CampaignIcon, Sort as SortIcon, QuizOutlined as QuizOutlinedIcon, QuestionMarkOutlined as QuestionMarkOutlinedIcon, LibraryAddOutlined as LibraryAddOutlinedIcon, CachedOutlined as CachedOutlinedIcon, DeleteSweepOutlined as DeleteSweepOutlinedIcon, FilterList as FilterListIcon, Close as CloseIcon } from '@mui/icons-material';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

//  Material UI
import { Stack, Grow, Box, Tooltip, Divider, Fade, Menu, MenuItem, IconButton, TableContainer, TablePagination, InputLabel, DialogTitle, DialogContent, DialogActions, Dialog, Select, Switch, Paper, FormControl, Snackbar, LinearProgress, Typography, ListItemText, Badge, Button, Checkbox } from '@mui/material';

//  SignalR
import * as SignalR from '@microsoft/signalr';

//  Date Pickers
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';

//  Components
import InfoLabel from '../components/InfoLabel';
import LoadingLabel from '../components/LoadingLabel';
import Bulb from '../components/Bulb'
import Request from '../components/Request';

//  DayJS
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

function Raports() {
  //  Page data collections
  const [requests, setRequests] = React.useState([]);
  const [periods, setPeriods] = React.useState([]);
  const [statuses, setStatuses] = React.useState([]);
  const [locations, setLocations] = React.useState([]);
  const [measurements, setMeasurements] = React.useState([]);

  //  Page state
  const [serverResponding, setServerResponding] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [creatingSuccess, setCratingSuccess] = React.useState(null); // null = no suspend, true = success, false = failed
  const [isLoading, setIsLoading] = React.useState(false);
  //  True if WebSocket recieved something from backend and it was related to any Request in curently displayed Requests collection.
  const [RequestsCollectionUpdated, setRequestsCollectionUpdated] = React.useState(false);

  //  Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState(null);
  const [totalRequests, setTotalRequests] = React.useState(0);
  const [absoluteRequestsCount, setAbsoluteRequestsCount] = React.useState(0);

  //  Filter and Sort
  const [filterDateFrom, setFilterDateFrom] = React.useState(null);
  const [filterDateTo, setFilterDateTo] = React.useState(null);
  const [FiltersAndSettingsChanged, setFiltersAndSettingsChanged] = React.useState(false);
  const [sortOrder, setSortOrder] = React.useState('desc');
  const [appliedSettings, setAppliedSettings] = React.useState({
    selectedStatus: null,
    selectedPeriod: null,
    sortOrder: 'desc',
    filterDateFrom: null,
    filterDateTo: null
  });

  //  Sort menu
  const [anchorSortEl, setAnchorSortEl] = React.useState(null);
  const sortMenuOpen = Boolean(anchorSortEl);
  const handleOpenSortMenu = (e) => setAnchorSortEl(e.currentTarget);
  const handleCloseSortMenu = () => setAnchorSortEl(null);

  //  Filter menu
  const [anchorFilterEl, setAnchorFilterEl] = React.useState(null);
  const filterMenuOpen = Boolean(anchorFilterEl);
  const handleOpenFilterMenu = (e) => setAnchorFilterEl(e.currentTarget);
  const handleCloseFilterMenu = () => setAnchorFilterEl(null);

  //  Create request dialog
  const [CreateRequestDialogOpen, setCreateRequestDialogOpen] = React.useState(false);
  const [CreateRequestSelectedPeriod, setCreateRequestSelectedPeriod] = React.useState();
  const [CreateRequestDailyDate, setCreateRequestDailyDate] = React.useState(dayjs());
  const [CreateRequestSelectedWeek, setCreateRequestSelectedWeek] = React.useState(dayjs());
  const [CreateRequestSelectedMonth, setCreateRequestSelectedMonth] = React.useState(dayjs());
  const [CreateRequestStartDate, setCreateRequestStartDate] = React.useState(dayjs());
  const [CreateRequestEndDate, setCreateRequestEndDate] = React.useState(dayjs().add(1, 'hour'));
  const [CreateRequestSelectedLocations, setCreateRequestSelectedLocations] = React.useState([]);
  const [CreateRequestSelectedMeasurements, setCreateRequestSelectedMeasurements] = React.useState([]);

  //  Alert snack
  const [SnackProgress, setSnackProgress] = React.useState(0);
  const [SnackMessage, setSnackMessage] = React.useState('');
  const [SnackDescription, setSnackDescription] = React.useState('');
  const [DisableSnack, setDisableSnack] = React.useState(false);
  const SnackIntervalRef = React.useRef(null);

  // Check if current settings differ from applied settings
  const checkForChanges = React.useCallback(() => {
    const currentSettings = {
      selectedStatus,
      selectedPeriod,
      sortOrder,
      filterDateFrom,
      filterDateTo
    };

    const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(appliedSettings);
    setFiltersAndSettingsChanged(hasChanges);
  }, [selectedStatus, selectedPeriod, sortOrder, filterDateFrom, filterDateTo, appliedSettings]);

  // Update FiltersAndSettingsChanged whenever settings change
  React.useEffect(() => {
    checkForChanges();
  }, [checkForChanges]);

  //  ---------- Filters and sorting selection changed handlers  ----------
  const FilterStatus_Selected = (status) => {
    setSelectedStatus(selectedStatus?.id === status.id ? null : status);
  };

  const FilterPeriod_Selected = (period) => {
    setSelectedPeriod(selectedPeriod?.id === period.id ? null : period);
  };

  const Sorting_Selected = (newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const DateFrom_SelectionChanged = (newValue) => {
    setFilterDateFrom(newValue);
  };

  const DateTo_SelectionChanged = (newValue) => {
    setFilterDateTo(newValue);
  };

  //  ---------- Pagination/Refresh/Clear changed handlers  ----------
  const RefreshRequests_ButtonClick = () => {
    setPage(0);
    FetchRequests();
  };

  const Page_Changed = (event, newPage) => {
    setPage(newPage);
  };

  const RowsPerPage_Changed = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const ClearSortFilter_ButtonClick = () => {
    setSelectedStatus(null);
    setSelectedPeriod(null);
    setSortOrder('desc');
    setFilterDateFrom(null);
    setFilterDateTo(null);

    const defaultSettings = {
      selectedStatus: null,
      selectedPeriod: null,
      sortOrder: 'desc',
      filterDateFrom: null,
      filterDateTo: null
    };

    setAppliedSettings(defaultSettings);
    setFiltersAndSettingsChanged(false);
  };

  //  ---------- Fetch data from backend ----------
  const FetchAllPeriods = () => {
    fetch('https://localhost:6063/raports/periods/all')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setPeriods(data);
      })
      .catch(err => {
        setPeriods([]);
      });
  };

  const FetchAllStatuses = () => {
    fetch('https://localhost:6063/raports/statuses/all')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setStatuses(data);
      })
      .catch(err => {
        setStatuses([]);
      });
  };

  const FetchAllLocations = () => {
    fetch('https://localhost:6063/raports/locations/all')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setLocations(data);
      })
      .catch(err => {
        setLocations([]);
      });
  };

  const FetchAllMeasurements = () => {
    fetch('https://localhost:6063/raports/measurements/all')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setMeasurements(data);
      })
      .catch(err => {
        setMeasurements([]);
      });
  };

  const FetchRequests = React.useCallback(() => {
    setIsLoading(true);

    const params = new URLSearchParams({
      Page: (page + 1).toString(),
      PageSize: rowsPerPage.toString(),
      SortOrder: sortOrder
    });

    if (filterDateFrom) {
      params.append('RaportCreationDateFrom', filterDateFrom.toISOString());
    }
    if (filterDateTo) {
      params.append('RaportCreationDateTo', filterDateTo.toISOString());
    }

    if (selectedPeriod) {
      params.append('PeriodName', selectedPeriod.name);
    }

    if (selectedStatus) {
      params.append('StatusName', selectedStatus.name);
    }

    fetch(`https://localhost:6063/raports/query?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setTimeout(() => {
          // Handle nested paginatedList structure
          const paginatedData = data.paginatedList || data;
          const raportsArray = paginatedData.items || [];
          setRequests(raportsArray);
          setTotalRequests(paginatedData.totalCount || 0);
          setAbsoluteRequestsCount(paginatedData.absoluteCount || paginatedData.totalCount || 0);
          setRequestsCollectionUpdated(false);
          setIsLoading(false);
        }, 1200);
      })
      .catch(err => {
        setRequests([]);
        setTotalRequests(0);
        setAbsoluteRequestsCount(0);
        setIsLoading(false);
      });
  }, [page, rowsPerPage, sortOrder, filterDateFrom, filterDateTo, selectedPeriod, selectedStatus]);

  // Auto refresh when user changes page or items displayed on current page.
  React.useEffect(() => {
    FetchRequests();
  }, [page, rowsPerPage]);

  //  ---------- Counting active filters ----------
  const ActiveFiltersCount = React.useMemo(() => {
    let count = 0;
    if (selectedStatus) count++;
    if (selectedPeriod) count++;

    return count;
  }, [selectedStatus, selectedPeriod]);

  //  ---------- Messages recieved from request handlers ----------
  const RequestDeleted_Handler = (requestDto) => {
    CreateSnackAlert_Handler('Request deleted', `One of currently displayed requests was deleted! To apply latest changes refresh collection!`);
  };

  //  ---------- Create request handlers ----------
  const CancelCreateRequest_ButtonClick = () => {
    setCreateRequestDialogOpen(false);

    setTimeout(() => {
      setCreateRequestSelectedPeriod(null);
      setCreateRequestStartDate(dayjs());
      setCreateRequestEndDate(dayjs().add(1, 'hour'));
      setCreateRequestDailyDate(dayjs());
      setCreateRequestSelectedWeek(dayjs());
      setCreateRequestSelectedMonth(dayjs());
      setCreateRequestSelectedLocations([]);
      setCreateRequestSelectedMeasurements([]);
    }, 200);
  };

  const ConfirmCreateRequest_ButtonClick = async () => {
    if (!CreateRequestSelectedPeriod) return;

    setIsCreating(true);
    setCratingSuccess(null);

    try {
      let requestData = {
        periodName: CreateRequestSelectedPeriod.name
      };

      switch (CreateRequestSelectedPeriod.name) {
        case 'Hourly':
          if (!CreateRequestStartDate || !CreateRequestEndDate) {
            throw new Error('Start and end dates are required for hourly requests');
          }
          requestData.startDate = CreateRequestStartDate.toISOString();
          requestData.endDate = CreateRequestEndDate.toISOString();
          break;

        case 'Daily':
          if (!CreateRequestDailyDate) {
            throw new Error('Daily date is required for daily requests');
          }
          requestData.startDate = CreateRequestDailyDate.startOf('day').toISOString();
          requestData.endDate = CreateRequestDailyDate.endOf('day').toISOString();
          break;

        case 'Weekly':
          if (!CreateRequestSelectedWeek) {
            throw new Error('Week selection is required for weekly requests');
          }
          requestData.startDate = CreateRequestSelectedWeek.startOf('isoWeek').toISOString();
          requestData.endDate = CreateRequestSelectedWeek.endOf('isoWeek').toISOString();
          break;

        case 'Monthly':
          if (!CreateRequestSelectedMonth) {
            throw new Error('Month selection is required for monthly requests');
          }
          requestData.startDate = CreateRequestSelectedMonth.startOf('month').toISOString();
          requestData.endDate = CreateRequestSelectedMonth.endOf('month').toISOString();
          break;

        default:
          throw new Error('Invalid period type');
      }

      const periodId = CreateRequestSelectedPeriod.id;
      const startDate = requestData.startDate;
      const endDate = requestData.endDate;

      // Build query string with array parameters
      const params = new URLSearchParams();
      params.append('StartDate', startDate);
      params.append('EndDate', endDate);
      params.append('PeriodID', periodId.toString());
      
      // Add selected locations
      CreateRequestSelectedLocations.forEach(locationId => {
        params.append('RequestedLocationsIDs', locationId.toString());
      });
      
      // Add selected measurements
      CreateRequestSelectedMeasurements.forEach(measurementId => {
        params.append('RequestedMeasurementsIDs', measurementId.toString());
      });

      const response = await fetch(`https://localhost:6063/raports/raport?${params.toString()}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      setCratingSuccess(true);

      setTimeout(() => {
        setIsCreating(false);
        setCratingSuccess(null);
        setCreateRequestSelectedPeriod(null);
        setCreateRequestStartDate(dayjs());
        setCreateRequestEndDate(dayjs().add(1, 'hour'));
        setCreateRequestDailyDate(dayjs());
        setCreateRequestSelectedWeek(dayjs());
        setCreateRequestSelectedMonth(dayjs());
        setCreateRequestSelectedLocations([]);
        setCreateRequestSelectedMeasurements([]);
      }, 1500);

    } catch (error) {
      console.error('[CREATE REQUEST] Error:', error);
      setCratingSuccess(false);

      setTimeout(() => {
        setIsCreating(false);
        setCratingSuccess(null);
      }, 2000);
    }
  };

  //  ---------- Snack alerts handlers ----------
  const CloseSnackAlert_Handler = () => {
    setDisableSnack(false);
    setSnackProgress(0);

    // Clear the interval to stop the timer
    if (SnackIntervalRef.current) {
      clearInterval(SnackIntervalRef.current);
      SnackIntervalRef.current = null;
    }
  };

  const CreateSnackAlert_Handler = (message, description) => {
    setRequestsCollectionUpdated(true);

    setSnackMessage(message);
    setSnackDescription(description);

    setDisableSnack(true);
    setSnackProgress(0);

    clearInterval(SnackIntervalRef.current);

    const startTime = Date.now();
    const duration = 3000;

    SnackIntervalRef.current = setInterval(() => {
      setSnackProgress(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);

        if (newProgress >= 100) {
          setDisableSnack(false);
          clearInterval(SnackIntervalRef.current);
          return 0;
        }

        return newProgress;
      });
    }, 16);
  };

  //  ---------- SignalR - WebSockets ----------
  React.useEffect(() => {
    FetchAllStatuses();
    FetchAllPeriods();
    FetchAllLocations();
    FetchAllMeasurements();

    let connection = null;

    connection = new SignalR.HubConnectionBuilder()
      .withUrl('https://localhost:6063/raportshub')
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
        connection.on('RaportCreated', (dto) => {
          CreateSnackAlert_Handler('Raport created', `New ${dto.period.name} raport was created. To apply latest changes refresh collection!`);
        });
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
      if (SnackIntervalRef.current) {
        clearInterval(SnackIntervalRef.current);
      }
    };
  }, []);


  const RenderDatePickers = () => {
    if (!CreateRequestSelectedPeriod) return (
      <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
        <InfoLabel
          mainlabel="Select period!"
          icon={CalendarMonthOutlinedIcon}
          description={"You have to select period to continue!"}
        />
      </Box>
    );

    switch (CreateRequestSelectedPeriod.name) {
      case 'Hourly':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0 }}>

            <DateTimePicker
              label="Start"
              value={CreateRequestStartDate}
              ampm={false}
              views={['year', 'month', 'day', 'hours', 'minutes']}
              onChange={(newValue) => setCreateRequestStartDate(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: CreateRequestStartDate ? `From: ${CreateRequestStartDate.format('DD MMMM YYYY - HH:mm')}` : '',
                }
              }}
            />
            <DateTimePicker
              label="End"
              value={CreateRequestEndDate}
              ampm={false}
              views={['year', 'month', 'day', 'hours', 'minutes']}
              onChange={(newValue) => setCreateRequestEndDate(newValue)}
              minDateTime={CreateRequestStartDate}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: CreateRequestEndDate ? `To: ${CreateRequestEndDate.format('DD MMMM YYYY - HH:mm')}` : '',
                }
              }}
            />

            {CreateRequestStartDate && CreateRequestEndDate ? (<Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{
                color: (theme) => theme.palette.custompalette.azure,
                fontWeight: 'bold',
                mr: 0.5
              }}>
                {CreateRequestEndDate.diff(CreateRequestStartDate, 'hour')}
              </Typography>

              <Typography sx={{
                color: (theme) => theme.palette.text.secondary
              }}>
                hours included
              </Typography>
            </Box>) : (<Box></Box>)}

          </Box>
        );

      case 'Daily':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>

            <Divider></Divider>

            <DatePicker
              label="Day"
              value={CreateRequestDailyDate}
              onChange={(newValue) => setCreateRequestDailyDate(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: CreateRequestDailyDate ? `${CreateRequestDailyDate.format('DD MMMM YYYY')}` : '',
                }
              }}
            />
          </Box>
        );

      case 'Weekly':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Divider></Divider>

            <DatePicker
              label="Week"
              value={CreateRequestSelectedWeek}
              onChange={(newValue) => {
                setCreateRequestSelectedWeek(newValue);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: CreateRequestSelectedWeek ? `${CreateRequestSelectedWeek.startOf('isoWeek').format('DD MMMM')} - ${CreateRequestSelectedWeek.endOf('isoWeek').format('DD MMMM, YYYY')}` : '',
                }
              }}
            />
          </Box>
        );

      case 'Monthly':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Divider></Divider>

            <DatePicker
              label="Select Month"
              value={CreateRequestSelectedMonth}
              onChange={(newValue) => {
                setCreateRequestSelectedMonth(newValue);
              }}
              views={['year', 'month']}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: CreateRequestSelectedMonth ? `${CreateRequestSelectedMonth.format('MMMM YYYY')}` : '',
                }
              }}
            />
          </Box>
        );
      default:
        return (<Box>asdasd</Box>);
    }
  };


  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Search and filtering */}
      <Paper sx={{ display: 'flex', m: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {/* Box with filters and sorting */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Create request button */}
          <Tooltip title="Create request">
            <span>

              <IconButton
                disabled={!serverResponding || isLoading}
                onClick={() => { setCreateRequestDialogOpen(true); }}
                aria-label="close"
                size='medium'
              >
                <NoteAddOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>

          {/* Modify request dialog */}
          <Dialog
            open={CreateRequestDialogOpen}
            onClose={CancelCreateRequest_ButtonClick}
            maxWidth="sm"
            fullWidth
            aria-labelledby="measurement-details-dialog-title"
            aria-describedby="measurement-details-dialog-description"
            slotProps={{
              paper: {
                sx: {
                  border: '0.01rem solid',
                  borderColor: (theme) => theme.palette.customgray?.light,
                  borderRadius: 2,
                }
              }
            }}
          >
            <Paper variant='outlined'>

              <DialogTitle sx={{ display: 'flex', alignItems: 'center', padding: 1, paddingLeft: 2 }}>
                <Box component="span">
                  <Typography variant='h6'>Request raport</Typography>
                </Box>
                <IconButton
                  aria-label="close"
                  onClick={CancelCreateRequest_ButtonClick}
                  sx={(theme) => ({ ml: 'auto' })}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <Divider />

              <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, height: 600, minHeight: 0, position: 'relative', overflow: 'auto' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                  <FormControl fullWidth size="small">
                    <InputLabel>Requested Locations</InputLabel>
                    <Select
                      multiple
                      value={CreateRequestSelectedLocations}
                      label="Requested Locations"
                      onChange={(e) => setCreateRequestSelectedLocations(e.target.value)}
                      renderValue={(selected) => {
                        if (selected.length === 0) return 'None selected';
                        return `${selected.length} location(s) selected`;
                      }}
                    >
                      {locations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          <Switch size='small' checked={CreateRequestSelectedLocations.indexOf(location.id) > -1} />
                          <ListItemText primary={location.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Requested Measurements</InputLabel>
                    <Select
                      multiple
                      value={CreateRequestSelectedMeasurements}
                      label="Requested Measurements"
                      onChange={(e) => setCreateRequestSelectedMeasurements(e.target.value)}
                      renderValue={(selected) => {
                        if (selected.length === 0) return 'None selected';
                        return `${selected.length} measurement(s) selected`;
                      }}
                    >
                      {measurements.map((measurement) => (
                        <MenuItem key={measurement.id} value={measurement.id}>
                          <Switch size='small' checked={CreateRequestSelectedMeasurements.indexOf(measurement.id) > -1} />
                          <ListItemText primary={`${measurement.name} (${measurement.unit})`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  <FormControl fullWidth size="small">
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={CreateRequestSelectedPeriod?.id ?? ''}
                      label="Period"
                      onChange={(e) => {
                        const period = periods.find(p => p.id === e.target.value);
                        setCreateRequestSelectedPeriod(period);
                      }}
                    >
                      {periods.map((period) => (
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

              <DialogActions sx={{ padding: 1, paddingRight: 1 }}>
                <Button
                  onClick={CancelCreateRequest_ButtonClick}
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
                >Cancel</Button>

                <Button
                  variant="outlined"
                  onClick={ConfirmCreateRequest_ButtonClick}
                  disabled={
                    !CreateRequestSelectedPeriod ||
                    CreateRequestSelectedLocations.length === 0 ||
                    CreateRequestSelectedMeasurements.length === 0
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
                  {'Apply'}
                </Button>
              </DialogActions>

              <Fade in={isCreating || creatingSuccess !== null} timeout={300} unmountOnExit>

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
                    pointerEvents: 'auto',
                    backdropFilter: 'blur(8px)',
                  })}
                >
                  {isCreating && creatingSuccess === null ? (
                    <>
                      <LoadingLabel
                        mainlabel="Creating request..."
                        icon={LibraryBooksOutlinedIcon}
                        description={"Your request is being created"}
                      />
                    </>
                  ) : creatingSuccess === true ? (
                    <>
                      <InfoLabel
                        mainlabel="Request created successfully"
                        icon={LibraryAddCheckOutlinedIcon}
                        description={"Request created"}
                        iconColor={(theme) => theme.palette.custompalette.persiangreen}
                      />
                    </>
                  ) : creatingSuccess === false ? (
                    <InfoLabel
                      mainlabel="Failed to create request"
                      icon={ClearOutlinedIcon}
                      description={"Failed to create request"}
                      iconColor={(theme) => theme.palette.custompalette.rustyred}
                    />
                  ) : (
                    <Box></Box>
                  )}
                </Box>
              </Fade>
            </Paper>
          </Dialog>

          {/* Request creation date filters */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Badge
              variant="dot"
              invisible={!filterDateFrom}
              sx={{
                '& .MuiBadge-dot': {
                  backgroundColor: (theme) => theme.palette.custompalette.maize
                }
              }}>

              <DatePicker
                label="From"
                variant="outlined"
                size="medium"
                disabled={!serverResponding || isLoading}
                value={filterDateFrom}
                onChange={DateFrom_SelectionChanged}
                clearable
                slotProps={{
                  textField: { size: 'small', variant: 'outlined' },
                  actionBar: {
                    actions: ['clear']
                  }
                }}
                maxDate={filterDateTo || undefined}
              />
            </Badge>

            <Badge
              variant="dot"
              invisible={!filterDateTo}
              sx={{
                '& .MuiBadge-dot': {
                  backgroundColor: (theme) => theme.palette.custompalette.maize
                }
              }}>

              <DatePicker
                label="To"
                disabled={!serverResponding || isLoading}
                value={filterDateTo}
                onChange={DateTo_SelectionChanged}
                clearable
                slotProps={{
                  textField: { size: 'small', variant: 'outlined' },
                  actionBar: {
                    actions: ['clear']
                  }
                }}
                minDate={filterDateFrom || undefined}
              />
            </Badge>
          </LocalizationProvider>

          {/* Filters */}
          <Tooltip title="Filter">
            <span>

              <IconButton onClick={handleOpenFilterMenu} sx={{ ml: 1 }} disabled={!serverResponding || isLoading}>
                <Badge
                  badgeContent={ActiveFiltersCount}
                  invisible={ActiveFiltersCount === 0}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: (theme) => theme.palette.custompalette.maize,
                      color: 'black'
                    }
                  }}>
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </span>
          </Tooltip>
          <Menu
            anchorEl={anchorFilterEl}
            open={filterMenuOpen}
            onClose={handleCloseFilterMenu}
          >
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* List of options for periods */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Typography sx={{
                  fontWeight: 'bold',
                  ml: 1,
                  mt: 1
                }}>Period</Typography>
                {periods.map((period) => (
                  <MenuItem
                    key={period.id}
                    size='small'
                    selected={selectedPeriod?.id === period.id}
                    onClick={() => FilterPeriod_Selected(period)}
                  >
                    <Switch
                      size='small'
                      checked={selectedPeriod?.id === period.id}
                      sx={{ mr: 1 }}
                    />
                    <ListItemText primary={period.name} />
                  </MenuItem>
                ))}
              </Box>

              <Divider />

              {/* List of statuses */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Typography sx={{
                  fontWeight: 'bold',
                  ml: 1,
                  mt: 1
                }}>Status</Typography>
                {statuses.map((status) => (
                  <MenuItem
                    key={status.id}
                    size='small'
                    selected={selectedStatus?.id === status.id}
                    onClick={() => FilterStatus_Selected(status)}
                  >
                    <Switch
                      size='small'
                      checked={selectedStatus?.id === status.id}
                      sx={{ mr: 1 }}
                    />
                    {Bulb(status.name, true)}
                  </MenuItem>
                ))}
              </Box>
            </Paper>
          </Menu>

          {/* Sorting button */}
          <Tooltip title="Sort">
            <span>

              <IconButton onClick={handleOpenSortMenu} sx={{ ml: 1 }} disabled={!serverResponding || isLoading}>
                <SortIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Menu
            anchorEl={anchorSortEl}
            open={sortMenuOpen}
            onClose={handleCloseSortMenu}
          >
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Typography sx={{
                  fontWeight: 'bold',
                  ml: 1,
                  mt: 1
                }}>Request creation date</Typography>
                <MenuItem
                  selected={sortOrder === 'asc'}
                  onClick={() => Sorting_Selected('asc')}
                >
                  <Switch
                    size="small"
                    checked={sortOrder === 'asc'}
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Ascending (oldest first)" />
                </MenuItem>

                <MenuItem
                  selected={sortOrder === 'desc'}
                  onClick={() => Sorting_Selected('desc')}
                >
                  <Switch
                    size="small"
                    checked={sortOrder === 'desc'}
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary="Descending (newest first)" />
                </MenuItem>
              </Box>
            </Paper>
          </Menu>
        </Box>

        {/* Box with operation buttons: refresh and clear */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Refresh button */}
          <IconButton
            size='medium'
            disabled={!serverResponding || isLoading}
            onClick={RefreshRequests_ButtonClick}
          >
            <Badge
              variant="dot"
              sx={{
                '& .MuiBadge-dot': {
                  backgroundColor: (theme) => {
                    if (RequestsCollectionUpdated === true) {
                      return theme.palette.custompalette.rustyred;
                    }
                    else {
                      return theme.palette.custompalette.persiangreen;
                    }
                  }
                }
              }}
            >
              <CachedOutlinedIcon />
            </Badge>
          </IconButton>

          {/* Snack */}
          <Snackbar
            open={DisableSnack}
            padding={2}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >

            <Paper variant='outlined' sx={{
              width: 300,
              padding: 1,
              margin: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>

              {/* Top bar */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
                alignContent: 'center',
                justifyContent: 'space-between',
                flexDirection: 'rows',
              }}>
                <CampaignIcon sx={{
                  color: (theme) => theme.palette.custompalette.maize
                }} />

                <Typography variant="body2">
                  {SnackMessage}
                </Typography>

                {/* Close button */}
                <IconButton
                  size="small"
                  onClick={CloseSnackAlert_Handler}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Divider></Divider>

              <Typography variant="subtitle2" align="justify" sx={{ mt: 1, color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>
                {SnackDescription}
              </Typography>

              <LinearProgress variant="determinate" sx={{ mt: 1 }} value={SnackProgress} />
            </Paper>
          </Snackbar>

          {/* Clear button */}
          <Tooltip
            title={FiltersAndSettingsChanged ? "Clear filters/sorting" : "No changes to clear"}
          >
            <span>
              <IconButton
                disabled={!serverResponding || isLoading || !FiltersAndSettingsChanged}
                size='medium'
                onClick={ClearSortFilter_ButtonClick}
                sx={(theme) => ({
                  backgroundColor: 'transparent',
                  color: theme.palette.custompalette.indianred,
                  transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.custompalette.indianred, 0.12),
                    color: theme.palette.custompalette.indianred,
                  },
                  '&:active': {
                    backgroundColor: alpha(theme.palette.custompalette.indianred, 0.18),
                  },
                  '&:disabled': {
                    opacity: 0.3,
                    cursor: 'not-allowed',
                    color: theme.palette.action.disabled
                  }
                })}
              >
                <DeleteSweepOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      {/* Divider */}
      <Divider sx={{ mb: 1 }} />

      {/* Main content */}
      <TableContainer sx={{
        flexGrow: 1,
        overflow: 'auto',
        minHeight: 0,
        display: 'flex',
        position: 'relative'
      }}>

        <Box sx={{
          position: 'relative',
          width: '100%',
          height: '100%'
        }}>

          {/* Loading requests! */}
          <Fade
            in={serverResponding && isLoading}
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
                mainlabel="Loading requests..."
                icon={DescriptionOutlinedIcon}
                description={"Homee system is retrieveing requests from database"}
              />
            </Box>
          </Fade>

          {/* No requests in the system! */}
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
                description={"Requests service is not responding right now, try again later."}
              />
            </Box>
          </Fade>

          {/* No requests in the system! */}
          <Fade
            in={serverResponding && !isLoading && requests.length === 0 && absoluteRequestsCount === 0}
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
                mainlabel="No requests!"
                icon={QuizOutlinedIcon}
                description={"No report requests are available right now. To get started, create a new request to generate a custom report based on your data. Once your request is submitted, it will appear here along with its status and results, making it easy to track and review your reports over time."}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant='contained'
                  sx={{
                    minWidth: 180,
                    mt: 2
                  }}
                >Create New Request</Button>
              </Box>
            </Box>
          </Fade>

          {/* No requests for this filters! */}
          <Fade
            in={serverResponding && !isLoading && requests.length === 0 && absoluteRequestsCount > 0}
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
                mainlabel="No requests found!"
                icon={QuestionMarkOutlinedIcon}
                description={"It seems that no report requests meet the selected filter conditions. You can modify the filters to broaden your search or clear them to display all report requests in the system."}
              />
            </Box>
          </Fade>

          {/* Requests list */}
          <Fade
            in={serverResponding && !isLoading && requests.length > 0}
            timeout={{ enter: 600, exit: 300 }}
            unmountOnExit
          >
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              overflow: 'auto'
            }}>
              <Stack spacing={2} sx={{
                padding: 0,
                width: '100%',
                alignItems: 'center'
              }}>
                {requests.map((request) => (
                  <Grow
                    key={request.id}
                    in={true}
                    timeout={400}
                    style={{ transformOrigin: '50% 50%' }}
                  >
                    <Box>
                      <Request
                        key={request.id}
                        id={request.id}
                        raportCreationDate={request.raportCreationDate}
                        raportCompletedDate={request.raportCompletedDate}
                        startDate={request.startDate}
                        endDate={request.endDate}
                        status={request.status}
                        message={request.message}
                        period={request.period}
                        requestedMeasurements={request.requestedMeasurements}
                        requestedLocations={request.requestedLocations}
                        onDelete={(requestDto) => RequestDeleted_Handler(requestDto)}
                      />
                    </Box>
                  </Grow>
                ))}
              </Stack>
            </Box>
          </Fade>
        </Box>

      </TableContainer>

      {/* Divider */}
      <Divider sx={{ mt: 1 }} />

      {/* Pagination */}
      <Paper sx={{
        display: 'flex',
        mr: 1,
        ml: 1,
        padding: 0,
        flexDirection: 'column',
      }}>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          disabled={isLoading}
          count={totalRequests}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={Page_Changed}
          onRowsPerPageChange={RowsPerPage_Changed}
          sx={{
            padding: 0,
            flexShrink: 0,
          }}
        />
      </Paper>
    </Box>
  );
}

export default Raports;