import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
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
import FilterListIcon from '@mui/icons-material/FilterList';
import DialogActions from '@mui/material/DialogActions';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const columns = [
  { id: 'day', label: 'Dzień', minWidth: 110 },
  { id: 'hour', label: 'Godzina', minWidth: 80 },
  { id: 'deviceNumber', label: 'Device Number', minWidth: 220 },
  { id: 'deviceName', label: 'Device Name', minWidth: 220 },
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

function MeasurementsLive() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('registerDate');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [filters, setFilters] = React.useState({
    registerDate: '',
    deviceId: '',
    deviceNumber: '',
    location: ''
  });

  const [measurements, setMeasurements] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedDetails, setSelectedDetails] = React.useState(null);
  const [newIds, setNewIds] = React.useState([]);
  const [timeFrom, setTimeFrom] = React.useState(null);
  const [timeTo, setTimeTo] = React.useState(null);
  const [dayFrom, setDayFrom] = React.useState(null);
  const [dayTo, setDayTo] = React.useState(null);
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
    Object.values(filters).forEach(val => {
      if (val) count++;
    });
    return count;
  }, [dayFrom, dayTo, timeFrom, timeTo, filters]);


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
    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:6061/devicehub')
      .withAutomaticReconnect()
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
    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:6063/measurementhub')
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('MeasurementCreated', (createdMeasurementSet) => {
          const dateObj = new Date(createdMeasurementSet.registerDate);

          console.log(devices);
          console.log(createdMeasurementSet);

          // Pobierz lokalizację na podstawie deviceNumber
          const device = devices.find(d => d.deviceNumber === createdMeasurementSet.deviceNumber);

          console.log(device);

          setMeasurements(prev => [
            {
              id: createdMeasurementSet.id, // <-- to jest kluczowe!
              day: dayjs(dateObj).format('YYYY-MM-DD'),
              hour: dayjs(dateObj).format('HH:mm'),
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

  const handleFilterChange = (columnId) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: event.target.value
    }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      registerDate: '',
      deviceId: '',
      deviceNumber: '',
      location: ''
    });
    setTimeFrom(null);
    setTimeTo(null);
    setDayFrom(null);
    setDayTo(null);
  };

  const handleFilterModeChange = (event) => {
    setFilterMode(event.target.value);
    setFilters((prev) => ({
      ...prev,
      deviceNumber: '',
      deviceName: ''
    }));
  };

  const filteredMeasurements = React.useMemo(() => {
    return measurements.filter((row) => {
      // Filtrowanie po dniu
      if (dayFrom || dayTo) {
        if (dayFrom && dayjs(row.day).isBefore(dayjs(dayFrom), 'day')) return false;
        if (dayTo && dayjs(row.day).isAfter(dayjs(dayTo), 'day')) return false;
      }
      // Filtrowanie po godzinie
      if (timeFrom || timeTo) {
        if (timeFrom && row.hour < dayjs(timeFrom).format('HH:mm')) return false;
        if (timeTo && row.hour > dayjs(timeTo).format('HH:mm')) return false;
      }
      // Pozostałe filtry
      return columns.every((col) => {
        const filterValue = filters[col.id];
        if (!filterValue) return true;
        // Tylko jeden filtr: deviceNumber lub deviceName
        if (col.id === 'deviceNumber' && filterMode !== 'deviceNumber') return true;
        if (col.id === 'deviceName' && filterMode !== 'deviceName') return true;
        return row[col.id]?.toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [filters, measurements, timeFrom, timeTo, dayFrom, dayTo, filterMode]);

  const sortedRows = React.useMemo(
    () =>
      stableSort(filteredMeasurements, getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredMeasurements]
  );

  const handleRowClick = (details, id) => {
    setSelectedDetails(details);
    setOpen(true);
    setNewIds(prev => prev.filter(newId => newId !== id));
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDetails(null);
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Measurements
        </Typography>
        <Badge
          color="primary"
          badgeContent={activeFiltersCount > 0 ? activeFiltersCount : null}
          sx={{ '& .MuiBadge-badge': { fontSize: 12, padding: '0 6px' } }}
        >
          <IconButton onClick={() => setFilterDialogOpen(true)}>
            <FilterListIcon />
          </IconButton>
        </Badge>
      </Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ minHeight: `${rowsPerPage * 53 + 56}px`, maxHeight: `${rowsPerPage * 53 + 56}px` }}>
          <Table stickyHeader aria-label="measurements table">
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: 60, fontWeight: 'bold' }}>
                  Index
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
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: '#888' }}>
                    Brak pomiarów do wyświetlenia.
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row, idx) => {
                  const tableIndex = page * rowsPerPage + idx + 1;
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      onClick={() => handleRowClick(row.details, row.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {/* Numer wystąpienia z badge jeśli nowy */}
                      <TableCell sx={{ position: 'relative', pr: 3 }}>
                        <span>{tableIndex}</span>
                        {newIds.includes(row.id) && (
                          <Badge
                            color="primary"
                            badgeContent="New"
                            sx={{
                              position: 'absolute',
                              top: '30%',
                              right: '70%',
                              transform: 'translateY(-50%)',
                              '& .MuiBadge-badge': { fontSize: 12, padding: '0 6px' }
                            }}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                          />
                        )}
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column.id}>
                          {typeof row[column.id] === 'object' && row[column.id] !== null
                            ? JSON.stringify(row[column.id])
                            : row[column.id] ?? ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
              {/* Puste wiersze dla stałej wysokości */}
              {sortedRows.length < rowsPerPage && Array.from({ length: rowsPerPage - sortedRows.length }).map((_, i) => (
                <TableRow key={`empty-${i}`} style={{ height: 53 }}>
                  <TableCell />
                  {columns.map((column) => (
                    <TableCell key={column.id} />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredMeasurements.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {/* Okno dialogowe z filtrami */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Filtry</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2">Dzień</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <DatePicker
                    label="Od dnia"
                    value={dayFrom}
                    onChange={setDayFrom}
                    slotProps={{ textField: { size: 'small', variant: 'standard' } }}
                  />
                  <DatePicker
                    label="Do dnia"
                    value={dayTo}
                    onChange={setDayTo}
                    slotProps={{ textField: { size: 'small', variant: 'standard' } }}
                  />
                </Box>
                <Typography variant="subtitle2">Godzina</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TimePicker
                    label="Od godziny"
                    value={timeFrom}
                    onChange={setTimeFrom}
                    ampm={false}
                    slotProps={{ textField: { size: 'small', variant: 'standard' } }}
                  />
                  <TimePicker
                    label="Do godziny"
                    value={timeTo}
                    onChange={setTimeTo}
                    ampm={false}
                    slotProps={{ textField: { size: 'small', variant: 'standard' } }}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2">Pozostałe</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                <TextField
                  select
                  label="Filtruj po"
                  value={filterMode}
                  onChange={handleFilterModeChange}
                  variant="standard"
                  size="small"
                  sx={{ minWidth: 120 }}
                  SelectProps={{ native: true }}
                >
                  <option value="deviceNumber">Device Number</option>
                  <option value="deviceName">Device Name</option>
                </TextField>
                <TextField
                  key={filterMode}
                  label={filterMode === 'deviceNumber' ? 'Device Number' : 'Device Name'}
                  variant="standard"
                  value={filters[filterMode]}
                  onChange={handleFilterChange(filterMode)}
                  placeholder={`Filtruj`}
                  size="small"
                  sx={{ minWidth: 220 }}
                />
              </Box>
              {columns.filter(col => col.id !== 'day' && col.id !== 'hour' && col.id !== 'deviceNumber' && col.id !== 'deviceName').map((column) => (
                <TextField
                  key={column.id}
                  label={column.label}
                  variant="standard"
                  value={filters[column.id]}
                  onChange={handleFilterChange(column.id)}
                  placeholder={`Filtruj`}
                  size="small"
                  sx={{ minWidth: column.minWidth, mt: 1 }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters}>Wyczyść filtry</Button>
          <Button onClick={() => setFilterDialogOpen(false)}>Zamknij</Button>
        </DialogActions>
      </Dialog>
      {/* Okno dialogowe ze szczegółami pomiaru */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Szczegóły pomiaru</DialogTitle>
        <DialogContent>
          {selectedDetails ? (
            <List>
              {Object.entries(selectedDetails).map(([key, value]) => (
                <ListItem key={key}>
                  <ListItemText
                    primary={key}
                    secondary={`${value.value} ${value.unit}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">Brak szczegółowych danych.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MeasurementsLive;