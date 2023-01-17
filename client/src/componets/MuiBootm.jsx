import { Button, ButtonGroup, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Stack } from '@mui/system';
import {FormatBoldIcon,FormatItalicIcon,FormatUnderlinedIcon} from '@mui/material/Icon'
import React from 'react';









const MuiBootm = () => {
    return (
       <Stack spacing={4} >
            
            <Stack spacing={2} direction="row" sx={{margin:'auto'}} >
                
                     <Button variant='text' color='warning'   >Warning </Button>
            
            <Button variant='contained' color='info'  size='small'  >Info </Button>
     
            <Button variant='outlined' color='success' size='small'>Success</Button>
            <Button variant='text' color='error' size='small'>Error</Button>
            <Button variant='contained' color='primary' size='small'>Primary</Button>
            <Button variant='outlined' color='secondary' size='small'>Secondary</Button>

           
            </Stack>
            <Stack spacing={2} direction="row" > 
<Button variant='text'>Text</Button>
<Button variant='contained'>Contained</Button>
<Button variant='outlined'>Outlined</Button>
            </Stack>
            <Stack display='block' spacing={2} direction='row'>
<Button variant='text' size='small' >Small</Button>
<Button variant='contained' size='medium'>Medium</Button>
<Button variant='outlined' size='large'>Large</Button>
            </Stack>
            <Stack spacing={2} direction='row'>
                <Button variant='contained' disableElevation disableFocusRipple  >
Send
                </Button>
            </Stack>
            
            <Stack directionn='row' >
                <ButtonGroup variant='contained' orientation='vertical' size='small'
                aria-label='align button group'>
                    <Button>Left </Button>
                    <Button>Center</Button>
                    <Button>Right</Button>
</ButtonGroup>
            </Stack>
            <Stack direction='row'>
                <ToggleButtonGroup aria-label='text formating'>
<ToggleButton value='bold'>  </ToggleButton>
                </ToggleButtonGroup>
            </Stack>
       </Stack>
       
    );
};

export default MuiBootm;