import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

function LoadingLabel({ mainlabel, description, icon: IconComponent }) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

        {/* CircularProgress with Icon inside */}
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
            {/* Outer ring */}
            <CircularProgress
                size={120}
                thickness={1.5}
                sx={{ color: (theme) => theme.palette.custompalette.royalblue, opacity: 0.3 }}
            />
            {/* Inner ring */}
            <CircularProgress
                size={100}
                thickness={2}
                sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    color: (theme) => theme.palette.custompalette.royalblue
                }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Icon */}
                <IconComponent sx={{
                    fontSize: 48,
                    color: (theme) => theme.palette.custompalette.airsuperiorityblue
                }} />
            </Box>
        </Box>

        <Typography variant="h6">{mainlabel}</Typography>

        {/* Detailed description */}
        <Box maxWidth={500}>
            <Typography variant="subtitle2" align="justify" sx={{ mt: 1, color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>{description}</Typography>
        </Box>
    </Box>
}

export default LoadingLabel;