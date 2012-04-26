if(!js.global || js.global.HTTPRequest==undefined)
	load("http.js");

// Comment these...
//Bot_Commands={};
//function Bot_Command(x,y,z){}
//js.global.config_filename='hambot.ini';

var last_update=0;
var update_interval=2;
var last_wflength=-1;
var last_solar_update=0;
var solar_x;
function main(srv,target)
{
	if((time() - last_update) < update_interval) return;

	var config = new File(system.ctrl_dir + js.global.config_filename);
	var watch=new File();
	if(!config.open('r')) {
		log("Unable to open config!");
		return;
	}
	var wfname=config.iniGetValue("module_Ham", 'watchfile');
	config.close();
	if(wfname.length > 0) {
		var wf=new File(wfname);
		var len=wf.length;
		// Ignore contents at start up.
		if(last_wflength==-1)
			last_wflength=len;
		// If the file is truncated, start over
		if(last_wflength > len)
			last_wflength=0;
		if(len > last_wflength) {
			if(wf.open("r")) {
				var l;
				wf.position=last_wflength;
				while(l=wf.readln()) {
					srv.o(target, l);
				}
				last_wflength=wf.position;
				wf.close();
			}
		}
	}
	last_update=time();
}

Bot_Commands["Z"] = new Bot_Command(0, false, false);
Bot_Commands["Z"].command = function (target, onick, ouh, srv, lbl, cmd) {
	// Remove empty cmd args
	for(i=1; i<cmd.length; i++) {
		if(cmd[i].search(/^\s*$/)==0) {
			cmd.splice(i,1);
			i--;
		}
	}

	if(cmd.length == 1) {
		var d=new Date(time()*1000);
		srv.o(target,d.toGMTString());
	}

	return true;
}

function update_solar()
{
	// MUST NOT request more than every hour or you will get banned!
	if((time() - last_solar_update) < 60*60) return;
	var req=new HTTPRequest();
	var newxml=req.Get('http://www.hamqsl.com/solarxml.php');
	newxml=newxml.replace(/<\?[^?]*\?>/g,'');
	solar_x=new XML(newxml).solardata;
}

function trim(val)
{
	var ret=val.toString().replace(/^\s*/,"");
	ret=ret.replace(/\s*$/,"");
	return(ret);
}

Bot_Commands["GEO"] = new Bot_Command(0, false, false);
Bot_Commands["GEO"].command = function (target, onick, ouh, srv, lbl, cmd) {
	// Remove empty cmd args
	for(i=1; i<cmd.length; i++) {
		if(cmd[i].search(/^\s*$/)==0) {
			cmd.splice(i,1);
			i--;
		}
	}

	if(cmd.length == 1) {
		update_solar();
		srv.o(target,"Solar conditions from "+trim(solar_x.source)+" as of "+trim(solar_x.updated)+":");
		srv.o(target,"Solar Flux: "+trim(solar_x.solarflux)+", A-Index: "+trim(solar_x.aindex)+", K-Index: "+trim(solar_x.kindex)+"/"+trim(solar_x.kindexnt)+", X-Ray: "+trim(solar_x.xray)+", Sun Spots: "+trim(solar_x.sunspots)+", Helium Line: "+trim(solar_x.heliumline)+", Proton Flux: "+trim(solar_x.protonflux)+", Electron Flux: "+trim(solar_x.electonflux)+", Aurora Activity: "+trim(solar_x.aurora)+"/n="+trim(solar_x.normalization)+", Aurora Latitude: "+trim(solar_x.latdegree)+", Solar Wind: "+trim(solar_x.solarwind)+", Magnetic Field: "+trim(solar_x.magneticfield)+", Geomagnetic Field: "+trim(solar_x.geomagfield)+", Noise Level: "+trim(solar_x.signalnoise)+", F2 Critical Frequency: "+trim(solar_x.fof2));
	}

	return true;
}

Bot_Commands["VHF"] = new Bot_Command(0, false, false);
Bot_Commands["VHF"].command = function (target, onick, ouh, srv, lbl, cmd) {
	// Remove empty cmd args
	for(i=1; i<cmd.length; i++) {
		if(cmd[i].search(/^\s*$/)==0) {
			cmd.splice(i,1);
			i--;
		}
	}

	if(cmd.length == 1) {
		update_solar();
		srv.o(target,"VHF conditions from "+trim(solar_x.source)+" as of "+trim(solar_x.updated)+":");
		srv.o(target,"Aurora Latitude: "+trim(solar_x.latdegree)+" ("+trim(solar_x.calculatedvhfconditions.phenomenon.(@name=='vhf-aurora'))+")");
		srv.o(target,"E-Skip North America (2m): "+trim(solar_x.calculatedvhfconditions.phenomenon.(@name=='E-Skip').(@location=='north_america')));
		srv.o(target,"E-Skip Europe (2m): "+trim(solar_x.calculatedvhfconditions.phenomenon.(@name=='E-Skip').(@location=='europe')));
		srv.o(target,"E-Skip Europe (4m): "+trim(solar_x.calculatedvhfconditions.phenomenon.(@name=='E-Skip').(@location=='europe_4m')));
		srv.o(target,"E-Skip Europe (6m): "+trim(solar_x.calculatedvhfconditions.phenomenon.(@name=='E-Skip').(@location=='europe_6m')));
	}
	return true;
}

Bot_Commands["HF"] = new Bot_Command(0, false, false);
Bot_Commands["HF"].command = function (target, onick, ouh, srv, lbl, cmd) {
	// Remove empty cmd args
	for(i=1; i<cmd.length; i++) {
		if(cmd[i].search(/^\s*$/)==0) {
			cmd.splice(i,1);
			i--;
		}
	}

	if(cmd.length == 1) {
		update_solar();
		srv.o(target,"HF conditions from "+trim(solar_x.source)+" as of "+trim(solar_x.updated)+":");
		srv.o(target,"Band    | Day    | Night");
		srv.o(target,format("80m-40m | %-7.7s| %s",solar_x.calculatedconditions.band.(@name == '80m-40m').(@time == 'day'),solar_x.calculatedconditions.band.(@name == '80m-40m').(@time == 'night')));
		srv.o(target,format("30m-20m | %-7.7s| %s",solar_x.calculatedconditions.band.(@name == '30m-20m').(@time == 'day'),solar_x.calculatedconditions.band.(@name == '30m-20m').(@time == 'night')));
		srv.o(target,format("17m-15m | %-7.7s| %s",solar_x.calculatedconditions.band.(@name == '17m-15m').(@time == 'day'),solar_x.calculatedconditions.band.(@name == '17m-15m').(@time == 'night')));
		srv.o(target,format("12m-10m | %-7.7s| %s",solar_x.calculatedconditions.band.(@name == '12m-10m').(@time == 'day'),solar_x.calculatedconditions.band.(@name == '12m-10m').(@time == 'night')));
		srv.o(target,"Signal Noise Level: "+trim(solar_x.signalnoise));
	}
	return true;
}

Bot_Commands["CALLSIGN"] = new Bot_Command(0,false,false);
Bot_Commands["CALLSIGN"].command = function (target,onick,ouh,srv,lvl,cmd) {
	var callsign;
	var i;

	// Remove empty cmd args
	for(i=1; i<cmd.length; i++) {
		if(cmd[i].search(/^\s*$/)==0) {
			cmd.splice(i,1);
			i--;
		}
	}

	if(cmd.length==2)
		callsign=cmd[1].toUpperCase();
	else {
		srv.o(target,"Usage: callsign <sign>");
		return true;
	}

	function USCallsign(callsign, srv, target) {
		var i;
		var CookieRequest=new HTTPRequest();
		var m=CookieRequest.Get('http://wireless2.fcc.gov/UlsApp/UlsSearch/searchLicense.jsp');
		var jsess='';
		var cookies=['refineIndex=0'];
		for(i in CookieRequest.response_headers) {
			if(CookieRequest.response_headers[i].search(/^Set-Cookie:/i)!=-1) {
				if(m=CookieRequest.response_headers[i].match(/^Set-Cookie:\s*(.*?);/)) {
					cookies.push(m[1]);
					if(m[1].search(/JSESSIONID_/)==0)
						jsess=m[1];
				}
			}
		}
		req=new HTTPRequest();
		req.SetupPost('http://wireless2.fcc.gov/UlsApp/UlsSearch/results.jsp;'+jsess, undefined, undefined, 'fiUlsSearchByType=uls_l_callsign++++++++++++++++&fiUlsSearchByValue='+callsign+'&fiUlsExactMatchInd=Y&hiddenForm=hiddenForm&jsValidated=true&x=0&y=0');
		req.request_headers.push("Cookie: "+cookies.join('; '));
		req.request_headers.push("Referer: http://wireless2.fcc.gov/UlsApp/UlsSearch/searchLicense.jsp");
		req.SendRequest();
		req.ReadResponse();

		m=req.body.match(/license.jsp\?licKey=[^\s]*/g);

		if(m && m.length) {
			var response=new HTTPRequest().Get('http://wireless2.fcc.gov/UlsApp/UlsSearch/'+m[m.length-1]);
			m=response.match(/In the case of City, state and zip[^-]*?-->([\s\S]*?)<\/td>/);
			if(m) {
				var info=callsign+':';
				m[1]=m[1].replace(/<[^>]*>/g,'');
				m[1]=m[1].replace(/[\r\n]/g,' ');
				m[1]=m[1].replace(/\s+/g,' ');
				info += m[1];

				m=response.match(/>Type<\/td>[\s\S]*?>([^<&]*)[<&]/);
				if(m) {
					m[1]=m[1].replace(/<[^>]*>/g,'');
					m[1]=m[1].replace(/[\r\n]/g,' ');
					m[1]=m[1].replace(/\s+/g,' ');
					info += ' -  Type: '+m[1];
				}

				m=response.match(/<!--Example: Amateur Extra -->([^&<]*?)[&<]/);
				if(m) {
					m[1]=m[1].replace(/<[^>]*>/g,'');
					m[1]=m[1].replace(/[\r\n]/g,' ');
					m[1]=m[1].replace(/\s+/g,' ');
					info += ' -  Class: '+m[1];
				}

				m=response.match(/>Status<\/td>[\s\S]*?>([^<&]*)[<&]/);
				if(m) {
					m[1]=m[1].replace(/<[^>]*>/g,'');
					m[1]=m[1].replace(/[\r\n]/g,' ');
					m[1]=m[1].replace(/\s+/g,' ');
					info += ' ('+m[1]+')';
				}
				srv.o(target,info);
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	}

	function CanadaCallsign(callsign, srv, target) {
		var result=new HTTPRequest().Post('http://apc-cap.ic.gc.ca/pls/apc_anon/query_amat_cs$callsign.actionquery','P_CALLSIGN='+callsign+'&P_SURNAME=&P_CITY=&P_PROV_STATE_CD=&P_POSTAL_ZIP_CODE=&Z_ACTION=QUERY&Z_CHK=0');
		var re=new RegExp("<a href=\"(query_amat_cs\\$callsign\\.QueryViewByKey\\?P_CALLSIGN="+callsign.toUpperCase()+"&amp;Z_CHK=[0-9]+)\">"+callsign.toUpperCase()+"</a>");
		var m=result.match(re);
		if(m!=null) {
			result=new HTTPRequest().Get('http://apc-cap.ic.gc.ca/pls/apc_anon/'+m[1].replace(/&amp;/g, '&'));
			m=result.match(/Call Sign:[\s\S]*?\<td>([^<]+)<[\s\S]*?Amateur Name:[\s\S]*?\<td>([^<]+)<[\s\S]*?Address:[\s\S]*?\<td>([^<]+)<[\s\S]*?City:[\s\S]*?\<td>([^<]+)<[\s\S]*?Province:[\s\S]*?\<td>([^<]+)<[\s\S]*?Postal Code:[\s\S]*?\<td>([^<]+)<[\s\S]*?Qualifications:[\s\S]*?\<td>([^<]+)</);
			if(m!=null) {
				srv.o(target, (m[1]+": "+m[2]+", "+m[3]+", "+m[4]+", "+m[5]+" "+m[6]+". "+m[7]).replace(/&nbsp;/g,''));
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	}

	function HamcallCallsign(callsign, srv, target) {
		var req=new HTTPRequest();
		var config = new File(system.ctrl_dir + js.global.config_filename);
		if(!config.open('r')) {
			log("Unable to open config!");
			return false;
		}

		req.SetupGet('http://hamcall.net/call?callsign='+callsign);
		req.request_headers.push("Cookie: callsign="+config.iniGetValue("module_Ham", 'callsign')+'; password='+config.iniGetValue("module_Ham", 'password'));
		req.SendRequest();
		req.ReadResponse();

		config.close();

		var m=req.body.match(/Tell them you found it on HamCall.net, the world's largest callsign database!.*?<BR>([\s\S]*?)(<font size|<\/td>)/);
		if(m) {
			m[1]=m[1].replace(/<[^>]*>/g,' ');
			m[1]=m[1].replace(/[\r\n]/g,' ');
			m[1]=m[1].replace(/\s+/g,' ');
			m[1] += ' (Found on HamCall.net)';
			srv.o(target, m[1]);
			return true;
		}
		else {
			return false;
		}
	}

	function USSpecialEvent(callsign,src,target) {
		var today=strftime("%m%%2F%d%%2F%Y", time());
		var result=new HTTPRequest().Post('http://www.arrl.org/special-event-stations', '_method=POST&data%5BSearch%5D%5Bcall_sign%5D='+callsign+'&data%5BSearch%5D%5Bkeywords%5D=&data%5BLocation%5D%5Bzip%5D=&data%5BLocation%5D%5Barea%5D=&data%5BLocation%5D%5Bcity%5D=&data%5BLocation%5D%5Bstate%5D=&data%5BLocation%5D%5Bdivision_id%5D=&data%5BLocation%5D%5Bsection_id%5D=&data%5BLocation%5D%5Bcountry%5D=&data%5BDate%5D%5Bstart%5D='+today+'&data%5BDate%5D%5Bend%5D=&=Search');
		var m=result.match(/<h3>\s*([\s\S]*?)<\/p/);
		if(m!=null) {
			m[1]=m[1].replace(/<[^>]*>/g,'');
			m[1]=m[1].replace(/[\r\n]/g,' ');
			m[1]=m[1].replace(/\s+/g,' ');
			srv.o(target, m[1]);
			return true;
		}
		else {
			return false;
		}
	}

	var matched=false;
	if(!matched && callsign.search(/(C[F-K]|C[Y-Z]|V[A-GOXY]|X[J-O])/)==0) {
		try {
			matched=CanadaCallsign(callsign, srv, target);
		}
		catch(e) {
			srv.o(target, "Failed to look up Canadian Callsign: "+e);
		}
	}
	if(!matched && callsign.search(/^\s*(K|N|W)[0-9].\s*$/)==0) {
		try {
			matched=USSpecialEvent(callsign,srv,target);
		}
		catch(e) {
			srv.o(target, "Failed to look up US Special Event Callsign: "+e);
		}
	}
	if(!matched && callsign.search(/(A[A-L]|K|N|W)/)==0) {
		try {
			matched=USCallsign(callsign,srv,target);
		}
		catch(e) {
			srv.o(target, "Failed to look up US Callsign: "+e);
		}
	}
	if(!matched) {
		try {
			matched=HamcallCallsign(callsign, srv, target);
		}
		catch(e) {
			srv.o(target, "Failed to look up Callsign on HamCall: "+e);
		}
	}
	if(!matched) {
		srv.o(target, "Unable to match callsign in any databases.");
	}

	return true;
}

//var dumb={o:function(x,y) {log(y);}};
//Bot_Commands["GEO"].command(undefined, undefined, undefined,dumb,undefined,['GEO']);
//Bot_Commands["HF"].command(undefined, undefined, undefined,dumb,undefined,['GEO']);
//Bot_Commands["VHF"].command(undefined, undefined, undefined,dumb,undefined,['GEO']);
//Bot_Commands["CALLSIGN"].command(undefined, undefined, undefined,dumb,undefined,['asdf','n0l']);
//Bot_Commands["CALLSIGN"].command(undefined, undefined, undefined,dumb,undefined,['asdf','kj6pxy']);
//Bot_Commands["CALLSIGN"].command(undefined, undefined, undefined,dumb,undefined,['asdf','va6rrx']);
//Bot_Commands["CALLSIGN"].command(undefined, undefined, undefined,dumb,undefined,['asdf','g1xkz']);
