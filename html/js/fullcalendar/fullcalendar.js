Traction.FullCalendar = { };

Traction.FullCalendar = {

  onEventDropEvent: function(info) {

    console.log("Event entry was dropped. View = " + info.view.type);

    if (info.event.allDay) {
      console.log('Dropped into a day-grid area.');

      const startDateTime = info.event.startStr + 'T00:00:00+00:00'; // GMT Midnight
      const startDateTimeX = moment(startDateTime).format('x'); // GMT Midnight

      //console.log('startDateTime = ' + startDateTime);
      //console.log('startDateTimeX = ' + startDateTimeX);

      const endDateTime   = info.event.end ? moment(info.event.end).add(-1,'days').format() : startDateTime;
      const endDateTimeX  = info.event.end ? moment(endDateTime).format('x')                : startDateTimeX;

      //console.log('endDateTime = ' + endDateTime);
      //console.log('endDateTimeX = ' + endDateTimeX);

      const msgArg = {
        "start": moment(startDateTime).format('YYYY/MM/DD'),
        "end": moment(endDateTime).format('YYYY/MM/DD'),
        "fqid": info.event.id,
        "allday": info.event.allDay,
        "displayname": info.event.extendedProps.displayname,
        "tractionid": info.event.extendedProps.tractionid
      }

      console.dir(msgArg);

      const callbackFunc = startDateTime === endDateTime ? Traction.FullCalendar.displayStatusMoveEventDate(msgArg) : Traction.FullCalendar.displayStatusMoveEventStartEnd(msgArg);

      Proteus.Calendar.setEventProperties(info.event.id, startDateTimeX, endDateTimeX, true, callbackFunc);

    } else {
      console.log('Dropped into a time-grid area.');

      const startDateTime = moment(info.event.start).format(); // Local Time
      const startDateTimeX = moment(startDateTime).format('x'); // Local Time

      console.log('startDateTime = ' + startDateTime);
      console.log('startDateTimeX = ' + startDateTimeX);

      const endDateTime = moment(info.event.end).format(); // Local Time
      const endDateTimeX = moment(endDateTime).format('x'); // Local Time

      console.log('endDateTime = ' + endDateTime);
      console.log('endDateTimeX = ' + endDateTimeX);


      const msgArg = {
        "start": moment(startDateTime).format('YYYY/MM/DD HH:mm'),
        "end": moment(endDateTime).format('YYYY/MM/DD HH:mm'),
        "fqid": info.event.id,
        "allday": info.event.allDay,
        "displayname": info.event.extendedProps.displayname,
        "tractionid": info.event.extendedProps.tractionid
      }

      console.log(msgArg);

      const callbackFunc = Traction.FullCalendar.displayStatusMoveEventStartEnd(msgArg);
      Proteus.Calendar.setEventProperties(info.event.id, startDateTimeX, endDateTimeX, false, callbackFunc);

    }

  },

  // When a PM entry (task, goal, milestone) is dropped
  onEventDropPm: function(info) {

    if (info.event.allDay) {

      console.log("PM entry was dropped onto the allDay area.");

      var startDateTimeLocal = info.event.startStr; // YYYY-MM-DD
      var startDateTimeGmtMidnight = moment(startDateTimeLocal).format('YYYY-MM-DD') + 'T00:00:00+0000';
      var startDateTimeGmtMidnightX = moment(startDateTimeGmtMidnight).format('x');

      var msgArg = {
        "fqid": info.event.id,
        "displayname": info.event.extendedProps.displayname,
        "tractionid": info.event.extendedProps.tractionid,
        // Date only for the "allDay" PM entry
        "start": moment(info.event.start).format('YYYY/MM/DD')
      };

      //console.log('startDateTimeLocal = ' + startDateTimeLocal);
      //console.log('startDateTimeGmtMidnight = ' + startDateTimeGmtMidnight);
      //console.log('startDateTimeGmtMidnightX = ' + startDateTimeGmtMidnightX);
      //console.log(msgArg);

      var callbackFunc = Traction.FullCalendar.displayStatusMovePMDue(msgArg);
      Proteus.Calendar.moveEvent(info.event.id, startDateTimeGmtMidnightX, callbackFunc);

    } else {

      console.log("PM entry was dropped onto the non-allDay (time-grid) area.");

      var startDateTimeHumanZone = info.event.startStr;
      var startDateTimeEpoch = moment(startDateTimeHumanZone).format('x');

      var msgArg = {
        "fqid": info.event.id,
        "displayname": info.event.extendedProps.displayname,
        "tractionid": info.event.extendedProps.tractionid,
        "start": moment(info.event.start).format('YYYY/MM/DD HH:mm')
      };

      //console.log('startDateTimeHumanZone = ' + startDateTimeHumanZone);
      //console.log('startDateTimeEpoch = ' + startDateTimeEpoch);
      //console.log(msgArg);

      if (Traction.FullCalendar.pmTimeSupport) {
        var callbackFunc = Traction.FullCalendar.displayStatusMovePMDue(msgArg);
        Proteus.Calendar.moveEvent(info.event.id, startDateTimeEpoch, callbackFunc);
      } else {
        Proteus.showStatusMessage(eval(i18n_fullcalendar("proteus_status_message_moving_into_timegrid_not_supported", "'Moving ' + msgArg.displayname + ' ' + msgArg.tractionid + ' into the time-grid area is not supported.'"), true));
        info.revert();
      }

    }

    // The easiest way to move the tasks related to a milestone on move
    // of the milestone should be refreshing the whole calendar.
    // See Server93891.
    if ( info.event.extendedProps.customentrytype === 'milestone' ) {
      setTimeout( ()=>info.view.calendar.refetchEvents(), 50);
    }

  },

  onEventResize: function(info) {
    if (info.event.extendedProps.customentrytype === 'event') {
      if (info.event.extendedProps.tpAllDay) {
        var endDateTimeLocal = moment(info.event.end).format('YYYY-MM-DDT00:00:00+00:00');
        var endDateTimeEpoch = moment(endDateTimeLocal).add(-1,'days').format('x');
      } else {
        var endDateTimeLocal = moment(info.event.end).format('YYYY-MM-DDTHH:mm:ssZ');
        var endDateTimeEpoch = moment(endDateTimeLocal).format('x');
      }

      var msgArg = {
        "displayname": info.event.extendedProps.displayname,
        "tractionid": info.event.extendedProps.tractionid,
        "start": moment(info.event.start).format('YYYY-MM-DD HH:mm:ss'),
        "end": moment(info.event.end).format('YYYY-MM-DD HH:mm:ss')
      };
      console.log(msgArg);
      var callbackFunc = Traction.FullCalendar.displayStatusResizeEventStartEnd(msgArg);
      console.log('endDateTimeLocal = ' + endDateTimeLocal);
      console.log('endDateTimeEpoch = ' + endDateTimeEpoch);
      Proteus.Calendar.changeEventEnd(info.event.id, endDateTimeEpoch, callbackFunc);
    } else {
      var msg = 'Sorry. Resizing a ' + info.event.extendedProps.displayname + ' is not supported.'
      Proteus.showStatusMessage(msg, true);
      revertFunc();
    }
  },

  // Drag'n'Drop of Event Entry from External or Another Callendar
  onEventReceiveEvent: function(info, draggedItemParam) {
    console.log("Event external dropped. View = " + info.view.type);
    Proteus.showStatusMessage("Sorry. Dropping an external event entry is not supported yet.", true);
  },

  // Drag'n'Drop of PM Entry from External or Another Callendar
  onEventReceivePm: function(info, draggedItemParam) {
    console.log("PM external dropped. View = " + info.view.type);
    console.dir(info);
    console.dir(draggedItemParam);

    var arrayClassNames = info.draggedEl.classList;
    info.event.setProp('className', arrayClassNames);

    if (info.event.allDay) {
      // Dropped on the allDay slot
      if (draggedItemParam.tpallday === 'true') {
        var startDateLocal = info.event.startStr; // YYYY-MM-DD
        var startDateTimeGmtMidnight = startDateLocal + 'T00:00:00+0000';
        var startDateTimeGmtMidnightX = moment(startDateTimeGmtMidnight).format('x');

        var msgArg = {
          "fqid": draggedItemParam.fqid,
          "displayname": draggedItemParam.displayname,
          "tractionid": draggedItemParam.tractionid,
          "start": startDateLocal
        };

        //console.log('startDateLocal = ' + startDateLocal);
        //console.log('startDateTimeGmtMidnight = ' + startDateTimeGmtMidnight);
        //console.log('startDateTimeGmtMidnightX = ' + startDateTimeGmtMidnightX);
        //console.log(msgArg);

        var callbackFunc = Traction.FullCalendar.afterReceiveEvPm(info,msgArg);
        //var callbackFunc = Traction.FullCalendar.displayStatusMovePMDue(msgArg);
        Proteus.Calendar.moveEvent(draggedItemParam.fqid, startDateTimeGmtMidnightX, callbackFunc);

      }
    } else {
      // Dropped on the non-allDay slot that supports time-grid
      if (draggedItemParam.tpallday === 'true') {
        var msgArg = {
          "displayname": draggedItemParam.displayname,
          "tractionid": draggedItemParam.tractionid,
        };
        Traction.FullCalendar.displayStatusRevertMovementOnTimeGrid(msgArg);
        info.event.remove();
      }
    }

    if (info.draggedEl.dataset.tpallday) {
      var fillBackground = true;
    } else {
      var fillBackground = false;
    }

    console.log('info.draggedEl');
    console.log(info.draggedEl);

    //el, customEntryType, colorName, fillBackground
    //Traction.FullCalendar.colorCalItem(info.event, info.event.allDay, info.draggedEl.dataset.customentrytype, info.draggedEl.dataset.color, fillBackground);

  },

  // Convert an HTML string into the "real" HTML code.
  // https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
  htmlToElements: function(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.childNodes;
  },

  // -------------------------------------------------------
  // Callbacks on events
  // -------------------------------------------------------
  afterReceiveEvPm: function(info, msgArg) {
    console.log('---- afterReceiveEvPm ----');
    console.dir(info);
    console.dir(msgArg);

    // Remove the element from the "Draggable Events" list
    info.draggedEl.parentNode.removeChild(info.draggedEl);

    var arrayFqid = [ msgArg.fqid ];

    // These parameters represent where the target calendar is.
    // For example, userId = 5 means "this calendar is in the user profile page whose user id is 5."
    var calParam = {
      "projId": $('#external-events').attr('data-proj'),
      "userId": $('#external-events').attr('data-user'),
      "goalId": $('#external-events').attr('data-goal'),
      "msId": $('#external-events').attr('data-ms'),
      // Calendar type name, default = "normal"
      "calType": $('#external-events').attr('data-caltype')
    };

    Traction.FullCalendar.removeExtEv(arrayFqid, calParam)
  },

  // -------------------------------------------------------
  // Display status messages
  // -------------------------------------------------------
  // fcShowStatusMoveEventDate
  displayStatusMoveEventDate: function(msgArg) {
    Proteus.showStatusMessage(eval(i18n_fullcalendar("proteus_status_message_move_event_date", "msgArg.displayname + ' ' + msgArg.tractionid + ' was moved. (Date: ' + msgArg.start + ')'"), true));
  },
  //fcShowStatusMoveEventStartEnd
  displayStatusMoveEventStartEnd: function(msgArg) {
    Proteus.showStatusMessage(eval(i18n_fullcalendar("proteus_status_message_move_event_start_end", "msgArg.displayname + ' ' + msgArg.tractionid + ' was moved. (Start: ' + msgArg.start + ', End: ' + msgArg.end + ')'"), true));
  },
  //fcShowStatusMovePMDue
  displayStatusMovePMDue: function(msgArg) {
    Proteus.showStatusMessage(eval(i18n_fullcalendar("proteus_status_message_move_pm_due", "msgArg.displayname + ' ' + msgArg.tractionid + ' was moved. (Due: ' + msgArg.start + ')'"), true));
  },
  // fcShowStatusResizeEventStartEnd
  displayStatusResizeEventStartEnd: function(msgArg) {
    Proteus.showStatusMessage(eval(i18n_fullcalendar("proteus_status_message_resize_event_start_end", "msgArg.displayname + ' ' + msgArg.tractionid + ' was modified. (Start: ' + msgArg.start + ', End: ' + msgArg.end + ')'"), true));
  },
  fcShowStatusPMTaskChkBox: function(displayname, id, action) {
    if ( action === 'close' ) {
      Proteus.showStatusMessage(i18n_fullcalendar("proteus_status_message_close_task", "'You closed the ' + displayname + ' ' + id + '.'"), true);
    } else if ( action === 'open' ) {
      Proteus.showStatusMessage(i18n_fullcalendar("proteus_status_message_reopen_task", "'You re-opened the ' + displayname + ' ' + id + '.'"), true);
    }
  },
  displayStatusRevertMovementOnTimeGrid: function(msgArg) {
    Proteus.showStatusMessage(eval(i18n_fullcalendar("proteus_status_message_moving_into_timegrid_not_supported", "'Moving ' + msgArg.displayname + ' ' + msgArg.tractionid + ' into the time-grid area is not supported.'"), true));
  },

  // -------------------------------------------------------
  // Record the order of the external events by using jQuery UI Sortable.
  // See the Proteus.addHandler('load') section.
  // -------------------------------------------------------
  updateExtEvOrder: function(arrayFqid, calParam) {

    console.log('---- updateExtEvOrder ----');
    console.log(arrayFqid);
    console.dir(calParam);

    // This will be the payload encoded for a POST request to the
    // server.
    var poststring = "";
    // The type of the view is "ajaxrpc"
    poststring = fm_append(poststring, "type=fcextevorder");
    poststring = fm_append(poststring, "method=update");
    // _get_url_param is exported by GWT to the global JS namespace,
    // to allow getting the current value of the proj= param.
    poststring = fm_append(poststring, "projid="+calParam.projId);
    poststring = fm_append(poststring, "goalid="+calParam.goalId);
    poststring = fm_append(poststring, "msid="+calParam.msId);
    poststring = fm_append(poststring, "userid="+calParam.userId);
    poststring = fm_append(poststring, "caltype="+calParam.calType);
    poststring = fm_append(poststring, "entryid="+encode_url_parameter(arrayFqid.join(',')));

    // Browser ID is required by the server as a CSRF attack
    // countermeasure
    poststring = fm_append(poststring, "browserid="+Traction.ContextMenu.getBrowserId());

    console.log('updateExtEvOrder poststring = ' + poststring);

    // you can put anything in here your callback needs to know
    // when handling the response
    const state = {
      "method": "update",
      "projId": calParam.projId,
      "goalId": calParam.goalId,
      "msId": calParam.msId,
      "userId": calParam.userId,
      "calType": calParam.calType
    };

    // Call back to the kanbanDefaultResponse function when response received
    xmlpost_async(FORM_ACTION_READ_WRITE, poststring, null, true, Traction.FullCalendar.extEvOrderDefaultResponse, state);
  },

  extEvOrderDefaultResponse: function(responseText, state) {
    console.dir(state);
    console.log("extEvOrderDefaultResponse: method=" + state.method + " projId="+ state.projId + " userId="+ state.userId + " goalId="+ state.goalId + " msId="+ state.msId + " entryId="+ state.entryId + " caltype="+ state.calType);
  },

  // -------------------------------------------------------
  // Remove the entry from the JavaDB database that stores the order of the items.
  // -------------------------------------------------------
  removeExtEv: function(arrayFqid, calParam) {

    console.log('---- removeExtEv ----');
    //console.log(arrayFqid);
    //console.dir(calParam);

    // This will be the payload encoded for a POST request to the
    // server.
    var poststring = "";
    // The type of the view is "ajaxrpc"
    poststring = fm_append(poststring, "type=fcextevorder");
    poststring = fm_append(poststring, "method=remove");
    // _get_url_param is exported by GWT to the global JS namespace,
    // to allow getting the current value of the proj= param.
    poststring = fm_append(poststring, "projid="+calParam.projId);
    poststring = fm_append(poststring, "goalid="+calParam.goalId);
    poststring = fm_append(poststring, "msid="+calParam.msId);
    poststring = fm_append(poststring, "userid="+calParam.userId);
    poststring = fm_append(poststring, "caltype="+calParam.calType);
    poststring = fm_append(poststring, "entryid="+encode_url_parameter(arrayFqid.join(',')));

    // Browser ID is required by the server as a CSRF attack
    // countermeasure
    poststring = fm_append(poststring, "browserid="+Traction.ContextMenu.getBrowserId());

    //console.log('removeExtEv poststring = ' + poststring);

    // you can put anything in here your callback needs to know
    // when handling the response
    const state = {
      "method": "remove",
      "projId": calParam.projId,
      "goalId": calParam.goalId,
      "msId": calParam.msId,
      "userId": calParam.userId,
      "calType": calParam.calType
    };

    // Call back to the kanbanDefaultResponse function when response received
    xmlpost_async(FORM_ACTION_READ_WRITE, poststring, null, true, Traction.FullCalendar.removeExtEvDefaultResponse, state);
  },

  removeExtEvDefaultResponse: function(responseText, state) {
    //console.dir(state);
    //console.log("removeExtEvDefaultResponse: method=" + state.method + " projId="+ state.projId + " userId="+ state.userId + " goalId="+ state.goalId + " msId="+ state.msId + " entryId="+ state.entryId + " caltype="+ state.calType);
  },

  colorCalItem: function(info) {

    //console.log('---- colorCalItem ----');
    //console.dir(info);

    var customEntryType = info.event.extendedProps.customentrytype;
    var colorName = info.event.extendedProps.colorname;
    if ($(info.el).hasClass('fc-daygrid-block-event')) {
      var fillBackground = true;
    } else {
      var fillBackground = false;
    }
    var allDay = info.event.allDay;
    var viewType = info.view.type;

    //console.log('fillBackground = ' + fillBackground);
    //console.log('allDay = ' + allDay);
    //console.log('viewType = ' + viewType);
    //console.log('Does the view name contain \"list\" ? ' + viewType.indexOf('list'));

    if (viewType.indexOf('list') > 0) {
      // List View
      Traction.FullCalendar.colorCalItemList(info.el, customEntryType, colorName, fillBackground);
    } else {
      if (allDay) {
        Traction.FullCalendar.colorCalItemDayGrid(info.el, customEntryType, colorName, fillBackground);
      } else {
        Traction.FullCalendar.colorCalItemTimeGrid(info.el, customEntryType, colorName, fillBackground);
      }
    }

  },

  colorCalItemDayGrid: function(el, customEntryType, colorName, fillBackground) {
    console.log('---- colorCalItemDayGrid ----');
    console.dir(el);
    console.log('customEntryType = ' + customEntryType + ' colorName = ' + colorName + ' fillBackground = ' + fillBackground);

    // Set the background color of each event with the color picked up from a standard link,
    // if the event is not from Google Calendar.
    // Please refer to JPBO16042, JPBO16137, and JPBO16290 for details.
    var linkColor = $('#fc-linkcolor-placeholder a').css('color');
    //console.log('customentrytype = ' + info.event.extendedProps.customentrytype + ' linkColor = ' + linkColor);

    if ( customEntryType === 'event' ) {
      console.log('aaa');
      if ( colorName ) {
        console.log('bbb');
        $(el).css('color', '#fff');
        $(el).css('background-color', Traction.FullCalendar.convertColorNameToCode(colorName));
      } else {
        console.log('ccc');
        if ( fillBackground ) {
          $(el).css('color', '#fff');
          $(el).css('background-color', linkColor);
        } else {
          $(el).css('color', linkColor);
        }
      }
    } else {
      if (! colorName) {
        if ( $(el).hasClass('calitem-allday') ) {
          $(el).css('color', '#fff');
          $(el).css('background-color', linkColor);
        } else {
          $(el).find('.text').css('color', linkColor);
          $(el).css('background-color', 'transparent');
        }
      } else {
        $(el).css('color', '#fff');
      }
    }
  },

  colorCalItemTimeGrid: function(el, customEntryType, colorName, fillBackground) {
    //console.log('---- colorCalItemTimeGrid ----');
    //console.dir(el);
    //console.log('customEntryType = ' + customEntryType + ' colorName = ' + colorName + ' fillBackground = ' + fillBackground);

    // Set the background color of each event with the color picked up from a standard link,
    // if the event is not from Google Calendar.
    // Please refer to JPBO16042, JPBO16137, and JPBO16290 for details.
    var linkColor = $('#fc-linkcolor-placeholder a').css('color');


    if (! colorName) {
      $(el).css('color', '#fff');
      $(el).css('background-color', linkColor);
    } else {
      $(el).css('color', '#fff');
      $(el).css('background-color', Traction.FullCalendar.convertColorNameToCode(colorName));
    }

  },

  colorCalItemList: function(el, customEntryType, colorName, fillBackground) {
    var linkColor = $('#fc-linkcolor-placeholder a').css('color');
    $(el).css('background-color', 'transparent');
    $(el).css('color', linkColor);
    if (colorName) {
      $(el).find('.fc-list-event-dot').css('border-color', Traction.FullCalendar.convertColorNameToCode(colorName));
    } else {
      $(el).find('.fc-list-event-dot').css('border-color', linkColor);
    }
  },

  convertColorNameToCode: function(colorName) {
    switch (colorName) {
      case 'red':
        var colorCode = '#e53935';
        break
      case 'orange':
        var colorCode = '#fb8c00';
        break;
      case 'yellow':
        var colorCode = '#fdd835';
        break;
      case 'green':
        var colorCode = '#43a047';
        break;
      case 'blue':
        var colorCode = '#1e88e5';
        break;
      case 'purple':
        var colorCode = '#8e24aa';
        break;
      case 'gray':
        var colorCode = '#757575';
        break;
      default:
        var colorCode = 'transparent';
        break;
    }
    return colorCode;
  },

  addPriorityBadge: function(el) {
    console.log('---- addPriorityBadge ----');
    console.log(el);

    var entryClasses = $(el).attr('class');
    var classArray = entryClasses.split(' ');

    console.dir(classArray);

    for (i = 0; i < classArray.length; i++) {
      var priority = classArray[i].match(/calitem-p([0-9])/);
      console.log('loop = ' + priority);
      if (priority) {
        console.log('priority[1] = ' + priority[1]);
        if ($(el).find('.fc-event-title').children('span.priority').length === 0) {
          $(el).find('.fc-event-title').append('<span class="label-sticker priority p' + priority[1] + '">' + priority[1] + '</span>');
        }
      }
    }

  },

  // -------------------------------------------------------
  // The following data will be passed to the event that is
  // dragged from the external-event section and dropped onto the calendar.
  // See the "new Draggable" section below.
  // -------------------------------------------------------
  externalEventData: function(eventEl) {
    if (eventEl.dataset.customentrytype === 'event') {
      return Traction.FullCalendar.externalEventDataEv(eventEl);
    } else if (eventEl.dataset.customentrytype === 'task') {
      return Traction.FullCalendar.externalEventDataTask(eventEl);
    } else if (eventEl.dataset.customentrytype === 'goal') {
      return Traction.FullCalendar.externalEventDataGoal(eventEl);
    } else if (eventEl.dataset.customentrytype === 'milestone') {
      return Traction.FullCalendar.externalEventDataMs(eventEl);
    } else {
      return Traction.FullCalendar.externalEventDataShared(eventEl);
    }
 },
 externalEventDataEv: function(eventEl) {
   var dataShared = Traction.FullCalendar.externalEventDataShared(eventEl);
   var dataEv = {
     tpAllDay: eventEl.dataset.tpallday,
     tpFullSingleDay: eventEl.dataset.tpfullsingleday,
     invitees: eventEl.dataset.invitees
   };
   return Object.assign(dataShared, dataEv);
 },
 externalEventDataTask: function(eventEl) {
   var dataShared = Traction.FullCalendar.externalEventDataShared(eventEl);
   var dataTask = {
     tpAllDay: eventEl.dataset.tpallday,
     assigned: eventEl.dataset.assigned
   };
   return Object.assign(dataShared, dataTask);
 },
 externalEventDataGoal: function(eventEl) {
   var dataShared = Traction.FullCalendar.externalEventDataShared(eventEl);
   var dataGoal = {
     tpAllDay: eventEl.dataset.tpallday,
     owners: eventEl.dataset.owners,
     members: eventEl.dataset.members
   };
   return Object.assign(dataShared, dataGoal);
 },
 externalEventDataMs: function(eventEl) {
   var dataShared = Traction.FullCalendar.externalEventDataShared(eventEl);
   var dataMs = {
     tpAllDay: eventEl.dataset.tpallday,
   };
   return Object.assign(dataShared, dataMs);
 },
 externalEventDataShared: function(eventEl) {
   var data = {
     id: eventEl.dataset.fqid,
     tractionid: eventEl.dataset.tractionid,
     displayname: eventEl.dataset.displayname,
     displaytype: eventEl.dataset.displaytype,
     customentrytype: eventEl.dataset.customentrytype,
     editable: eventEl.dataset.editable,
     durationEditable: eventEl.dataset.durationeditable,
     className: eventEl.dataset.classname,
     title: $(eventEl.innerHTML)[0].innerHTML,
     titleText: eventEl.dataset.titletext,
     tpDue: eventEl.dataset.tpdue,
     colorname: eventEl.dataset.color,
     rg: eventEl.dataset.rg,
     tpurl: eventEl.dataset.tpurl,
     titleTipDesc: eventEl.dataset.titletipdesc
   };
   return data;
 }

}


function fcShowStatusPMTaskChkBox(displayname, id, action) {
  if ( action === 'close' ) {
    Proteus.showStatusMessage('Closed the ' + displayname + '(' + id + ').', true);
  } else if ( action === 'open' ) {
    Proteus.showStatusMessage('Re-opened the ' + displayname + '(' + id + ').', true);
  }
}

function fcRenderCalendar(data) {

  console.log('---- fcRenderCalendar: Render FullCalendar -----')
  console.dir(data);

  Traction.FullCalendar.pmTimeSupport = data.pmTimeSupport;

  var calendarEl = document.getElementById(data.fcCanvasId);
  var Calendar = FullCalendar.Calendar;
  var Draggable = FullCalendar.Draggable;

  var containerEl = document.getElementById(data.tpDraggableId);

  // If the user doesn't have the edit permission for the entry,
  // the "fc-event-draggable" class will not be given to the entry,
  // and the entry can not be dragged on to the calendar.
  new Draggable(containerEl, {
    itemSelector: '.fc-event.fc-event-draggable',
    eventData: function(eventEl) {
      console.log('---- Dragged Draggable ----');
      console.dir(eventEl);
      return Traction.FullCalendar.externalEventData(eventEl);
    }
  });

  var initialViewName = 'dayGridMonth';

  var calendar = new FullCalendar.Calendar(calendarEl, {

    // Enable external drag-n-drop
    droppable: true,

    locale: data.locale,
    firstDay: data.firstDay,
    initialView: initialViewName,
    initialDate: data.initialDate,
    headerToolbar: {
      left: data.fcViews,
      center: 'title',
      right: 'prev,next today'
    },
    views: {
      dayGridMonth: {
        type: 'dayGrid',
        duration: { months: 1 },
        buttonText: data.btnTextDayGridMonth
      },
      dayGridWeek: {
        type: 'dayGrid',
        duration: { weeks: 1 },
        buttonText: data.btnTextDayGridWeek
      },
      dayGridSevenDay: {
        type: 'dayGrid',
        duration: { days: 7 },
        buttonText: data.btnTextDayGridSevenDay
      },
      dayGridTwoWeek: {
        type: 'dayGrid',
        duration: { weeks: 2 },
        buttonText: data.btnTextDayGridTwoWeek
      },
      timeGridDay: {
        type: 'timeGrid',
        duration: { days: 1 },
        buttonText: data.btnTextTimeGridDay
      },
      timeGridWeek: {
        type: 'timeGrid',
        duration: { weeks: 1 },
        buttonText: data.btnTextTimeGridWeek
      },
      timeGridSevenDay: {
        type: 'timeGrid',
        duration: { days: 7 },
        buttonText: data.btnTextTimeGridSevenDay
      },
      listWeek: {
        type: 'list',
        duration: { weeks: 1 },
        buttonText: data.btnTextListWeek
      },
      listSevenDay: {
        type: 'list',
        duration: { days: 7 },
        buttonText: data.btnTextListSevenDay
      },
      listMonth: {
        type: 'list',
        duration: { months: 1 },
        buttonText: data.btnTextListMonth
      },
      listYear: {
        type: 'list',
        duration: { years: 1 },
        buttonText: data.btnTextListYear
      }
    },

    eventSources: [
      {
        url: data.tpSourceURL,
        dataType: 'json',
        id: data.tpSourceId
      }
    ],
    eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    },


    loading: function(isLoading) {
      //console.log('---- fullcalendar loading ----');

      $('.fc .fc-header-toolbar .fc-toolbar-chunk').eq(0).addClass('fc-header-toolbar-left');
      $('.fc .fc-header-toolbar .fc-toolbar-chunk').eq(1).addClass('fc-header-toolbar-center');
      $('.fc .fc-header-toolbar .fc-toolbar-chunk').eq(2).addClass('fc-header-toolbar-right');

      $('.fc .fc-button-group').each(function(){
        $(this).addClass('button-group');
      });

      if(isLoading) {
        Traction.Loading.show();
        //$('#fc-loading-status').removeClass('off').addClass('on');
      } else {
        Traction.Loading.hide();
        //$('#fc-loading-status').removeClass('on').addClass('off');
      }

    },

    // Called after the calendar’s date range has been initially set
    // or changed in some way and the DOM has been updated.
    datesSet: function(dateInfo) {

      // Get fullCallendar's title and insert it into TeamPage's view title.
      var pageTitle = $('.fc-canvas:first .fc-header-toolbar h2').text().replace(/_/g, ' ');
      $('.view-calendar #title-info h2 .calendar-title, .view-profile #title-info h2 .calendar-title').html(pageTitle);

      // The "Today" button is newly rendered on every datasSet.
      // The button is wrapped by the "button-group-today" classified div as follows,
      // but the div gets empty on every dataSet because the button disappears and is re-rendered.
      // So, to prevent the empty "button-group-today" div wrapper from being created and increased,
      // I had to check the div wrapper and its inner element (by the length method)
      // and make the empty wrapper be removed.
      if ($('.fc .button-group-today').length > 0 && $('.fc .button-group-today').children().length === 0) {
        $('.fc .button-group-today').remove();
      }
      $('.fc .fc-today-button').wrap('<div class="fc-button-group button-group button-group-today"></div>');

      $('.fc .fc-button').each(function(){
        if ($(this).hasClass('fc-button-active')) {
          $(this).removeClass('fc-button-active').addClass("selected");
        }
      });


    },

    // Triggered when dragging stops and the event has moved to a different day/time.
    // https://fullcalendar.io/docs/eventDrop
    eventDrop: function(info) {
      console.log('---- eventDrop ----');
      console.dir(info);

      var startDateTimeHumanZone = info.event.startStr;
      var startDateTimeEpoch = moment(startDateTimeHumanZone).format('x');
      // Note: The value of endDate is null when the event is dropped on an allday slot.
      var endDateTimeHumanZone = info.event.endStr;
      var endDateTimeEpoch = moment(endDateTimeHumanZone).format('x');

      // Entry's custom entry type (event, task, goal, milestone)
      var customEntryType = info.event.extendedProps.customentrytype;

      if ( customEntryType === 'event' ) {
        Traction.FullCalendar.onEventDropEvent(info);
      } else {
        Traction.FullCalendar.onEventDropPm(info);
      }

    },

    eventResize: function(info) {
      console.dir('---- eventResize ----');
      console.dir(info);
      Traction.FullCalendar.onEventResize(info);
    },

    // Called after an event has been added to the calendar.
    // This fires after Calendar::addEvent is called or
    // when an external event is dropped from outside the calendar or
    // from a different calendar.
    // If being called as a result of the latter two, eventAdd will be fired after eventReceive.
    eventAdd: function(addInfo) {
      console.log('---- eventAdd ----');
      console.dir(addInfo);
    },

    eventClassNames: function(arg) {
      //console.log('---- eventClassNames ----');
      //console.dir(arg);
    },

    // Called when an external draggable element or
    // an event from another calendar has been dropped onto the calendar.
    eventReceive: function(info) {
      console.dir('---- eventReceive: external drag\'n\'drop or another calendar ----');
      console.dir(info);

      // Entry's custom entry type (event, task, goal, milestone)
      var customEntryType = info.draggedEl.dataset.customentrytype;

      var draggedItemParam = {
        "tractionid": info.draggedEl.dataset.tractionid,
        "fqid": info.draggedEl.dataset.fqid,
        "displayname": info.draggedEl.dataset.displayname,
        "customentrytype": info.draggedEl.dataset.customentrytype,
        "editable": info.draggedEl.dataset.editable,
        "classname": info.draggedEl.dataset.classname,
        "title": info.draggedEl.dataset.title,
        "titletext": info.draggedEl.dataset.titletext,
        "tpdue": info.draggedEl.dataset.tpdue,
        "tpallday": info.draggedEl.dataset.tpallday,
        "color": info.draggedEl.dataset.color
      };

      if ( customEntryType === 'event' ) {
        Traction.FullCalendar.onEventReceiveEvent(info, draggedItemParam);
      } else {
        Traction.FullCalendar.onEventReceivePm(info, draggedItemParam);
      }

    },

    // After an event is renderred
    eventContent: function(event) {
      // Convert the event inner HTML string, provided by the "title" parameter,
      // into the "real" HTML code.
//      if (event.timeText) {
//        var returnHtml = Traction.FullCalendar.htmlToElements( "<div class='fc-event-inner'><div class='fc-event-time'>" + event.timeText + "</div>" + "<div class='fc-event-title'>" + event.event.title + "</div></div>" );
//      } else {
//        var returnHtml = Traction.FullCalendar.htmlToElements( "<div class='fc-event-inner'>" + "<div class='fc-event-title'>" + event.event.title + "</div></div>" );
//      }
//      return { domNodes: returnHtml };
    },

    // After an event is renderred
    eventDidMount: function(info) {
      console.log('---- eventDidMount ----');
      console.dir(info);

      //Traction.FullCalendar.colorCalItem(info);

      var chkTodoHtml = '<div class="tododone"><input type="checkbox" class="ptags-chk todo" /></div>';
      var chkDoneHtml = '<div class="tododone"><input type="checkbox" class="ptags-chk done" /></div>';
      var imgIconHtml = '<div class="ic">&nbsp;</div>';
      var faIconHtml = '<div class="ic"><i></i></div>';

      // DayGrid Dot Event
      if ($(info.el).hasClass('fc-daygrid-dot-event')) {
        if ($(info.el).hasClass('icon-image')) {
          // icon-image or checkbox
          if ($(info.el).hasClass('calitem-task')) {
            if ($(info.el).hasClass('todo')) {
              $(info.el).children('.fc-daygrid-event-dot').after(chkTodoHtml);
            } else if ($(info.el).hasClass('done')) {
              $(info.el).children('.fc-daygrid-event-dot').after(chkDoneHtml);
            }
          } else {
            $(info.el).children('.fc-daygrid-event-dot').after(imgIconHtml);
          }
        } else {
          // icon-fontawesome
          $(info.el).children('.fc-daygrid-event-dot').after(faIconHtml);
        }
      }

      // DayGrig Block Event
      if ($(info.el).hasClass('fc-daygrid-block-event')) {
        if ($(info.el).hasClass('icon-image')) {
          // icon-image or checkbox
          if ($(info.el).hasClass('calitem-task')) {
            if ($(info.el).hasClass('todo')) {
              $(info.el).find('.fc-event-main-frame').prepend(chkTodoHtml);
            } else if ($(info.el).hasClass('done')) {
              $(info.el).find('.fc-event-main-frame').prepend(chkDoneHtml);
            }
          } else {
            $(info.el).find('.fc-event-main-frame').prepend(imgIconHtml);
          }
        } else {
          // icon-fontawesome
          $(info.el).find('.fc-event-main-frame').prepend(faIconHtml);
        }
      }

      if (info.view.type.indexOf('list') !== -1 && info.event.extendedProps.customentrytype === 'task') {
        Traction.FullCalendar.addPriorityBadge(info.el);
      }

    },

    // After the view is renderred
    viewDidMount: function(info) {
      // console.log('---- viewDidMount (After the view is renderred) ----');
      // console.dir(info);

      // Draw add-task, add-event, and add-phonenotes icons
      $(info.el).find('.fc-daygrid-day').each(function() {

        var targetDate = $(this).data('date');
        var curHour = moment().format('H');
        var curTZ = moment().format('Z');

        // console.log('targetDate = ' + targetDate);
        // console.log('curHour = ' + curHour);
        // console.log('curTZ = ' + curTZ);

        var startDateTime = moment(targetDate + 'T00:00:00' + curTZ).add(curHour, 'hours').format('x');
        var endDateTime = moment(targetDate + 'T00:00:00' + curTZ).add(curHour, 'hours').add('1', 'hours').format('x');

        // console.log('targetDate = ' + targetDate);
        // console.log('startDateTime = ' + startDateTime);
        // console.log('endDateTime = ' + endDateTime);

        if (data.showAddTask === 'true') {
          var tsRg = "a#form&form=" + data.rgParamTaskFormName + data.rgParamTaskPostProj + data.rgParamTaskTags + "&onsave=rv" + "&html=" + data.rgParamTaskFormTitle + data.rgParamNewPmEntryDefaults  + data.rgParamAssignedId + "&default_property_due=" + startDateTime;
          var tsHtml = '<a class="task" rg="' + tsRg + '" href="javascript:void(0);" title="' + data.rgParamTaskFormTitle + '"><i class="icon"></i><span class="text">' + data.rgParamTaskFormTitle + '</span></a>';
        } else {
          var tsHtml = '';
        }

        if (data.showAddEvent === 'true') {
          var evRg = "a#form&form=" + data.rgParamEventFormName + data.rgParamEventPostProj + data.rgParamEventTags + "&onsave=rv" + "&html=" + data.rgParamEventFormTitle + data.rgParamNewPmEntryDefaults + data.rgParamAssignedId + "&default_property_due=" + startDateTime + "&default_property_enddate=" + endDateTime;
          var evHtml = '<a class="event" rg="' + evRg + '" href="javascript:void(0);" title="' + data.rgParamEventFormTitle + '"><i class="icon"></i><span class="text">' + data.rgParamEventFormTitle + '</span></a>';
        } else {
          var evHtml = '';
        }

        if (data.showAddPhoneNotes === 'true') {
          var pnRg = "a#form&form=" + data.rgParamPhoneNotesFormName + data.rgParamPhoneNotesPostProj + data.rgParamPhoneNotesTags + "&onsave=rv" + "&html=" + data.rgParamPhoneNotesFormTitle + data.rgParamNewPmDefaults + data.rgParamAssignedId + "&default_property_due=" + startDateTime;
          var pnHtml = '<a class="phonenotes" rg="' + pnRg + '" href="javascript:void(0);" title="' + data.rgParamPhoneNotesFormTitle + '"><i class="icon"></i><span class="text">' + data.rgParamPhoneNotesFormTitle + '</span></a>';
        } else {
          var pnHtml = '';
        }

        // console.log('tsHtml = ' + tsHtml);
        // console.log('evHtml = ' + evHtml);
        // console.log('pnHtml = ' + pnHtml);

        $(this).find('.fc-daygrid-day-top').append('<div class="fc-day-add-links">' + evHtml + tsHtml + pnHtml + '</div>');

      }); // Draw add-task, add-event, and add-phonenotes icons

    },

    dayCellContent: function(arg) {
      // Remove non-numeric characters from the date description in each calendar cell.
      var dayNumber = arg.dayNumberText.replace(/[^0-9]+/g, '');
      var date = $(this).attr("data-date") + ' <datetime timeformat="HH:mm:ss Z" />';
      return { html: '<a class="fc-daygrid-day-number">' + dayNumber + '</a>'};
    },

    eventClick: function(eventClickInfo) {
      console.log('---- eventClickInfo ---- ' + 'Title: ' + eventClickInfo.event.title + ' ID: ' + eventClickInfo.event.id + ' Description: ' + eventClickInfo.event.tpurl + ' displayname: ' + eventClickInfo.event.extendedProps.displayname + ' tractionid: ' + eventClickInfo.event.extendedProps.tractionid );

      console.dir(eventClickInfo);

      var $element = $(eventClickInfo.jsEvent.target);
      // Check if the task "todo" checkbox was clicked or not.
      if( $element.hasClass('ptags-chk') ) {
        // Yes, the "todo" checkbox was clicked.
        eventClickInfo.jsEvent.stopPropagation();
        if( $element.hasClass('todo') ) {
          // The checkbox was unchecked and the status of the task is "todo".
          var callbackFunc = fcShowStatusPMTaskChkBox(eventClickInfo.event.extendedProps.displayname, eventClickInfo.event.extendedProps.tractionid, 'close');
          Proteus.processCustomLabelAction('2', eventClickInfo.event.extendedProps.tractionid, callbackFunc);
          // Change the class of the checkbox from todo to done.
          $element.removeClass('todo').addClass('done');
          // Change the class of the ancestor "a" from todo to done.
          $element.closest('a').removeClass('todo').addClass('done');
        } else if ( $element.hasClass('done') ) {
          // The checkbox was checked and the status of the task is "done".
          var callbackFunc = fcShowStatusPMTaskChkBox(eventClickInfo.event.extendedProps.displayname, eventClickInfo.event.extendedProps.tractionid, 'open');
          Proteus.processCustomLabelAction('1', eventClickInfo.event.extendedProps.tractionid, callbackFunc);
          $element.removeClass('done').addClass('todo');
          $element.closest('a').removeClass('done').addClass('todo');
        }
      } else {
        var str = eventClickInfo.el.className;
        if ( str.indexOf('tpcal') != -1 ) {
          Proteus.Calendar.showEventDetails(eventClickInfo.event._def.publicId, eventClickInfo.event.extendedProps.tpurl);
        } else {
          // This is a Google Calendar item.
        }
      }
    },
  });

  calendar.render();

}


Proteus.addHandler("load", function() {

  $('#external-events .entries .fc-event').each(function(){
    // Render task checkbox
    var titleHtml = $(this).data('title').replace(/\\\"/g,'"').replace(/\\\//g,'/');
    $(this).html('<div class="fc-event-inner">' + titleHtml + '</div>');
    // Check the edit permission
    if ($(this).data('editable')) {
      $(this).addClass('fc-event-draggable');
    }
    // Coloring
    $(this).css('background-color', Traction.FullCalendar.convertColorNameToCode($(this).data('color')));
    if ($(this).data('color')) {
      $(this).css('color', '#fff');
    } else {
      $(this).css('color', $('#fc-linkcolor-placeholder a').css('color'));
    }

  });


  $('#external-events .entries').sortable({
    // When sorting is over and the order was changed
    "update": function(ev,ui){

      var arrayFqid = $(this).sortable('serialize', {
        // Make the output be like entry=fqid1&entry=fqid2...
        key: "entry"
      }).replace(/entry=/g,'').split("&");

      // These parameters represent where the target calendar is.
      // For example, userId = 5 means "this calendar is in the user profile page whose user id is 5."
      var calParam = {
        "projId": $('#external-events').attr('data-proj'),
        "userId": $('#external-events').attr('data-user'),
        "goalId": $('#external-events').attr('data-goal'),
        "msId": $('#external-events').attr('data-ms'),
        // Calendar type name, default = "normal"
        "calType": $('#external-events').attr('data-caltype')
      };

      Traction.FullCalendar.updateExtEvOrder(arrayFqid, calParam)

    }
  });

  $('#external-events .entries .fc-event .ptags-chk').on('change, click', function(event){
    var tractionId = $(this).closest('div.fc-event').data('tractionid');
    var displayName = $(this).closest('div.fc-event').data('entryclassdisplayname');
    if( $(this).hasClass('todo') ) {
      // The checkbox was unchecked and the status of the task is "todo".
      var callbackFunc = fcShowStatusPMTaskChkBox(displayName, tractionId, 'close');
      Proteus.processCustomLabelAction('2', tractionId, callbackFunc);
      // Change the class of the checkbox from todo to done.
      $(this).removeClass('todo').addClass('done');
      // Change the class of the ancestor "a" from todo to done.
      $(this).closest('div.fc-event').removeClass('todo').addClass('done');
    } else if ( $(this).hasClass('done') ) {
      // The checkbox was checked and the status of the task is "done".
      var callbackFunc = fcShowStatusPMTaskChkBox(displayName, tractionId, 'open');
      Proteus.processCustomLabelAction('1', tractionId, callbackFunc);
      $(this).removeClass('done').addClass('todo');
      $(this).closest('div.fc-event').removeClass('done').addClass('todo');
    }
  });

  Traction.FullCalendar.isDragging = false;

  $('#external-events .entries .fc-event').mousedown(function() {
    Traction.FullCalendar.isDragging = false;
  })
  .mousemove(function() {
    Traction.FullCalendar.isDragging = true;
   })
  .mouseup(function() {
    var wasDragging = Traction.FullCalendar.isDragging;
    Traction.FullCalendar.isDragging = false;
    if (!wasDragging) {
      Proteus.Calendar.showEventDetails($(this).data('fqid'), $(this).data('tpurl'));
    }
  });

});
