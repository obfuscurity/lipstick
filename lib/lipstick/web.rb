require 'sinatra'
require 'rack-ssl-enforcer'
require 'nagiosharder'
require 'mongo_mapper'
require 'json'
require 'uri'

require 'lipstick/models/sites'
require 'lipstick/models/events'

module Lipstick
  class Web < Sinatra::Base

    configure do
      enable :logging
      enable :sessions

      set :session_secret, ENV['SESSION_SECRET'] || Digest::SHA1.hexdigest(Time.now.to_f.to_s)
      mime_type :js, 'text/javascript'

      use Rack::SslEnforcer if ENV['FORCE_HTTPS']
    end

    before do
    end

    get '/api/sites/?' do
      if request.xhr?
        content_type 'application/json'
        status 200
        Site.sort(:name).all.to_json
      else
        halt 404
      end
    end

    post '/api/sites/?' do
      if request.xhr?
        content_type 'application/json'
        begin
          site = Site.create({ :name => params['name'], :url  => params['url'] })
          site.save
        rescue => e
          p e.message
          halt 400
        end
        status 200
        Site.all.to_json
      else
        halt 404
      end
    end

    post '/api/sites/:site_id/events/:event_id/acknowledge' do
      if request.xhr?
        content_type 'application/json'
        begin
          event = Event.find({ :site_id => params[:site_id], :event_id => params[:event_id] })
          event.acknowledge({ :site_id => params[:site_id], :comment => 'test comment', :author => 'lipstick' })
          status 204
        rescue => e
          p e.message
          halt 400
        end
      else
        halt 404
      end
    end

    delete '/api/sites/:site_id/events/:event_id/acknowledge' do
      if request.xhr?
        content_type 'application/json'
        begin
          event = Event.filter(:id => params[:event_id]).first
          event.remove_acknowledgement
          status 204
        rescue => e
          p e.message
          halt 400
        end
      else
        halt 404
      end
    end

    post '/api/sites/:site_id/events/:event_id/downtime/:duration' do
      if request.xhr?
        content_type 'application/json'
        begin
          event = Event.filter(:id => params[:event_id]).first
          event.schedule_downtime(params[:duration])
          status 204
        rescue => e
          p e.message
          halt 400
        end
      else
        halt 404
      end
    end

    post '/api/sites/:site_id/events/:event_id/check' do
      if request.xhr?
        content_type 'application/json'
        begin
          event = Event.filter(:id => params[:event_id]).first
          event.reschedule_check
          status 204
        rescue => e
          p e.message
          halt 400
        end
      else
        halt 404
      end
    end

    delete '/api/sites/:site_id/?' do
      if request.xhr?
        content_type 'application/json'
        begin
          Site.find_by_id(params[:site_id]).destroy
        rescue => e
          p e.message
          halt 400
        end
        status 204
      else
        halt 404
      end
    end

    get '/*' do
      erb :index, :locals => {}
    end
  end
end
