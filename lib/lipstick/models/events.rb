require 'rest-client'

class Event
  include MongoMapper::EmbeddedDocument

  key :host, String
  key :host_extinfo_url, String
  key :service, String
  key :status, String
  key :last_check, Time
  key :duration, String
  key :attempts, String
  key :started_at, Time
  key :extended_info, String
  key :acknowledged, Boolean
  key :service_extinfo_url, String
  key :flapping, Boolean
  key :comments_url, String
  key :extra_service_notes_url, String
  key :notifications_disabled, Boolean


  def self.find(options)
    Site.find(options[:site_id]).events.each do |event|
      return event if event.id.to_s.eql?(options[:event_id])
    end
    return
  end

  def acknowledge(options)
    begin
      self.acknowledged = true
      self.save
      nagios_api_url = Site.find(options[:site_id]).nagios_api_url
      RestClient.post "#{nagios_api_url}/acknowledge_problem",
        {
          :host => self.host,
          :service => self.service,
          :comment => options[:comment],
          :author => options[:author]
        }.to_json, :content_type => :json
    rescue => e
      raise e.message
    end
  end

  def remove_acknowledgement(options)
    begin
      self.acknowledged = false
      self.save
      nagios_api_url = Site.find(options[:site_id]).nagios_api_url
      RestClient.post "#{nagios_api_url}/remove_acknowledgement",
        {
          :host => self.host,
          :service => self.service
        }.to_json, :content_type => :json
    rescue => e
      raise e.message
    end
  end

  def schedule_downtime(options)
    begin
      nagios_api_url = Site.find(options[:site_id]).nagios_api_url
      RestClient.post "#{nagios_api_url}/schedule_downtime",
        {
          :host => self.host,
          :service => self.service,
          :duration => options[:duration],
          :comment => options[:comment]
        }.to_json, :content_type => :json
    rescue => e
      raise e.message
    end
  end

  def cancel_downtime(options)
    begin
      nagios_api_url = Site.find(options[:site_id]).nagios_api_url
      RestClient.post "#{nagios_api_url}/cancel_downtime",
        {
          :host => self.host,
          :service => self.service
        }.to_json, :content_type => :json
    rescue => e
      raise e.message
    end
  end

  def remove_downtime
  end

  def schedule_check(options)
    begin
      nagios_api_url = Site.find(options[:site_id]).nagios_api_url
      RestClient.post "#{nagios_api_url}/schedule_check",
        {
          :host => self.host,
          :service => self.service,
          :forced => 1
        }.to_json, :content_type => :json
    rescue => e
      raise e.message
    end
  end
end
