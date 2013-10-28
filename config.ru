$LOAD_PATH << './lib'

require 'radial/web'
run Radial::Web

# allow user to set SSL_VERSION explicitly
if ENV['SSL_VERSION']
  OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:ssl_version] = ENV['SSL_VERSION']
end

# grab the MongoDB URI for our connection
begin
  uri = URI.parse(ENV['MONGODB_URI'])
rescue
  uri = URI.parse('mongodb://127.0.0.1:27017/development')
end

# connect to our MongoDB
begin
  MongoMapper.connection = Mongo::Connection.new(uri.host)
  MongoMapper.database = uri.path.gsub(/^\//,'')
rescue
  raise 'Unable to connect to MONGODB_URI, aborting.'
end

# fetch Events on start (or not)
Site.update_all unless ENV['EVENTS_UPDATE_ON_BOOT'] == 'false'

# schedule regular updates for our Events
require 'rufus/scheduler'
scheduler = Rufus::Scheduler.new

interval = ENV['EVENTS_UPDATE_TIMEOUT'].nil? ? 60 : ENV['EVENTS_UPDATE_TIMEOUT'].to_i

scheduler.every interval do
  Site.update_all
end