import { CircularProgress, Dialog, DialogContent } from "@mui/material";

export default function Preloader({ open = false, onClose = null, title = "Carregando" }) {
    return (
        <Dialog
            open={open}
            // onClose={() => {
            //     if(onClose !== null)
            //         onClose()
            // }}
        >
            <DialogContent className="d-flex flex-column align-items-center">
                <CircularProgress />

                <h5 className="m-0 mt-2 fw-bold" style={{ color: "#1a74c7" }}>
                    { title }
                </h5>
            </DialogContent>
        </Dialog>
    )
}