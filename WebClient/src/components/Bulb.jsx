import React from 'react';
import { Box, IconButton, Typography, Button, Stack, ButtonGroup, Grid, Divider, Snackbar, Alert, CircularProgress, LinearProgress, SpeedDial, SpeedDialAction, MenuItem, Select, FormControl, InputLabel, Collapse, Tabs, Tab, ListItemText, Menu, Icon, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { alpha } from '@mui/material/styles';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import RemoveIcon from '@mui/icons-material/Remove';
import EastIcon from '@mui/icons-material/East';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
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

import TextField from '@mui/material/TextField';
import { DatePicker, DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

function Bulb(statusname, isStatic = false) {
    switch (statusname) {
        case 'Pending':
            return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}>
                {isStatic === false ? (
                <Stack direction="row" spacing={0.5}>
                    <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.primary.light, 1),
                        boxShadow: (theme) => `0 0 6px 1px ${alpha(theme.palette.primary.light, 0.65)}`,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0s',
                        '@keyframes pulse': {
                            '0%, 80%, 100%': {
                                opacity: 0.3,
                                transform: 'scale(0.8)',
                            },
                            '40%': {
                                opacity: 1,
                                transform: 'scale(1)',
                            }
                        }
                    }} />
                    <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.primary.light, 1),
                        boxShadow: (theme) => `0 0 6px 1px ${alpha(theme.palette.primary.light, 0.65)}`,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.3s',
                        '@keyframes pulse': {
                            '0%, 80%, 100%': {
                                opacity: 0.3,
                                transform: 'scale(0.8)',
                            },
                            '40%': {
                                opacity: 1,
                                transform: 'scale(1)',
                            }
                        }
                    }} />
                    <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.primary.light, 1),
                        boxShadow: (theme) => `0 0 6px 1px ${alpha(theme.palette.primary.light, 0.65)}`,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.6s',
                        '@keyframes pulse': {
                            '0%, 80%, 100%': {
                                opacity: 0.3,
                                transform: 'scale(0.8)',
                            },
                            '40%': {
                                opacity: 1,
                                transform: 'scale(1)',
                            }
                        }
                    }} />
                </Stack>) : 
                <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: (theme) => {
                        return ` ${alpha(theme.palette.primary.light, 1)}`;
                    },
                    boxShadow: (theme) => {
                        return `0 0 8px 2px ${alpha(theme.palette.primary.light, 0.65)}`;
                    }
                }}>
                </Box>
                }
                <Typography>Pending</Typography>
            </Stack>
        case 'Suspended':
            return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                sx={{}}>
                <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: (theme) => {
                        return ` ${alpha(theme.palette.customgray.light, 1)}`;
                    },
                    boxShadow: (theme) => {
                        return `0 0 8px 2px ${alpha(theme.palette.customgray.light, 0.65)}`;
                    }
                }}>
                </Box>
                <Typography>Suspended</Typography>
            </Stack>
        case 'Completed':
            return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                sx={{}}>
                <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: (theme) => {
                        return ` ${alpha(theme.palette.customgreen.light, 1)}`;
                    },
                    boxShadow: (theme) => {
                        return `0 0 8px 2px ${alpha(theme.palette.customgreen.light, 0.65)}`;
                    }
                }}>
                </Box>
                <Typography>Completed</Typography>
            </Stack>
        case 'Failed':
            return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                sx={{}}>
                <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: (theme) => {
                        return ` ${alpha(theme.palette.customred.main, 1)}`;
                    },
                    boxShadow: (theme) => {
                        return `0 0 8px 2px ${alpha(theme.palette.customred.main, 0.65)}`;
                    }
                }}>
                </Box>
                <Typography>Failed</Typography>
            </Stack>
        case 'Deleted':
            return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}
                sx={{}}>
                <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: (theme) => {
                        return ` ${alpha(theme.palette.custompalette.rustyred, 1)}`;
                    },
                    boxShadow: (theme) => {
                        return `0 0 8px 2px ${alpha(theme.palette.custompalette.rustyred, 0.65)}`;
                    }
                }}>
                </Box>
                <Typography>Deleted</Typography>
            </Stack>
        case 'Processing':
            return <Stack direction="row" alignContent="center" alignItems="center" spacing={1}>
                {isStatic === false ? (
                <Stack direction="row" spacing={0.5}>
                    <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.customyellow.main, 1),
                        boxShadow: (theme) => `0 0 6px 1px ${alpha(theme.palette.customyellow.main, 0.65)}`,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0s',
                        '@keyframes pulse': {
                            '0%, 80%, 100%': {
                                opacity: 0.3,
                                transform: 'scale(0.8)',
                            },
                            '40%': {
                                opacity: 1,
                                transform: 'scale(1)',
                            }
                        }
                    }} />
                    <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.customyellow.main, 1),
                        boxShadow: (theme) => `0 0 6px 1px ${alpha(theme.palette.customyellow.main, 0.65)}`,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.3s',
                        '@keyframes pulse': {
                            '0%, 80%, 100%': {
                                opacity: 0.3,
                                transform: 'scale(0.8)',
                            },
                            '40%': {
                                opacity: 1,
                                transform: 'scale(1)',
                            }
                        }
                    }} />
                    <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.customyellow.main, 1),
                        boxShadow: (theme) => `0 0 6px 1px ${alpha(theme.palette.customyellow.main, 0.65)}`,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.6s',
                        '@keyframes pulse': {
                            '0%, 80%, 100%': {
                                opacity: 0.3,
                                transform: 'scale(0.8)',
                            },
                            '40%': {
                                opacity: 1,
                                transform: 'scale(1)',
                            }
                        }
                    }} />
                </Stack>
                ) : (
                <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: (theme) => {
                        return ` ${alpha(theme.palette.customyellow.main, 1)}`;
                    },
                    boxShadow: (theme) => {
                        return `0 0 8px 2px ${alpha(theme.palette.customyellow.main, 0.65)}`;
                    }
                }}>
                </Box>
                )}

                <Typography>Processing</Typography>
            </Stack>
        default:
            return <Typography>UNDEFINED</Typography>
    }
}

export default Bulb;