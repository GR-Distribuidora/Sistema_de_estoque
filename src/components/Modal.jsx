import { forwardRef } from 'react';
import { Dialog, Slide } from "@mui/material";

let dir;
const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction={dir} ref={ref} {...props} />
})

export default function Modal(props) {
    const {
        open, onClose = null, style, className = '', direction = 'up', fullWidth = true, fullScreen = false,
        children, sx, PaperProps, disableMargin = false, maxWidth = 'md', radius = 1.5
    } = props

    dir = direction

    return (
        <Dialog
            sx={
                Object.assign(
                    {},
                    sx,
                    {
                        "& .MuiDialog-paper": { borderRadius: radius }
                    }
                )
            }
            open={open}
            style={style}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            fullScreen={fullScreen}
            PaperProps={PaperProps}
            TransitionComponent={Transition}
            onClose={() => { if(onClose != null) onClose() }}
            className={`${disableMargin ? '' : 'm-4'} ${className}`}
        >
            <div className='p-3 bg-dark text-white'>
                { children }
            </div>
        </Dialog>
    )
}