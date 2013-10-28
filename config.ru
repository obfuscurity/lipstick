$LOAD_PATH << './lib'
require 'radial/web'

run Radial::Web

Events.load unless ENV['EVENTS_UPDATE_ON_BOOT'] == 'false'

require 'rufus/scheduler'
scheduler = Rufus::Scheduler.start_new

interval = defined? ENV['EVENTS_UPDATE_TIMEOUT'] ? ENV['EVENTS_UPDATE_TIMEOUT'].to_i : 60

scheduler.every interval do
  Events.update
end