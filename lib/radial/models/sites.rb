class Site
  include MongoMapper::Document
  many :events

  key :name, String
  key :url, String

  timestamps!

  def self.update_all
    Site.all.each do |site|
      OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:ssl_version] = 'SSLv3'
      nagios = NagiosHarder::Site.new("#{site.url}/cgi-bin/", ENV['NAGIOS_USER'], ENV['NAGIOS_PASS'])
      site.events.clear unless site.events.empty?
      nagios.service_status(:critical).each do |event|
        e = Event.new(event.to_hash)
        site.events << e
      end
      site.save
    end
  end
end