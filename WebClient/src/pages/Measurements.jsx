import * as React from 'react';

// DayJS
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";

// Material UI
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, Divider, Snackbar, Fade, LinearProgress, TableRow, Box, Typography, IconButton, Badge, TextField, Button, Menu, MenuItem, ListItemText, Tooltip, Switch, Autocomplete } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Date Pickers
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// SignalR
import * as SignalR from '@microsoft/signalr';

//  Icons
import { FilterList as FilterListIcon, WifiOffOutlined as WifiOffOutlinedIcon, Campaign as CampaignIcon, CloudOutlined as CloudOutlinedIcon, DeleteSweepOutlined as DeleteSweepOutlinedIcon, CachedOutlined as CachedOutlinedIcon, ViewWeekOutlined as ViewWeekOutlinedIcon, CloudOffOutlined as CloudOffOutlinedIcon, Close as CloseIcon, Sort as SortIcon } from '@mui/icons-material';
import CopyAllIcon from '@mui/icons-material/CopyAll';
//  Components
import InfoLabel from '../components/InfoLabel';
import LoadingLabel from '../components/LoadingLabel';

dayjs.extend(utc);

const columns = [
  { id: 'index', label: 'Index', minWidth: 60 },
  { id: 'date', label: 'Date', minWidth: 250 },
  { id: 'deviceNumber', label: 'Device Number', minWidth: 350 },
  { id: 'deviceName', label: 'Device Name', minWidth: 150 },
  { id: 'locationName', label: 'Location', minWidth: 150 },

  { id: 'temperature', label: 'Air Temperature (T)', minWidth: 300 },
  { id: 'humidity', label: 'Relative Humidity (RH)', minWidth: 300 },
  { id: 'carbonDioxide', label: 'Carbon Dioxide (CO₂)', minWidth: 300 },
  { id: 'volatileOrganicCompounds', label: 'Volatile Organic Compounds (VOC)', minWidth: 300 },
  { id: 'particulateMatter1', label: 'Particulate Matter 1µm', minWidth: 300 },
  { id: 'particulateMatter2v5', label: 'Particulate Matter 2.5µm', minWidth: 300 },
  { id: 'particulateMatter10', label: 'Particulate Matter 10µm', minWidth: 300 },
  { id: 'formaldehyde', label: 'Formaldehyde (HCHO)', minWidth: 300 },
  { id: 'carbonMonoxide', label: 'Carbon Monoxide (CO)', minWidth: 300 },
  { id: 'ozone', label: 'Ozone (O₃)', minWidth: 300 },
  { id: 'ammonia', label: 'Ammonia (NH3)', minWidth: 300 },
  { id: 'airflow', label: 'Air Flow Rate (AFR)', minWidth: 300 },
  { id: 'airIonizationLevel', label: 'Air Ionization Level', minWidth: 300 },
  { id: 'oxygen', label: 'Oxygen Concentration (O₂)', minWidth: 300 },
  { id: 'radon', label: 'Radon Gas Concentration (Rn)', minWidth: 300 },
  { id: 'illuminance', label: 'Illuminance level (Lux)', minWidth: 300 },
  { id: 'soundLevel', label: 'Sound Pressure Level', minWidth: 300 }
];

function FormatDoubleMeasurementValue(value, unit) {
  if (value === null || value === undefined) return '-';
  return `${value} ${unit}`;
}

function FormatIntMeasurementValue(value, unit) {
  if (value === null || value === undefined) return '-';
  return value;
}

export default function Measurements() {
  const [measurements, setMeasurements] = React.useState([]);
  const [locations, setLocations] = React.useState([]);
  const [deviceOptions, setDeviceOptions] = React.useState([]);

  //  Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [TotalMeasurements, setTotalMeasurements] = React.useState(0);
  const [AbsoluteMeasurementsCount, setAbsoluteMeasurementsCount] = React.useState(0);

  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [filterDayFrom, setFilterDayFrom] = React.useState(null);
  const [filterDayTo, setFilterDayTo] = React.useState(null);
  const [RequestsCollectionUpdated, setRequestsCollectionUpdated] = React.useState(false);
  const [searchInputValue, setSearchInputValue] = React.useState('');

  //  Filter menu
  const [anchorFilterEl, setAnchorFilterEl] = React.useState(null);
  const filterMenuOpen = Boolean(anchorFilterEl);
  const handleOpenFilterMenu = (e) => setAnchorFilterEl(e.currentTarget);
  const handleCloseFilterMenu = () => setAnchorFilterEl(null);

  //  Filters and sorting
  const [dateSortOrder, setDateSortOrder] = React.useState('desc');
  const [SearchText, setSearchText] = React.useState('');
  const [FiltersAndSettingsChanged, setFiltersAndSettingsChanged] = React.useState(false);
  const [appliedSettings, setAppliedSettings] = React.useState({
    SearchText: '',
    dateSortOrder: 'desc',
    filterDayFrom: null,
    filterDayTo: null,
    selectedLocation: null
  });

  const [serverResponding, setServerResponding] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [visibleColumnIds, setVisibleColumnIds] = React.useState(() => {
    const basicColumnIds = ['index', 'date', 'deviceNumber', 'deviceName', 'locationName']; // ✅ Only actual basic columns
    const measurementColumnIds = columns.slice(5).map(c => c.id); // ✅ Start from index 5 (temperature)
    return [...basicColumnIds, ...measurementColumnIds];
  });
  const [anchorColsEl, setAnchorColsEl] = React.useState(null);
  const colsMenuOpen = Boolean(anchorColsEl);

  const handleOpenColsMenu = (e) => setAnchorColsEl(e.currentTarget);
  const handleCloseColsMenu = () => setAnchorColsEl(null);

  // sort menu anchor
  const [anchorSortEl, setAnchorSortEl] = React.useState(null);
  const sortMenuOpen = Boolean(anchorSortEl);
  const handleOpenSortMenu = (e) => setAnchorSortEl(e.currentTarget);
  const handleCloseSortMenu = () => setAnchorSortEl(null);

  const measurementColumns = React.useMemo(() => columns.slice(5), []); // ✅ Start from index 5
  const measurementIds = React.useMemo(() => measurementColumns.map(c => c.id), [measurementColumns]);

  //  Alert snack
  const [SnackProgress, setSnackProgress] = React.useState(0);
  const [SnackMessage, setSnackMessage] = React.useState('');
  const [SnackDescription, setSnackDescription] = React.useState('');
  const [DisableSnack, setDisableSnack] = React.useState(false);
  const SnackIntervalRef = React.useRef(null);

  const checkForChanges = React.useCallback(() => {
    const currentSettings = {
      SearchText,
      dateSortOrder,
      filterDayFrom,
      filterDayTo,
      selectedLocation
    };


    const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(appliedSettings);
    setFiltersAndSettingsChanged(hasChanges);
  }, [SearchText, dateSortOrder, filterDayFrom, filterDayFrom, filterDayTo, appliedSettings, selectedLocation]);

  React.useEffect(() => {
    checkForChanges();
  }, [checkForChanges]);

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

  const toggleColumn = (id) => {
    if (!measurementIds.includes(id)) return;
    setVisibleColumnIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  const selectAllMeasurements = () => {
    setVisibleColumnIds(prev => {
      const next = new Set(prev);
      measurementIds.forEach(id => next.add(id));
      return Array.from(next);
    });
  };

  const clearMeasurementSelection = () => {
    setVisibleColumnIds(prev => prev.filter(id => !measurementIds.includes(id)));
  };

  const FilterLocation_Selected = (location) => {
    setSelectedLocation(selectedLocation?.id === location.id ? null : location);
  };

  React.useEffect(() => {
    FetchAllLocations();
  }, []);

  const FetchAllLocations = () => {
    fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/locations/all`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        //console.log(data);
        setLocations(data);
      })
      .catch(err => {
        setLocations([]);
      });
  };

  const FetchDeviceNumbers = React.useCallback(() => {
    fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/devices/all`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        const devices = Array.isArray(data) ? data : data.items || [];
        setDeviceOptions(devices);
      })
      .catch(err => {
        console.error('Failed to fetch devices:', err);
        setDeviceOptions([]);
      });
  }, []);

  React.useEffect(() => {
    FetchDeviceNumbers();
  }, [FetchDeviceNumbers]);

  const FetchMeasurements = React.useCallback(() => {
    setIsLoading(true);

    const params = new URLSearchParams({
      Page: (page + 1).toString(),
      PageSize: rowsPerPage.toString(),
      SortOrder: dateSortOrder,
    });

    if (SearchText) {
      // DeviceNumber is now a Guid, pass it directly if valid
      params.append('DeviceNumber', SearchText);
    }
    if (filterDayFrom) {
      const utcDateStart = dayjs(filterDayFrom).startOf('day').utc().toISOString();
      params.append('DateStart', utcDateStart);
    }
    if (filterDayTo) {
      const utcDateEnd = dayjs(filterDayTo).endOf('day').utc().toISOString();
      params.append('DateEnd', utcDateEnd);
    }
    if (selectedLocation) {
      // LocationHash is now a Guid (the location's id)
      params.append('LocationHash', selectedLocation.hash);
    }

    fetch(`${import.meta.env.VITE_MEASUREMENTS_URL}/measurements/combined/all?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setTimeout(() => {
          const mapped = data.items.map((m, idx) => ({
            index: page * rowsPerPage + idx + 1,
            date: dayjs(m.measurementCaptureDate).format('HH:mm:ss - DD MMMM YYYY'),
            deviceNumber: m.deviceNumber,
            deviceName: m.deviceName,
            locationName: m.locationName,
            temperature: FormatDoubleMeasurementValue(m.temperature, '°C'),
            humidity: FormatDoubleMeasurementValue(m.humidity, '%'),
            carbonDioxide: FormatDoubleMeasurementValue(m.carbonDioxide, 'ppm'),
            volatileOrganicCompounds: FormatDoubleMeasurementValue(m.volatileOrganicCompounds, 'µg/m³'),
            particulateMatter1: FormatDoubleMeasurementValue(m.particulateMatter1, 'µg/m³'),
            particulateMatter2v5: FormatDoubleMeasurementValue(m.particulateMatter2v5, 'µg/m³'),
            particulateMatter10: FormatDoubleMeasurementValue(m.particulateMatter10, 'µg/m³'),
            formaldehyde: FormatDoubleMeasurementValue(m.formaldehyde, 'µg/m³'),
            carbonMonoxide: FormatDoubleMeasurementValue(m.carbonMonoxide, 'ppm'),
            ozone: FormatDoubleMeasurementValue(m.ozone, 'ppb'),
            ammonia: FormatDoubleMeasurementValue(m.ammonia, 'µg/m³'),
            airflow: FormatDoubleMeasurementValue(m.airflow, 'CFM'),
            airIonizationLevel: FormatDoubleMeasurementValue(m.airIonizationLevel, 'ions/m³'),
            oxygen: FormatDoubleMeasurementValue(m.oxygen, '%'),
            radon: FormatDoubleMeasurementValue(m.radon, 'Bq/m³'),
            illuminance: FormatDoubleMeasurementValue(m.illuminance, 'lx'),
            soundLevel: FormatDoubleMeasurementValue(m.soundLevel, 'dB')
          }));
          setMeasurements(mapped);
          setTotalMeasurements(data.totalCount || data.total || data.length || 0);
          setAbsoluteMeasurementsCount(data.absoluteCount)
          setRequestsCollectionUpdated(false);
          setIsLoading(false);
        }, 1200);
      })
      .catch(err => {
        setMeasurements([]);
        setTotalMeasurements(0);
        setAbsoluteMeasurementsCount(0);
        setIsLoading(false);
      });
  }, [page, rowsPerPage, filterDayFrom, filterDayTo, dateSortOrder, selectedLocation, SearchText]);

  React.useEffect(() => {
    FetchMeasurements();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = +event.target.value;
    setRowsPerPage(newSize);
    setPage(0);
  };

  const RefreshMeasurements_ButtonClick = () => {
    setPage(0);
    FetchMeasurements()
  };

  const ClearSortFilter_ButtonClick = () => {
    setSearchText('');
    setFilterDayFrom(null);
    setFilterDayTo(null);
    setDateSortOrder('desc');
    setSelectedLocation(null);

    const defaultSettings = {
      SearchText: '',
      dateSortOrder: 'desc',
      filterDayFrom: null,
      filterDayTo: null,
      selectedLocation: null,
    };

    setAppliedSettings(defaultSettings);
    setFiltersAndSettingsChanged(false);
  };

  const columnsToShow = React.useMemo(() => {
    const basicColumns = columns.slice(0, 5); // ✅ First 5 columns are basic (index, date, deviceNumber, deviceName, locationName)
    const selectedMeasurementColumns = columns.slice(5).filter(c => visibleColumnIds.includes(c.id)); // ✅ Measurements start at index 5
    return [...basicColumns, ...selectedMeasurementColumns];
  }, [visibleColumnIds]);

  const selectedMeasurementCount = measurementIds.filter(id => visibleColumnIds.includes(id)).length;

  //  ---------- SignalR - WebSockets ----------
  React.useEffect(() => {
    let connection = null;

    connection = new SignalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_MEASUREMENTS_URL}/measurementhub`)
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
        connection.on('MeasurementCreated', (dto) => {
          CreateSnackAlert_Handler('Measurement captured', `Device captured new measurement. To apply latest changes refresh collection!`);
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
            <Typography fontWeight='bold' variant='h5'>Measurements</Typography>
            <Typography variant='subtitle2' sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>Browse captured measurements!</Typography>
          </Box>
        </Box>

        <Paper sx={{ display: 'flex', m: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Search field */}
            <Autocomplete
              id="device-search-autocomplete"
              value={SearchText}
              onChange={(event, newValue) => {
                const deviceValue = typeof newValue === 'object' && newValue?.deviceNumber ? newValue.deviceNumber : (newValue || '');
                setSearchText(deviceValue);
              }}
              inputValue={searchInputValue}
              onInputChange={(event, newInputValue) => {
                setSearchInputValue(newInputValue);
                setSearchText(newInputValue);
              }}
              options={deviceOptions}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.deviceNumber || option.toString();
              }}
              renderOption={(props, option) => {
                const { key, ...itemProps } = props;
                return (
                  <Box component="li" key={key} {...itemProps}>
                    <Typography variant="body2">
                      {option.name ? `${option.name} - ${option.deviceNumber}` : option.deviceNumber}
                    </Typography>
                  </Box>
                );
              }}
              freeSolo
              clearOnBlur={false}
              disabled={!serverResponding || isLoading}
              sx={{ minWidth: 450 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search"
                  placeholder="Type or select Device Name"
                  variant="outlined"
                  size="small"
                />
              )}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {/* Date from */}
              <Badge
                variant="dot"
                invisible={!filterDayFrom}
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
                  value={filterDayFrom}
                  onChange={(v) => setFilterDayFrom(v)}
                  clearable
                  slotProps={{
                    textField: { size: 'small', variant: 'outlined' },
                    actionBar: {
                      actions: ['clear']
                    }
                  }}
                  maxDate={filterDayTo || undefined}
                />
              </Badge>

              {/* Date to */}
              <Badge
                variant="dot"
                invisible={!filterDayTo}
                sx={{
                  '& .MuiBadge-dot': {
                    backgroundColor: (theme) => theme.palette.custompalette.maize
                  }
                }}>

                <DatePicker
                  label="To"
                  value={filterDayTo}
                  onChange={(v) => setFilterDayTo(v)}
                  disabled={!serverResponding || isLoading}
                  clearable
                  slotProps={{
                    textField: { size: 'small', variant: 'outlined' },
                    actionBar: {
                      actions: ['clear']
                    }
                  }}
                  minDate={filterDayFrom || undefined}
                />
              </Badge>
            </LocalizationProvider>

            {/* Filters */}
            <Tooltip title="Filter">
              <span>
                <IconButton onClick={handleOpenFilterMenu} disabled={!serverResponding || isLoading}>
                  <FilterListIcon />
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
                {/* List of options for locations */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Typography sx={{
                    fontWeight: 'bold',
                    ml: 1,
                    mt: 1
                  }}>Location</Typography>
                  {locations.map((location) => (
                    <MenuItem
                      key={location.id}
                      size='small'
                      selected={selectedLocation?.id === location.id}
                      onClick={() => FilterLocation_Selected(location)}
                    >
                      <Switch
                        size='small'
                        checked={selectedLocation?.id === location.id}
                        sx={{ mr: 1 }}
                      />
                      <ListItemText primary={location.name} />
                    </MenuItem>
                  ))}
                </Box>
              </Paper>
            </Menu>

            {/* Sorting button */}
            <Tooltip title="Sort">
              <span>
                <IconButton onClick={handleOpenSortMenu}
                  disabled={!serverResponding || isLoading}
                >
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
                  }}>Measurement date</Typography>
                  <MenuItem
                    selected={dateSortOrder === 'asc'}
                    onClick={() => setDateSortOrder('asc')}
                  >
                    <Switch
                      size="small"
                      checked={dateSortOrder === 'asc'}
                      sx={{ mr: 1 }}
                    />
                    <ListItemText primary="Ascending (oldest first)" />
                  </MenuItem>

                  <MenuItem
                    selected={dateSortOrder === 'desc'}
                    onClick={() => setDateSortOrder('desc')}
                  >
                    <Switch
                      size="small"
                      checked={dateSortOrder === 'desc'}
                      sx={{ mr: 1 }}
                    />
                    <ListItemText primary="Descending (newest first)" />
                  </MenuItem>
                </Box>
              </Paper>
            </Menu>

            {/* Measurements */}
            <Tooltip title="Measurements">
              <span>
                <IconButton onClick={handleOpenColsMenu}
                  disabled={!serverResponding || isLoading}
                >
                  <Badge
                    badgeContent={selectedMeasurementCount}
                    invisible={selectedMeasurementCount === 0}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: (theme) => theme.palette.custompalette.maize,
                        color: 'black'
                      }
                    }}>
                    <ViewWeekOutlinedIcon />
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>
            <Menu
              anchorEl={anchorColsEl}
              open={colsMenuOpen}
              onClose={handleCloseColsMenu}
              MenuListProps={{ dense: true }}
              PaperProps={{
                style: {
                  width: 360,
                  height: 420,
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: 400,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ p: 1, paddingLeft: 1.5, display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 0 }}>
                  <Typography sx={{
                    fontWeight: 'bold',
                    //ml: 1,
                    //mt: 1
                  }}>Measurements</Typography>
                </Box>
                {/* scrollable list */}
                <Box
                  sx={{
                    mt: 0,
                    flex: 1,
                    overflowY: 'auto',
                    pr: 1,
                  }}
                >
                  {measurementColumns.map(col => (
                    <MenuItem key={col.id} onClick={() => toggleColumn(col.id)} disableRipple>
                      <Switch checked={visibleColumnIds.includes(col.id)} size="small" />
                      <ListItemText primary={col.label} />
                    </MenuItem>
                  ))}
                </Box>

                {/* footer fixed to bottom */}
                <Box
                  sx={{
                    p: 1,
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                    backgroundColor: '#10151b',
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Button size="small" onClick={selectAllMeasurements} variant="text">Select All</Button>
                    <Button size="small" onClick={clearMeasurementSelection} variant="text">Unselect All</Button>
                  </Box>
                </Box>
              </Paper>
            </Menu>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Refresh button */}
            <IconButton
              size='medium'
              disabled={!serverResponding || isLoading}
              onClick={RefreshMeasurements_ButtonClick}
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
              title={"Clear"}
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

      </Paper>

      {/* Divider */}
      {/* <Divider sx={{ mb: 0 }} /> */}

      <Box sx={{
        flexGrow: 1,
        overflow: 'auto',
        ml: 2,
        mr: 2,
        minHeight: 0,
        display: 'flex',
        position: 'relative'
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
              description={"Measurements service is not responding right now, try again later."}
            />
          </Box>
        </Fade>

        {/* System responding but no measurements in the system! */}
        <Fade
          in={serverResponding && !isLoading && measurements.length === 0 && AbsoluteMeasurementsCount === 0}
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
              mainlabel="No measurements available!"
              icon={CloudOffOutlinedIcon}
              description={"No measurement data found. Please ensure your measurement devices are powered on and connected to begin data collection."}
            />
          </Box>
        </Fade>

        {/* System responding but no measurements for this filters! */}
        <Fade
          in={serverResponding && !isLoading && measurements.length === 0 && AbsoluteMeasurementsCount > 0}
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
              mainlabel="No measurements found!"
              icon={CloudOffOutlinedIcon}
              description={"No measurements match your current filters. Try modifying the search criteria or clearing filters to see more results."}
            />
          </Box>
        </Fade>

        {/* System responding and loading measurements! */}
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
              mainlabel="Loading measurements..."
              icon={CloudOutlinedIcon}
              description={"Homee system is retrieveing measurements from database"}
            />
          </Box>
        </Fade>

        {/* System responding and displaying measurements list */}
        <Fade
          in={serverResponding && !isLoading && measurements.length > 0}
          timeout={{ enter: 600, exit: 300 }}
          unmountOnExit
        >
          <TableContainer sx={{
            flexGrow: 1,
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
            position: 'relative'
          }}>

            <Table stickyHeader aria-label="measurements table">
              <TableHead>
                <TableRow>
                  {/* <TableCell style={{ minWidth: 60, fontWeight: 'bold', textAlign: 'center' }}>Index</TableCell> */}
                  {columnsToShow.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{
                        minWidth: column.minWidth,
                        fontWeight: 'bold',
                        textAlign: ['index', 'date', 'deviceNumber', 'deviceName', 'locationName'].includes(column.id) ? 'left' : 'right'
                      }}
                    >
                      <Typography fontWeight='bold' variant='subtitle2'>
                        {column.label}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {measurements.map((row, idx) => {
                  const tableIndex = page * rowsPerPage + idx + 1;
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.index || `${row.deviceNumber}-${tableIndex}`}
                      sx={{
                        '& .copy-button': {
                          opacity: 0,
                        },
                        '&:hover .copy-button': {
                          opacity: 1
                        }
                      }}
                    >
                      {columnsToShow.map((column) => (
                        <TableCell
                          key={column.id}
                          style={{
                            textAlign: ['index', 'date', 'deviceNumber', 'deviceName', 'locationName'].includes(column.id)
                              ? 'left'
                              : 'right'
                          }}
                        >
                          {(['deviceNumber', 'deviceName', 'locationName'].includes(column.id) && row[column.id] !== '') ?
                            (<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignContent: 'center', alignItems: 'center', gap: 1 }}>
                              <Typography variant='subtitle2'>{row[column.id] ?? ''}</Typography>
                              <Tooltip title="Copy to clipboard" className="copy-button">
                                <span>
                                  <IconButton
                                    size='small'
                                    onClick={() => {
                                      const textToCopy = row[column.id] ?? '';
                                      if (textToCopy) {
                                        navigator.clipboard.writeText(textToCopy).then(() => {
                                          // Optional: Show a brief success message
                                        }).catch(err => {
                                          //console.error('Failed to copy to clipboard:', err);
                                        });
                                      }
                                    }}
                                  >
                                    <CopyAllIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>) :
                            (<Typography variant='subtitle2'>{row[column.id] ?? '-'}</Typography>)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                }
                )}
              </TableBody>
            </Table>


          </TableContainer>
        </Fade>

      </Box>

      {/* Divider */}
      {/* <Divider sx={{ mt: 0 }} /> */}

      {/* Pagination */}
      <Paper sx={{
        display: 'flex',
        mr: 1,
        ml: 1,
        padding: 0,
        flexDirection: 'column',
      }}>
        {/* Pagination fixed at bottom inside the Paper */}
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          disabled={!serverResponding || isLoading}
          count={TotalMeasurements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            padding: 0,
            flexShrink: 0,
          }}
        />
      </Paper>
    </Box>
  );
}