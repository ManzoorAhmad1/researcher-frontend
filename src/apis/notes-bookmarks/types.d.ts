export type CreateFolderBody = {
  folder_name: string;
};

type Member = {
  email: string;
  role: string;
};

export type CreateNoteBody = {
  type: "note";
  document_id: number | string;
  folder_id: number | string;
  project_id?: number | string;
  workspace_id?: number | string;
  user_id?: number | string;
  members: Member[];
  description: string | null;
  title: string;
};

export type ShareSaveNotesBody = {
  document_id: string | number;
  public: boolean;
  public_role?: string;
  members: any[];
  project_id: string;
};

export type AccepteRequestBody = {
  document_id: string;
  role: string;
};

export type RejectRequestApiBody = {
  document_id: string;
};
export type RemoveAccessAPIBody = {
  document_id: string;
};
export type TransferOwnerShipBody = {
  transferEmail: string;
  ownerEmail: string;
};

export type SendEmailBody = {
  url: string | undefined;
  firstName: string;
  lastName: string;
  newMembers: Member[] | any;
};

export type AddNotesBookmarksTagBody = {
  userId: string | number;
  name: string;
  color: string;
};

export type UpdateNotesBookmarksTagBody = {
  oldName: string;
  newName: string;
  newColor: string;
};
