import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Skeleton from '@mui/material/Skeleton';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import { DataGrid } from '@mui/x-data-grid';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import IconButton from '@mui/material/IconButton';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import * as SignalR from '@microsoft/signalr';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MeasurementDetailsTable from '../components/MeasurementDetailsTable';

import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import LoadingLabel from '../components/LoadingLabel';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import InfoLabel from '../components/InfoLabel';
import { WifiOffOutlined as WifiOffOutlinedIcon, CloudOffOutlined as CloudOffOutlinedIcon, CloudOutlined as CloudOutlinedIcon } from '@mui/icons-material';
import { useDebouncedCallback } from 'use-debounce'; // npm install use-debounce
dayjs.extend(customParseFormat);

const columns = [
  { id: 0, name: 'deviceName', label: 'Device Name', minWidth: 120 },
  { id: 1, name: 'date', label: 'Date', minWidth: 50 },
  { id: 2, name: 'location', label: 'Location', minWidth: 120 },
  { id: 3, name: 'deviceNumber', label: 'Device Number', minWidth: 300 },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const cmp = comparator(a[0], b[0]);
    if (cmp !== 0) return cmp;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// Styled table used inside details dialog
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // show grid lines: borders for head & body cells
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#111' : theme.palette.common.black,
    color: theme.palette.common.white,
    borderBottom: `2px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderRight: 'none'
    }
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderRight: 'none'
    }
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // keep borders on the last row so the bottom grid line is visible
}));

// map backend keys -> frontend labels (edit as you like)
const PARAMETER_LABELS = {
  Temperature: 'Temperature',
  Humidity: 'Humidity',
  CO2: 'Carbon Dioxide (CO₂)',
  VOC: 'Volatile Organic Matter',
  ParticulateMatter1: 'Particulate Matter 1µm',
  ParticulateMatter2v5: 'Particulate Matter 2.5µm',
  ParticulateMatter10: 'Particulate Matter 10µm',
  Formaldehyde: 'Formaldehyde',
  CO: 'Carbon Monoxide (CO)',
  O3: 'Ozone (O₃)',
  Ammonia: 'Ammonia',
  Airflow: 'Airflow',
  AirIonizationLevel: 'Air Ionization',
  O2: 'Oxygen level (O₂)',
  Radon: 'Radon',
  Illuminance: 'Illuminance',
  SoundLevel: 'Sound Level'
};

const labelForParameter = (key) => {
  if (!key) return '';
  return PARAMETER_LABELS[key] ?? key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_\-]/g, ' ');
};

function MeasurementsLive() {
  const [devices, setDevices] = React.useState([]);
  const [locations, setLocations] = React.useState([]);
  const [measurements, setMeasurements] = React.useState([]);

  const [devicesServiceResponding, setDevicesServiceResponding] = React.useState(false);
  const [measurementsServiceResponding, setMeasurementsServiceResponding] = React.useState(false);

  {/* Filters */ }
  const [searchText, setSearchText] = React.useState('');
  const [dayFrom, setDayFrom] = React.useState(null);
  const [dayTo, setDayTo] = React.useState(null);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('registerDate');
  const [page, setPage] = React.useState(0);
  // must match one of TablePagination rowsPerPageOptions (25, 50, 100)
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [open, setOpen] = React.useState(false);
  const [selectedDetails, setSelectedDetails] = React.useState(null);
  const [newIds, setNewIds] = React.useState([]);
  const [displayedIds, setDisplayedIds] = React.useState([]);

  const [appliedSettings, setAppliedSettings] = React.useState({
    searchText: '',
    dayTo: null,
    dayFrom: null
  });

  const [FiltersAndSettingsChanged, setFiltersAndSettingsChanged] = React.useState(false);

  const checkForChanges = React.useCallback(() => {
    const currentSettings = {
      searchText,
      dayTo,
      dayFrom
    };


    const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(appliedSettings);
    setFiltersAndSettingsChanged(hasChanges);
  }, [searchText, dayTo, dayFrom]);
  React.useEffect(() => {
    checkForChanges();
  }, [checkForChanges]);


  // Liczba aktywnych filtrów
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (dayFrom) count++;
    if (dayTo) count++;
    return count;
  }, [dayFrom, dayTo]);

  const getRowClassName = React.useCallback((params) => {
    return newIds.includes(params.id) ? 'new-row' : '';
  }, [newIds]);

  // Pobierz urządzenia na start
  const fetchDevices = React.useCallback(() => {
    fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/devices/all`)
      .then(res => res.json())
      .then(data => { setDevices(data); })
      .catch(() => setDevices([]));
  }, []);

  const fetchLocations = React.useCallback(() => {
    fetch(`${import.meta.env.VITE_DEVICES_URL}/devices/locations/all`)
      .then(res => res.json())
      .then(data => { setLocations(data); })
      .catch(() => setLocations([]));
  }, []);

  React.useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  React.useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  //  ---------- SignalR - WebSockets ----------
  React.useEffect(() => {
    let connection = null;

    connection = new SignalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_DEVICES_URL}/devicehub`)
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
      setDevicesServiceResponding(false);
    });

    connection.onreconnected((connectionId) => {
      //console.log('[SIGNALR] Reconnected successfully with connection ID:', connectionId);
      setDevicesServiceResponding(true);
    });

    connection.start()
      .then(() => {
        //console.log('[SIGNALR] Connected to ReportsHub successfully');
        setDevicesServiceResponding(true);
        connection.on('DeviceCreated', (deviceDto) => {

        });
        connection.on('DeviceUpdated', (deviceDto) => {

        });
        connection.on('DeviceStatusChanged', (deviceDto) => {

        });
        connection.on('DeviceDeleted', (deviceDto) => {

        });
      })
      .catch((error) => {
        //console.log('[SIGNALR] Failed to connect to ReportsHub:', error);
        setDevicesServiceResponding(false);
      });

    return () => {
      if (connection) {
        //console.log('[SIGNALR] Disconnecting from ReportsHub...');
        setDevicesServiceResponding(false);
        connection.stop().catch((error) => {
          //console.log('[SIGNALR] Error while disconnecting:', error);
        });
      }
    };
  }, []);

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
      setMeasurementsServiceResponding(false);
    });

    connection.onreconnected((connectionId) => {
      //console.log('[SIGNALR] Reconnected successfully with connection ID:', connectionId);
      setMeasurementsServiceResponding(true);
    });

    connection.start()
      .then(() => {
        //console.log('[SIGNALR] Connected to ReportsHub successfully');
        setMeasurementsServiceResponding(true);
        connection.on('MeasurementCreated', (createdMeasurementSet) => {
          const device = devices.find(d => d.deviceNumber === createdMeasurementSet.deviceNumber);
          const location = locations.find(l => l.hash === createdMeasurementSet.locationHash);

          setMeasurements(prev => [
            {
              id: createdMeasurementSet.id,
              date: dayjs(createdMeasurementSet.measurementCaptureDate).format('HH:mm:ss - DD MMMM YYYY'),
              deviceNumber: createdMeasurementSet.deviceNumber,
              deviceName: device?.name || '',
              location: location?.name || '',
              details: Object.entries({
                Temperature: createdMeasurementSet.temperature,
                Humidity: createdMeasurementSet.humidity,
                CO2: createdMeasurementSet.carbonDioxide,
                VOC: createdMeasurementSet.volatileOrganicCompounds,
                ParticulateMatter1: createdMeasurementSet.particulateMatter1,
                ParticulateMatter2v5: createdMeasurementSet.particulateMatter2v5,
                ParticulateMatter10: createdMeasurementSet.particulateMatter10,
                Formaldehyde: createdMeasurementSet.formaldehyde,
                CO: createdMeasurementSet.carbonMonoxide,
                O3: createdMeasurementSet.ozone,
                Ammonia: createdMeasurementSet.ammonia,
                Airflow: createdMeasurementSet.airflow,
                AirIonizationLevel: createdMeasurementSet.airIonizationLevel,
                O2: createdMeasurementSet.oxygen,
                Radon: createdMeasurementSet.radon,
                Illuminance: createdMeasurementSet.illuminance,
                SoundLevel: createdMeasurementSet.soundLevel
              })
                .filter(([_, val]) => val !== null && val !== undefined)
                .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {})
            },
            ...prev
          ]);
          setNewIds(prev => [createdMeasurementSet.id, ...prev]);
        });
      })
      .catch((error) => {
        //console.log('[SIGNALR] Failed to connect to ReportsHub:', error);
        setMeasurementsServiceResponding(false);
      });

    return () => {
      if (connection) {
        //console.log('[SIGNALR] Disconnecting from ReportsHub...');
        setMeasurementsServiceResponding(false);
        connection.stop().catch((error) => {
          //console.log('[SIGNALR] Error while disconnecting:', error);
        });
      }
    };
  }, [devices, locations]);

  // Debounce search to reduce filtering frequency
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      setSearchText(value);
      setPage(0);
    },
    50 // 300ms delay
  );

  // Memoize pagination props
  const paginationModel = React.useMemo(() => ({
    page,
    pageSize: rowsPerPage
  }), [page, rowsPerPage]);

  const handlePaginationChange = React.useCallback((model) => {
    setPage(model.page);
    setRowsPerPage(model.pageSize);
  }, []);

  const filteredMeasurements = React.useMemo(() => {
    if (measurements.length === 0) return [];

    const searchLower = searchText.toLowerCase();
    const hasSearch = searchText.length > 0;
    const hasDateFrom = dayFrom !== null;
    const hasDateTo = dayTo !== null;

    return measurements.filter((row) => {
      // Early return for search text (most common filter)
      if (hasSearch) {
        const matchesLocation = String(row.location ?? '').toLowerCase().includes(searchLower);
        const matchesDeviceName = String(row.deviceName ?? '').toLowerCase().includes(searchLower);
        const matchesDeviceNumber = String(row.deviceNumber ?? '').toLowerCase().includes(searchLower);
        if (!matchesLocation && !matchesDeviceName && !matchesDeviceNumber) return false;
      }

      // Only parse dates if date filtering is active
      if (hasDateFrom || hasDateTo) {
        let rowDate = null;

        // Parse the row date from the 'date' field (which contains formatted date like "HH:mm - DD MMMM YYYY")
        if (row.date) {
          // Try to parse the formatted date string
          rowDate = dayjs(row.date, ['HH:mm - DD MMMM YYYY', 'DD.MM.YYYY HH:mm:ss', 'DD.MM.YYYY HH:mm', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD']);
        }

        // Date range filtering
        if ((hasDateFrom || hasDateTo) && (!rowDate || !rowDate.isValid())) return false;

        // Compare dates (ignoring time for date-only comparison)
        if (hasDateFrom && rowDate.startOf('day').isBefore(dayFrom.startOf('day'))) return false;
        if (hasDateTo && rowDate.startOf('day').isAfter(dayTo.startOf('day'))) return false;
      }

      return true;
    });
  }, [measurements, searchText, dayFrom, dayTo]);

  const handleRowClick = (details, id, rowData) => {
    setSelectedDetails({ details, rowData });
    setOpen(true);
    // mark as no longer "new"
    setNewIds(prev => prev.filter(newId => newId !== id));
    // remember that this measurement was displayed
    setDisplayedIds(prev => (prev.includes(id) ? prev : [id, ...prev]));
  };

  const handleClose = () => {
    // only close dialog here; clear details after transition finishes
    setOpen(false);
  };

  // update min/max when measurements change, but DO NOT modify user's selected filters
  React.useEffect(() => {
    if (!measurements || measurements.length === 0) {
      // no measurements -> clear range and the From/To values
      setDayFrom(null);
      setDayTo(null);
      return;
    }

    // parse measurement datetime from row.day + row.hour
    const dates = measurements
      .map((m) => {
        const combined = `${m.day} ${m.hour ?? ''}`.trim();
        // try common formats used in this component
        return dayjs(combined, ['DD.MM.YYYY HH:mm:ss', 'DD.MM.YYYY HH:mm', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm']);
      })
      .filter((d) => d.isValid());

    if (dates.length === 0) {
      return;
    }

    // find min / max
    let min = dates[0];
    let max = dates[0];
    for (let i = 1; i < dates.length; i++) {
      if (dates[i].isBefore(min)) min = dates[i];
      if (dates[i].isAfter(max)) max = dates[i];
    }

    // round min down and max up to 5-minute grid so pickers (5-min step) can select around actual measurements
    const roundDown5 = (d) => {
      const base = d.second(0).millisecond(0);
      const delta = base.minute() % 5;
      return base.subtract(delta, 'minute');
    };
    const roundUp5 = (d) => {
      const base = d.second(0).millisecond(0);
      const rem = base.minute() % 5;
      return rem === 0 ? base : base.add(5 - rem, 'minute');
    };

    const roundedMin = roundDown5(min);
    const roundedMax = roundUp5(max);

    // only update available range — do NOT change dayFrom/dayTo (preserve user's selection)
    setMinDate(roundedMin);
    setMaxDate(roundedMax);
  }, [measurements]);

  // delete measurement locally only (no backend request)
  const handleDeleteMeasurement = (id) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
    setNewIds((prev) => prev.filter((n) => n !== id));
    setDisplayedIds((prev) => prev.filter((n) => n !== id));
  };

  const ClearSortFilter_ButtonClick = () => {
    setSearchText('');
    setDayTo(null);
    setDayFrom(null);

    const stxt = document.getElementById('measurement-search-input');
    stxt.value = '';

    const defaultSettings = {
      searchText: '',
      dayTo: null,
      dayFrom: null,
    };

    setAppliedSettings(defaultSettings);
    setFiltersAndSettingsChanged(false);
  };


  // Move this outside the component or memoize properly
  const dataGridColumns = React.useMemo(() => [
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      sortable: false,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => {
        if (newIds.includes(params.row.id)) {
          return (
            <Box component="span" sx={(theme) => ({
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.2, py: 0.4,
              borderRadius: '999px',
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: '0.75rem',
              fontWeight: 700,
            })}>
              <Typography variant='subtitle2'>New</Typography>
            </Box>
          );
        } else if (displayedIds.includes(params.row.id)) {
          return (
            <Box component="span" sx={(theme) => ({
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.2, py: 0.4,
              borderRadius: '999px',
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.text.primary,
              fontSize: '0.75rem',
              fontWeight: 500,
            })}>
              <Typography variant='subtitle2'>Displayed</Typography>
            </Box>
          );
        }
        return null;
      }
    },
    {
      field: 'deviceName',
      headerName: 'Device Name',
      minWidth: 200,
      flex: 1,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row-reverse' }}>
          <Typography variant='subtitle2'>{params.value || '-'}</Typography>
          <Box sx={{
            opacity: 0,
            transition: 'opacity 0.2s ease',
            '.MuiDataGrid-row:hover &': { opacity: 1 }
          }}>
            <Tooltip title="Copy to clipboard">
              <IconButton
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(params.value);
                }}
              >
                <CopyAllIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )
    },
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 200,
      flex: 1,
      headerAlign: 'left',
      align: 'left',
    },
    {
      field: 'location',
      headerName: 'Location',
      minWidth: 200,
      headerAlign: 'right',
      flex: 1,
      align: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
          {params.value && (
            <Box sx={{
              opacity: 0,
              transition: 'opacity 0.2s ease',
              '.MuiDataGrid-row:hover &': { opacity: 1 }
            }}>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size='small'
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(params.value);
                  }}
                >
                  <CopyAllIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Typography variant='subtitle2'>{params.value || '-'}</Typography>
        </Box>
      )
    },
    {
      field: 'deviceNumber',
      headerName: 'Device Number',
      minWidth: 350,
      headerAlign: 'left',
      flex: 1,
      align: 'left',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='subtitle2'>{params.value || '-'}</Typography>
          {params.value && (
            <Box sx={{
              opacity: 0,
              transition: 'opacity 0.2s ease',
              '.MuiDataGrid-row:hover &': { opacity: 1 }
            }}>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size='small'
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(params.value);
                  }}
                >
                  <CopyAllIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 120,
      maxWidth: 120,
      width: 120,
      headerAlign: 'right',
      flex: 1,
      sortable: false,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          height: '100%',
          alignItems: 'center',
          gap: 1,
          opacity: 0,
          transition: 'opacity 0.2s ease',
          '.MuiDataGrid-row:hover &': { opacity: 1 }
        }}>
          <Tooltip title="Details">
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(params.row.details, params.row.id, params.row);
              }}
              sx={(theme) => ({
                color: theme.palette.custompalette.royalblue,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.custompalette.royalblue, 0.12),
                }
              })}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hide">
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMeasurement(params.row.id);
              }}
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
              <VisibilityOffOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [newIds, displayedIds]);

  const HideAllSelectedRows_ButtonClick = () => {
    if (rowSelectionModel.type === 'exclude' && rowSelectionModel.ids.size !== 0) {
      //  Delete not excluded - keep only the excluded ones
      const excludedIds = Array.from(rowSelectionModel.ids);
      setMeasurements((prev) => prev.filter((m) => excludedIds.includes(m.id)));
      setNewIds((prev) => prev.filter((id) => excludedIds.includes(id)));
      setDisplayedIds((prev) => prev.filter((id) => excludedIds.includes(id)));
    }
    else if (rowSelectionModel.type === 'exclude' && rowSelectionModel.ids.size === 0) {
      //Delete all - no exclusions means delete everything
      setMeasurements([]);
      setNewIds([]);
      setDisplayedIds([]);
    }
    else if (rowSelectionModel.type === 'include' && rowSelectionModel.ids.size !== 0) {
      //  Drop selected
      const selectedIds = Array.from(rowSelectionModel.ids);
      setMeasurements((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
      setNewIds((prev) => prev.filter((id) => !selectedIds.includes(id)));
      setDisplayedIds((prev) => prev.filter((id) => !selectedIds.includes(id)));
    }

    // Clear selection after hiding
    setRowSelectionModel({
      type: 'include',
      ids: new Set(),
    });
  };

  const [rowSelectionModel, setRowSelectionModel] = React.useState({
    type: 'include',
    ids: new Set(),
  });

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>

      {/* Search and filtering */}
      <Paper sx={{ display: 'flex', m: 1, justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'column' }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', flexDirection: 'row' }}>

          <Box sx={{ gap: 0, m: 1 }}>
            <Typography fontWeight='bold' variant='h5'>Live Measurements</Typography>
            <Typography variant='subtitle2' sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>View all of currently captured measurements with live feed!</Typography>
          </Box>

          <Box sx={{ gap: 0, m: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant='subtitle1'>Active Devices</Typography>
              <Tooltip title={"Current count of devices that are capturing data. Their status is Online."}>
                <InfoOutlinedIcon sx={{ color: (theme) => theme.palette.custompalette.royalblue, fontSize: 18 }}></InfoOutlinedIcon>
              </Tooltip>
            </Box>

            {devicesServiceResponding === false ? (
              <Skeleton variant="text" height={28} width={150} sx={{ borderRadius: 1 }} />
            ) : devices.length === 0 ? (
              <Typography variant='subtitle1' sx={{ color: (theme) => theme.palette.custompalette.rustyred }}>
                There are no devices in the system!
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.4 }}>

                {/* i/j devices */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.3 }}>
                  <Typography fontWeight='bold' variant='subtitle1' sx={{ color: (theme) => theme.palette.custompalette.persiangreen }}>
                    {devices.filter(device => device.status.type === 'Online').length}
                  </Typography>
                  <Typography variant='subtitle1' sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>
                    /
                  </Typography>
                  <Typography fontWeight='bold' variant='subtitle1' sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>
                    {devices.length}
                  </Typography>
                </Box>

                {/* % of active devices */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 0 }}>
                  <Typography variant='subtitle2' sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>
                    (
                  </Typography>
                  <Typography variant='subtitle2' sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>
                    {Math.round(devices.filter(device => device.status.type === 'Online').length * 100 / devices.length)}
                  </Typography>
                  <Typography variant='subtitle2' sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>
                    % percent active)
                  </Typography>
                </Box>
              </Box>)}
          </Box>
        </Box>

        <Paper sx={{ display: 'flex', m: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge
              variant="dot"
              invisible={!searchText}
              sx={{
                '& .MuiBadge-dot': {
                  backgroundColor: (theme) => theme.palette.custompalette.maize
                }
              }}>
              <TextField
                label="Search"
                variant="outlined"
                //value={searchText}
                size="small"
                id="measurement-search-input"
                sx={{ minWidth: 300 }}
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </Badge>

            <Box>
              <Paper sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {/* From picker (disabled while no measurements). min/max prevent selecting outside available range */}
                  <Badge
                    variant="dot"
                    invisible={!dayFrom}
                    sx={{
                      '& .MuiBadge-dot': {
                        backgroundColor: (theme) => theme.palette.custompalette.maize
                      }
                    }}>

                    <DatePicker
                      label="From"
                      variant="outlined"
                      size="medium"
                      //disabled={!serverResponding || isLoading}
                      value={dayFrom}
                      onChange={(v) => { setDayFrom(v); setPage(0); }}
                      clearable
                      slotProps={{
                        textField: { size: 'small', variant: 'outlined' },
                        actionBar: {
                          actions: ['clear']
                        }
                      }}
                      maxDate={dayTo || undefined}
                    />
                  </Badge>

                  {/* To picker */}
                  <Badge
                    variant="dot"
                    invisible={!dayTo}
                    sx={{
                      '& .MuiBadge-dot': {
                        backgroundColor: (theme) => theme.palette.custompalette.maize
                      }
                    }}>

                    <DatePicker
                      label="To"
                      variant="outlined"
                      size="medium"
                      //disabled={!serverResponding || isLoading}
                      value={dayTo}
                      onChange={(v) => { setDayTo(v); setPage(0); }}
                      clearable
                      slotProps={{
                        textField: { size: 'small', variant: 'outlined' },
                        actionBar: {
                          actions: ['clear']
                        }
                      }}
                      maxDate={dayFrom || undefined}
                    />
                  </Badge>
                </LocalizationProvider>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Refresh button */}
            <Tooltip title={"Hide selected measurements"}>
              <span>

                <IconButton
                  size='medium'
                  disabled={!(rowSelectionModel.type === 'exclude' || rowSelectionModel.ids.size !== 0)}
                  onClick={HideAllSelectedRows_ButtonClick}
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
                  <VisibilityOffOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {/* Clear button */}
            <Tooltip
              title={"Clear filters"}
            >
              <span>
                <IconButton
                  disabled={!measurementsServiceResponding || !FiltersAndSettingsChanged}
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
      {/* <Divider /> */}


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
          in={!measurementsServiceResponding}
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
              mainlabel="Measurements service is not responding"
              icon={WifiOffOutlinedIcon}
              description={"This service is not responding right now, try again later."}
            />
          </Box>
        </Fade>

        {/* System responding but no measurements in the system! */}
        <Fade
          in={measurementsServiceResponding && measurements.length === 0}
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
              mainlabel="Waiting for new measurements..."
              icon={CloudOutlinedIcon}
              description={"Waiting for devices to create new measurement"}
            />
          </Box>
        </Fade>

        {/* System responding but no measurements for this filters! */}
        <Fade
          in={measurementsServiceResponding && measurements.length > 0 && filteredMeasurements.length === 0}
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

        {/* System responding */}
        <Fade
          in={measurementsServiceResponding && measurements.length > 0 && filteredMeasurements.length > 0}
          timeout={{ enter: 600, exit: 300 }}
          unmountOnExit
        >
          <DataGrid
            rows={filteredMeasurements}
            columns={dataGridColumns}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            checkboxSelection
            disableSelectionOnClick
            disableColumnMenu={false}
            disableColumnSelector={true}
            disableColumnFilter={false}
            disableColumnReorder={true}
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setRowSelectionModel(newRowSelectionModel);
            }}
            rowSelectionModel={rowSelectionModel}
            disableColumnResize={false}
            sortingOrder={['asc', 'desc']}
            onSortModelChange={(model) => {
              if (model.length > 0) {
                setOrder(model[0].sort);
                setOrderBy(model[0].field);
              }
            }}
            sx={{
              height: '100%',
              border: 'none',
              backgroundColor: (theme) => theme.palette.custompalette.richblack,
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
                border: 'none',
                backgroundColor: (theme) => theme.palette.custompalette.richblack,
              },
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) => theme.palette.custompalette.richblack,
                border: 'none',
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: (theme) => theme.palette.custompalette.richblack,
                },
              },
              '& .MuiDataGrid-row': {
                backgroundColor: (theme) => theme.palette.custompalette.airsuperiorityblue,
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.05),
                  '& .MuiDataGrid-cell': {
                    backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.05),
                  }
                },
                '&.Mui-selected': {
                  backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.1),
                  '& .MuiDataGrid-cell': {
                    backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.1),
                  },
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.15),
                    '& .MuiDataGrid-cell': {
                      backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.15),
                    }
                  },
                },
              },
              '& .new-row': {
                backgroundColor: (theme) => alpha(theme.palette.custompalette.richblack, 1),
                border: 'none',
                '& .MuiDataGrid-cell': {
                  backgroundColor: (theme) => alpha(theme.palette.custompalette.richblack, 1),
                },
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.05),
                  '& .MuiDataGrid-cell': {
                    backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.05),
                  }
                },
                '&.Mui-selected': {
                  backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.1),
                  '& .MuiDataGrid-cell': {
                    backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.1),
                  },
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.15),
                    '& .MuiDataGrid-cell': {
                      backgroundColor: (theme) => alpha(theme.palette.custompalette.airsuperiorityblue, 0.15),
                    }
                  },
                },
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: (theme) => theme.palette.custompalette.richblack,
              },
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-main': {
                backgroundColor: (theme) => theme.palette.custompalette.richblack,
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: (theme) => theme.palette.custompalette.richblack,
              },
              '& .MuiDataGrid-overlay': {
                backgroundColor: (theme) => theme.palette.custompalette.richblack,
              }
            }}
            getRowClassName={getRowClassName}
          />
        </Fade>
      </Box>

      {/* Okno dialogowe ze szczegółami pomiaru */}
      <Dialog
        open={open}
        onClose={handleClose}
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
        TransitionProps={{ onExited: () => setSelectedDetails(null) }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', padding: 1, paddingLeft: 2 }}>
          <Box component="span">
            <Typography variant='h6'>Measurement details</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({ ml: 'auto' })}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ px: 2, py: 1, height: 500 }}>
          {selectedDetails && (
            <MeasurementDetailsTable
              date={selectedDetails.rowData?.date || 'Unknown'}
              device={{
                id: selectedDetails.rowData?.deviceNumber || 'Unknown',
                name: selectedDetails.rowData?.deviceName || 'Unknown'
              }}
              location={{
                id: 'Unknown', // Add locationId to your data structure if available
                name: selectedDetails.rowData?.location || 'Unknown'
              }}
              temperature={selectedDetails.details?.Temperature || null}
              humidity={selectedDetails.details?.Humidity || null}
              co2={selectedDetails.details?.CO2 || null}
              voc={selectedDetails.details?.VOC || null}
              pm1={selectedDetails.details?.ParticulateMatter1 || null}
              pm25={selectedDetails.details?.ParticulateMatter2v5 || null}
              p10={selectedDetails.details?.ParticulateMatter10 || null}
              formaldehyde={selectedDetails.details?.Formaldehyde || null}
              co={selectedDetails.details?.CO || null}
              o3={selectedDetails.details?.O3 || null}
              ammonia={selectedDetails.details?.Ammonia || null}
              airflow={selectedDetails.details?.Airflow || null}
              ail={selectedDetails.details?.AirIonizationLevel || null}
              o2={selectedDetails.details?.O2 || null}
              radon={selectedDetails.details?.Radon || null}
              illuminance={selectedDetails.details?.Illuminance || null}
              soundlevel={selectedDetails.details?.SoundLevel || null}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MeasurementsLive;