Traction.FullCalendar = { };

Traction.FullCalendar = {

  onEventDropEvent: function(info) {

    console.log("Event entry was dropped. View = " + info.view.type);

    if ( info.view.type === "dayGridMonth" ) {

      var startDateTimeLocal = moment(info.event.start).format();
      var startDateTimeLocalX = moment(startDateTimeLocal).format('x');

      if ( info.event.allDay ) {
        //var endDateTimeLocal = info.event.endStr; // YYYY-MM-DDTHH:mm:ssZ
        var endDateTimeLocal = moment(info.event.end).add(-1,'days').format();
        var endDateTimeLocalX = moment(endDateTimeLocal).format('x');
        var msgArg = {
          "start": moment(startDateTimeLocal).format('YYYY/MM/DD'),
          "end": moment(endDateTimeLocal).format('YYYY/MM/DD')
        }
      } else {
        var endDateTimeLocal = moment(info.event.end).format();
        var endDateTimeLocalX = moment(endDateTimeLocal).format('x');
        var msgArg = {
          "start": moment(startDateTimeLocal).format('YYYY/MM/DD HH:mm'),
          "end": moment(endDateTimeLocal).format('YYYY/MM/DD HH:mm')
        }
      }

      msgArg.fqid = info.event.id;
      msgArg.allday = info.event.allDay;
      msgArg.displayname = info.event.extendedProps.displayname;
      msgArg.tractionid = info.event.extendedProps.tractionid;

      console.log('startDateTimeLocal = ' + startDateTimeLocal);
      console.log('startDateTimeLocalX = ' + startDateTimeLocalX);
      console.log('endDateTimeLocal = ' + endDateTimeLocal);
      console.log('endDateTimeLocalX = ' + endDateTimeLocalX);
      console.log(msgArg);

      if (startDateTimeLocal == endDateTimeLocal) {
        console.log("Single allDay");
        var callbackFunc = Traction.FullCalendar.displayStatusMoveEventDate(msgArg);
      } else {
        console.log("Multiple allDay");
        var callbackFunc = Traction.FullCalendar.displayStatusMoveEventStartEnd(msgArg);
      }
      Proteus.Calendar.moveEvent(info.event.id, startDateTimeLocalX, callbackFunc);
    } else {
      // Other calendar types
      if (info.event.allDay) {
        // Droped on AllDay slot / Agenda view / Event entry
        if (info.event.extendedProps.tpAllDay) {
          // If it's an AllDay event, just move it.
          var callbackFunc = displayStatusMoveEventDate(event.displayname, event.tractionid, startDate.format('#{@fullcalendar#datetimeformat_date}'));
          Proteus.Calendar.moveEvent(event.id, startDateTimeEpoch, callbackFunc);
        } else {
          // If it isn't an AllDay event (if it is a normal event), set both of the start and the end date.

          // Completed JPBO16371

          var callbackFunc = displayStatusMoveEventDate(event.displayname, event.tractionid, startDate.format('#{@fullcalendar#datetimeformat_date}'));
          Proteus.Calendar.setEventProperties(event.id, startDateTimeEpoch, endDateTimeEpoch, true, callbackFunc);
        }
      } else {
        if (info.event.extendedProps.tpAllDay) {
          console.log("Droped on Normal slot / Agenda view / Event entry");
          console.log("If it is an AllDay event, set both of the start and the end date/time.");

          // Completed JPBO16372

          endDate = moment(startDate).add(2,'hours'); // The value "+2 hours" is defined as defaultTimedEventDuration.
          endDateTimeHumanZone = moment(endDate).format('YYYY-MM-DD') + 'T' + moment(endDate).format('HH:mm:ss') + '<datetime dateformat="Z" />';
          endDateTimeEpoch = moment(endDateTimeHumanZone).format('x');
          var callbackFunc = displayStatusMoveEventStartEnd(event.displayname, event.tractionid, startDate.format('#{@fullcalendar#datetimeformat_date_time}'), endDate.format('#{@fullcalendar#datetimeformat_date_time}'));
          Proteus.Calendar.setEventProperties(event.id, startDateTimeEpoch, endDateTimeEpoch, false, callbackFunc);
        } else {
          console.log("If it is a non-allDay event, set the new start and end date/time.");
          var startDateTimeLocal = moment(info.event.start).format('YYYY-MM-DDTHH:mm:ssZ');
          var startDateTimeEpoch = moment(startDateTimeLocal).format('x');
          var endDateTimeLocal = moment(info.event.end).format('YYYY-MM-DDTHH:mm:ssZ');
          var endDateTimeEpoch = moment(endDateTimeLocal).format('x');

          var msgArg = {
            "fqid": info.event.id,
            "displayname": info.event.extendedProps.displayname,
            "tractionid": info.event.extendedProps.tractionid,
            "start": moment(info.event.start).format('YYYY/MM/DD HH:mm'),
            "end": moment(info.event.end).format('YYYY/MM/DD HH:mm')
          };

          console.log('startDateTimeLocal = ' + startDateTimeLocal);
          console.log('startDateTimeEpoch = ' + startDateTimeEpoch);
          console.log('endDateTimeLocal = ' + endDateTimeLocal);
          console.log('endDateTimeEpoch = ' + endDateTimeEpoch);
          console.dir(msgArg);

          var callbackFunc = Traction.FullCalendar.displayStatusMoveEventStartEnd(msgArg);

          Proteus.Calendar.setEventProperties(info.event.id, startDateTimeEpoch, endDateTimeEpoch, false, callbackFunc);

        }
      }
    }
  },

  // When a PM entry (task, goal, milestone) is dropped
  onEventDropPm: function(info) {
    console.log("PM entry was dropped. View = " + info.view.type);
    if ( info.view.type === "dayGridMonth" ) {
      // PM Entry: In the Basic view, the value of the event.allDay is always "true".
      if (info.event.allDay) {

        console.log("The state of allDay was true.");

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

        console.log('startDateTimeLocal = ' + startDateTimeLocal);
        console.log('startDateTimeGmtMidnight = ' + startDateTimeGmtMidnight);
        console.log('startDateTimeGmtMidnightX = ' + startDateTimeGmtMidnightX);
        console.log(msgArg);

        var callbackFunc = Traction.FullCalendar.displayStatusMovePMDue(msgArg);
        Proteus.Calendar.moveEvent(info.event.id, startDateTimeGmtMidnightX, callbackFunc);

      } else {

        console.log("The state of allDay was false.");

        var evTime = event.tpDue.match(/^.+T([0-9]+:[0-9]+:[0-9]+)[\+|-][0-9]+$/)[1];
        var startDateTimeHumanZone = event.start.format('YYYY-MM-DD') + 'T' + evTime + '<datetime dateformat="Z" />';
        var startDateTimeEpoch = moment(startDateTimeHumanZone).format('x');

        var msgArg = {
          "fqid": info.event.id,
          "displayname": info.event.extendedProps.displayname,
          "tractionid": info.event.extendedProps.tractionid,
          "start": moment(info.event.start).format('YYYY/MM/DD HH:mm')
        };

        console.log('startDateTimeHumanZone = ' + startDateTimeHumanZone);
        console.log('startDateTimeEpoch = ' + startDateTimeEpoch);
        console.log(msgArg);

        var callbackFunc = Traction.FullCalendar.displayStatusMovePMDue(msgArg);
        Proteus.Calendar.moveEvent(event.id, startDateTimeEpoch, callbackFunc);

      }
    } else {
      // Agenda or List view. (Can not drag and drop in the List views, though.)
      if (info.event.extendedProps.allDay) {
        // AllDay Slot / Agenda View / PM Entry
        if (info.event.extendedProps.tpAllDay) {
          var endDate = moment(event.end).add(-1,'days');
          // The start date and time should be the midnight in the requesting user's timezone.
          var startDateTimeHumanZone = event.start.format('YYYY-MM-DD') + 'T' + event.start.format('HH:mm:ss') + '+0000';
          var startDateTimeEpoch = moment(startDateTimeHumanZone).format('x');
          var callbackFunc = displayStatusMoveEventDate(event.displayname, event.tractionid, startDate.format('#{@fullcalendar#datetimeformat_date}'));
        } else {
          var evTime = event.tpDue.match(/^.+T([0-9]+:[0-9]+:[0-9]+)[\+|-][0-9]+$/)[1];
          var startDateTimeHumanZone = event.start.format('YYYY-MM-DD') + 'T' + evTime + '<datetime dateformat="Z" />';
          var startDateTimeEpoch = moment(startDateTimeHumanZone).format('x');
          var callbackFunc = fcShowStatusMovePMDue(event.displayname, event.tractionid, moment(startDateTimeEpoch, 'x').format('#{@fullcalendar#datetimeformat_date_time}'));
        }
        Proteus.Calendar.moveEvent(event.id, startDateTimeEpoch, callbackFunc);
      } else {
        // Normal Slot / Agenda View / PM Entry
        var msg = 'Sorry. Moving a ' + info.event.extendedProps.displayname + ' into a normal slot is not supported.'
        Proteus.showStatusMessage(msg, true);
        revertFunc();
      }
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

// #######

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

        console.log('startDateLocal = ' + startDateLocal);
        console.log('startDateTimeGmtMidnight = ' + startDateTimeGmtMidnight);
        console.log('startDateTimeGmtMidnightX = ' + startDateTimeGmtMidnightX);
        console.log(msgArg);

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

    Traction.FullCalendar.colorCalItem(info.draggedEl, info.draggedEl.dataset.customentrytype, info.draggedEl.dataset.color, fillBackground);

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
    console.log('---- displayStatusMoveEventDate ----');
    console.log(msgArg);
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
    console.log(arrayFqid);
    console.dir(calParam);

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

    console.log('removeExtEv poststring = ' + poststring);

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
    console.dir(state);
    console.log("removeExtEvDefaultResponse: method=" + state.method + " projId="+ state.projId + " userId="+ state.userId + " goalId="+ state.goalId + " msId="+ state.msId + " entryId="+ state.entryId + " caltype="+ state.calType);
  },

  colorCalItem: function(el, customEntryType, colorName, fillBackground) {
    //console.log('---- colorCalItem ----');
    //console.dir(el);
    //console.log('customEntryType = ' + customEntryType + ' colorName = ' + colorName + ' fillBackground = ' + fillBackground);

    // Set the background color of each event with the color picked up from a standard link,
    // if the event is not from Google Calendar.
    // Please refer to JPBO16042, JPBO16137, and JPBO16290 for details.
    var linkColor = $('#fc-linkcolor-placeholder a').css('color');
    //console.log('customentrytype = ' + info.event.extendedProps.customentrytype + ' linkColor = ' + linkColor);

    if ( customEntryType === 'event' ) {
      if (colorName === '') {
        $(el).css('color', linkColor);
        //$(el).css('background-color', 'transparent');
        //$(el).css('border-color', 'transparent');
        if ( fillBackground ) {
          $(el).css('color', '#fff');
          $(el).css('background-color', linkColor);
          //$(el).css('border-color', linkColor);
        } else {
          $(el).css('color', linkColor);
          //$(el).css('background-color', 'transparent');
          //$(el).css('border-color', 'transparent');
        }
      } else {
        $(el).css('color', '#fff');
        //$(el).css('background-color', Traction.FullCalendar.convertColorNameToCode(info.event.extendedProps.colorname));
        //$(el).css('border-color', Traction.FullCalendar.convertColorNameToCode(info.event.extendedProps.colorname));
      }
    } else {
      if (colorName === '') {
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

  addPriorityBadge: function(info) {
    if (view.name == 'listDay' || view.name == 'listWeek' || view.name == 'listMonth' || view.name == 'listYear') {
    $('.fc-list-item-title').each(function(){
      var entryClasses = $(this).parent('.fc-list-event').attr('class');

      if (entryClasses.match(/calitem-task/)) {
        var classArray = entryClasses.split(' ');
        for (i = 0; i < classArray.length; i++) {
          var priority = entryClasses.match(/calitem-p([0-9])/);
          if (priority) {
            if ($(this).children('span.priority').length == 0) {
              $(this).append('<span class="priority p' + priority[1] + '">' + priority[1] + '</span>');
            }
          }
        }
      }
    });
  }
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
      return {
        // Remove the "fc-event-main" div element and get its inner HTML data.
        title: $(eventEl.innerHTML)[0].innerHTML
      };
    }
  });



  var calendar = new FullCalendar.Calendar(calendarEl, {

    // Enable external drag-n-drop
    droppable: true,

    locale: data.locale,
    firstDay: data.firstDay,
    initialView: 'dayGridMonth',
    initialDate: data.initialDate,
    headerToolbar: {
      left: 'dayGridMonth,timeGridWeek,dayGridTwoWeek,timeGridSevenDay,timeGridDay,listMonth',
      center: 'title',
      right: 'prev,next today'
    },
    views: {
      timeGridSevenDay: {
        type: 'timeGrid',
        duration: { days: 7 },
        buttonText: '7 day'
      },
      dayGridOneWeek: {
        type: 'dayGrid',
        duration: { weeks: 1 },
        buttonText: '1 w'
      },
      dayGridSevenDay: {
        type: 'dayGrid',
        duration: { days: 7 },
        buttonText: '7 d'
      },
      dayGridTwoWeek: {
        type: 'dayGrid',
        duration: { weeks: 2 },
        buttonText: '2 w'
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
      console.log('---- fullcalendar loading ----');

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
      // Convert the event inner HTML string, provided by the "title" parameter, into the "real" HTML code.
      if (event.timeText) {
        var returnHtml = Traction.FullCalendar.htmlToElements( "<div class='fc-event-inner'><div class='fc-event-time'>" + event.timeText + "</div>" + "<div class='fc-event-title'>" + event.event.title + "</div></div>" );
      } else {
        var returnHtml = Traction.FullCalendar.htmlToElements( "<div class='fc-event-inner'>" + "<div class='fc-event-title'>" + event.event.title + "</div></div>" );
      }
      return { domNodes: returnHtml };
    },

    // After an event is renderred
    eventDidMount: function(info) {
      console.log('---- eventDidMount ----');
      console.dir(info);

      var customEntryType = info.event.extendedProps.customentrytype;
      var colorName = info.event.extendedProps.colorname;
      if ($(info.el).hasClass('calitem-allday') || $(info.el).hasClass('calitem-multidays')) {
        var fillBackground = true;
      } else {
        var fillBackground = false;
      }

      Traction.FullCalendar.colorCalItem(info.el, customEntryType, colorName, fillBackground);

    },

    // After the view is renderred
    viewDidMount: function(info) {
      console.log('---- viewDidMount (After the view is renderred) ----');
      console.dir(info);

      // Draw add-task, add-event, and add-phonenotes icons
      $(info.el).find('.fc-daygrid-day').each(function() {

        var targetDate = $(this).data('date');
        var curHour = moment().format('H');
        var curTZ = moment().format('Z');

        // console.log('targetDate = ' + targetDate);
        // console.log('curHour = ' + curHour);
        //console.log('curTZ = ' + curTZ);

        var startDateTime = moment(moment(targetDate + 'T00:00:00' + curTZ).add(curHour, 'hours').format('YYYY-MM-DDTH:mm:ssZ')).format('x');
        var endDateTime = moment(moment(targetDate + 'T00:00:00' + curTZ).add(curHour, 'hours').add('1', 'hours').format('YYYY-MM-DDTH:mm:ssZ')).format('x');

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
      console.dir(eventClickInfo);
      console.log('fullCalendar Click: ' + 'Title: ' + eventClickInfo.event.title + ' ID: ' + eventClickInfo.event.id + ' Description: ' + eventClickInfo.event.tpurl + ' displayname: ' + eventClickInfo.event.extendedProps.displayname + ' tractionid: ' + eventClickInfo.event.extendedProps.tractionid );
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
    $(this).html('<div class="fc-event-main">' + titleHtml + '</div>');
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

  $('#external-events .entries .fc-event').on('click', function(){

    console.log('fqid = ' + $(this).data('fqid'));
    console.log('tpurl = ' + $(this).data('tpurl'));

    Proteus.Calendar.showEventDetails($(this).data('fqid'), $(this).data('tpurl'));
  });

});
