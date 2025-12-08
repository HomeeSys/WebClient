import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import DevicesIcon from '@mui/icons-material/Devices';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';

function Home() {
    const sections = [
        {
            title: 'Devices',
            icon: DevicesIcon,
            description: 'Manage and monitor your IoT devices.',
            details: 'Configure device settings, view real-time status, and organize sensors by location. Track device connectivity and update configurations on-the-fly.',
            link: '/devices',
            color: '#3b82f6'
        },
        {
            title: 'Measurements',
            icon: CloudOutlinedIcon,
            description: 'Browse historical environmental data.',
            details: 'Explore past measurements with advanced filtering. Track temperature, humidity, CO2, air quality, and more across different time periods and locations.',
            link: '/measurements',
            color: '#10b981'
        },
        {
            title: 'Raports',
            icon: DescriptionOutlinedIcon,
            description: 'Generate comprehensive environmental raports.',
            details: 'Create detailed PDF raports for any time period. Choose hourly, daily, weekly, or monthly summaries with custom parameters and measurement types.',
            link: '/raports',
            color: '#f59e0b'
        },
        {
            title: 'Analysis',
            icon: InsightsIcon,
            description: 'Real-time data visualization and monitoring.',
            details: 'Watch live environmental data streaming from all active devices. Monitor current readings, trends, and get instant insights into your home environment.',
            link: '/measurementslive',
            color: '#8b5cf6'
        }
    ];

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateRows: '1fr 1fr 1fr',
            gridTemplateColumns: '1fr 1fr',
            gap: 3,
            height: '100%',
            width: '100%',
            padding: 3,
            overflow: 'auto'
        }}>
            {/* Header Section - spans full width */}
            <Paper
                elevation={0}
                sx={{
                    gridColumn: '1 / -1',
                    padding: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    border: 1,
                    borderColor: (theme) => alpha(theme.palette.divider, 0.3),
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Icon */}
                    <Box
                        sx={{
                            width: 70,
                            height: 70,
                            borderRadius: 2,
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 1,
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                            flexShrink: 0
                        }}
                    >
                        <CottageOutlinedIcon sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main }} />
                    </Box>

                    {/* Text content */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            Homee System
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            Comprehensive home environmental monitoring platform. Track air quality, temperature, humidity, and more across your entire home with real-time insights and automated raports.
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Grid Sections */}
            {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                    <Paper
                        key={index}
                        component={Link}
                        to={section.link}
                        elevation={0}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 3,
                            textDecoration: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            border: 1,
                            borderColor: (theme) => alpha(theme.palette.divider, 0.3),
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 8px 24px ${alpha(section.color, 0.25)}`,
                                borderColor: alpha(section.color, 0.6),
                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                '& .icon-wrapper': {
                                    backgroundColor: alpha(section.color, 0.25),
                                    transform: 'scale(1.1)',
                                    boxShadow: `0 4px 12px ${alpha(section.color, 0.3)}`
                                }
                            },
                            '&:active': {
                                transform: 'translateY(-2px)',
                            }
                        }}
                    >
                        {/* Icon */}
                        <Box
                            className="icon-wrapper"
                            sx={{
                                width: 70,
                                height: 70,
                                borderRadius: 2,
                                backgroundColor: alpha(section.color, 0.15),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                transition: 'all 0.3s ease',
                                border: 1,
                                borderColor: alpha(section.color, 0.3)
                            }}
                        >
                            <IconComponent sx={{ fontSize: 40, color: section.color }} />
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 'bold',
                                mb: 1,
                                color: 'text.primary'
                            }}
                        >
                            {section.title}
                        </Typography>

                        {/* Description */}
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                lineHeight: 1.5,
                                mb: 1.5,
                                fontWeight: 500
                            }}
                        >
                            {section.description}
                        </Typography>

                        {/* Details */}
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.disabled',
                                lineHeight: 1.6,
                                fontSize: '0.8rem'
                            }}
                        >
                            {section.details}
                        </Typography>
                    </Paper>
                );
            })}
        </Box>
    );
}

export default Home;