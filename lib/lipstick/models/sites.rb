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
        nagios.service_status(:critical).each do |problem|
          site.events << Event.new(problem.to_hash)
        end
        site.save
      rescue => e
        raise "Unable to retrieve status for site #{site.name} at #{site.url}: #{e.message}"
      end
    end
  end
end