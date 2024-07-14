import React, { useEffect } from 'react';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const Alert = React.forwardRef(function Alert(props, ref){
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export default function SnackAlert({ flag, handleCloseSnackbar, color, txt }){
	useEffect(() => {
        if(flag)
            setTimeout(() => handleCloseSnackbar(), 3000)
    }, [flag])
	
    return (
        <Snackbar open={flag} autoHideDuration={3000} onClose={handleCloseSnackbar} style={{ zIndex: '99999999' }}>
            <Alert onClose={handleCloseSnackbar} severity={color} sx={{ width: '100%' }}>
                { txt }
            </Alert>
        </Snackbar>
    )
}