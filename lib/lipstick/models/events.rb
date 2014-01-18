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

  nagios_api_url = ENV['NAGIOS_API_URL']

  def acknowledge(options)
    self.acknowledged = true
    self.save
    begin
      RestClient.post "#{nagios_api_url}/acknowledge",
      {
        :host => self.host,
        :service => self.service,
        :comment => options[:comment],
        :author => options[:author]
      }
    rescue => e
      raise e.message
    end
  end

  def remove_acknowledgement
    self.acknowledged = false
    self.save
    begin
      RestClient.post "#{nagios_api_url}/remove_acknowledgement",
      {
        :host => self.host,
        :service => self.service
      }
    rescue => e
      raise e.message
    end
  end

  def schedule_downtime(duration)
    # duration in seconds
  end

  def reschedule_check
  end
end
