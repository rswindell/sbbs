// E-mail Section

// $Id$

// Note: this module replaces the old ### E-mail section ### Baja code in exec/*.src
// replace "call E-mail" with "exec_bin email_sec"

load("sbbsdefs.js");
var text = load({}, "text.js");
var userprops = load({}, "userprops.js");

while(bbs.online) {
	if(!(user.settings & USER_EXPERT))
		bbs.menu("e-mail");
	console.print("\r\n\1_\1y\1hE-mail: \1n");
	var wm_mode = WM_NONE;
	var cmdkeys = "SARUFNKQ?\r";
	switch(console.getkeys(cmdkeys,K_UPPER)) {
		case 'R':	// Read your mail
			bbs.read_mail(MAIL_YOUR, user.number);
			break;
		case 'U':	// Read your un-read mail
			bbs.read_mail(MAIL_YOUR, user.number, LM_UNREAD);
			break;
		case 'K':	// Read/Kill sent mail
			bbs.read_mail(MAIL_SENT, user.number);
			break;
		case 'F':	// Send Feedback
			bbs.email(/* user # */1, bbs.text(text.ReFeedback));
			break;
		case 'A':	// Send file attachment
			wm_mode = WM_FILE;
		case 'S':	// Send Mail
			console.print(bbs.text(text.Email));
			var name = console.getstr(40);
			if(!name)
				break;
			if(name.indexOf('@') > 0) {
				bbs.netmail(name); 
				break;
			}
			var number = bbs.finduser(name);
			if(!number)
				number = system.matchuser(name);
			if(!number && (msg_area.settings&MM_REALNAME))
				number = system.matchuserdata(U_NAME, name);
			if(number)
				bbs.email(number, wm_mode);
			else
				console.print(bbs.text(text.UnknownUser));
			break;
		case 'N':	// Send NetMail
			var netmail = msg_area.fido_netmail_settings | msg_area.inet_netmail_settings;
			console.crlf();
			if((netmail&NMAIL_FILE) && !console.noyes("Attach a file"))
				wm_mode = WM_FILE;
			console.print(bbs.text(text.EnterNetMailAddress));
			var addr = userprops.get("netmail sent", "address");
			addr = console.getstr(addr, 60, K_LINE|K_EDIT);
			if(!addr || console.aborted)
				break;
			if(bbs.netmail(addr, wm_mode)) {
				userprops.set("netmail sent", "address", addr);
				userprops.set("netmail sent", "localtime", new Date().toString());
			}
			break;
		case 'Q':	// Quit
		case '\r':
			exit(0);
		case '?':	// Display menu
			if(user.settings & USER_EXPERT)
				bbs.menu("e-mail");
			break;
	}
}