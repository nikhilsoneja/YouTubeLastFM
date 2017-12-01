function loadAPIClientInterfaces() {
    gapi.client.load("youtube", "v3", function() {
        handleAPILoaded()
    })
}

googleApiClientReady = function() {
    loadAPIClientInterfaces();
};

function handleAPILoaded() {
    gapi.client.setApiKey("AIzaSyCr5PexuEF_S43HH02si2uj32O4n3FWodc");
}

function onYouTubeIframeAPIReady()
{
    player = new YT.Player("player",{
        height: "394",
        width: "700",
        events: {
            onReady: onPlayerReady,
            onError: onPlayerError,
            onStateChange: onPlayerStateChange,
        },
        playerVars: {
            modestbranding: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            theme: "dark",
            color: "white",
            showinfo: 1,
            playsinline: 1
        }
    })
}

var search = function(query,counter) {
	var q = query;
	var c = counter;

	var request = gapi.client.youtube.search.list({
	q: q,
	part: 'snippet',
	maxResults: 20
	//order: 'viewCount'
	});
  
  request.execute(function(response) {
	var searchObj = response.result;
	//these arrays will hold the top 20 results of each one in the loop
	var vIdArr=[], vTitleArr=[], vThumbArr=[];

	$.each(searchObj.items, function(i,x) {
		var vId = x.id.videoId;
		var vTitle = x.snippet.title;
		if (x.snippet.thumbnails.default.url !=undefined) var vThumb = x.snippet.thumbnails.default.url;
		if (vId===undefined) {
			vId="Not Found"; vTitle="Not Found. Try version refresh button: "; vThumb="img/notfound.png"; 
		}

		vIdArr.push(vId);
		vTitleArr.push(vTitle);
		vThumbArr.push(vThumb);

        //global object of all the song results
		search.vidObjArray[c] = {
			vid:vIdArr,
			title:vTitleArr, 
			thumb:vThumbArr
		};

		//display list, use only first result of each
		if (i === 0) {
			search.topvIdArray.push(vId);	
			search.topvTitleArray.push(vTitle);
			search.topvThumbArray.push(vThumb);
			//start the first video right away while the playlist loads

			if (search.topvIdArray.length == 1) {
				//only cue on the first search, keep the video running on subsequent searches
				//////if (count==1) cuePlayer();
				if (search.count==1) loadVid(search.topvIdArray[0], 0, "medium"); 
			} 

			renderPlaylist(c,vThumb,vId,vTitle);
			c++;
		}
	});
  });	
};

function multiSearch() {
        search.vidObjArray = {}; 
        search.topvIdArray = []; 
        search.topvTitleArray =[]; 
        search.topvThumbArray = []; 
        search.listArray = [];
        search.vidcount = 0; search.playcount = 0; search.done = false; 
        
        if (!search.count) search.count = 0;
   
        if (search.topvIdArray) {
            search.topvIdArray.length = 0; search.topvTitleArray.length = 0; search.topvThumbArray.length = 0;
            search.listArray.length = 0;
        }
   
        
        $('#songs li').each(
            function(){
                search.listArray.push($.trim($(this).text()));    
            }
        )
        
        var x = 0;
        var searchnum = search.listArray.length;

        (function setInterval_afterDone(){
    
            /* do search function */
            if (search.listArray[x])
                { search(search.listArray[x],x); } 
            x++;            
            
            var waittime = 600; 
            var timerId = setTimeout(setInterval_afterDone, waittime);
            if(x==searchnum) {
    
                search.done = true;
                clearTimeout(timerId);
            }
        })();
        search.count++;
    }
    
function renderPlaylist(c,vThumb,vId,vTitle) {
    $("#search-container").append("<div class='searchresult'>"+createPlaylistItem(c,vThumb,vId,vTitle)+"</div>");
}
function createPlaylistItem(c,vThumb,vId,vTitle,swapcount) {
    var vclick = "loadVid(\""+vId+"\"); search.vidcount="+c+";";
    var notFoundString = '';
    if (vId == "Not Found") {
        vclick = "editSearchTerm(0);";
        notFoundString = "<input id='not-found' value='"+ search.listArray[c] +"'> ";
    }

    return "<div class='searchresult-div'><img id='thumb' src='"+ vThumb +"'></div> <div class='searchresult-title'>"+ notFoundString +"<a id='link' onclick='"+ vclick + "' title='"+ vTitle +"'>" + vTitle + 
        "</a></div>";
}


function playPause() {
    if (player.getPlayerState() != 1) {
            player.playVideo();
            $("#playpause").text("Pause");
    } else {
        player.pauseVideo();
        $("#playpause").text("Play");
    }
}

function nextVideo(next) {
    var totalvids = search.topvIdArray.length;
    if (next===true) {
        search.vidcount++; search.playcount++;
        if (search.vidcount >= totalvids) search.vidcount = 0;
        $('#search-container').append($('#search-container div.searchresult:first'));
    } else { 
        search.vidcount--; search.playcount--;
        if ((search.vidcount < 0) || (search.vidcount=='undefined')) search.vidcount = totalvids-1;
        $('#search-container').prepend($('#search-container div.searchresult:last'));
    }
    
    var thevideoid = search.topvIdArray[search.vidcount];
    if (thevideoid) loadVid(thevideoid);
}

function loadVid(vidId) {
    if (player.loadVideoById) {
        player.loadVideoById(vidId);
        if (search.topvTitleArray[search.vidcount]) document.title = search.topvTitleArray[search.vidcount];
    } 
}

function cuePlayer() {
    //check if the player object is loaded
    if (player.cueVideoById) {
        player.cueVideoById(search.topvIdArray[0]);
    } 
}

function onPlayerStateChange(e) {
    if (e.data != 1) 
        $("#playpause").text("Play")
    else 
        $("#playpause").text("Pause")
    
	//if video is done, play next
	if (e.data === 0) {
		var totalvids = search.topvIdArray.length;
		if (search.playcount+1 < totalvids) {
			nextVideo(true);
		} else {
			search.playcount = -1;
        }render
    }
}

function onPlayerError(e) {
}

function onPlayerReady() {
    $("#prevbutton").click(function() {
        nextVideo(false)
    }),
    $("#playpause").click(function() {
        playPause()
    }),
    $("#nextbutton").click(function() {
        nextVideo(true)
    })

    multiSearch();        
    
}

var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
