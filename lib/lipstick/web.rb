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
        status 200
        erb :sites, :locals => { :sites => Site.all }
      end
    end

    post '/api/sites/?' do
      if request.xhr?
        content_type 'application/json'
        status 200
        Site.all.to_json
      else
        redirect '/404'
      end
    end

    get '/*' do
      erb :index, :locals => {}
    end
  end
end
