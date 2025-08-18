export interface TableColumn {
  name: string;
  field: string;
  visible: boolean;
}

export interface TableViewProps {
  selectAll: boolean;
  selectedItems: any[];
  selectedOption: string;
  setSelectAll: (item) => void;
  setSelectedItems: (item) => void;
  tableColumns: TableColumn[] | undefined;
  tableRef: any;
  setISTableColumns: any;
  isTableColumns: any;
}
export interface GridViewProps {
  selectedOption: string;
}
export interface FolderBodyProps {
  tableColumns: TableColumn[] | undefined;
  item: notesBookmarksitem;
  setDeleteDialogInfo: (item) => void;
  setSelectedItems: (item) => void;
  handleEdite: (item, type) => void;
  selectedItems: any[];
}
export interface BookmarkBodyProps {
  item: any;
  tableColumns: TableColumn[] | undefined;
  selectedItems: any[];
  setTageId: (item: string) => void;
  setDeleteDialogInfo: (item) => void;
  setSelectedItems: (item) => void;
  handleEdite: (item, type) => void;
  handleMove: (item: any) => void;
  setBookmarkInfo: (item: any) => void;
}
export interface NotBodyProps {
  item: any;
  index: string;
  selectedItems: any[];
  tableColumns: TableColumn[] | undefined;
  setTageId: (item: string) => void;
  setDeleteDialogInfo: (item) => void;
  setSelectedItems: (item) => void;
  handleEdite: (item, type) => void;
  setShareId: (item: string) => void;
  setVisible: (item) => void;
  setShareVisible: (item) => void;
  handleMove: (item: any) => void;
}
export interface ExportSideBarProps {
  shareId: string;
  visible: boolean;
  setVisible: (data: boolean) => void;
}
export interface ShareSideBarProps {
  shareId: string;
  shareVisible: boolean;
  setShareVisible: (data: boolean) => void;
}
export interface AddBookmarkDialogProps {
  bookmarkInfo: {
    show: boolean;
    id: string;
  };
  setBookmarkInfo: (data: bookmarkInfo) => void;
}
export interface CreateFolderDialogProps {
  createFolderShow: boolean;
  setCreateFolderShow: (data: boolean) => void;
}
export interface notesBookmarksitem {
  name: string;
  totalFiles: number;
  id: string;
  created_at: string;
  folder_name: string;
  folder_id: number;
  user_id: number;
  is_root: boolean;
  type: string;
  folderDataLength: number;
  favorite: boolean;
}
export interface ExportSideBarProps {
  visible: boolean;
  setVisible: (data: boolean) => void;
}
export interface ShareSideBarProps {
  shareVisible: boolean;
  setShareVisible: (data: boolean) => void;
}
export interface ShareNotesDialogProps {
  show: boolean;
  setShow: (data: boolean) => void;
  noteTitle: string | null;
  setNoteTitle: (data: string) => void;
  getSingleNote: () => void;
  isSingleNote: any;
}
export interface Member {
  email: string;
  role: string;
}
export interface FormInputs {
  email: string;
  role: string;
  general_access: string;
  public_role: string;
  members: Member[];
  accepte_request_role: string;
}

export type FormValues = {
  message: string;
};

export interface RequestToEditorDialogProps {
  noteName: string | null;
  showRequestDialog: boolean | undefined;
  setShowRequestDialog: (item: boolean) => void;
}
export interface AddCommentsDialogProps {
  show: boolean;
  setShow: (item: boolean) => void;
  commentsData: object;
}
export interface ListingCommentsDialogProps {
  myMemberInfo: any;
  quill: any;
  show: boolean;
  setShow: (item: boolean) => void;
}
export interface ListingBookmarkCommentsDialogProps {
  isOwner: any;
  quill: any;
  show: boolean;
  setShow: (item: boolean) => void;
}
export interface TableColumnData {
  name: string;
  field: string;
  visible: boolean;
}
export interface Tags {
  name: string;
  color: string;
}
interface Member {
  role: string;
  email: string;
}
export interface Request {
  role: string;
  email: string;
}
export interface Comments {
  id: string;
  comments: [
    { id: any; comment: string; first_name: string; last_name: string }
  ];
  selectedText: string;
  range: { length: number; index: number };
}

export interface NotesAndBookmarksItem {
  id: number;
  created_at: string;
  folder_id: number;
  user_id: number;
  type: string;
  title: string | null;
  link: string | null;
  image_url: string | null;
  description: string | null;
  document_id: string;
  members: Member[];
  request: Request[];
  public: boolean;
  public_role: string | null;
  soft_delete: boolean;
  comments: Comments[];
  tags: Tag[];
}
export interface AccessPageProps {
  isSingleNote?: NotesAndBookmarksItem | undefined;
}
export interface NoteNameSetDialogProps {
  showNameDialog: boolean;
  setShowNameDialog: (isOpen: boolean) => void;
  setShow: (isOpen: boolean) => void;
  setNoteTitle: (isOpen: string) => void;
}

export interface AllEmail {
  label: string;
  value: string;
}
export interface AccessRequest {
  id: number;
  role: string;
  email: string;
  message: string;
  last_name: string;
  first_name: string;
}
export type DeleteDialogInfo = {
  id: string;
  show: boolean;
  name: string;
  type: string;
};
export type RenameNoteTitleDialogInfo = {
  id: string;
  show: boolean;
  name: string;
  type: string;
};

export type RenameFolderTitleDialogInfo = {
  id: string;
  show: boolean;
  name: string;
  type: string;
};
export type BookmarkShareDialogProps = {
  showBookmarkDialog: boolean;
  setShowBookmarkDialog: (item: boolean) => void;
};
export type AddBookmarkCommentsDialogProps = {
  show: boolean;
  setShow: (item: boolean) => void;
  commentsData: object;
};
