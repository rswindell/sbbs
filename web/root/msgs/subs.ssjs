load("html_inc/msgslib.ssjs");

template.title="Message Subs in Group: "+msg_area.grp[grp].description;

write_template("header.inc");

template.group=msg_area.grp[grp];
template.subs=new Array;

for(s in msg_area.grp[grp].sub_list) {
	if(!(msg_area.grp[grp].sub_list[s].scan_cfg&(SCAN_CFG_YONLY|SCAN_CFG_NEW))
			&& (http_request.query.show_all_subs == undefined 
				|| http_request.query.show_all_subs != 'Yes'))
		continue;
	var thissub=msg_area.grp[grp].sub_list[s];
	msgbase = new MsgBase(msg_area.grp[grp].sub_list[s].code);
	if(msgbase.open()) {
		var lastdate="No Msgs";
        msgs=msgbase.total_msgs;
		if(msgs != undefined && msgs > 0) {
			lastdate=msgbase.get_msg_index(true,msgs-1);
			if(lastdate!=undefined && lastdate != null) {
				lastdate=lastdate.time;
				if(lastdate>0)
					lastdate=strftime("%m/%d/%y",lastdate);
			}
        }
        msgbase.close();
        thissub.messages=msgs;
        thissub.lastmsg=lastdate;
	}
	template.subs.push(thissub);
}

write_template("msgs/subs.inc");
write_template("footer.inc");

msgs_done();
