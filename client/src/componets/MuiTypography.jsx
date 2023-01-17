import React from 'react';
import {Typography} from '@mui/material'

const MuiTypography = () => {
    return (
        <div>
            <Typography variant='h6' gutterBottom  paragraph >
          Material UI projet
           </Typography>
            <Typography variant='h6' component='h1'>
          Material UI subtitle
           </Typography>
            <Typography variant='body2'paragraph >
          Material UI subtitle
           </Typography>
        </div>
    );
};

export default MuiTypography;