import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function CustomTabPanel({ children, value, index }) {
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }