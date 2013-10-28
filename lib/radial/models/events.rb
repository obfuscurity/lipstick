class Event
  include MongoMapper::EmbeddedDocument

  key :host, String
  key :host_extinfo_url, String
  key :service, String
  key :status, String
  key :last_check, Time
  key :duration, String
  key :attempts, String
  key :started_at, Time
  key :extended_info, String
  key :acknowledged, Boolean
  key :service_extinfo_url, String
  key :flapping, Boolean
  key :comments_url, String
  key :extra_service_notes_url, String
  key :notifications_disabled, Boolean
end
