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
          var startDateTimeHumanZone = moment(info.event.start).format('YYYY-MM-DDTHH:mm:ssZ');
          var startDateTimeEpoch = moment(startDateTimeHumanZone).format('x');
          var endDateTimeHumanZone = moment(info.event.end).format('YYYY-MM-DDTHH:mm:ssZ');
          var endDateTimeEpoch = moment(endDateTimeHumanZone).format('x');

          var msgArg = {
            "fqid": info.event.id,
            "displayname": info.event.extendedProps.displayname,
            "tractionid": info.event.extendedProps.tractionid,
            "start": moment(info.event.start).format('YYYY/MM/DD HH:mm'),
            "end": moment(info.event.end).format('YYYY/MM/DD HH:mm')
          };

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
          "start": moment(info.event.start).format('YYYY/MM/DD HH:mm')
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

  // Convert an HTML string into the "real" HTML code.
  // https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
  htmlToElements: function htmlToElements(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
  },

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
  fcShowStatusResizeEventStartEnd: function(msgArg) {
    Proteus.showStatusMessage(i18n_fullcalendar("proteus_status_message_resize_event_start_end", "displayname + ' ' + id + ' was modified. (Start: ' + start + ', End: ' + end + ')'"), true);
  },
  fcShowStatusPMTaskChkBox: function(displayname, id, action) {
    if ( action === 'close' ) {
      Proteus.showStatusMessage(i18n_fullcalendar("proteus_status_message_close_task", "'You closed the ' + displayname + ' ' + id + '.'"), true);
    } else if ( action === 'open' ) {
      Proteus.showStatusMessage(i18n_fullcalendar("proteus_status_message_reopen_task", "'You re-opened the ' + displayname + ' ' + id + '.'"), true);
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

  console.log('---- tpDraggableId -----')
  console.dir(data);

  var calendarEl = document.getElementById(data.fcCanvasId);
  var Calendar = FullCalendar.Calendar;
  var Draggable = FullCalendar.Draggable;

  var containerEl = document.getElementById(data.tpDraggableId);
  var checkbox = document.getElementById('drop-remove');

  new Draggable(containerEl, {
    itemSelector: '.fc-event',
    eventData: function(eventEl) {
      return {
        title: eventEl.innerText
      };
    }
  });



  var calendar = new FullCalendar.Calendar(calendarEl, {

    droppable: true,

    locale: data.locale,
    firstDay: data.firstDay,
    initialView: 'dayGridMonth',
    initialDate: '2020-07-07',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
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

    // Triggered when dragging stops and the event has moved to a different day/time.
    // https://fullcalendar.io/docs/eventDrop
    eventDrop: function(info) {
      console.dir('---- eventDrop ----');
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

    // When an event is drooped...
    drop: function(info) {

      // Remove the element from the "Draggable Events" list
      info.draggedEl.parentNode.removeChild(info.draggedEl);

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

    // After the view is renderred
    viewDidMount: function(arg) {
      console.log('---- viewDidMount ----');
      console.dir(arg);

      // Draw add-task, add-event, and add-phonenotes icons
      $(arg.el).find('.fc-daygrid-day').each(function() {

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
          var tsRg = "a#form&form=" + data.rgParamTaskFormName + data.rgParamTaskPostProj + data.rgParamTaskTags + "&onsave=rv" + "&html=" + data.rgParamTaskFormTitle + data.rgParamNewPmEntryDefaults + "&default_property_due=" + startDateTime;
          var tsHtml = '<a class="task" rg="' + tsRg + '" href="javascript:void(0);" title="' + data.rgParamTaskFormTitle + '"><i class="icon"></i><span class="text">' + data.rgParamTaskFormTitle + '</span></a>';
        } else {
          var tsHtml = '';
        }

        if (data.showAddEvent === 'true') {
          var evRg = "a#form&form=" + data.rgParamEventFormName + data.rgParamEventPostProj + data.rgParamEventTags + "&onsave=rv" + "&html=" + data.rgParamEventFormTitle + data.rgParamNewPmEntryDefaults + "&default_property_due=" + startDateTime + "&default_property_enddate=" + endDateTime;
          var evHtml = '<a class="event" rg="' + evRg + '" href="javascript:void(0);" title="' + data.rgParamEventFormTitle + '"><i class="icon"></i><span class="text">' + data.rgParamEventFormTitle + '</span></a>';
        } else {
          var evHtml = '';
        }

        if (data.showAddPhoneNotes === 'true') {
          var pnRg = "a#form&form=" + data.rgParamPhoneNotesFormName + data.rgParamPhoneNotesPostProj + data.rgParamPhoneNotesTags + "&onsave=rv" + "&html=" + data.rgParamPhoneNotesFormTitle + data.rgParamNewPmDefaults + "&default_property_due=" + startDateTime;
          var pnHtml = '<a class="phonenotes" rg="' + pnRg + '" href="javascript:void(0);" title="' + data.rgParamPhoneNotesFormTitle + '"><i class="icon"></i><span class="text">' + data.rgParamPhoneNotesFormTitle + '</span></a>';
        } else {
          var pnHtml = '';
        }

        // console.log('tsHtml = ' + tsHtml);
        // console.log('evHtml = ' + evHtml);
        // console.log('pnHtml = ' + pnHtml);

        $(this).find('.fc-daygrid-day-top').append('<div class="fc-day-add-links">' + evHtml + tsHtml + pnHtml + '</div>');

      });
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
          Proteus.Calendar.showEventDetails(eventClickInfo.event._def.publicId , eventClickInfo.event.extendedProps.tpurl);
        } else {
          // This is a Google Calendar item.
        }
      }
    },
  });

  calendar.render();

}


Proteus.addHandler("load", function() {


});
