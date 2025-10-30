import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function InfoLabel({mainlabel, description, icon: IconComponent, iconColor}) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

        {/* Icon */}
        <Box sx={{
            width: 70,
            height: 70,
            borderRadius: 100,
            mb: 1,
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: (theme) => theme.palette.customgray.lightest,
        }}>
            <IconComponent sx={{ 
                fontSize: 46, 
                color: iconColor ? 
                    (typeof iconColor === 'function' ? iconColor : iconColor) : 
                    ((theme) => theme.palette.custompalette.airsuperiorityblue)
            }} />
        </Box>

        <Typography variant="h6">{mainlabel}</Typography>

        {/* Detailed description */}
        <Box maxWidth={500}>
            <Typography variant="subtitle2" align="justify" sx={{ mt: 1, color: (theme) => theme.palette.custompalette.airsuperiorityblue }}>{description}</Typography>
        </Box>
    </Box>
}

export default InfoLabel;