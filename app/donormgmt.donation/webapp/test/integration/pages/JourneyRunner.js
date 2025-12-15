sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"donormgmt/donation/test/integration/pages/DonationsList",
	"donormgmt/donation/test/integration/pages/DonationsObjectPage"
], function (JourneyRunner, DonationsList, DonationsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('donormgmt/donation') + '/test/flpSandbox.html#donormgmtdonation-tile',
        pages: {
			onTheDonationsList: DonationsList,
			onTheDonationsObjectPage: DonationsObjectPage
        },
        async: true
    });

    return runner;
});

