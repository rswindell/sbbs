# targets.mk

# Make 'include file' defining targets for Synchronet SCFG project

# $Id$

# LIBODIR, SLASH, LIBFILE, EXEFILE, and DELETE must be pre-defined

SCFG	=	$(EXEODIR)$(DIRSEP)scfg$(EXEFILE) 
MAKEHELP=	$(EXEODIR)$(DIRSEP)makehelp$(EXEFILE) 
SCFGHELP=	$(EXEODIR)$(DIRSEP)scfghelp.dat

all:		xpdev-mt \
		uifc-mt \
		ciolib-mt \
		smblib \
		$(EXEODIR) \
		$(MTOBJODIR) \
		$(LIBODIR) \
		$(SCFG) $(SCFGHELP)

$(SCFG):	$(XPDEV-MT_LIB) $(UIFCLIB-MT) $(CIOLIB-MT)
