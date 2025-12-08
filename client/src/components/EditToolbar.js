import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
// import Button from '@mui/material/Button';
// import AddIcon from '@mui/icons-material/Add';
// import RedoIcon from '@mui/icons-material/Redo';
// import UndoIcon from '@mui/icons-material/Undo';
// import CloseIcon from '@mui/icons-material/HighlightOff';

/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);

    function handleAddNewSong() {
        store.addNewSong();
    }
    function handleUndo() {
        store.undo();
    }
    function handleRedo() {
        store.redo();
    }
    function handleClose() {
        store.closeCurrentList();
    }
    return (
        <div></div>
    )
}

export default EditToolbar;