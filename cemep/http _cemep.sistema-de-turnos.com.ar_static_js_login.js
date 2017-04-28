var use_rel = false;
var hora_min = '09:00';
var hora_max = '22:00';

function alertar(msg, title, callback) {
	if (typeof title == "undefined") {
		title = 'Error';
	}

	if (typeof callback == "undefined") {
		callback = function() {
		};
	}

	return jAlert(msg, title, callback);
}

function hideSteps(actual)
{
	for (var i=++actual; i <= 6; i++)
		$("#step"+i).hide('fade');
		
}

function dos(s)
{
	if(s < 10)
		return '0' + s;
	return s;
}

function validar(nombre, extra)
{
	objeto = $('[name="' + nombre + '"]');
	if(objeto.length == 0)
		return true;

	resultado = true;
	texto = 'Por favor, ingrese su ' + nombre;
	
	if (!$.trim(objeto.val()) || objeto.val() === objeto.attr('placeholder')) {
		if( objeto.attr('obligatorio'))
			resultado = (objeto.attr('obligatorio') != 'true');
		else
			resultado = false;
	}

	if((resultado) && (extra > 0))
	{
		if(extra == 1)
		{
			if (!objeto.val().match(regex.email))
			{
				texto = 'El mail ingresado es incorrecto';
				resultado = false;
			}
		}
		if(extra == 2)
		{
			if (objeto.val() < 6 || objeto.val() > 23)
			{
				texto = 'El rango de hora ingresado es incorrecto';
				resultado = false;
			}
		}
		if(extra == 3)
		{
			if (objeto.val() < 0 || objeto.val() > 59)
			{
				texto = 'El rango de minutos ingresado es incorrecto';
				resultado = false;
			}
		}
	}
	
	if(resultado == false)
	{
		alertar(texto, 'Validacion', function() {
				objeto.focus();
		});
		return false;
	}
	else
		return true;
}

var regex = {
	'email': new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
};

$(document).ready(function() {

	$(".numeric").keypress(function(event) {
		var controlKeys = [8, 9, 13, 35, 36, 37, 39];
		var isControlKey = controlKeys.join(",").match(new RegExp(event.which));
		if (!event.which || // Control keys in most browsers. e.g. Firefox tab is 0
			(48 <= event.which && event.which <= 57) || // Always 1 through 9
			isControlKey) { // Opera assigns values for control keys.
			return;
		} else {
			event.preventDefault();
		}
	});

	//arranco ocultando el loading del ajax
	$("#loading").hide();
	//configuro el loading del ajax para q se muestre en cada llamado
	$.ajaxSetup({
	    beforeSend:function(){
        	$("#loading").show();
    	},
    	complete:function(){
        	$("#loading").hide();
    	}
	});

	// utils
	$('[placeholder]').focus(function() {
		var input = $(this);
		if (input.val() === input.attr('placeholder')) {
			input.val('');
			input.removeClass('placeholder');
		}
	}).blur(function() {
		var input = $(this);
		if (input.val() === '' || input.val() === input.attr('placeholder')) {
			input.addClass('placeholder');
			input.val(input.attr('placeholder'));
		}
	}).blur();

	$('[placeholder]').parents('form').submit(function() {
		$(this).find('[placeholder]').each(function() {
			var input = $(this);
			if (input.val() === input.attr('placeholder')) {
				input.val('');
			}
		});
	});

	$.fn.goTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    };

	// step 2
	$('.js-finish').bind('click', function() {
		if(!validar('nombre', 0) ||	!validar('email', 1) || !validar('empresa', 0) || !validar('telefono', 0) || !validar('dni', 0))
			return;
		if(!validar('fecha1', 0) || !validar('hora1', 2) || !validar('minuto1', 3))
			return;
		if(!validar('fecha2', 0) || !validar('hora2', 2) || !validar('minuto2', 3))
			return;

		$('.js-finish').hide();

		$.ajax({
       		url: '/guardar_turno',
			type: "POST",
			data: {
				'email': $('[name="email"]').val(),
				'nombre': $('[name="nombre"]').val(),
				'empresa': $('[name="empresa"]').val(),
				'dni': $('[name="dni"]').val(),
				'telefono': $('[name="telefono"]').val(),
				'value1': $("#opcion1").val(),
				'value2': $("#opcion2").val(),
				'value3': $("#opcion4").val(),
				'fecha1': $('[name="fecha1"]').val(),
				'hora1': $('[name="hora1"]').val(),
				'minuto1': $('[name="minuto1"]').val(),
				'fecha2': $('[name="fecha2"]').val(),
				'hora2': $('[name="hora2"]').val(),
				'minuto2': $('[name="minuto2"]').val()
			},
			dataType: "json",
			cache: false,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			success: function(response) {
				$('.js-finish').show();
				if (!response.resultado) {
					alertar('Turno NO Tomado:' + response.error, 'REINTENTAR', function() {
						$('[name="' + response.nombre + '"]').focus();
					});
					return;
				}else{
						window.location = response.redirect_to;
					};
			},
			error: function(xhr, status, message) {
					$('.js-finish').show();
					console.log('log error');
					console.log(status);
					console.log(message);
					console.log(xhr);
					var er = "\nStatus: " + status  + "\nMessage: " + message;
					
					if (status == "timeout")
						alertar('El tiempo del proceso ha superado lo esperado, por favor, intentelo nuevamente.' + er);
        			else
						alertar('El turno no pudo ser guardado, por favor, controle los datos ingresados.' + er);
			}
		});
	});

	$('#opcion1').on('change', function (e) {
	    var valueSelected = this.value;
		var valueStep = 1;
		if(valueSelected > 0)
		{
			$.ajax({
	       		url: '/get_step',
				type: "POST",
				data: {
					step: valueStep,				
					value: valueSelected
				},
				dataType: "json",
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
       			success: function(msg){
					hideSteps(valueStep);
					valueStep++;
					$("#opcion" + valueStep).html(msg.opcion);
					$("#descripcion_tn1").html(msg.descripcion);
					$("#step" + valueStep).show('fade');
					$("#opcion" + valueStep).val('');
					if(use_rel) $("#opcion" + valueStep).trigger("liszt:updated");

					$("#step" + valueStep).goTo();
					$("#opcion" + valueStep).focus();
					e.preventDefault();
           		},
           		error: function(xhr, status, message) {
           			alertar('salio x error');
                	//document.location.href = $clink.attr('href');
					//event.preventDefault();
           		}
    		});
    	}
    	else
    	{
			hideSteps(valueStep);
    	}
	});

	$('#opcion2').on('change', function (e) {
	    var valueSelected = this.value;
		var valueStep = 2;
		if(valueSelected > 0)
		{
			$.ajax({
	       		url: '/get_step',
				type: "POST",
				data: {
					step: valueStep,				
					value: $("#opcion1").val(),
					valueTN2: valueSelected
				},
				dataType: "html",
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
       			success: function(msg){
					hideSteps(valueStep);
					valueStep = 4; //valueStep++;
					$("#opcion" + valueStep).html(msg);
					$("#step" + valueStep).show('fade');
					if(use_rel) $("#opcion" + valueStep).trigger("liszt:updated");
					$("#step" + valueStep).goTo();
					$("#opcion" + valueStep).focus();
					e.preventDefault();
           		},
           		error: function(xhr, status, message) {
	           		alertar('upsss.. algo no funciono, por favor, intentelo nuevamente');
           		}
    		});
    	}
    	else
    	{
			hideSteps(valueStep);
    	}	
    });
/*
	$('#opcion3').on('change', function (e) {
	    var valueSelected = this.value;
		var valueStep = 3;
		if(valueSelected > 0)
		{
			$.ajax({
	       		url: '/get_step',
				type: "POST",
				data: {
					step: valueStep,				
					value: $("#opcion1").val(),
					valueTN2: $("#opcion2").val(),
					valueAgrupacion: valueSelected
				},
				dataType: "html",
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
       			success: function(msg){
					hideSteps(valueStep);
					valueStep++;
					$("#opcion" + valueStep).html(msg);
					$("#step" + valueStep).show('fade');
					if(use_rel) $("#opcion" + valueStep).trigger("liszt:updated");
					$("#step" + valueStep).goTo();
					$("#opcion" + valueStep).focus();
					//alert(valueSelected);
					e.preventDefault();
           		},
           		error: function(xhr, status, message) {
	           		alertar('upsss.. algo no funciono, por favor, intentelo nuevamente');
                	//document.location.href = $clink.attr('href');
					//event.preventDefault();
           		}
    		});
    	}
    	else
    	{
			hideSteps(valueStep);
    	}	
    });
	*/
	$('#opcion4').on('change', function (e) {
	    var valueSelected = this.value;
	    var valueStep = 4;
		if(valueSelected > 0)
		{
			$.ajax({
	       		url: '/get_step',
				type: "POST",
				data: {
					step: valueStep,				
					valueTN3: valueSelected
				},
				dataType: "json",
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
       			success: function(msg){
					$("#prep").html(msg.preparacion);
					if(msg.divhorarios != false)
						$(".modal-body").html(msg.divhorarios);
					if(msg.minutos > 0)
					{
						$("#comboMinutos").html(msg.minutos);
						$("#comboMinutos2").html(msg.minutos);
					}
					hora_min = msg.hora_min;
					hora_max = msg.hora_max;

					$("#step5").show('fade');
					$("#step6").show('fade');
					$("#step4").goTo();
					$('[name="nombre"]').focus();
			
					//alert(valueSelected);
					e.preventDefault();
           		},
           		error: function(xhr, status, message) {
	           		alertar('upsss.. algo no funciono, por favor, intentelo nuevamente');
                	//document.location.href = $clink.attr('href');
					//event.preventDefault();
           		}
    		});
		}
		else
		{
			hideSteps(4);
		}
	});

	if(use_rel) //chosen - improves select
		$('[data-rel="chosen"],[rel="chosen"]').chosen();

	$('.divstep').hide();
	
 	$.datepicker.regional['es'] = {
    	closeText: 'Cerrar',
        prevText: '&#x3c;Ant',
        nextText: 'Sig&#x3e;',
        currentText: 'Hoy',
        monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
        	'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
        monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun',
        	'Jul','Ago','Sep','Oct','Nov','Dic'],
        dayNames: ['Domingo','Lunes','Martes','Mi&eacute;rcoles','Jueves','Viernes','S&aacute;bado'],
        dayNamesShort: ['Dom','Lun','Mar','Mi&eacute;','Juv','Vie','S&aacute;b'],
        dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','S&aacute;'],
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''};
    $.datepicker.setDefaults($.datepicker.regional['es']);
	
    //$( ".datepicker" ).datepicker();
	//datepicker
	$('.datepicker').datepicker({
					dateFormat: 'dd-mm-yy', 
					changeYear: false,
					onClose: function(dateText, inst) {
           try {
               var d = $.datepicker.parseDate('dd-mm-yy', dateText);
             } catch (err) { 
               $(this).datepicker('setDate', new Date());
               alertar('La fecha ingresada es incorrecta. (DD-MM-YYYY)');
             }
      }
      });

	$(".numeric").keypress(function(event) {
		var controlKeys = [8, 9, 13, 35, 36, 37, 39];
  		var isControlKey = controlKeys.join(",").match(new RegExp(event.which));
  		if (!event.which || // Control keys in most browsers. e.g. Firefox tab is 0
    		(48 <= event.which && event.which <= 57) || // Always 1 through 9
    		isControlKey) { // Opera assigns values for control keys.
    		return;
  		} else {
			event.preventDefault();
  		}
	});

	$(".numeric0").keypress(function(event) {
		var controlKeys = [8, 9, 13, 35, 36, 37, 39];
  		var isControlKey = controlKeys.join(",").match(new RegExp(event.which));
  		if (!event.which || // Control keys in most browsers. e.g. Firefox tab is 0
    		(48 <= event.which && event.which <= 57) || // Always 1 through 9
    		isControlKey) { // Opera assigns values for control keys.
    		return;
  		} else {
			event.preventDefault();
  		}
	});

    $('.timepicker_hours').timepicker({
    	showMinutes: false,
        showPeriod: false,
        showLeadingZero: true,
	    hourText: 'Hora',
	    rows: 2,
    	hours: {
	        starts: 8,                // First displayed hour
        	ends: 20                  // Last displayed hour
    	}
    });

    $('.timepicker_minutes').timepicker({
    	minutes: {
	        starts: 0,                // First displayed minute
        	ends: 55,                 // Last displayed minute
        	interval: 15              // Interval of displayed minutes
    	},
    	showHours: false,
	    // Localization
	    minuteText: 'Minutos',         // Define the locale text for "Minute"
	    amPmText: ['AM', 'PM'],       // Define the locale text for periods
        showMinutesLeadingZero: true
    });
    
	$('.timepicker').timepicker({
	    // Options
	    timeSeparator: ':',           // The character to use to separate hours and minutes. (default: ':')
	    showLeadingZero: true,        // Define whether or not to show a leading zero for hours < 10.(default: true)
	    showMinutesLeadingZero: true, // Define whether or not to show a leading zero for minutes < 10.(default: true)
	    showPeriod: false,            // Define whether or not to show AM/PM with selected time. (default: false)
	    showPeriodLabels: true,       // Define if the AM/PM labels on the left are displayed. (default: true)
	    periodSeparator: ' ',         // The character to use to separate the time from the time period.
	
	    defaultTime: 'now',         // Used as default time when input field is empty or for inline timePicker
                                  	// (set to 'now' for the current time, '' for no highlighted time,default value: now)

    	// Localization
    	hourText: 'Hora',             // Define the locale text for "Hours"
    	minuteText: 'Minutos',         // Define the locale text for "Minute"
    	amPmText: ['AM', 'PM'],       // Define the locale text for periods

	    // custom hours and minutes
	    hours: {
        	starts: 8,                // First displayed hour
        	ends: 20                  // Last displayed hour
    	},
    	minutes: {
        	starts: 0,                // First displayed minute
        	ends: 55,                 // Last displayed minute
        	interval: 15               // Interval of displayed minutes
    	},
    	rows: 2,                      // Number of rows for the input tables, minimum 2, makes more sense if you use multiple of 2
    	showHours: true,              // Define if the hours section is displayed or not. Set to false to get a minute only dialog
    	showMinutes: true,            // Define if the minutes section is displayed or not. Set to false to get an hour only dialog

    	// buttons
    	showCloseButton: true,       // shows an OK button to confirm the edit
    	closeButtonText: 'Listo'      // Text for the confirmation button (ok button)
	});
	
	$('.js-modal').bind('click', function(e) {
		$("#myModal").modal();
		setTimeout(function() {
			crearCalendario(hora_min, hora_max);
			}, 500);
    	e.preventDefault();
	});
	
	$('#myModal').hide();
});

var cant_calendarios = 0;
function crearCalendario(min, max)
{
	objeto = $('#calendar'); // esto es para q funcione cuando solo tengo un turno q no tengo calendario
	if(objeto.length == 0)
		return true;

	if(cant_calendarios == 0)
	{
		$('#calendar').fullCalendar({
	   		defaultView: 'agendaWeek',
   			monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
    					'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
	   		dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'],
			dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],   		
			header: {
	    		left: 'prev,next today',
    			center: 'title',
    			right: 'agendaWeek,agendaDay'
   			},
   			minTime: min,
   			maxTime: max,
 			buttonText: {
	            today: 'Hoy',
            	day: 'Día',
            	week:'Semana',
            	month:'Mes'
        	},
    		events: function(start, end, callback) {
	        	$.ajax({
            		url: '/site/eventos/' + $('#opcion2').val() + '/' + $('#opcion4').val(),
            		type: "POST",
            		dataType: 'json',
            		data: {
                		start: $.fullCalendar.formatDate(start, "yyyy-MM-dd HH:mm"),
                		end: $.fullCalendar.formatDate(end, "yyyy-MM-dd HH:mm")
            		},
            		success: function(doc) {
                				var events = [];
	                				$(doc).each(function() {
                    				events.push({
	                    				id: $(this).attr('id'),
                        				title: 'Disponible',
                        				start: $(this).attr('start'),
                        				end: $(this).attr('end'),
                        				allDay: false
                    				});
                				});
                    			callback(events);
            		}
        		});
    		},
    		eventClick: function(e) {
    				d = new Date(e.start);
					if(navegadorHTML5 == 1)
	        			$('[name="fecha1"]').val(d.toISOString().substring(0, 10));
        			else
						$('[name="fecha1"]').val(dos(d.getDate()) + '-' + dos(d.getMonth() + 1) + '-' + d.getFullYear());
					$('[name="hora1"]').val(d.getHours());
					$('[name="minuto1"]').val(d.getMinutes());
					$('#myModal').modal('hide');
					$('[name="fecha1"]').focus();
			},
			allDaySlot: false,
   			selectable: false,
   			selectHelper: false,
   			editable: false
		});
	}
	cant_calendarios += 1;
}

