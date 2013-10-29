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

    not_found do
      erb :'404'
    end

    get '/' do
      erb :index, :locals => {}
    end

    get '/sites/?' do
      if request.accept.include?('application/json')
        content_type 'application/json'
        status 200
        Site.all.to_json
      else
        status 200
        erb :sites, :locals => {}
      end
    end

    post '/sites/?' do
      if request.accept.include?('application/json')
        content_type 'application/json'
        status 200
        Site.all.to_json
      else
        redirect '/404'
      end
    end
  end
end
