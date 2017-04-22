const 	crypto 	= require('crypto');

class binding{
	constructor (secret) {
        this._secret = api;
        this.chatroom = [];
    }

    AddChatRoom(platform, thread){
    	this._chatroom.push([platform, [thread]])
    }
}
exports.run = (api, event) => {
	var apis = exports.platform.getIntegrationApis();

	if(['facebook', 'wechat', 'test'].indexOf(event.event_source)==-1){
		LOG.warn('Platform is not supported'+event.event_source)
		return;
	}

	switch(event.arguments[0]){
		case "/bind":
			if(event.arguments[1]){
				var _isFound = false
				for (var i = exports.config.bindings.length - 1; i >= 0; i--) {
					if(exports.config.bindings[i].secret == event.arguments[1]){
						exports.config.bindings[i].chatroom.push({platform:event.event_source, thread_id:event.thread_id})
						_isFound = true;
						break;
					}
				}
				if(_isFound){
					api.sendMessage('Bind successfully!!', event.thread_id);
				}else{
					api.sendMessage('Can\'t find a corresponding binding!! ', event.thread_id);
				}
			}else{
				var timestamp = Date.now();
				
				var secret = crypto.createHmac('sha256', 'ring_bind_'+event.sender_name+'_'+timestamp).digest('hex');
				api.sendMessage('Paste the following binding script to the chat room you want to bind.', event.thread_id);
				api.sendMessage('/bind '+ secret, event.thread_id);
				
				const binding = {secret:secret, chatroom:[]}
				binding.chatroom.push({platform:event.event_source, thread_id:event.thread_id});
				exports.config.bindings.push(binding);
			}
			
			break;
		case "/unbind":
			break;
		default:
			LOG.info(JSON.stringify(event))
			var _isFound = false
			for (var i = exports.config.bindings.length - 1; i >= 0; i--) {
				for (var j = exports.config.bindings[i].chatroom.length - 1; j >= 0; j--) {
					var chat = exports.config.bindings[i].chatroom[j];
					if(chat.platform == event.event_source && chat.thread_id == event.thread_id){
						for (var k = exports.config.bindings[i].chatroom.length - 1; k >= 0; k--) {
							var chat_found = exports.config.bindings[i].chatroom[k]
							if(chat_found.platform != event.event_source || chat_found.thread_id != event.thread_id){
								if(apis[chat.platform]){
									LOG.info('Send a message from '+event.event_source+' to '+chat_found.platform+' : '+event.body);
									apis[chat_found.platform].sendMessage('['+event.sender_name+'@'+event.event_source+'] '+event.body, chat_found.thread_id)
								}
							}
						}
						_isFound = true;
						break;
						
					}
				}
				if(_isFound){break;}
			}
			break;
	}
    
    
    
};
exports.match = (event, commandPrefix) => {
    return true;
};