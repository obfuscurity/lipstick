class Site
  include MongoMapper::Document
  many :events

  key :name, String
  timestamps!
end