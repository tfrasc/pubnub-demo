$(document).ready(function() {
  $('#user_id').val(Math.floor(Math.random() * 100000));
  // $('.choice').each(function() {
  //   var ticker = $(this).data('ticker');
  //
  //   $.get(`https://api.coinmarketcap.com/v1/ticker/${ticker}`, function(err, response) {
  //     console.log(response);
  //   });
  // });

  function publish() {
      pubnub = new PubNub({
          publishKey : 'pub-c-cf1ae4e9-3895-4204-b11a-23c22c4497d9',
          subscribeKey : 'sub-c-6b181acc-23e7-11e8-84be-f641dd32cbde'
      })

      pubnub.addListener({
          status: function(statusEvent) {
              if (statusEvent.category === "PNConnectedCategory") {
                  // publishSampleMessage();
              }
          },
          message: function(message) {
              // console.log("New Message!!", message);
              if(message.userMetadata.user_id == $('#user_id').val()) {
                if(message.userMetadata.payment == true) {
                  $(`.channel-content[data-id='${message.channel}']`).append(`<div class="message-container"><div class="message mine">\
                    You paid ${message.userMetadata.amount} ${message.userMetadata.crypto} to User ${message.userMetadata.to_user}\
                    </div></div>`
                  );
                } else {
                  $(`.channel-content[data-id='${message.channel}']`).append(`<div class="message-container"><div class="message mine">${message.message}</div></div>`);
                }
              } else {
                if(message.userMetadata.payment == true) {
                  if(message.userMetadata.payment == true && $('#user_id').val() == message.userMetadata.to_user.toString()) {
                    $(`.channel-content[data-id='${message.channel}']`).append(`<div class="message-container"><div class="message mine">\
                      User ${message.userMetadata.user_id} paid ${message.userMetadata.amount} ${message.userMetadata.crypto} to You\
                      </div></div>`
                    );
                  } else {
                    $(`.channel-content[data-id='${message.channel}']`).append(`<div class="message-container"><div class="message">\
                      User ${message.userMetadata.user_id} paid ${message.userMetadata.amount} ${message.userMetadata.crypto} to User ${message.userMetadata.to_user}\
                      </div></div>`
                    );
                  }
                } else {
                  $(`.channel-content[data-id='${message.channel}']`).append(`<div class="message-container"><div class="message">${message.message}</div></div>`);
                }
              }
              $(`.channel-content[data-id='${message.channel}']`).scrollTop($(`.channel-content[data-id='${message.channel}']`)[0].scrollHeight);
          },
          presence: function(presenceEvent) {
              // console.log("New presence", presenceEvent);
          }
      })
      // console.log("Subscribing..");
      pubnub.subscribe({
          channels: ['bitcoin']
      });
  };

  publish();

  $(document).on('click', '.send-img', function() {
    var msg = $(this).prev().val();
    var channel = $(this).parent().prev().data('id');
    var crypto, amount, user;

    if(msg.indexOf('/pay') !== -1){
      crypto = msg.split('/')[2];
      amount = msg.split('/')[3];
      user = msg.split('/')[4];

      var publishConfig = {
        channel : channel,
        message : msg,
        meta : {
          payment: true,
          user_id: $('#user_id').val(),
          to_user: user,
          amount: amount,
          crypto: crypto
        }
      }

      console.log(crypto, amount, user);
      pubnub.publish(publishConfig, function(status, response) {
          // console.log(status, response);
      });
    } else {
      var publishConfig = {
        channel : channel,
        message : msg,
        meta : {
          payment: false,
          user_id: $('#user_id').val()
        }
      }
      pubnub.publish(publishConfig, function(status, response) {
          // console.log(status, response);
      });
    }

    $(this).prev().val('');
  });

  $('.choice').click(function() {
    var channel = $(this).data('id');
    var title = $(this).find('.choice-title').html();
    var img = $(this).find('.choice-img').attr('src');

    $('.channels').append(
      `<div class="channel-container">\
        <div class="channel-header">\
          <img class="channel-img" src="${img}">\
          <p class="channel-title">${title}</p>\
        </div>\
        <div data-id="${channel}" class="channel-content">\
        <div class="message-container"><div class="message">Talk about ${title} here!</div></div></div>\
        <div class="channel-footer">\
          <input class="message-input" type="text">\
          <img class="send-img" src="http://www.myiconfinder.com/uploads/iconsets/256-256-182bdb888bc2849a2f8fe58cc818137a-message.png">\
        </div>\
      </div>`
    )
    pubnub.subscribe({
        channels: [`${channel}`]
    });

    $(this).remove();
  });
});
