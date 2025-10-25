import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import DialogActions from '@mui/material/DialogActions';
import * as SignalR from '@microsoft/signalr';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { alpha } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';

const columns = [
  { id: 'day', label: 'Day', minWidth: 50 },
  { id: 'hour', label: 'Hour', minWidth: 50 },
  { id: 'deviceName', label: 'Device Name', minWidth: 120 },
  { id: 'deviceNumber', label: 'Device Number', minWidth: 300 },
  { id: 'location', label: 'Location', minWidth: 120 }
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
  {/* Filters */}
  const [searchText, setSearchText] = React.useState('');
  const [minDate, setMinDate] = React.useState(null);
  const [maxDate, setMaxDate] = React.useState(null);
  const [dayFrom, setDayFrom] = React.useState(null);
  const [dayTo, setDayTo] = React.useState(null);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('registerDate');
  const [page, setPage] = React.useState(0);
  // must match one of TablePagination rowsPerPageOptions (25, 50, 100)
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [measurements, setMeasurements] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedDetails, setSelectedDetails] = React.useState(null);
  const [newIds, setNewIds] = React.useState([]);
  const [displayedIds, setDisplayedIds] = React.useState([]);
  const [timeFrom, setTimeFrom] = React.useState(null);
  const [timeTo, setTimeTo] = React.useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);
  const [devices, setDevices] = React.useState([]);
  const [filterMode, setFilterMode] = React.useState('deviceNumber'); // 'deviceNumber' or 'deviceName'

  // Liczba aktywnych filtrów
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (dayFrom) count++;
    if (dayTo) count++;
    if (timeFrom) count++;
    if (timeTo) count++;
    return count;
  }, [dayFrom, dayTo, timeFrom, timeTo]);

  const HandleSearchChanged = (newSearchText) => {
    setSearchText(newSearchText);
  };

  // Pobierz urządzenia na start
  const fetchDevices = React.useCallback(() => {
    fetch('https://localhost:6061/devices/all')
      .then(res => res.json())
      .then(data => setDevices(data))
      .catch(() => setDevices([]));
  }, []);

  React.useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Obsługa websocket dla urządzeń (aktualizacja listy urządzeń)
  React.useEffect(() => {
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl('https://localhost:6061/devicehub')
      .withAutomaticReconnect()
      .configureLogging(SignalR.LogLevel.None)
      .build();

    connection.start()
      .then(() => {
        connection.on('DeviceCreated', fetchDevices);
        connection.on('DeviceDeleted', fetchDevices);
        connection.on('DeviceUpdated', fetchDevices);
      })
      .catch(() => {});

    return () => {
      connection.stop();
    };
  }, [fetchDevices]);

  // SignalR dla pomiarów
  React.useEffect(() => {
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl('https://localhost:6063/measurementhub')
      .withAutomaticReconnect()
      .configureLogging(SignalR.LogLevel.None)
      .build();

    connection.start()
      .then(() => {
        connection.on('MeasurementCreated', (createdMeasurementSet) => {
          const dateObj = new Date(createdMeasurementSet.registerDate);
          const device = devices.find(d => d.deviceNumber === createdMeasurementSet.deviceNumber);

          console.log(`[MEASUREMENT CREATED] - ${JSON.stringify(createdMeasurementSet, null, 2)}`);

          setMeasurements(prev => [
            {
              id: createdMeasurementSet.id,
              day: dayjs(dateObj).format('DD.MM.YYYY'),
              hour: dayjs(dateObj).format('HH:mm:ss'),
              deviceNumber: createdMeasurementSet.deviceNumber,
              deviceName: device?.name || '',
              location: device?.location.name || '',
              details: Object.entries({
                Temperature: createdMeasurementSet.temperature,
                Humidity: createdMeasurementSet.humidity,
                CO2: createdMeasurementSet.cO2,
                VOC: createdMeasurementSet.voc,
                ParticulateMatter1: createdMeasurementSet.particulateMatter1,
                ParticulateMatter2v5: createdMeasurementSet.particulateMatter2v5,
                ParticulateMatter10: createdMeasurementSet.particulateMatter10,
                Formaldehyde: createdMeasurementSet.formaldehyde,
                CO: createdMeasurementSet.co,
                O3: createdMeasurementSet.o3,
                Ammonia: createdMeasurementSet.ammonia,
                Airflow: createdMeasurementSet.airflow,
                AirIonizationLevel: createdMeasurementSet.airIonizationLevel,
                O2: createdMeasurementSet.o2,
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
      .catch(() => {});

    return () => {
      connection.stop();
    };
  }, [devices]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setTimeFrom(null);
    setTimeTo(null);
    setDayFrom(null);
    setDayTo(null);
    setSearchText('');
    setPage(0);
  };

  const handleFilterModeChange = (event) => {
    setFilterMode(event.target.value);
  };

  const filteredMeasurements = React.useMemo(() => {
    // interpret user's picks as inclusive whole-day range

    return measurements.filter((row) => {
      // build a full datetime from row.day + row.hour when available
      let rowDate = null;
      if (row.day && row.hour) {
        rowDate = dayjs(
          `${row.day} ${row.hour}`,
          ['DD.MM.YYYY HH:mm:ss', 'DD.MM.YYYY HH:mm', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'],
        );
      } else if (row.day) {
        rowDate = dayjs(row.day, ['DD.MM.YYYY', 'YYYY-MM-DD']);
      }

      // date range filtering (inclusive)
      if (dayFrom || dayTo) {
        if (!rowDate || !rowDate.isValid()) return false;
        if (dayFrom && rowDate.isBefore(dayFrom)) return false;
        if (dayTo && rowDate.isAfter(dayTo)) return false;
      }

      // time-of-day filtering (if you use selects/strings for timeFrom/timeTo)
      if (timeFrom || timeTo) {
        if (!row.hour) return false;
        const rowTime = dayjs(row.hour, ['HH:mm:ss', 'HH:mm']);
        if (!rowTime.isValid()) return false;
        if (timeFrom) {
          const tf = dayjs(timeFrom, ['HH:mm:ss', 'HH:mm']);
          if (!tf.isValid()) return false;
          if (rowTime.isBefore(tf)) return false;
        }
        if (timeTo) {
          const tt = dayjs(timeTo, ['HH:mm:ss', 'HH:mm']);
          if (!tt.isValid()) return false;
          if (rowTime.isAfter(tt)) return false;
        }
      }

      // searchText should match any of: location, deviceName, deviceNumber
      if (searchText) {
        const s = searchText.toLowerCase();
        const matchesLocation = String(row.location ?? '').toLowerCase().includes(s);
        const matchesDeviceName = String(row.deviceName ?? '').toLowerCase().includes(s);
        const matchesDeviceNumber = String(row.deviceNumber ?? '').toLowerCase().includes(s);
        if (!matchesLocation && !matchesDeviceName && !matchesDeviceNumber) return false;
      }

      return true;
    });
  }, [measurements, timeFrom, timeTo, dayFrom, dayTo, searchText]);

  const sortedRows = React.useMemo(
    () =>
      stableSort(filteredMeasurements, getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredMeasurements, searchText]
  );

  const handleRowClick = (details, id) => {
    setSelectedDetails(details);
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
      setMinDate(null);
      setMaxDate(null);
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
      setMinDate(null);
      setMaxDate(null);
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

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>

      {/* Search and filtering */}
      <Paper>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              id="measurement-search-input"
              sx={{ minWidth: 300 }}
              onChange={(e) => {
                HandleSearchChanged(e.target.value);
                setPage(0); // reset pagination so new filter is immediately visible
              }}
            />
          <Badge
            color="primary"
            badgeContent={activeFiltersCount > 0 ? activeFiltersCount : null}
            sx={{ '& .MuiBadge-badge': { fontSize: 12, padding: '0 6px' } }}>
            <IconButton onClick={() => setFilterDialogOpen(true)}>
              <FilterListIcon />
            </IconButton>
          </Badge>
        </Box>
      </Paper>
      
      {/* Divider */}
      <Divider />

      {/* Table and pagination content */}
      <Paper sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <TableContainer sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
          <Collapse in={filteredMeasurements.length === 0} timeout={300} unmountOnExit>
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
              <Paper elevation={0} sx={{ width: '100%', textAlign: 'center', py: 6, bgcolor: 'transparent' }}>
                <SearchOffIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 1 }} />
                <Typography variant="h6">No measurements found!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  If you have just started the system, please wait a moment for measurements to arrive.
                </Typography>
              </Paper>
            </Box>
          </Collapse>

          <Collapse in={filteredMeasurements.length > 0} timeout={400} unmountOnExit>
            <Table stickyHeader aria-label="measurements table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={(theme) => ({
                      minWidth: 10,
                      maxWidth: 40,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      px: 1,
                    })}
                  >
                    Index
                  </TableCell>
                  <TableCell style={{ minWidth: 80, fontWeight: 'bold', textAlign: 'center' }}>
                    Status
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                      sortDirection={orderBy === column.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell
                    sx={(theme) => ({
                      minWidth: 40,
                      maxWidth: 40,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      borderLeft: `1px solid ${theme.palette.divider}` // vertical separator before Actions
                    })}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.map((row, idx) => {
                  const tableIndex = page * rowsPerPage + idx + 1;
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      onClick={() => handleRowClick(row.details, row.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ pr: 1, textAlign: 'center' }}>
                        <span>{tableIndex}</span>
                      </TableCell>
                      <TableCell sx={{ pr: 1, textAlign: 'center' }}>
                        {newIds.includes(row.id) ? (
                          <Box
                            component="span"
                            sx={(theme) => ({
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 1.2,
                              py: 0.4,
                              borderRadius: '999px',
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            })}
                          >
                            New
                          </Box>
                        ) : displayedIds.includes(row.id) ? (
                          <Box
                            component="span"
                            sx={(theme) => ({
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 1.2,
                              py: 0.4,
                              borderRadius: '999px',
                              bgcolor: theme.palette.action.disabledBackground,
                              color: theme.palette.text.primary,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            })}
                          >
                            Displayed
                          </Box>
                        ) : null}
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column.id}>
                          {typeof row[column.id] === 'object' && row[column.id] !== null
                            ? JSON.stringify(row[column.id])
                            : row[column.id] ?? ''}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={(theme) => ({
                          pr: 1,
                          textAlign: 'center',
                          borderLeft: `1px solid ${theme.palette.divider}` // vertical separator
                        })}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          sx={(theme) => ({
                            backgroundColor: 'transparent',
                            color: theme.palette.error.main,
                            transition: theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.12),
                              color: theme.palette.error.dark,
                            },
                            '&:active': {
                              backgroundColor: alpha(theme.palette.error.main, 0.18),
                            },
                          })}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeasurement(row.id);
                          }}
                        >
                          <VisibilityOffIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Puste wiersze dla stałej wysokości */}
                {sortedRows.length < rowsPerPage && Array.from({ length: rowsPerPage - sortedRows.length }).map((_, i) => (
                  <TableRow key={`empty-${i}`} style={{ height: 53 }}>
                    <TableCell />{/* Index */}
                    <TableCell />{/* Status */}
                    {columns.map((column) => (
                      <TableCell key={column.id} />
                    ))}
                    <TableCell sx={(theme) => ({ borderLeft: `1px solid ${theme.palette.divider}` })} />{/* Actions (last) */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableContainer>

      <Divider/>

      {/* Pagination */}
       <TablePagination
         rowsPerPageOptions={[25, 50, 100]}
         component="div"
         count={filteredMeasurements.length}
         rowsPerPage={rowsPerPage}
         page={page}
         onPageChange={handleChangePage}
         onRowsPerPageChange={handleChangeRowsPerPage}
         sx={{ 
           flexShrink: 0,  // prevent pagination from shrinking
         }}
       />
      </Paper>

      {/* Okno dialogowe z filtrami */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', padding: 2, paddingLeft: 2, paddingRight: 2 }}>
          <Box component="span">Filters</Box>
          <IconButton
            aria-label="close"
            onClick={() => setFilterDialogOpen(false)}
            sx={(theme) => ({ ml: 'auto' })}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ padding: 2}}>
          <Box>
            <Paper sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* From picker (disabled while no measurements). min/max prevent selecting outside available range */}
                <DateTimePicker
                  label="From"
                  value={dayFrom ?? null}
                  onChange={(v) => {
                    // normalize picker output to a dayjs instance or null
                    setDayFrom(v ? dayjs(v) : null);
                    setPage(0); // apply filter immediately
                  }}
                   minDateTime={minDate ?? undefined}
                   maxDateTime={maxDate ?? undefined}
                   disabled={!minDate || !maxDate}
                   inputFormat="DD.MM.YYYY HH:mm:ss"         // show DD.MM.YYYY with seconds
                   views={['day','month','year','hours','minutes']}
                   minutesStep={5} // allow selecting only 5-minute intervals
                   ampm={false}
                   slotProps={{
                     textField: {
                       size: 'small',
                       variant: 'outlined',
                       helperText: !minDate ? 'No measurements available' : "Select start date"
                     }
                   }}
                 />

                 {/* To picker */}
                 <DateTimePicker
                   label="To"
                   value={dayTo ?? null}
                   onChange={(v) => {
                     // normalize picker output to a dayjs instance or null
                     setDayTo(v ? dayjs(v) : null);
                     setPage(0); // apply filter immediately
                   }}
                   minDateTime={minDate ?? undefined}
                   maxDateTime={maxDate ?? undefined}
                   disabled={!minDate || !maxDate}
                   inputFormat="DD.MM.YYYY HH:mm:ss"
                   views={['year','month','day','hours','minutes']}
                   minutesStep={5}
                   ampm={false}
                   slotProps={{
                     textField: {
                       size: 'small',
                       variant: 'outlined',
                       helperText: !maxDate ? 'No measurements available' : "Select end date"
                     }
                   }}
                 />
              </LocalizationProvider>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ margin: 1 }}>
          <Button onClick={handleClearFilters} variant="outlined" startIcon={<DeleteIcon />}>Clear</Button>
        </DialogActions>
      </Dialog>

      {/* Okno dialogowe ze szczegółami pomiaru */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        TransitionProps={{ onExited: () => setSelectedDetails(null) }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', padding: 1, paddingLeft: 2 }}>
          <Box component="span">Details</Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({ ml: 'auto' })}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ px: 2, py: 1 }}>
          {selectedDetails ? (
            <TableContainer
              component={Paper}
              sx={(theme) => ({
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                maxHeight: '60vh',
                overflow: 'auto',
              })}
            >
              <Table size="small" aria-label="details table" stickyHeader sx={{ borderCollapse: 'collapse', width: '100%' }}>
                 <TableHead>
                   <TableRow>
                     <StyledTableCell>Parameter</StyledTableCell>
                     <StyledTableCell align="right">Value</StyledTableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {Object.entries(selectedDetails).map(([key, value]) => (
                     <StyledTableRow key={key}>
                       <StyledTableCell component="th" scope="row">
                         {labelForParameter(key)}
                       </StyledTableCell>
                       <StyledTableCell align="right">
                         {value?.value ?? ''}{value?.unit ? ` ${value.unit}` : ''}
                       </StyledTableCell>
                     </StyledTableRow>
                   ))}
                 </TableBody>
               </Table>
             </TableContainer>
           ) : (
             <Typography color="text.secondary">Brak szczegółowych danych.</Typography>
           )}
         </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MeasurementsLive;