$LOAD_PATH << './lib'
require 'radial/web'

run Radial::Web

MongoMapper.setup({ 'production' => { 'uri' => ENV['MONGODB_URI'] } }, 'production')

Event.load unless ENV['EVENTS_UPDATE_ON_BOOT'] == 'false'

require 'rufus/scheduler'
scheduler = Rufus::Scheduler.new

interval = ENV['EVENTS_UPDATE_TIMEOUT'].nil? ? 60 : ENV['EVENTS_UPDATE_TIMEOUT'].to_i

scheduler.every interval do
  Event.update
end