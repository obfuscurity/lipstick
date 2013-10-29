require 'rack/test'
require 'spec_helper'

require 'lipstick/web'

describe Lipstick::Web do
  include Rack::Test::Methods

  def app
    Lipstick::Web
  end

  describe 'GET /' do
    context 'html' do
      it 'should return ok' do
        get '/'
        last_response.should be_ok
      end
    end
  end
end
