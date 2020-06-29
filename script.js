// // $(document).ready(function(){
// //   setTimeout(function(){    
// //     initChat("252","a");
// // },10000)
// // });
/* runs global socket connection */

var ip = 'http://124.123.97.81:8081/'
// var ip = 'http://127.0.0.1:5000/'
var socket = io.connect(ip);
var EmpCode = "";
var userid;
var online_users = {};
var companyid;
var name_get_msg;
var login_time;
var new_date;
var time_id = Date.now(); 
var message_id;





var all_users; //storing all users fname id and last name
socket.on( 'connect', function() {

});

socket.on('disconnect', (reason) => {
  console.log('the reason for disconnection is', reason);
  if (reason === 'io server disconnect') {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
});

socket.on('reconnect', (attemptNumber) => {
  console.log('we are trying to reconnect')
  // ...
});
socket.on('error', (error) => {
  console.log('socket error occured')
  // ...
});


// var script_tag = document.createElement('script');
// script_tag.setAttribute('src','https://focus-enspire.herokuapp.com/prettydate.js');
// document.head.appendChild(script_tag);


function initChat(user, usertoken, ip){ 

  if(user!= null){
    EmpCode = user;
    var time_id = Date.now();
    interval_check = setInterval(function(){  
      var d = new Date();
      var mili_sec = d.getTime();
      login_time = Math.floor(mili_sec/1000)
      if(EmpCode!= null){
      socket.emit( 'check online', {
      data: userid,
      online_time: login_time
      }) 
    }
    else{
      console.log('EMPCOD is null')
    }
    }, 5000);
    get_id()

    function get_id(){
      socket.emit('getId', {
        emp_code: EmpCode,
        time_id : time_id
      }
     
      )}
      socket.on('ongetId'+EmpCode+'-'+time_id, function(response){
        userid = response[0].id
        companyid = response[0].company_id
        postProcess(userid); 
    
      })



  }
  
  else{
    console.log('invalid user')
    alert('invalid user')
  }
  $('#chat-sidebar').toggle('fast');

}

console.log("Triggered initChat");

$(document).on('click', '#chat-icon-top', function(event) { 
  event.preventDefault();
  // $("#chat-icon-top").unbind();
  $('#chat-sidebar').toggle('fast');
  $('.msg_box').toggle('slow')
})


var arr = []; // List of users
function postProcess(userid){ 
  
  
  var dest;

  get_user()
  get_groups()
  
  

  // var arr = []; // List of users

  $(document).on('click', '.minimise-box', function() { 
    chatbox = $(this).parents().parents().attr("rel") ;
    if ($('[rel="'+chatbox+'"]').find('.msg_wrap').css('display') != 'block'){
      // $('[rel="'+chatbox+'"]').css('top','325px');
      $('[rel="'+chatbox+'"] .msg_wrap').slideToggle('fast');
      $('[rel="'+chatbox+'"] .min-img').css('transform', 'rotate(0deg)');
    }
    else {
      //$('[rel="'+chatbox+'"]').find('.msg_wrap').css('display', 'none')
      $('[rel="'+chatbox+'"] .msg_wrap').slideToggle('fast');
      $('[rel="'+chatbox+'"] .min-img').css('transform', 'rotate(180deg)');
    }

    //$('[rel="'+chatbox+'"] .msg_wrap').slideToggle('fast');
    
    return false;
  });

  
}
  
//   $('#chat-icon-top').unbind('click').bind('click', function (e) {
//     $('#chat-sidebar').toggle('fast');
//      $('.msg_box').toggle('slow')
//  });

  function iconUnreadCounter(){
    var sum = 0;
    $(".unread-circle").each(function() {
    var val = $.trim( $(this).text() );

    if ( val ) {
    val = parseInt( val.replace( /^\$/, "" ) );

    sum += !isNaN( val ) ? val : 0;
    }
    });

    if ($('#chat-icon-top').find('.top-counter').length == 1){
      $('#chat-icon-top').find('.top-counter').remove()
    }
    if (sum > 0){
      
      $('#chat-icon-top').append(
      '<div class="top-counter">'+sum+'</div>'
      ); 
      }
      else{
        return
      }
    }


    //close the chat box
  $(document).on('click', '.close', function() { 
    chatbox = $(this).parents().parents().attr("rel") ;
    $('[rel="'+chatbox+'"]').remove();
    // arr.splice($.inArray(chatbox, arr), 1);
    for(var i=0; i<arr.length; i++){
        if(arr[i]==parseInt(chatbox)){
        arr.splice(i, 1);
      }
    }
    // chat = arr.length-1
    // $('[rel="'+arr[chat]+'"]').css('right','270px')
    displayChatBox();
    sort_users();

    return false;

  });

  //deletes the wholes conversation
  $(document).on('click', '.delete_msg', function() { 
    del_id = $(this).parents().parents().parents().parents().attr('rel')
    var answer = window.confirm("are you sure want to delete the whole conversation?")
    var time_id = Date.now(); 
    if (answer) {
    socket.emit('deleteMessage', {
        source: userid,
        dest: Number(del_id),
        emp_code: EmpCode,
        time_id: time_id
      });
    }
    else {
        return

      }
      socket.on('ondeletesuccess'+EmpCode+'-'+time_id, function(response){

        $('#' + del_id).find('.msg_body').empty();
        $('.sidebar-user-box.'+del_id).find('.last_msg_display').empty()
        console.log("message delete inseerted upddated ")
      });
  });
      
  
  $(document).on('click', '.sidebar-user-box', function() {
    
    var userID = parseInt($(this).attr("class").split(' ')[1]);
    for(i =0; i<all_users.length; i++){
      if(all_users[i].id == userID){
        full_name = all_users[i].firstname + " " + all_users[i].lastname +" " + '('+all_users[i].EmpCode+')';
        name_get_msg = all_users[i].firstname + " " + all_users[i].lastname
        var profile_pic;
        if (all_users[i].attachment != null ){        
          profile_pic = 'emp/pics/'+all_users[i].attachment+''
        }
        else {
          if (all_users[i].gender.trim() == "M"){
            profile_pic = 'EmailTemplateImages/profile.png'
          }
          else{
            profile_pic = 'EmailTemplateImages/Fprofile.png'
          }
        }
        break;
      }

    }
    
    //checking if window is already present 
    if ($.inArray(userID, arr) != -1){
      arr.splice($.inArray(userID, arr), 1);
      arr.unshift(userID);
      displayChatBox(userID);

    }
    else {
      arr.unshift(userID);
      chatPopup =  '<div class="msg_box" isgroup="0" id="'+ userID+'" style="right:270px" rel="'+ userID+'">'+
      // '<div class="box-ring-container">' +
      //   '<div class="box-circle"></div></div>'+
        '<div class="msg_head"><img class="box-contact-image" src="/FocuslabsAPI/public/uploads/'+profile_pic+'"><span id="slider-username">'+full_name +
        '</span><div class = "close"><img class="chat-img" src="https://focus-enspire.herokuapp.com/images/close.png" width: "30px" height: "30px" /></div>'+
        '<div class="minimise-box"><img class="min-img" src="https://focus-enspire.herokuapp.com/images/minimise_icon.png" width: "30px" height: "30px" /></div></div>'+
        '<div class="msg_wrap"> <div class="msg_body"> <div class="msg_push"></div></div>'+
        '<div class="msg_footer"><div class="attach"><div class="delete_msg"><img class="chat-img" src="https://focus-enspire.herokuapp.com/images/delete_icon.png" width: "30px" height: "30px" /><div class = "delete_text">Clear Chat</div></div></div><div class = "msg-type"><textarea id="text_id" class="msg_input" rows="3" placeholder="Type your message"></textarea></div></div></div>' ;     
        // $("body").append(  chatPopup  );
        $('.page-body').append(chatPopup);     
        displayChatBox(userID);
        get_msg(userID); 
        remove_read_count(userID);
        iconUnreadCounter()
        get_status_box(all_users)
        
    }

    // $('.msg_body').slimScroll({
    //   color: '#5db2ff', 
    //   opacity: '1',
    //   size: '5px',
    //   start:  $('#'+message_id+''),
    //   height: $('#element').outerHeight(true),
    //   alwaysVisible: false
    // });
    // $('.msg_wrap').find('.slimScrollBar').css('margin','0')
    
  });

  $(document).on('click', '.danger.boldt-600.sign-out', function() { 
    logout_setinterval();
  })
  function logout_setinterval(){
    clearInterval(interval_check);



    // EmpCode = undefined;
    // userid = undefined;
    // online_users = undefined;
    // socket= undefined;

   

  }
    



  $(document).on('keypress', 'textarea#text_id' , function(e) {     
    
    if (e.keyCode == 13 && !e.shiftKey ) {   
      e.preventDefault();
      var msg = $(this).val();  
      $(this).val('');
      if(msg.trim().length != 0){    
        chatbox = $(this).parents().parents().parents().parents().attr("rel") ;
        var userID = $(this).attr("class");
        var uName = $(this).parent().parent().parent().find('.msg_head');
        var isgroup = $(this).parent().parent().parent().parent().parent().find('.msg_box').attr('isgroup');
        // room = uName[0].innerText;
        msg_time = new Date();
        dateString = new Date(msg_time).toUTCString();
        dateString = dateString.split(' ').slice(0, 3).join(' ');
        var cwindow =  $(this).parent().parent().parent().find('.msg_body');
        var time_id = Date.now(); 
        var d = new Date();
        var mili_sec = d.getTime();
        var current_time = Math.floor(mili_sec/1000)
        date_new = current_time
        date_processing(date_new);
        moment_ago = 'Just Now'
        var element = $('<div id='+time_id + ' class="msg-right"><div class="message-info">'+
        '<div class="contact-name">Me</div>'+
        '<div class="message-time message-time-check" rel="'+ date_new+'">'+moment_ago+'</div></div>'+
        '<div class="text-body">'+msg+'</div>');
        $(cwindow).append(element);
        element = document.getElementById(time_id)
        element.scrollIntoView(true);
        //$(cwindow).append($('<div class="msg-right">'+msg+'<div class = "tick></div></div>'));
        socket.emit( 'my event',{
          from : userid,
          message : msg,
          to: chatbox,
          d_time: current_time,
          isgroup : isgroup
        });
        update_last_message(chatbox,msg,current_time)
        sort_users()
      }
    }   
    
  });

      msg_time_check = setInterval(function(){  
      $.each($('div.message-time-check[rel]'),function(index, value){
        rel = $(value).attr('rel')
        var d = new Date();
        var mili_sec = d.getTime();
        var current_time = Math.floor(mili_sec/1000)
        date_new = current_time - rel
        var time_text = date_processing(date_new)
        $(value).text(time_text)
        //$('.message-time').replaceWith('<div class="region">' + content + '</div>');
      })



    }, 10000);
  // date procesing via rel


    
      // $(document).on('click', '#sidebar-group-box', function() {
      
      //   var userID = $(this).attr("class");
      //   var username = $(this).children().text() ;
        
      //   if ($.inArray(userID, arr) != -1){
      //     arr.splice($.inArray(userID, arr), 1);
      //   }
      //   arr.unshift(userID);
      //   chatPopup =  '<div class="msg_box" isgroup="1" id="'+ userID+'" style="right:270px" rel="'+ userID+'">'+
      //   // '<div class="box-ring-container">' +
      //   //   '<div class="box-circle"></div></div>'+
      //     '<div class="msg_head"><img class="contact-image" src="/FocuslabsAPI/public/uploads/EmailTemplateImages/profile.png"><span id="slider-username">'+username +
      //     '</span><div class = "close"><img class="chat-img" src="https://focus-enspire.herokuapp.com/images/close.png" width: "30px" height: "30px" /></div>'+
      //     '</div>'+
      //     '<div class="msg_wrap"> <div class="msg_body"> <div class="msg_push"></div> </div>'+
      //     '<div class="msg_footer"><textarea id="text_id" class="msg_input" rows="4"></textarea>  </div> </div>' ;    
      //     $("body").append(  chatPopup  );
      //   displayGroupChatBox(userID);
        

      //   $(document).on('keypress', 'textarea' , function(e) {       
      //     if (e.keyCode == 13 ) {   
      //       var msg = $(this).val();  
      //       $(this).val('');
      //       if(msg.trim().length != 0){    
      //         chatbox = $(this).parents().parents().parents().attr("rel") ;
      //         var userID = $(this).attr("class");
      //         var uName = $(this).parent().parent().parent().find('.msg_head');
      //         var isgroup = $(this).parent().parent().parent().parent().find('.msg_box').attr('isgroup');
      //         room = uName[0].innerText;

      //         msg_time = getTime()/1000;
      //         var cwindow =  $(this).parent().parent().parent().find('.msg_body');
      //         $(cwindow).append($('<div class="msg-right"><div class="message-info">'+
      //         '<div class="contact-name">Me</div>'+
      //         '<div class="message-time">10:14 AM, Today</div></div>'+
      //         '<div class="text-body">'+msg+'</div>'));
      //         socket.emit( 'my event',{
      //           from : userid,
      //           message : msg,
      //           to: chatbox,
      //           d_time: msg_time,
      //           isgroup : isgroup
      //         });

      //       }
      //     }
      //   });
      // });

      socket.on( userid, function( response ) {
        console.log( 'incoming message', response.message , response.to )

          var time_id = Date.now(); 
          var d = new Date();
          var mili_sec = d.getTime();
          var current_time = Math.floor(mili_sec/1000)
          date_new = current_time - response.d_time
          update_last_message(response.from, response.message, current_time)
          sort_users()
          date_processing(date_new);
        if (response.isgroup == 0){
          var userID = response.from;
          for(i =0; i<all_users.length; i++){
            if(all_users[i].id == userID){
              name_get_msg = all_users[i].firstname + " " + all_users[i].lastname;
              break;
            }

          }
          var new_window = false; 
          if ($.inArray(userID, arr) != -1){
            arr.splice($.inArray(userID, arr), 1);
            arr.unshift(userID);

            var activeWindows = $(".msg_box>.msg_head");
            var chatWindow = "";
            for(var i=0;i<activeWindows.length;i++){
              d = activeWindows[i].parentElement
              if($(d).attr('rel') == userID){
                chatWindow = activeWindows[i];
                break;
              }
            }
            if(chatWindow!="" && !new_window ){
              var targetWindow = "";
              var moment_ago = 'Just Now'
              targetWindow = $(chatWindow).parent().find('.msg_body');
              
    
              targetWindow.append($('<div class="msg-left" id = '+response.msgid+' ><div class="left-message-info">'+
              '<div class="left-contact-name">'+name_get_msg+'</div>'+
              '<div class="left-message-time message-time-check" rel = "'+response.d_time+'">'+date_processing(date_new)+'</div></div>'+
              '<div class="left-text-body">'+response.message+'</div>'));
              document.getElementById(response.msgid).scrollIntoView(true);
              console.log(targetWindow);
              socket.emit( 'acknowledgement',{
                from: response.from,
                to: response.to,
                isgroup: response.isgroup,
                msgid: response.msgid  
              });
          
            }
          }
          else {
          // chatPopup =  '<div class="msg_box" isgroup="0" id="'+ userID+'" style="right:270px" rel="'+ userID+'">'+

          //   '<div class="msg_head"><img class="contact-image" src="/FocuslabsAPI/public/uploads/EmailTemplateImages/profile.png"><span id="slider-username">'+full_name +
          //   '</span><div class = "close"><img class="chat-img" src="https://focus-enspire.herokuapp.com/images/close.png" width: "30px" height: "30px" /></div>'+
          //   '</div>'+
          //   '<div class="msg_wrap"> <div class="msg_body"> <div class="msg_push"></div> </div>'+
          //   '<div class="msg_footer"><textarea id="text_id" class="msg_input" rows="4"></textarea>  </div> </div>' ;    

          //   $('.page-body').append(chatPopup);
          //   displayChatBox(userID);
          //   get_msg(userID); 
          //   remove_read_count(userID);
          //   new_window = true; 
          update_unread_count(response.from);
          iconUnreadCounter();
          //delete last visible message if already on new message arrival and append new last message
          // $("#chat-sidebar").find("."+response.from).find(".last_msg_display").remove()
          
          // if (response.message.length > 20 ){
          //   $("#chat-sidebar").find("."+response.from).append(
          //     '<div class="last_msg_display"><i>'+response.message.slice(0,20)+'....</i></div></div>'
          //   )}
          // else{

          //     $("#chat-sidebar").find("."+response.from).append(
          //       '<div class="last_msg_display"><i>'+response.message+'</i></div></div>'
          //     )}


          // $("#chat-sidebar").find("."+response.to).append(
          //   '<div class="unread-container">'+
          //   '<div class="unread-circle">'+value.count+'</div>'
          //   // '<div class="unread-circle">'+value.count+'</div></div>'
          // );
          }
          

      
        }
        //   else {
        //   var userID = response.to ;
        //   var activeWindows = $(".msg_box>.msg_head");
        //   var chatWindow = "";
        //   for(var i=0;i<activeWindows.length;i++){
        //     d = activeWindows[i].parentElement
        //     if($(d).attr('rel') ==userID){
        //       chatWindow = activeWindows[i];
        //       //check this part : pramodh
        //       //new_window = true; 
        //       break;
        //     }
        //   }
        //   if(chatWindow!="" && !new_window){
        //     var targetWindow = "";
        //     targetWindow = $(chatWindow).parent().find('.msg_body');
        //     targetWindow.append($('<div class="msg-left" >'+response.message+'</div>'));
        //     console.log(targetWindow);
        //   }

        // }

      });


      socket.on( 'online', function( response ) {
        var current_time;
        //adding online tag where it is missing 
        $.each(response, function(index, value){
          //tack online user here after it goes offline

        // if (online_users.hasOwnProperty(value)){
          var d = new Date();
          var mili_sec = d.getTime();
          
          current_time = Math.floor(mili_sec/1000)
          online_users[value] = current_time
        
        // }
        // else{
        //   online_users[value] = new Date();
        // }
        
          if($("#chat-bar").find("."+value).find(".ring-container").length == 0){
            $("#chat-bar").find("."+value).find(".offline-ring-container").remove()
            $("#chat-bar").find("."+value).append(
              '<div class="ring-container">'+
              '<div class="circle"></div><div class ="status_user">Now</div></div></div>'
            );
          }
          if($(".msg_box#"+value).find(".msg_head").find(".box-ring-container").length == 0){
            $(".msg_box#"+value).find(".box-offline-ring-container").remove()
            $(".msg_box#"+value).find(".msg_head").append(
              '<div class="box-ring-container">'+
              '<div class="box-circle"></div><div class="box-status-user">Now</div></div>'
            )
          }
        });

        //removing online tag where it is not needed  
      
        $("#chat-bar").find(".ring-container").each(
          function(){
          // employee_id =  $(this).parent().attr('class');
          box_name = $(this).parent().attr('class')
          employee_id = parseInt(box_name.replace('sidebar-user-box ', ''))

          employee_found = false;
          for(var i=0; i<response.length; i++){
            if (response[i] == employee_id)
              employee_found = true;
          }
          if (!employee_found){
            $("#chat-bar").find("."+employee_id).find(".ring-container").remove()
            if (online_users.hasOwnProperty(employee_id)){
              var d = new Date();
              var mili_sec = d.getTime();
              var offline_time = Math.floor(mili_sec/1000)
              date_new = offline_time - current_time
              date_processing(date_new);
            $("#chat-bar").find("."+employee_id).append(
              '<div class="offline-ring-container">'+
              '<div class="red-circle"></div><div class ="status_user  message-time-check" rel = "'+offline_time+'">'+date_processing(date_new)+'</div></div>'
            )}
          }
        })

        $(".msg_box").find(".msg_head").find(".box-ring-container").each(
          function(){
            var d = new Date();
            var mili_sec = d.getTime();
            var offline_time = Math.floor(mili_sec/1000)
            date_new = offline_time - current_time
          box_id =  $(this).parent().parent().attr('id');
          box_found = false;
          for(var i=0; i<response.length; i++){
            if (response[i] == box_id)
              box_found = true;
          }
          if (!box_found){
            $(".msg_box#"+box_id).find(".box-ring-container").remove()
            $(".msg_box#"+box_id).find(".msg_head").append(
              '<div class="box-offline-ring-container">'+
              '<div class="box-red-circle"></div><div class ="box-status-user  message-time-check" rel = "'+offline_time+'">'+date_processing(date_new)+'</div></div>'
            )
          }
        })


      });

      function displayChatBox(destination){
        i = 270; // start position
        j = 260;  //next position
        $.each( arr, function( index, value ) {  
          if(index < 4){
            $('[rel="'+value+'"]').css("right",i);
            $('[rel="'+value+'"]').show();
            i = i+j;
            dest = value;    
          }
          else{
            $('[rel="'+value+'"]').hide();
          }
        }); 
        
      }  

      
      // function displayGroupChatBox(destination){ 
      //   i = 270 ; // start position
      //   j = 260;  //next position
      //   $.each( arr, function( index, value ) {  
      //     if(index < 4){
      //       $('[rel="'+value+'"]').css("right",i);
      //       $('[rel="'+value+'"]').show();
      //       i = i+j;
      //       dest = value;    
      //     }
      //     else{
      //       $('[rel="'+value+'"]').hide();
      //     }
      //   }); 
      //   getGroupmsg(destination); 
      // } 


          
      function get_msg(dest){
        var time_id = Date.now(); 
        socket.emit('get_msg',{
            source: userid,
            dest: dest,
            emp_code: EmpCode,
            time_id: time_id
          });
      

        socket.on('ongetmsg'+EmpCode+'-'+time_id, function(response){
            console.log(response);
            $.each(response, function(index, value){
              if (value.destination == userid && value.isread == 0){
                socket.emit( 'acknowledgement',{
                  from: value.source,
                  to: value.destination,
                  msgid: value.id  
                });
                
              }
            });
            var message_id = -1; 
            var scroll_invoked = false; 
            $.each(response, function(index, value){
              var d = new Date();
              var mili_sec = d.getTime();
              var current_time = Math.floor(mili_sec/1000)
              date_new = (current_time) - (value.msgtime)
              date_processing(date_new);
              var username = value.destination;
              var activeWindows = $(".msg_box>.msg_head");
              var chatWindow = "";
              
              for(var i=0;i<activeWindows.length;i++){
                d = activeWindows[i].parentElement
                if($(d).attr('rel') ==username){
                  chatWindow = activeWindows[i];
                  break;
                }
              }
              message_id = value.id; 
              if(chatWindow!=""){
                // var targetWindow = $(chatWindow).parent().find('.msg-left');
                var targetWindow = "";
                targetWindow = $(chatWindow).parent().find('.msg_body');
                
                targetWindow.append($('<div class="msg-right" id= '+value.id+'><div class="message-info">'+
                '<div class="contact-name">Me</div>'+
                '<div class="message-time message-time-check" rel = "'+value.msgtime+'">'+date_processing(date_new)+'</div></div>'+
            '<div class="text-body">'+value.msgtext+'</div>'));
                console.log(targetWindow);
                
              }
            
              else {
                var username = value.source;
                var activeWindows = $(".msg_box>.msg_head");
                var chatWindow = "";
                for(var i=0;i<activeWindows.length;i++){
                  d = activeWindows[i].parentElement
                  if($(d).attr('rel') ==username){
                    chatWindow = activeWindows[i];
                    break;
                  }
                }
                if(chatWindow!=""){
                  // var targetWindow = $(chatWindow).parent().find('.msg-left');
                  var targetWindow = "";
                  targetWindow = $(chatWindow).parent().find('.msg_body');
                  targetWindow.append($('<div class="msg-left" id = '+value.id+'><div class="left-message-info">'+
                  '<div class="left-contact-name">'+name_get_msg+'</div>'+
                  '<div class="left-message-time message-time-check" rel = "'+value.msgtime+'">'+date_processing(date_new)+'</div></div>'+
                  '<div class="left-text-body">'+value.msgtext+'</div></div>'));
                  if(value.isread == false && !scroll_invoked){
                    // document.getElementById(value.id).scrollIntoView(true);
                    $('.msg_body').slimScroll({
                      color: '#5db2ff', 
                      opacity: '1',
                      size: '5px',
                      start:  $('#'+value.id),
                      height: $('#element').outerHeight(true),
                      alwaysVisible: false
                    });
                    $('.msg_wrap').find('.slimScrollBar').css('margin','0')
                    
           
                    scroll_invoked = true; 
                  }
                  //console.log(targetWindow);
                
                }
            
              }
              
            })
            if (!scroll_invoked){
              // document.getElementById(message_id).scrollIntoView(true);
              $('.msg_body').slimScroll({
                color: '#5db2ff', 
                opacity: '1',
                size: '5px',
                start:  $('#'+message_id),
                height: $('#element').outerHeight(true),
                alwaysVisible: false
              });
              $('.msg_wrap').find('.slimScrollBar').css('margin','0')
              
             
            }
          });
          
          
         
        }
      

      //working getmsg older//
      // function get_msg(dest){
      //   $.ajax({
      //     url: 'http://142.93.209.75:5000/getMessages',
      //     type: 'POST',
      //     data:{ 
      //       source: userid,
      //       dest: dest
      //     },
      //     dataType: "json",
      //     success: function (response) {
      //       console.log(response);
      //       $.each(response, function(index, value){
      //         if (value.destination == userid && value.isread == 0){
      //           socket.emit( 'acknowledgement',{
      //             from: value.source,
      //             to: value.destination,
      //             msgid: value.id  
      //           });
                
      //         }
      //       });
      //       var message_id = -1; 
      //       var scroll_invoked = false; 
      //       $.each(response, function(index, value){
      //         msgtime = value.msgtime;
      //         dateString = new Date(msgtime).toUTCString();
      //         dateString = dateString.split(' ').slice(0, 3).join(' ');
      //         //if (value.source == user_id){
      //         var username = value.destination;
      //         var activeWindows = $(".msg_box>.msg_head");
      //         var chatWindow = "";
              
      //         for(var i=0;i<activeWindows.length;i++){
      //           d = activeWindows[i].parentElement
      //           if($(d).attr('rel') ==username){
      //             chatWindow = activeWindows[i];
      //             break;
      //           }
      //         }
      //         message_id = value.id; 
      //         if(chatWindow!=""){
      //           // var targetWindow = $(chatWindow).parent().find('.msg-left');
      //           var targetWindow = "";
      //           targetWindow = $(chatWindow).parent().find('.msg_body');
                
      //           targetWindow.append($('<div class="msg-right" id= '+value.id+'><div class="message-info">'+
      //           '<div class="contact-name">Me</div>'+
      //           '<div class="message-time">'+dateString.toLocaleString("en-US")+'</div></div>'+
      //       '<div class="text-body">'+value.msgtext+'</div>'));
      //           console.log(targetWindow);
                
      //         }
      //         else {
      //           var username = value.source;
      //           var activeWindows = $(".msg_box>.msg_head");
      //           var chatWindow = "";
      //           for(var i=0;i<activeWindows.length;i++){
      //             d = activeWindows[i].parentElement
      //             if($(d).attr('rel') ==username){
      //               chatWindow = activeWindows[i];
      //               break;
      //             }
      //           }
      //           if(chatWindow!=""){
      //             // var targetWindow = $(chatWindow).parent().find('.msg-left');
      //             var targetWindow = "";
      //             targetWindow = $(chatWindow).parent().find('.msg_body');
      //             targetWindow.append($('<div class="msg-left" id = '+value.id+'><div class="left-message-info">'+
      //             '<div class="left-contact-name">'+name_get_msg+'</div>'+
      //             '<div class="left-message-time">'+dateString.toLocaleString("en-US")+'</div></div>'+
      //             '<div class="left-text-body">'+value.msgtext+'</div></div>'));
      //             if(value.isread == false && !scroll_invoked){
      //               document.getElementById(value.id).scrollIntoView(true);
                    
      //               scroll_invoked = true; 
      //             }
      //             //console.log(targetWindow);
                
      //           }
            
      //         }
              
      //       })
      //       if (!scroll_invoked){
      //         document.getElementById(message_id).scrollIntoView(true);
      //       }
      //     }
      //   })
      // };
      //get group messages from database

  //     function user_status(){
  //       $.ajax({
  //         url: 'http://142.93.209.75:5000/UserStatus',
  //         type: 'POST',
  //         data:{ 
  //           source: userid,
  //           dest: dest
  //         },
  //         dataType: "json",
  //         success: function (response) {

  //     }
  //   })
  // }
      function getGroupmsg(dest){
        $.ajax({
          url: 'http://142.93.209.75:5000/getMessages',
          type: 'POST',
          data:{ 
            source: userid,
            dest: dest
          },
          dataType: "json",
          success: function (response) {
            console.log(response);
            $.each(response, function(index, value){
              if (value.source == userid){
              var username = value.destination;
              var activeWindows = $(".msg_box>.msg_head");
              var chatWindow = "";
              for(var i=0;i<activeWindows.length;i++){
                d = activeWindows[i].parentElement
                if($(d).attr('rel') ==username){
                  chatWindow = activeWindows[i];
                  break;
                }
              }
              if(chatWindow!=""){
                // var targetWindow = $(chatWindow).parent().find('.msg-left');
                var targetWindow = "";
                targetWindow = $(chatWindow).parent().find('.msg_body');
                targetWindow.append($('<div class="msg-right">'+value.msgtext+'</div>'));
                console.log(targetWindow);
              }
            }
      
              else {
                var username = value.destination;
                var activeWindows = $(".msg_box>.msg_head");
                var chatWindow = "";
                for(var i=0;i<activeWindows.length;i++){
                  d = activeWindows[i].parentElement
                  if($(d).attr('rel') ==username){
                    chatWindow = activeWindows[i];
                    break;
                  }
                }
                if(chatWindow!=""){
                  // var targetWindow = $(chatWindow).parent().find('.msg-left');
                  var targetWindow = "";
                  targetWindow = $(chatWindow).parent().find('.msg_body');
                  targetWindow.append($('<div class="msg-left">'+value.msgtext+'</div>'));
                  console.log(targetWindow);
                }
              }
            })
          }
        })
      };
      //get user from db
      function get_user(){
        var time_id = Date.now();  
        var response;
        socket.emit( 'GetUserList',{
          companyid: companyid,
          emp_code: EmpCode,
          time_id: time_id
        })
        socket.on('UserListCollected'+EmpCode+'-'+time_id, function(response){
          response =  response;
          contact_search = '<div class="contact-search">'+
          '<input type="text" class="search-input" placeholder="Search Contacts">'+
          '<i class="search-icon fa fa-search"></i>'+
          '<div class="search-helper">Search Your Contacts and Chat History</div></div>'

          $('#chat-sidebar').append(contact_search);
          all_users = response;
          $.each(response, function(index, value){
            if(value.id!= userid){ 
              if (value.attachment != null){
                $("#chat-bar").append(
                  '<div class= "sidebar-user-box '+value.id+'"  data-sort2 = "0">'
                  +'<img class ="contact-image" src="/FocuslabsAPI/public/uploads/emp/pics/'+value.attachment+'" /><span id="slider-username">'+value.firstname+' '+''+value.lastname+' '+'('+value.EmpCode+')</span><div class="unread-container">'+
                  '<div class="unread-circle" data-sort = "0"></div></div>'
                )}

              else {
                if( value.gender.trim() == "M"){
                  $("#chat-bar").append(
                  '<div class= "sidebar-user-box '+value.id+'" data-sort2 = "0">'
                  +'<img class ="contact-image" src="/FocuslabsAPI/public/uploads/EmailTemplateImages/profile.png" /><span id="slider-username">'+value.firstname+' '+''+value.lastname+' '+'('+value.EmpCode+')</span><div class="unread-container">'+
                  '<div class="unread-circle" data-sort = "0"></div></div>'
                )}
                else{
                  $("#chat-bar").find("."+value.id).append(
                    '<img class ="contact-image" src="/FocuslabsAPI/public/uploads/EmailTemplateImages/Fprofile.png" />'
                  )
                }
              }
            }
          })
          socket.emit( 'GetUnread',{
            source: userid,
            emp_code: EmpCode,
            time_id: time_id
          })
          socket.on('UnreadCollected'+EmpCode+'-'+time_id, function(response){
            $.each(response, function(index, value){
              $("#chat-bar").find("."+value.destination).find('.unread-container').remove();
              $("#chat-bar").find("."+value.destination).append(
                '<div class="unread-container">'+
                '<div class="unread-circle" data-sort = '+value.count+'>'+value.count+'</div>'
                // '<div class="unread-circle">'+value.count+'</div></div>'
              );
            })
              
          })

          get_status(response);
          
        })  
        
      $('#chat-bar').slimScroll({
        color: '#5db2ff', 
        opacity: '1',
        size: '5px',
        //height: $('#element').outerHeight(true),
        height: $(window).height() - (50),
        alwaysVisible: false
      });
      

      };

      
      function get_last_msg(){
        var time_id = Date.now();  
        socket.emit('get_last_msg', {
          emp_code: EmpCode,
          time_id : time_id,
          source: userid
        })
        socket.on('last_message_collected'+EmpCode+'-'+time_id, function(response){
          for(var i =0; i<response.length; i++){    
            var msg_id = response[i].msg_id
            var source = response[i].source
            var destination = response[i].destination
            var msgtext = response[i].msgtext
            var msgtime = response[i].msgtime
            for (var j = i+1; j<response.length; j++){
              if (response[j].source == destination && response[j].destination == source && msg_id < response[j].msg_id){
                  msg_id = response[j].msg_id
                  msgtext = response[j].msgtext
                  msgtime =response[j].msgtime
                  break;
              }
            }
            if (source == userid){
              update_last_message(destination,msgtext,msgtime)
            }
            else {
              update_last_message(source,msgtext,msgtime)
            }
          }
          sort_users() 
        })
        $('<li class="" id= "chat-icon-top"><a chat-link="" title="Chat"><i class="icon glyphicon glyphicon-comment"></i></a></li>').insertAfter($('.fullscreen').parent())
      
        }

  

        function update_last_message(destination,msgtext,msgtime){
          $("#chat-bar").find("."+destination).find(".last_msg_display").remove()
          $("#chat-bar").find("."+destination).attr('data-sort2', msgtime)
          if (msgtext.length > 20 ){
            $("#chat-bar").find("."+destination).append(
              '<div class="last_msg_display"><i>'+msgtext.slice(0,20)+'....</i></div></div>'
            )
          }
          else {
            $("#chat-bar").find("."+destination).append(
              '<div class="last_msg_display"><i>'+msgtext+'</i></div></div>'
            )
          }

           
        }
      
      //search bar searching 
      $(document).on('keyup', '.search-input', function() { 
        var value = $(this).val().toLowerCase();
        $("#chat-bar .sidebar-user-box").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });
      function get_status(response){
        $.each(response, function(index, value){
        if(value.lastonline != null && value.lastonline != '') {
          var d = new Date();
          var mili_sec = d.getTime();
          var current_time = Math.floor(mili_sec/1000)
          date_new = (current_time) - (value.lastonline)
          date_processing(date_new);
          $("#chat-bar").find("."+value.id).append(
            '<div class="offline-ring-container">'+
              '<div class="red-circle"></div><div class ="status_user message-time-check" rel = "'+value.lastonline+'">'+new_date+'</div></div>'
          
      )

      }
      })
      get_last_msg();
      
    }

    function get_status_box(response) {
      $.each(response, function(index, value){
        var d = new Date();
        var mili_sec = d.getTime();
        var current_time = Math.floor(mili_sec/1000)
        date_new = (current_time) - (value.lastonline)
        if($(".msg_box#"+value.id).find(".msg_head").find(".box-ring-container").length == 1){
          return
        }
        else{

          if($(".msg_box#"+value.id).find(".msg_head").find(".box-offline-ring-container").length == 0){
          $(".msg_box#"+value.id).find(".msg_head").append(
          '<div class="box-offline-ring-container">'+
          '<div class="box-red-circle"></div><div class ="box-status-user  message-time-check" rel = "'+value.lastonline+'">'+date_processing(date_new)+'</div></div>'
          )}
        }
      
    })
  }
    

    function date_processing(date_new){
      if (isNaN(date_new)){
        new_date = "Never Logged In"
      }
      else if (date_new > 86400*365){
        new_date = "Never Logged In"
      }
      else if (date_new < 60 ){
        new_date =   date_new + ' sec(s) ago'
      }
        else if (date_new > 60 && date_new < 3600){
          new_date =  Math.floor(date_new/60) +  ' min(s) ago'

        }
        else if (date_new > 3600 && date_new < 86400) {
            new_date = Math.floor(date_new/3600) + ' hour(s) ago'
          }
        else{
          new_date = Math.floor(date_new/86400) +  ' day(s) ago'
        }
      return new_date;
    }
      // function get_unread(){
      //   $.ajax({
      //     url: 'http://142.93.209.75:5000/unreadCount',
      //     type: 'GET',
      //     data: {
      //       source: userid
      //     },
      //     dataType: "json",
      //     success: function (response) {
      //       console.log(response);
      //       $.each(response, function(index, value){
      //         $("#chat-bar").find("."+value.destination).find('.unread-container').remove();
      //         $("#chat-bar").find("."+value.destination).append(
      //           '<div class="unread-container">'+
      //           '<div class="unread-circle" data-sort = '+value.count+'>'+value.count+'</div>'
      //           // '<div class="unread-circle">'+value.count+'</div></div>'
      //         );
      //       })
      //       sort_users()
      // }
      //   })
      // } 

      function remove_read_count(destination_user){
        $("#chat-bar").find("."+destination_user).find('.unread-container').remove();
        $("#chat-bar").find("."+destination_user).append(
        '<div class="unread-container">'+
        '<div class="unread-circle" data-sort = "0"></div></div>'
        )}
      
      function update_unread_count(destination_user){
        unread_element = $("#chat-bar").find("."+destination_user).find('.unread-circle');
        //if found 
        if(unread_element.length>0 && unread_element[0].innerText!= ""){
          val = unread_element[0].innerText; 
          val = parseInt(val) + 1; 
          unread_element[0].innerText = val;
          unread_element.attr('data-sort',val.toString())
          //unread_element.value(val);
        }
        else{
          //if not found 
          $("#chat-bar").find("."+destination_user).find('.unread-container').remove();
          $("#chat-bar").find("."+destination_user).append(
            '<div class="unread-container">'+
            '<div class="unread-circle" data-sort = "1">1</div>'
            // '<div class="unread-circle">'+value.count+'</div></div>'
          );
        }
        sort_users()
        // changeTitle()

      }
      function getSorted(selector, attrName, attrName2) {
        return $($(selector).toArray().sort(function(a, b){
          var d = new Date();
          var mili_sec = d.getTime();
          var current_time = Math.floor(mili_sec/1000)
          var a_unread_count = parseInt($(a).find('.unread-circle').attr(attrName))
          var b_unread_count = parseInt($(b).find('.unread-circle').attr(attrName))
          // var a_lastonline = a.getAttribute(attrName2)
          // if (isNaN(a_lastonline)){
          //   a_lastonline = 0;
          // }

          var aVal = a_unread_count*(-1000000)+(current_time-parseInt(a.getAttribute(attrName2))), bVal = b_unread_count*(-1000000)+(current_time-parseInt(b.getAttribute(attrName2)));
          return aVal - bVal; }));
      }

      function sort_users(){
        var unread_shuffle = getSorted('.sidebar-user-box', 'data-sort', 'data-sort2')
        $("#chat-bar").empty();
        // contact_search = '<div class="contact-search">'+
        // '<input type="text" class="search-input" placeholder="Search Contacts">'+
        // '<i class="search-icon fa fa-search"></i>'+
        // '<div class="search-helper">Search Your Contacts and Chat History</div>'+
        // '</div>'
        // $('#chat-bar').append(contact_search);
        for(var i =0; i<unread_shuffle.length; i++ ){
          $("#chat-bar").append($(unread_shuffle[i]))
        }
        iconUnreadCounter()
      }
      

      // var isOldTitle = true;
      // var oldTitle = "Dashboard";
      // var newTitle = "New Message";
      // var interval = null;
      // function changeTitle() {
      //   document.title = isOldTitle ? oldTitle : newTitle;
      //   isOldTitle = !isOldTitle;
      //   setInterval(changeTitle, 700)
      // }

      // interval = setInterval(changeTitle, 700);

      // $(window).focus(function () {

      //   clearInterval(interval);
      //   $("title").text(oldTitle);
      // });

      function get_groups(){
        $.ajax({
          url: 'http://142.93.209.75:5000/getGroup',
          type: 'GET',
          success: function (response) {
            console.log(response);
            $.each(response, function(index, value){
              $("#group-sidebar").append(
                '<div id="sidebar-group-box" class='+value.id+'>'
                +'<img src="/static/images/chat.png" /><span id="slider-username">'+value.group_name+'&nbsp('+value.id+')</span></div>'
              );
      
            })
      
            
          }
        })
      };
      
      function upload(){
        var form_data = new FormData($('#upload-file')[0]);
              $.ajax({
                  type: 'POST',
                  url: '/uploadFile',
                  data: form_data,
                  contentType: false,
                  cache: false,
                  processData: false,
                  success: function(data) {
                      console.log('Success!');
                  },
              });
      };
  

  
  /* version 1.7*/