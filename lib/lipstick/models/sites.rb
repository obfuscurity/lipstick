class Site
  include MongoMapper::Document
  many :events

  key :name, String
  key :url, String

  timestamps!

  def self.update_all
    Site.all.each do |site|
      nagios = NagiosHarder::Site.new("#{site.url}/cgi-bin/", ENV['NAGIOS_USER'], ENV['NAGIOS_PASS'])
      begin
        site.events.clear unless site.events.empty?
        nagios.service_status(:critical).each do |event|
          e = Event.new(event.to_hash)
          site.events << e
        end
        site.save
      rescue
        raise "Unable to retrieve status for site #{site.name} at #{site.url}"
      end
    end
  end
end