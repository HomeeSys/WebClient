import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.custompalette?.azure,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    border: `1px solid ${theme.palette.divider}`,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: `1px solid ${theme.palette.divider}`,
  },
}));

function MeasurementDetailsTable({
  date, 
  device: { id: deviceId, name: deviceName }, 
  location: { id: locationId, name: locationName }, 
  temperature = null, 
  humidity = null, 
  co2 = null, 
  voc = null, 
  pm1 = null, 
  pm25 = null, 
  p10 = null, 
  formaldehyde = null, 
  co = null, 
  o3 = null, 
  ammonia = null, 
  airflow = null, 
  ail = null, 
  o2 = null, 
  radon = null, 
  illuminance = null, 
  soundlevel = null
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

      {/* Details about device */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: 1, width: '100%', mb: 2 }}>
        
        <Box>
          <Typography variant="subtitle1">Device</Typography>
          <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>{deviceName} (Device Number: {deviceId})</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle1">Captured at</Typography>
          <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>{date}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle1">Location</Typography>
          <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>{locationName}</Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{mb: 1}}>
        <Table aria-label="measurement details table">
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <Typography variant='subtitle2' fontWeight='bold'>Measurement</Typography>
              </StyledTableCell>
              <StyledTableCell align="right">
                <Typography variant='subtitle2' fontWeight='bold'>Value</Typography>
              </StyledTableCell>
              <StyledTableCell align="right">
                <Typography variant='subtitle2' fontWeight='bold'>Unit</Typography>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Temperature */}
            {temperature !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Air Temperature (T)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{temperature}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>°C</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}
            
            {/* Humidity */}
            {humidity !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Relative Humidity (RH)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{humidity}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>%</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* CO2 */}
            {co2 !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Carbon Dioxide (CO₂)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{co2}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>ppm</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* VOC */}
            {voc !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Volatile Organic Compounds (VOC)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{voc}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>ppb</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* PM1 */}
            {pm1 !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Particulate Matter 1.0μm (PM1)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{pm1}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>μg/m³</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* PM2.5 */}
            {pm25 !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Particulate Matter 2.5μm (PM2.5)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{pm25}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>μg/m³</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* PM10 */}
            {p10 !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Particulate Matter 10μm (PM10)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{p10}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>μg/m³</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* Formaldehyde */}
            {formaldehyde !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Formaldehyde (HCHO)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{formaldehyde}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>ppb</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* CO */}
            {co !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Carbon Monoxide (CO)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{co}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>ppm</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* O3 */}
            {o3 !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Ozone (O₃)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{o3}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>ppb</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* Ammonia */}
            {ammonia !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Ammonia (NH₃)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{ammonia}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>ppm</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* Airflow */}
            {airflow !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Air Flow Rate (AFR)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{airflow}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>m³/h</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* Air Ionization Level */}
            {ail !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Air Ionization Level (AIL)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{ail}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>ions/cm³</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* O2 */}
            {o2 !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Oxygen Concentration (O₂)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{o2}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>%</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* Radon */}
            {radon !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Radon Gas Concentration (Rn)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{radon}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>Bq/m³</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* Illuminance */}
            {illuminance !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Illuminance Level (Lux)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{illuminance}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>lx</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}

            {/* Sound Level */}
            {soundlevel !== null && (
              <StyledTableRow>
                <StyledTableCell component="th" scope="row">
                  <Typography variant='subtitle2'>Sound Pressure Level (SPL)</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2'>{soundlevel}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Typography variant='subtitle2' sx={{ fontStyle: 'italic', fontFamily: 'cursive' }}>dB</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default MeasurementDetailsTable;