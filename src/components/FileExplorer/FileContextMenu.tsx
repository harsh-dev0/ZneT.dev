import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileSystemItem, useFileExplorerStore } from '@/store/fileExplorerStore';
import { File, FolderPlus, Pencil, Trash2 } from 'lucide-react';

interface FileContextMenuProps {
  children: React.ReactNode;
  item: FileSystemItem;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({ children, item }) => {
  const [showNewFileDialog, setShowNewFileDialog] = React.useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = React.useState(false);
  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState('');

  const addFile = useFileExplorerStore((state) => state.addFile);
  const addFolder = useFileExplorerStore((state) => state.addFolder);
  const renameItem = useFileExplorerStore((state) => state.renameItem);
  const deleteItem = useFileExplorerStore((state) => state.deleteItem);

  const handleAddFile = () => {
    if (newItemName.trim()) {
      addFile(item.path, newItemName.trim());
      setNewItemName('');
      setShowNewFileDialog(false);
    }
  };

  const handleAddFolder = () => {
    if (newItemName.trim()) {
      addFolder(item.path, newItemName.trim());
      setNewItemName('');
      setShowNewFolderDialog(false);
    }
  };

  const handleRenameItem = () => {
    if (newItemName.trim()) {
      renameItem(item.id, newItemName.trim());
      setNewItemName('');
      setShowRenameDialog(false);
    }
  };

  const handleDeleteItem = () => {
    deleteItem(item.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          {item.type === 'folder' && (
            <>
              <ContextMenuItem
                onClick={() => {
                  setNewItemName('');
                  setShowNewFileDialog(true);
                }}
              >
                <File className="mr-2 h-4 w-4" />
                New File
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  setNewItemName('');
                  setShowNewFolderDialog(true);
                }}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem
            onClick={() => {
              setNewItemName(item.name);
              setShowRenameDialog(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New File</DialogTitle>
            <DialogDescription>Enter a name for your new file</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="File name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowNewFileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {item.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
            <DialogDescription>Enter a new name</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="New name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameItem()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameItem}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {item.name}</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <p>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{item.name}</span>?
            {item.type === 'folder' && ' This will delete all files and folders inside.'}
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileContextMenu;