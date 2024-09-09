export type TriggerFinal = {
  progress_note_id: number;
  internal_facility_id: string;
  facility_name: string;
  upstream: string;
  patient_name: string;
  patient_id: string;
  created_by: string;
  created_date: Date;
  revision_by: string;
  revision_date: Date;
  progress_note: string;
  trigger_words: {
    trigger_word: string;
    summary: string;
    is_thumb_up: boolean;
    update_time: Date;
    comment: string;
    event_ids: number[];
  }[];
};
