require 'sinatra'
require 'rack-ssl-enforcer'
require 'nagiosharder'
require 'json'
require 'uri'

module Radial
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

    get '/' do
      erb :index, :locals => { }
    end
  end
end

