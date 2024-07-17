import React from 'react';
import { Dialog, DialogContent, DialogActions } from '@mui/material';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup } from "@/components/ui/select";

interface AddToListDialogProps {
  open: boolean;
  onClose: () => void;
  lists: Array<{ id: string, name: string }>;
  selectedList: string;
  setSelectedList: (value: string) => void;
  addToList: () => void;
}

const AddToListDialog: React.FC<AddToListDialogProps> = ({ open, onClose, lists, selectedList, setSelectedList, addToList }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 16 } }}>
      <DialogContent>
      <div className="flex flex-col items-center">
        <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger className="mb-2 p-2 border rounded w-full">
                <SelectValue placeholder="Select a list" />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
            <SelectGroup>
            {lists.map(list => (
                <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
            ))}
            </SelectGroup>
            </SelectContent>
        </Select>
      </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={addToList} className="bg-purple-800 text-white px-4 py-2 rounded">
          Add
        </Button>
        <Button onClick={onClose} className="ml-2 bg-gray-800 px-4 py-2 rounded">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToListDialog;