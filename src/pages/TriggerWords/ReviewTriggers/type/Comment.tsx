export interface Comment {
  progress_note_id: number;
  trigger_word: string;
  comment: string;
}

export interface CommentFormProps {
  comment: Comment;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setThumbUp: React.Dispatch<React.SetStateAction<boolean>>;
  setCommentState: React.Dispatch<React.SetStateAction<unknown>>;
}
