$( function() {
    $( "#datapicker" ).datepicker({
        dateFormat: "dd/mm/yy",
        altFormat: "mm/dd/yy",
        altField: "#data",
        minDate: new Date(),
        maxDate: "+1m",
        monthNames: [ "Janeiro", "Fevereiro", "Março", 
        "Abril", "Maio", "Junho", "Julho", "Agosto", "Septembro", 
        "Outubro", "Novembro", "Dezembro" ],
        dayNamesShort: [ "D", "S", "T", "Q", "Q", "S", "S" ],
        dayNamesMin: [ "D", "S", "T", "Q", "Q", "S", "S" ]
        /*
        https://api.jqueryui.com/datepicker/#utility-formatDate
        */
    });
  } );