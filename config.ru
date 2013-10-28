$LOAD_PATH << './lib'

require 'radial/web'
run Radial::Web

begin
  uri = URI.parse(ENV['MONGODB_URI'])
rescue
  uri = URI.parse('mongodb://127.0.0.1:27017/development')
end

begin
  MongoMapper.connection = Mongo::Connection.new(uri.host)
  MongoMapper.database = uri.path.gsub(/^\//,'')
rescue
  raise 'Unable to connect to MONGODB_URI, aborting.'
end

Site.update_all unless ENV['EVENTS_UPDATE_ON_BOOT'] == 'false'

require 'rufus/scheduler'
scheduler = Rufus::Scheduler.new

interval = ENV['EVENTS_UPDATE_TIMEOUT'].nil? ? 60 : ENV['EVENTS_UPDATE_TIMEOUT'].to_i

scheduler.every interval do
  Site.update_all
end