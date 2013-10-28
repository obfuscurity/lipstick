class Site
  include MongoMapper::Document
  many :events

  key :name, String
  key :url, String

  timestamps!

  def self.update_all
    Site.all.each do |site|
      nagios = NagiosHarder::Site.new("#{site.url}/cgi-bin/", ENV['NAGIOS_USER'], ENV['NAGIOS_PASS'])
      t1 = Time.now.to_i
      alerts = nagios.service_status(:critical).count
      puts "site #{site} took #{time.now.to_i - t1} sec for #{alerts} alerts"
    end
  end
end