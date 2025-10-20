import * as React from 'react';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

dayjs.extend(utc);

const columns = [
  { id: 'day', label: 'Day', minWidth: 110 },
  { id: 'hour', label: 'Hour', minWidth: 80 },
  { id: 'deviceNumber', label: 'Device Number', minWidth: 300 },
  { id: 'deviceName', label: 'Device Name', minWidth: 140 },
  { id: 'location', label: 'Location', minWidth: 140 },

  // All measurement types as columns (these will be toggleable)
  { id: 'temperature', label: 'Temperature', minWidth: 110 },
  { id: 'humidity', label: 'Humidity', minWidth: 110 },
  { id: 'cO2', label: 'CO₂', minWidth: 100 },
  { id: 'voc', label: 'VOC', minWidth: 100 },
  { id: 'particulateMatter1', label: 'PM1', minWidth: 100 },
  { id: 'particulateMatter2v5', label: 'PM2.5', minWidth: 100 },
  { id: 'particulateMatter10', label: 'PM10', minWidth: 100 },
  { id: 'formaldehyde', label: 'Formaldehyde', minWidth: 120 },
  { id: 'co', label: 'CO', minWidth: 80 },
  { id: 'o3', label: 'O₃', minWidth: 80 },
  { id: 'ammonia', label: 'Ammonia', minWidth: 100 },
  { id: 'airflow', label: 'Airflow', minWidth: 100 },
  { id: 'airIonizationLevel', label: 'Air Ionization', minWidth: 130 },
  { id: 'o2', label: 'O₂', minWidth: 80 },
  { id: 'radon', label: 'Radon', minWidth: 100 },
  { id: 'illuminance', label: 'Illuminance', minWidth: 100 },
  { id: 'soundLevel', label: 'Sound Level', minWidth: 100 }
];

function formatMeasure(m) {
  if (!m) return '';
  const value = typeof m.value === 'number' ? Number(m.value).toFixed(2) : m.value;
  return `${value}${m.unit ? ' ' + m.unit : ''}`;
}

export default function Measurements() {
  const [measurements, setMeasurements] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // pickers values (initialized to null until backend returns)
  const [filterDayFrom, setFilterDayFrom] = React.useState(null);
  const [filterDayTo, setFilterDayTo] = React.useState(null);

  // backend-provided hard limits
  const [dateRangeMin, setDateRangeMin] = React.useState(null);
  const [dateRangeMax, setDateRangeMax] = React.useState(null);

  const [searchText, setSearchText] = React.useState('');

  // indicates whether date-range (min/max) is being loaded
  const [dateRangeLoading, setDateRangeLoading] = React.useState(true);

  // applied filters (used for backend query after "Zastosuj filtry")
  const [appliedFilters, setAppliedFilters] = React.useState({
    text: '',
    dayFrom: null,
    dayTo: null
  });
  // applied sort (used in backend query)
  const [appliedSortOrder, setAppliedSortOrder] = React.useState('desc');

  // visible columns state
  const [visibleColumnIds, setVisibleColumnIds] = React.useState(() => columns.map(c => c.id));
  const [anchorColsEl, setAnchorColsEl] = React.useState(null);
  const colsMenuOpen = Boolean(anchorColsEl);

  const handleOpenColsMenu = (e) => setAnchorColsEl(e.currentTarget);
  const handleCloseColsMenu = () => setAnchorColsEl(null);

  // sort menu anchor
  const [anchorSortEl, setAnchorSortEl] = React.useState(null);
  const sortMenuOpen = Boolean(anchorSortEl);
  const handleOpenSortMenu = (e) => setAnchorSortEl(e.currentTarget);
  const handleCloseSortMenu = () => setAnchorSortEl(null);

  // measurement-only columns (everything after the first 5 entries)
  const measurementColumns = React.useMemo(() => columns.slice(5), []);
  const measurementIds = React.useMemo(() => measurementColumns.map(c => c.id), [measurementColumns]);

  const toggleColumn = (id) => {
    // only allow toggling of measurement columns
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

  // sorting by date: this is the UI selection in sort menu (immediate)
  const [dateSortOrder, setDateSortOrder] = React.useState('desc');


  // fetch uses appliedFilters/appliedSortOrder + pagination
  const fetchMeasurements = React.useCallback(async (pageNumber = 1, pageSize = rowsPerPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('Page', pageNumber);
      params.append('PageSize', pageSize);

      //const searchInput = document.getElementById('measurement-search-input')?.value ?? '';
      if (searchText) {
        params.append('Search', searchText);
      }

      if(filterDayTo){
        const filterDateToISO = filterDayTo.utc().toISOString();
        params.append('DateTo', filterDateToISO);
      }

      if(filterDayFrom){
        const filterDatyFromISO = filterDayFrom.utc().toISOString();
        params.append('DateFrom', filterDatyFromISO);
      }

      if (dateSortOrder) params.append('SortOrder', dateSortOrder);

      //console.log(params.toString()); 

      const url = `https://localhost:6063/measurements/query?${params.toString()}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const items = Array.isArray(json.items) ? json.items : (Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
      const mapped = items.map((m) => ({
        id: m.id,
        day: dayjs(m.registerDate).format('YYYY-MM-DD'),
        hour: dayjs(m.registerDate).format('HH:mm:ss'),
        deviceNumber: m.deviceNumber ?? '',
        deviceName: m.deviceName ?? '',
        location: m.location ?? '',
        // measurement columns as preformatted strings
        temperature: formatMeasure(m.temperature),
        humidity: formatMeasure(m.humidity),
        cO2: formatMeasure(m.cO2),
        voc: formatMeasure(m.voc),
        particulateMatter1: formatMeasure(m.particulateMatter1),
        particulateMatter2v5: formatMeasure(m.particulateMatter2v5),
        particulateMatter10: formatMeasure(m.particulateMatter10),
        formaldehyde: formatMeasure(m.formaldehyde),
        co: formatMeasure(m.co),
        o3: formatMeasure(m.o3),
        ammonia: formatMeasure(m.ammonia),
        airflow: formatMeasure(m.airflow),
        airIonizationLevel: formatMeasure(m.airIonizationLevel),
        o2: formatMeasure(m.o2),
        radon: formatMeasure(m.radon),
        illuminance: formatMeasure(m.illuminance),
        soundLevel: formatMeasure(m.soundLevel)
      }));
      setMeasurements(mapped);
      setTotalCount(json.totalCount ?? json.total ?? mapped.length);
    } catch (e) {
      console.error('fetchMeasurements error', e);
      setMeasurements([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filterDayFrom, filterDayTo, rowsPerPage, appliedFilters, dateSortOrder, searchText]);

  // fetch min/max available measurement dates from backend and set pickers + limits
  const fetchAvailableDateRange = React.useCallback(async () => {
    setDateRangeLoading(true);
    try {
      const resp = await fetch('https://localhost:6063/measurements/dates');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      // backend returns ISO-like strings; use dayjs to parse and set UTC to be consistent with existing code
      if (json.minDate && dayjs(json.minDate).isValid()) {
        const min = dayjs(json.minDate).utc();
        setDateRangeMin(min);
        // if user pick value not set yet, initialize from min
        setFilterDayFrom(prev => {
          const newValue = prev ? prev : min;
          //console.log("Setting filterDayFrom to:", newValue);
          return newValue;
        });
      }
      if (json.maxDate && dayjs(json.maxDate).isValid()) {
        const max = dayjs(json.maxDate).utc();
        setDateRangeMax(max);
        setFilterDayTo(prev => {
          const newValue = prev ? prev : max;
          //console.log("Setting filterDayTo to:", newValue);
          return newValue;
        });
      }

    } catch (err) {
      console.error('fetchAvailableDateRange error', err);
    } finally {
      setDateRangeLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // get date bounds once on mount
    fetchAvailableDateRange();
  }, [fetchAvailableDateRange]);

  React.useEffect(() => {
    // initial load
    fetchMeasurements(1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchMeasurements(newPage + 1, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = +event.target.value;
    setRowsPerPage(newSize);
    setPage(0);
    fetchMeasurements(1, newSize);
  };

  // clamp helper: returns a dayjs between min and max if bounds exist
  const clampToRange = (value, min, max) => {
    if (!value) return value;
    if (min && dayjs(value).isBefore(min)) return min;
    if (max && dayjs(value).isAfter(max)) return max;
    return value;
  };

  const handleApplyFilters = () => {
    // clamp selected dates to backend-provided range before applying
    const clampedFrom = clampToRange(filterDayFrom, dateRangeMin, dateRangeMax);
    const clampedTo = clampToRange(filterDayTo, dateRangeMin, dateRangeMax);

    setFilterDayFrom(clampedFrom);
    setFilterDayTo(clampedTo);

    setPage(0);
    // run fetch after state updates (use timeout tick to ensure applied* updated)
    setTimeout(() => fetchMeasurements(1, rowsPerPage), 0);
  };

  const handleClearAll = () => {
    // clear search, dates and sorting
    setSearchText('');
    setFilterDayFrom(null);
    setFilterDayTo(null);
    setDateSortOrder('desc');
    setPage(0);
  };

  // columns to actually render
  const columnsToShow = React.useMemo(() => columns.filter(c => visibleColumnIds.includes(c.id)), [visibleColumnIds]);

  // selected measurement count (for badge)
  const selectedMeasurementCount = measurementIds.filter(id => visibleColumnIds.includes(id)).length;

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      {/* New: compact filter controls above the table */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Szukaj (device number / name / location)"
            variant="standard"
            size="small"
            id="measurement-search-input"
            defaultValue={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 300 }}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* From picker (disabled while date range loads). min/max prevent selecting outside backend range */}
            <MobileDateTimePicker
              label="Od dnia"
              id="measurement-dayfrom-picker"
              value={filterDayFrom}
              onChange={(v) => setFilterDayFrom(v)}
              slotProps={{ textField: { size: 'small', variant: 'standard' } }}
              disabled={dateRangeLoading}
              {...(dateRangeMin ? { minDateTime: dateRangeMin } : {})}
              {...(dateRangeMax ? { maxDateTime: dateRangeMax } : {})}
             ampm={false}
             inputFormat="YYYY-MM-DD HH:mm"
            />

            {/* To picker (disabled while date range loads). min/max prevent selecting outside backend range */}
            <MobileDateTimePicker
              label="Do dnia"
              id="measurement-dayto-picker"
              value={filterDayTo}
              onChange={(v) => setFilterDayTo(v)}
              slotProps={{ textField: { size: 'small', variant: 'standard' } }}
              disabled={dateRangeLoading}
              {...(dateRangeMin ? { minDateTime: dateRangeMin } : {})}
              {...(dateRangeMax ? { maxDateTime: dateRangeMax } : {})}
             ampm={false}
             inputFormat="YYYY-MM-DD HH:mm"
            />
          </LocalizationProvider>

          {/* Columns chooser button */}
          <IconButton onClick={handleOpenColsMenu} sx={{ ml: 1 }}>
            <Badge badgeContent={selectedMeasurementCount} color="primary">
              <FilterListIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorColsEl}
            open={colsMenuOpen}
            onClose={handleCloseColsMenu}
            MenuListProps={{ dense: true }}
            PaperProps={{
              style: {
                width: 360,    // stała szerokość
                height: 420,   // stała wysokość
                display: 'flex',
                flexDirection: 'column'
              }
            }}
          >
            {/* scrollable list area */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {measurementColumns.map(col => (
                <MenuItem key={col.id} onClick={() => toggleColumn(col.id)}>
                  <Checkbox checked={visibleColumnIds.includes(col.id)} size="small" />
                  <ListItemText primary={col.label} />
                </MenuItem>
              ))}
            </Box>

            {/* footer with actions fixed to bottom */}
            <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.12)', p: 1, display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={selectAllMeasurements} variant="outlined">Zaznacz wszystko</Button>
                <Button size="small" onClick={clearMeasurementSelection} variant="outlined">Wyczyść zaznaczenie</Button>
              </Box>
              <Button size="small" variant="contained" onClick={handleCloseColsMenu}>Zamknij</Button>
            </Box>
          </Menu>

          {/* Sort chooser button (otwiera okienko podobne do wyboru kolumn) */}
          <IconButton onClick={handleOpenSortMenu} sx={{ ml: 1 }}>
            <SortIcon />
          </IconButton>

          <Menu
            anchorEl={anchorSortEl}
            open={sortMenuOpen}
            onClose={handleCloseSortMenu}
            MenuListProps={{ dense: true }}
            PaperProps={{
              style: {
                width: 280,
                height: 180,
                display: 'flex',
                flexDirection: 'column'
              }
            }}
          >
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle1">Sortowanie po dacie</Typography>
              <Typography variant="caption" color="text.secondary">Wybierz sposób sortowania</Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <MenuItem
                onClick={() => { setDateSortOrder('asc'); handleCloseSortMenu(); }}
                selected={dateSortOrder === 'asc'}
              >
                <Radio checked={dateSortOrder === 'asc'} size="small" />
                <ListItemText primary="Rosnąco (najstarsze najpierw)" />
              </MenuItem>

              <MenuItem
                onClick={() => { setDateSortOrder('desc'); handleCloseSortMenu(); }}
                selected={dateSortOrder === 'desc'}
              >
                <Radio checked={dateSortOrder === 'desc'} size="small" />
                <ListItemText primary="Malejąco (najnowsze najpierw)" />
              </MenuItem>
            </Box>

            <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.12)', p: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" variant="contained" onClick={handleCloseSortMenu}>Zamknij</Button>
            </Box>
          </Menu>

          <Button variant="contained" onClick={handleApplyFilters} sx={{ ml: 'auto' }} disabled={loading}>
            Zastosuj filtry
          </Button>
          <Button variant="outlined" onClick={handleClearAll} sx={{ ml: 1 }} disabled={loading}>
            Wyczyść filtry i sortowanie
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
        {/* loading overlay now covers table + pagination (blocks interactions during load) */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.6)'
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader aria-label="measurements table">
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: 60, fontWeight: 'bold' }}>Index</TableCell>
                {columnsToShow.map((column) => (
                  <TableCell key={column.id} style={{ minWidth: column.minWidth, fontWeight: 'bold' }}>
                    <TableSortLabel>{column.label}</TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {measurements.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={columnsToShow.length + 1} align="center" sx={{ py: 6, color: '#888' }}>
                    Brak pomiarów do wyświetlenia.
                  </TableCell>
                </TableRow>
              ) : (
                measurements.map((row, idx) => {
                  const tableIndex = page * rowsPerPage + idx + 1;
                  return (
                    <TableRow hover tabIndex={-1} key={row.id || `${row.deviceNumber}-${tableIndex}`}>
                      <TableCell>{tableIndex}</TableCell>
                      {columnsToShow.map((column) => (
                        <TableCell key={column.id}>
                          {row[column.id] ?? ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}