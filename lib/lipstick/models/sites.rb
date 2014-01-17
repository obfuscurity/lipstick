require 'rufus/scheduler'

class Site

  include MongoMapper::Document
  many :events

  key :name, String
  key :url, String

  after_create :update_new_site

  timestamps!

  def update_new_site
    scheduler = Rufus::Scheduler.new
    scheduler.in '1s' do
      self.update_events
    end
  end

  def update_events
    p "DEBUG: updating events for site #{self.name}"
    nagios = NagiosHarder::Site.new("#{self.url}/cgi-bin/", ENV['NAGIOS_USER'], ENV['NAGIOS_PASS'])
    begin
      if ! Site.find_by_id(self.id).nil?
        self.events.clear unless self.events.empty?
        nagios.service_status(:critical).each do |problem|
          self.events << Event.new(problem.to_hash)
        end
        self.save
      end
    rescue => e
      raise "Unable to retrieve service_status for site #{self.name} at #{self.url}: #{e.message}"
    end
    begin
      nagios.host_status(:critical).each do |problem|
        p problem
      end
    rescue => e
      raise "Unable to retrieve host_status for site #{self.name} at #{self.url}: #{e.message}"
    end
  end

  def self.update_all_sites
    Site.all.each do |site|
      site.update_events
    end
  end
end