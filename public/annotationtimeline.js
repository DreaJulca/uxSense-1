var uxvideo = document.getElementById("video_html5_api");

d3.select('body').append('div')
.attr('id', 'annotimetooltip')
.style('opacity', 0)


function createAnnotationsTimeline(){
    refreshuxSDimVars();
    // we want to aggregate our count to some level of timespan for plotting, and then we want the user to be able to drill down into it
    var annosvg = d3.select("#AnnotationTimeline")
        .append("svg")
        .attr("width", "100%")
        .attr("height", (height + margin.top + margin.bottom))
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .attr("preserveAspectRatio", "none")
        .style('display', 'inline-block')
        .style('position', 'relative')

//    .attr("width", width + margin.left + margin.right)
//    .attr("height", height + margin.top + margin.bottom)
    var annotationsColors = {"Action1":'#ffa31a', "Emotion":'#e3f43a', "pitch":'steelblue', "vidtimelineholder": '#009900', "speech-rate":'#ff3300', "AnnotationTimeline":'purple'}
    var annotationsTimelineLabs = {"Action1":'Actions', "Emotion":'Emotions', "pitch":'Pitch', "vidtimelineholder": 'Thumbnails', "speech-rate":'Speech Rate', "AnnotationTimeline":'Annotations'}

    //wipe the slate first
    try{
        annosvg.selectAll('g').remove();
    } catch(err){
        console.log(err)
    }

    annograph = annosvg.append("g")
        .attr('id', 'annotationsgraphicmain')
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    d3.json('userAnnotations/data.json', function(rawdata){
        refreshuxSDimVars();
        if(rawdata.length>0){
            var data=_.sortBy(rawdata, function(o){
                if(o.annotationtype == "interval" & o.focusbrushed=="true"){
                    return parseFloat(o.annotatedintervalmin)
                } else {
                    return parseFloat(o.timestamp)
                }
            })
    
        } else {
            var data=rawdata
        }
         
        //console.log(data)

        annograph.data(data);
        annograph.attr('origdata', JSON.stringify(data));

        //Check to see if there is a selected time interval focus
        var focussvg = d3.select('#focussvg').select('g')
        var focusBrush = focussvg.select('g.x.brush')
        var selrect = focusBrush.select('rect.selection')

        var selwid = parseFloat(selrect.attr('width'))
        var selX = parseFloat(selrect.attr('x'))

        var isFocused=true;
        var minTime = uxvideo.duration * selX/width
        var maxTime = uxvideo.duration * ( selX + selwid )/width

        if(isNaN(minTime)|isNaN(maxTime)){
            selwid = width;
            selX = 1;
            minTime =  0
            maxTime =  uxvideo.duration 
            isFocused=false;
        }


        var crectwidthmin = 5

        if(data.length>0){
            var annotHeight = (height/data.length)

           for(i=0; i<data.length; i++){
               //console.log((maxTime-minTime))
               //console.log(data[i])
                if(data[i].annotationtype == "interval" & data[i].focusbrushed=="true"){
                    var mainanno = annograph.append('rect')
                    .datum(data[i])
                    .attr('fill', annotationsColors[data[i].timeline])
                    .attr('class', 'annottimelinerect')
                    .attr('id', 'rect_annot_'+data[i]._id)
                    .attr('width', crectwidthmin + width*(parseFloat(data[i].annotatedintervalmax)-parseFloat(data[i].annotatedintervalmin))/(maxTime-minTime))
                    .attr('height', annotHeight)
                    .attr('x', width*parseFloat(data[i].annotatedintervalmin)/(maxTime-minTime)-crectwidthmin/2 )
                    .attr('rx', 5)
                    .attr('ry', 5)
                    .attr('y', i*annotHeight)
                    .on('mouseover', function(d){
                        d3.select('#annotimetooltip')
                        .transition().duration(100)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")   
                        .style('opacity', 1)
            
                        d3.select('#annotimetooltip')
                        .html("Interval note: " + d.annotation + "<br/>Timeline: "+annotationsTimelineLabs[d.timeline])
            
                        //Track event
                        interactiontracking(d, 'annottimelinerects', 'rect_annot_'+d._id, 'mouseover'    )
                 
                    })
                    .on('mouseout', function(d){
                        d3.select('#annotimetooltip')
                        .transition().duration(100)
                        .style('opacity', 0)
            
                        //Track event
                        interactiontracking(d, 'annottimelinerects', 'rect_annot_'+d._id, 'mouseout'    )
            
                    })
                    .on('click', function(d){
                        var fps = maxTime/uxvideo.duration;
                        var uxvidPrevTime = uxvideo.currentTime
                        uxvideo.currentTime = parseFloat(d.annotatedintervalmin)/fps;
            
                        //track event
                        interactiontracking(d, 'annottimelinerects', 'rect_annot_'+d._id, 'click', [{oldtime: uxvidPrevTime}, {newtime: uxvideo.currentTime}])
                    })
            

                } else {
                    var mainanno = annograph.append('rect')
                    .datum(data[i])
                    .attr('fill', annotationsColors[data[i].timeline])
                    .attr('class', 'annottimelinerects')
                    .attr('id', 'rect_annot_'+data[i]._id)
                    .attr('width', crectwidthmin)
                    .attr('height', annotHeight)
                    .attr('x', width*parseFloat(data[i].timestamp)/(maxTime-minTime)-crectwidthmin/2 )
                    .attr('rx', 5)
                    .attr('ry', 5)
                    .attr('y', i*annotHeight)
                    .on('mouseover', function(d){
                        d3.select('#annotimetooltip')
                        .transition().duration(100)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")   
                        .style('opacity', 1)
            
                        d3.select('#annotimetooltip')
                        .html("Point note: " + d.annotation + "<br/>Timeline: "+annotationsTimelineLabs[d.timeline])
            
                        //Track event
                        interactiontracking(d, 'annottimelinerects', 'rect_annot_'+d._id, 'mouseover'    )
                 
                    })
                    .on('mouseout', function(d){
                        d3.select('#annotimetooltip')
                        .transition().duration(100)
                        .style('opacity', 0)
            
                        //Track event
                        interactiontracking(d, 'annottimelinerects', 'rect_annot_'+d._id, 'mouseout'    )
            
                    })
                    .on('click', function(d){
                        var fps = maxTime/uxvideo.duration;
                        var uxvidPrevTime = uxvideo.currentTime
                        uxvideo.currentTime = parseFloat(d.timestamp)/fps;
            
                        //track event
                        interactiontracking(d, 'annottimelinerects', 'rect_annot_'+d._id, 'click', [{oldtime: uxvidPrevTime}, {newtime: uxvideo.currentTime}])
                    })


                }               
           }     
        }
    })    
}

uxvideo.addEventListener('loadeddata', function(){
    createAnnotationsTimeline()
})
