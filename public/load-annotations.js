 /**
  * Need to continuously check if annotations table has been updated.
  */

  function annotationQueryRefresh(){
    $.ajax({ 
        url: '/annotationQuery'
        , type: 'GET'
        , cache: true
        , data: { }
        , callback: function(response){
            console.log(response)
        } 
        , success: function(data){
            annotationTabPop();
        }
        , error: function(jqXHR, textStatus, err){
            console.log('text status '+textStatus+', err '+err)
        }
    })

  }


  function annotationTabPop(){
    d3.json('userAnnotations/data.json', function(rawdata){
        var tdata = _.sortBy(rawdata, [function(o) { return parseFloat(o.timestamp); }])
        var tbody = d3.select('#annotation-table')
        .select('tbody')
        .data(tdata)

        try{
            tbody.selectAll('.annotrow').remove();
        } catch(err){
            console.log(err);
        }
        
        tdata.forEach(function(d){
            var row = tbody.append('tr').datum(d).attr('class', 'annotrow')
        
            var timeNum = parseFloat(d.timestamp)
    
            var minute = Math.floor(timeNum/60)
            var second = Math.round(timeNum - 60*minute)
            var minstr = minute < 10 ? "0" + minute.toString() : minute.toString();
            var secstr = second < 10 ? "0" + second.toString() : second.toString();

            var timestr = minstr + ":" + secstr
    
            row.append('td')
            .attr('style', 'width:20%')
            .text(timestr)
    
            row.append('td')
            .attr('style', 'width:80%')
            .text(d.annotation)        
    
        })  
        //have to wrap this in a try because it may not be defined yet.
        try{
            if(JSON.parse(d3.select('#annotationsgraphicmain').attr('origdata')).length == rawdata.length){
                //console.log('data unchanged')
            } else {
                //console.log(JSON.parse(d3.select('#annotationsgraphicmain').attr('origdata')))
                //console.log(rawdata)
                createAnnotationsTimeline();    
            }
        } catch(err){
            console.log(err)
        }

    })  


    //Sometimes success times out but the db is actually updated. This is a band-aid for that--we make it recursively update every four seconds.
    setTimeout("annotationTabPop()", 4000)

}

annotationQueryRefresh();