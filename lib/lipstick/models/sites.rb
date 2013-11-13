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
        if ! Site.find_by_id(site.id).nil?
          site.events.clear unless site.events.empty?
          nagios.service_status(:critical).each do |problem|
            site.events << Event.new(problem.to_hash)
          end
          site.save
        end
      rescue => e
        raise "Unable to retrieve service_status for site #{site.name} at #{site.url}: #{e.message}"
      end
      begin
        nagios.host_status(:critical).each do |problem|
          p problem
        end
      rescue => e
        raise "Unable to retrieve host_status for site #{site.name} at #{site.url}: #{e.message}"
      end
    end
  end
end